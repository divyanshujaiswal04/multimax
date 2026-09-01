import { io, Socket } from "socket.io-client";
import { ClientRoomView, Guest, PlaybackState, QueueItem, Song } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private serverTimeOffset: number = 0;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        this.syncTime();
      });

      this.socket.on("time_sync_response", (data: { clientTime: number; serverTime: number }) => {
        const now = Date.now();
        const rtt = now - data.clientTime;
        this.serverTimeOffset = data.serverTime - (data.clientTime + rtt / 2);
      });

      this.socket.on("disconnect", (reason) => {
        console.warn("🔌 Disconnected from socket server:", reason);
      });
    }
    return this.socket;
  }

  public syncTime() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("time_sync", { clientTime: Date.now() });
    }
  }

  public getServerTime(): number {
    return Date.now() + this.serverTimeOffset;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public isConnected(): boolean {
    return Boolean(this.socket && this.socket.connected);
  }

  public joinRoom(params: {
    roomCode: string;
    guestId?: string;
    guestName?: string;
    hostToken?: string;
    device?: "mobile" | "tablet" | "desktop";
  }) {
    this.getSocket().emit("join_room", params);
  }

  public leaveRoom() {
    this.getSocket().emit("leave_room");
  }

  public updateGuestName(name: string) {
    this.getSocket().emit("update_guest_name", { name });
  }

  public playNow(song: Song) {
    this.getSocket().emit("play_now", { song });
  }

  public play() {
    this.getSocket().emit("playback_play");
  }

  public pause() {
    this.getSocket().emit("playback_pause");
  }

  public seek(time: number) {
    this.getSocket().emit("playback_seek", { time });
  }

  public skip() {
    this.getSocket().emit("playback_skip");
  }

  public previous() {
    this.getSocket().emit("playback_previous");
  }

  public trackEnded() {
    this.getSocket().emit("playback_track_ended");
  }

  public addToQueue(song: Song) {
    this.getSocket().emit("queue_add", { song });
  }

  public removeFromQueue(queueItemId: string) {
    this.getSocket().emit("queue_remove", { queueItemId });
  }

  public voteSong(queueItemId: string) {
    this.getSocket().emit("queue_vote", { queueItemId });
  }

  public clearQueue() {
    this.getSocket().emit("queue_clear");
  }

  public reorderQueue(startIndex: number, endIndex: number) {
    this.getSocket().emit("queue_reorder", { startIndex, endIndex });
  }

  public kickGuest(targetGuestId: string) {
    this.getSocket().emit("host_kick_guest", { targetGuestId });
  }

  public transferHost(newHostGuestId: string) {
    this.getSocket().emit("host_transfer", { newHostGuestId });
  }

  public lockQueue(locked: boolean) {
    this.getSocket().emit("host_lock_queue", { locked });
  }

  public updateSettings(settings: any) {
    this.getSocket().emit("host_update_settings", { settings });
  }

  public endRoom() {
    this.getSocket().emit("host_end_room");
  }

  public sendReaction(emoji: string) {
    this.getSocket().emit("party_reaction", { emoji });
  }

  public requestSync() {
    this.getSocket().emit("request_sync");
  }
}

export const socketService = new SocketService();
