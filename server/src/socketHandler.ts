import { Server, Socket } from "socket.io";
import { roomManager } from "./roomManager";
import { Song, RoomSettings } from "./types";

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentRoomCode: string | null = null;
    let currentGuestId: string | null = null;

    // Helper to broadcast full room state
    const broadcastRoomUpdate = (roomCode: string) => {
      const roomView = roomManager.getClientRoomView(roomCode);
      if (roomView) {
        io.to(`room_${roomCode}`).emit("room_state_updated", { room: roomView });
      }
    };

    // 1. Join Room
    socket.on("join_room", (payload: {
      roomCode: string;
      guestId?: string;
      guestName?: string;
      hostToken?: string;
      device?: "mobile" | "tablet" | "desktop";
    }) => {
      const { roomCode, guestId, guestName, hostToken, device } = payload;
      const cleanCode = roomCode ? roomCode.toUpperCase().trim() : "";

      const joinResult = roomManager.joinRoom(
        cleanCode,
        socket.id,
        guestId,
        guestName,
        hostToken,
        device || "desktop"
      );

      if (!joinResult) {
        socket.emit("error_message", { message: "Room not found or has expired." });
        return;
      }

      const { room, guest, isHost } = joinResult;
      currentRoomCode = cleanCode;
      currentGuestId = guest.id;

      socket.join(`room_${cleanCode}`);

      const clientView = roomManager.getClientRoomView(cleanCode);

      // Confirm to the joining user
      socket.emit("room_joined", {
        room: clientView,
        guest,
        isHost
      });

      // Broadcast updated roster and toast to other peers
      socket.to(`room_${cleanCode}`).emit("guest_joined_toast", {
        guestName: guest.name
      });
      broadcastRoomUpdate(cleanCode);
    });

    // 2. Leave Room
    socket.on("leave_room", () => {
      if (currentRoomCode) {
        const removal = roomManager.removeGuestBySocketId(socket.id);
        socket.leave(`room_${currentRoomCode}`);
        if (removal) {
          socket.to(`room_${currentRoomCode}`).emit("guest_left_toast", {
            guestName: removal.guest.name
          });
          broadcastRoomUpdate(currentRoomCode);
        }
        currentRoomCode = null;
        currentGuestId = null;
      }
    });

    // 3. Disconnect
    socket.on("disconnect", () => {
      if (currentRoomCode) {
        const removal = roomManager.removeGuestBySocketId(socket.id);
        if (removal) {
          socket.to(`room_${currentRoomCode}`).emit("guest_left_toast", {
            guestName: removal.guest.name
          });
          broadcastRoomUpdate(currentRoomCode);
        }
      }
    });

    // 4. Update Guest Name
    socket.on("update_guest_name", (payload: { name: string }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const success = roomManager.updateGuestName(currentRoomCode, currentGuestId, payload.name);
      if (success) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    // 5. Playback Controls
    socket.on("play_now", (payload: { song: Song }) => {
      if (!currentRoomCode || !payload.song) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost && !room.settings.guestsCanControlPlayback) {
        socket.emit("error_message", { message: "Only the host can change tracks directly." });
        return;
      }

      roomManager.playNow(currentRoomCode, payload.song);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
      broadcastRoomUpdate(currentRoomCode);
    });

    socket.on("playback_play", () => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost && !room.settings.guestsCanControlPlayback) {
        socket.emit("error_message", { message: "Only the host can control playback in this room." });
        return;
      }

      roomManager.play(currentRoomCode);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
    });

    socket.on("playback_pause", () => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost && !room.settings.guestsCanControlPlayback) {
        socket.emit("error_message", { message: "Only the host can control playback in this room." });
        return;
      }

      roomManager.pause(currentRoomCode);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
    });

    socket.on("playback_seek", (payload: { time: number }) => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost && !room.settings.guestsCanControlPlayback) return;

      roomManager.seek(currentRoomCode, payload.time);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
    });

    socket.on("playback_skip", () => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost && !room.settings.guestsCanControlPlayback) {
        socket.emit("error_message", { message: "Only the host can skip songs." });
        return;
      }

      roomManager.skipToNext(currentRoomCode);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
      broadcastRoomUpdate(currentRoomCode);
    });

    socket.on("playback_previous", () => {
      if (!currentRoomCode) return;
      const isHost = currentGuestId ? roomManager.isHost(currentRoomCode, currentGuestId) : false;
      if (!isHost) return;

      roomManager.previous(currentRoomCode);
      const roomView = roomManager.getClientRoomView(currentRoomCode);
      if (roomView) {
        io.to(`room_${currentRoomCode}`).emit("playback_updated", {
          playbackState: roomView.playbackState,
          currentSong: roomView.currentSong
        });
      }
      broadcastRoomUpdate(currentRoomCode);
    });

    socket.on("playback_track_ended", () => {
      if (!currentRoomCode) return;
      roomManager.skipToNext(currentRoomCode);
      broadcastRoomUpdate(currentRoomCode);
    });

    // 6. Queue Operations
    socket.on("queue_add", (payload: { song: Song }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      if (room.settings.queueLocked) {
        socket.emit("error_message", { message: "Queue is locked by the host." });
        return;
      }

      const guest = room.guests.get(currentGuestId);
      const addedByName = guest ? guest.name : "Guest";

      const added = roomManager.addSongToQueue(currentRoomCode, payload.song, {
        id: currentGuestId,
        name: addedByName
      });

      if (added) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("queue_remove", (payload: { queueItemId: string }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      const success = roomManager.removeSongFromQueue(
        currentRoomCode,
        payload.queueItemId,
        currentGuestId,
        isHost
      );
      if (success) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("queue_vote", (payload: { queueItemId: string }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const result = roomManager.voteSong(currentRoomCode, payload.queueItemId, currentGuestId);
      if (result) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("queue_reorder", (payload: { startIndex: number; endIndex: number }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      const success = roomManager.reorderQueue(currentRoomCode, payload.startIndex, payload.endIndex);
      if (success) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("queue_clear", () => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      roomManager.clearQueue(currentRoomCode);
      broadcastRoomUpdate(currentRoomCode);
    });

    // 7. Host Management
    socket.on("host_kick_guest", (payload: { targetGuestId: string }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      const result = roomManager.kickGuest(currentRoomCode, payload.targetGuestId);
      if (result.success && result.targetSocketId) {
        io.to(result.targetSocketId).emit("kicked_from_room", {
          reason: "You were removed by the room host."
        });
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("host_transfer", (payload: { newHostGuestId: string }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      const success = roomManager.transferHost(currentRoomCode, currentGuestId, payload.newHostGuestId);
      if (success) {
        broadcastRoomUpdate(currentRoomCode);
      }
    });

    socket.on("host_lock_queue", (payload: { locked: boolean }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      roomManager.lockQueue(currentRoomCode, payload.locked);
      broadcastRoomUpdate(currentRoomCode);
    });

    socket.on("host_update_settings", (payload: { settings: Partial<RoomSettings> }) => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      roomManager.updateSettings(currentRoomCode, payload.settings);
      broadcastRoomUpdate(currentRoomCode);
    });

    socket.on("host_end_room", () => {
      if (!currentRoomCode || !currentGuestId) return;
      const isHost = roomManager.isHost(currentRoomCode, currentGuestId);
      if (!isHost) return;

      io.to(`room_${currentRoomCode}`).emit("room_ended", {
        reason: "The host has ended this room."
      });
      roomManager.endRoom(currentRoomCode);
      currentRoomCode = null;
      currentGuestId = null;
    });

    // 8. Party Reactions (Real-time emoji bursts)
    socket.on("party_reaction", (payload: { emoji: string }) => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      const guest = currentGuestId ? room?.guests.get(currentGuestId) : null;
      const senderName = guest ? guest.name : "Guest";

      io.to(`room_${currentRoomCode}`).emit("party_reaction_received", {
        emoji: payload.emoji,
        senderName
      });
    });

    // 9. Sync Time Request
    socket.on("request_sync", () => {
      if (!currentRoomCode) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        const state = roomManager.calculateCurrentPlaybackState(room);
        socket.emit("playback_updated", {
          playbackState: state,
          currentSong: room.currentSong
        });
      }
    });
  });
}
