import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { Room, Guest, Song, QueueItem, ClientRoomView, RoomSettings, PlaybackState } from "./types";
import { AUDIO_CATALOG } from "./audioCatalog";

const DATA_DIR = path.resolve(__dirname, "../data");
const ROOMS_FILE = path.join(DATA_DIR, "rooms.json");

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  constructor() {
    this.ensureDataDir();
    this.loadFromDisk();
    setInterval(() => this.cleanupInactiveRooms(), 5 * 60 * 1000);
  }

  private ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn("Could not create data dir:", e);
    }
  }

  private saveToDisk() {
    try {
      const serialized: any[] = [];
      for (const room of this.rooms.values()) {
        serialized.push({
          ...room,
          guests: Array.from(room.guests.entries())
        });
      }
      fs.writeFileSync(ROOMS_FILE, JSON.stringify(serialized, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist rooms to disk:", e);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(ROOMS_FILE)) {
        const raw = fs.readFileSync(ROOMS_FILE, "utf-8");
        const data: any[] = JSON.parse(raw);
        for (const item of data) {
          const room: Room = {
            ...item,
            guests: new Map(item.guests || [])
          };
          this.rooms.set(room.code, room);
        }
        console.log(`Loaded ${this.rooms.size} active rooms from storage.`);
      }
    } catch (e) {
      console.warn("Could not load rooms from disk:", e);
    }
  }

  /**
   * Ultra-lenient code normalization.
   * Handles "4821", "max4821", "max-4821", "MAX 4821", "#4821" -> "MAX-4821"
   */
  public normalizeCode(input: string): string {
    if (!input) return "";
    let clean = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!clean.startsWith("MAX")) {
      clean = `MAX${clean}`;
    }

    if (clean.length > 3) {
      return `MAX-${clean.substring(3)}`;
    }
    return clean;
  }

  public generateRoomCode(): string {
    let code: string;
    let attempts = 0;
    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      code = `MAX-${randomNum}`;
      attempts++;
    } while (this.rooms.has(code) && attempts < 100);
    return code;
  }

  public generateGuestName(): string {
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `Guest-${randomNum}`;
  }

  public createRoom(hostName?: string, device: "mobile" | "tablet" | "desktop" = "desktop"): { room: Room; hostGuest: Guest; hostToken: string } {
    const code = this.generateRoomCode();
    const id = uuidv4();
    const hostToken = uuidv4();
    const hostGuestId = uuidv4();
    const assignedHostName = hostName && hostName.trim() ? hostName.trim().slice(0, 24) : this.generateGuestName();

    const hostGuest: Guest = {
      id: hostGuestId,
      socketId: "",
      name: assignedHostName,
      isHost: true,
      joinedAt: Date.now(),
      device
    };

    const initialSong = AUDIO_CATALOG[0];

    const defaultSettings: RoomSettings = {
      queueLocked: false,
      guestsCanControlPlayback: true,
      guestCanAddSongs: true,
      votesRequiredToSkip: 2,
      autoPlayNext: true
    };

    const initialPlayback: PlaybackState = {
      isPlaying: false,
      currentTime: 0,
      updatedAt: Date.now(),
      duration: initialSong.duration
    };

    const initialQueue: QueueItem[] = [
      {
        id: uuidv4(),
        song: AUDIO_CATALOG[1],
        addedBy: { id: hostGuestId, name: assignedHostName },
        addedAt: Date.now(),
        votes: []
      },
      {
        id: uuidv4(),
        song: AUDIO_CATALOG[3],
        addedBy: { id: hostGuestId, name: assignedHostName },
        addedAt: Date.now() + 100,
        votes: []
      }
    ];

    const room: Room = {
      id,
      code,
      hostToken,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      currentSong: initialSong,
      playbackState: initialPlayback,
      queue: initialQueue,
      history: [],
      guests: new Map([[hostGuestId, hostGuest]]),
      settings: defaultSettings
    };

    this.rooms.set(code, room);
    this.saveToDisk();
    return { room, hostGuest, hostToken };
  }

  public getRoom(rawCode: string): Room | undefined {
    if (!rawCode) return undefined;
    const directMatch = this.rooms.get(rawCode.toUpperCase().trim());
    if (directMatch) return directMatch;

    const normalized = this.normalizeCode(rawCode);
    const normMatch = this.rooms.get(normalized);
    if (normMatch) return normMatch;

    // Search by partial suffix (e.g. if code was "4821", find room ending in "4821")
    const cleanDigits = rawCode.replace(/[^0-9]/g, "");
    if (cleanDigits.length >= 4) {
      for (const [code, r] of this.rooms.entries()) {
        if (code.endsWith(cleanDigits)) {
          return r;
        }
      }
    }

    return undefined;
  }

  public getClientRoomView(code: string): ClientRoomView | undefined {
    const room = this.getRoom(code);
    if (!room) return undefined;

    let hostId: string | null = null;
    const guestsList: Guest[] = [];

    for (const guest of room.guests.values()) {
      guestsList.push(guest);
      if (guest.isHost) {
        hostId = guest.id;
      }
    }

    return {
      id: room.id,
      code: room.code,
      createdAt: room.createdAt,
      currentSong: room.currentSong,
      playbackState: this.calculateCurrentPlaybackState(room),
      queue: [...room.queue],
      guests: guestsList,
      settings: { ...room.settings },
      hostId
    };
  }

  public getActiveRoomsSummary(): { code: string; currentSong: string; guestCount: number; createdAt: number }[] {
    const list: { code: string; currentSong: string; guestCount: number; createdAt: number }[] = [];
    for (const room of this.rooms.values()) {
      list.push({
        code: room.code,
        currentSong: room.currentSong ? `${room.currentSong.title} - ${room.currentSong.artist}` : "Idle",
        guestCount: room.guests.size,
        createdAt: room.createdAt
      });
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }

  public calculateCurrentPlaybackState(room: Room): PlaybackState {
    const { isPlaying, currentTime, updatedAt, duration } = room.playbackState;
    if (!isPlaying) {
      return { ...room.playbackState };
    }

    const elapsedSeconds = (Date.now() - updatedAt) / 1000;
    const computedTime = Math.min(currentTime + elapsedSeconds, duration);

    return {
      isPlaying,
      currentTime: Math.floor(computedTime * 10) / 10,
      updatedAt: Date.now(),
      duration
    };
  }

  public joinRoom(
    rawCode: string,
    socketId: string,
    existingGuestId?: string,
    providedName?: string,
    hostToken?: string,
    device: "mobile" | "tablet" | "desktop" = "desktop"
  ): { room: Room; guest: Guest; isHost: boolean } | null {
    const room = this.getRoom(rawCode);
    if (!room) return null;

    room.lastActiveAt = Date.now();

    const isHostTokenValid = Boolean(hostToken && hostToken === room.hostToken);

    if (existingGuestId && room.guests.has(existingGuestId)) {
      const existingGuest = room.guests.get(existingGuestId)!;
      existingGuest.socketId = socketId;
      existingGuest.device = device;
      if (providedName && providedName.trim()) {
        existingGuest.name = providedName.trim().slice(0, 24);
      }
      if (isHostTokenValid) {
        existingGuest.isHost = true;
      }
      this.saveToDisk();
      return { room, guest: existingGuest, isHost: existingGuest.isHost };
    }

    const guestId = existingGuestId || uuidv4();
    const guestName = providedName && providedName.trim()
      ? providedName.trim().slice(0, 24)
      : this.generateGuestName();

    const isFirstGuest = room.guests.size === 0;
    const isHost = isHostTokenValid || isFirstGuest;

    const newGuest: Guest = {
      id: guestId,
      socketId,
      name: guestName,
      isHost,
      joinedAt: Date.now(),
      device
    };

    room.guests.set(guestId, newGuest);
    this.saveToDisk();
    return { room, guest: newGuest, isHost };
  }

  public removeGuestBySocketId(socketId: string): { room: Room; guest: Guest } | null {
    for (const room of this.rooms.values()) {
      for (const [guestId, guest] of room.guests.entries()) {
        if (guest.socketId === socketId) {
          room.guests.delete(guestId);
          room.lastActiveAt = Date.now();

          if (guest.isHost && room.guests.size > 0) {
            const nextHost = Array.from(room.guests.values()).sort((a, b) => a.joinedAt - b.joinedAt)[0];
            if (nextHost) {
              nextHost.isHost = true;
            }
          }

          this.saveToDisk();
          return { room, guest };
        }
      }
    }
    return null;
  }

  public updateGuestName(roomCode: string, guestId: string, newName: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    const guest = room.guests.get(guestId);
    if (!guest) return false;

    guest.name = newName.trim().slice(0, 24) || this.generateGuestName();
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public isHost(roomCode: string, guestId: string, hostToken?: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    if (hostToken && room.hostToken === hostToken) return true;
    const guest = room.guests.get(guestId);
    return Boolean(guest?.isHost);
  }

  // --- PLAYBACK CONTROLS ---

  public playNow(roomCode: string, song: Song): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    if (room.currentSong) {
      room.history.unshift(room.currentSong);
      if (room.history.length > 20) room.history.pop();
    }

    // Remove from queue if present
    const qIndex = room.queue.findIndex(q => q.song.id === song.id);
    if (qIndex !== -1) {
      room.queue.splice(qIndex, 1);
    }

    room.currentSong = song;
    room.playbackState = {
      isPlaying: true,
      currentTime: 0,
      updatedAt: Date.now(),
      duration: song.duration
    };
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public play(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    // If no track is currently set, pick first track from queue or catalog
    if (!room.currentSong) {
      if (room.queue.length > 0) {
        const nextItem = room.queue.shift()!;
        room.currentSong = nextItem.song;
      } else {
        room.currentSong = AUDIO_CATALOG[0];
      }
    }

    const current = this.calculateCurrentPlaybackState(room);
    room.playbackState = {
      isPlaying: true,
      currentTime: current.currentTime,
      updatedAt: Date.now(),
      duration: room.currentSong.duration
    };
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public pause(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    const current = this.calculateCurrentPlaybackState(room);
    room.playbackState = {
      isPlaying: false,
      currentTime: current.currentTime,
      updatedAt: Date.now(),
      duration: room.currentSong?.duration || 0
    };
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public seek(roomCode: string, time: number): boolean {
    const room = this.getRoom(roomCode);
    if (!room || !room.currentSong) return false;

    const clampedTime = Math.max(0, Math.min(time, room.currentSong.duration));
    room.playbackState = {
      isPlaying: room.playbackState.isPlaying,
      currentTime: clampedTime,
      updatedAt: Date.now(),
      duration: room.currentSong.duration
    };
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public skipToNext(roomCode: string): { currentSong: Song | null; playbackState: PlaybackState } | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    if (room.currentSong) {
      room.history.unshift(room.currentSong);
      if (room.history.length > 20) room.history.pop();
    }

    if (room.queue.length > 0) {
      const nextItem = room.queue.shift()!;
      room.currentSong = nextItem.song;
      room.playbackState = {
        isPlaying: true,
        currentTime: 0,
        updatedAt: Date.now(),
        duration: nextItem.song.duration
      };
    } else {
      const catalogIndex = Math.floor(Math.random() * AUDIO_CATALOG.length);
      const fallbackSong = AUDIO_CATALOG[catalogIndex];
      room.currentSong = fallbackSong;
      room.playbackState = {
        isPlaying: true,
        currentTime: 0,
        updatedAt: Date.now(),
        duration: fallbackSong.duration
      };
    }

    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return { currentSong: room.currentSong, playbackState: room.playbackState };
  }

  public previous(roomCode: string): { currentSong: Song | null; playbackState: PlaybackState } | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    if (room.history.length > 0) {
      const prevSong = room.history.shift()!;
      if (room.currentSong) {
        room.queue.unshift({
          id: uuidv4(),
          song: room.currentSong,
          addedBy: { id: "system", name: "MultiMax" },
          addedAt: Date.now(),
          votes: []
        });
      }
      room.currentSong = prevSong;
      room.playbackState = {
        isPlaying: true,
        currentTime: 0,
        updatedAt: Date.now(),
        duration: prevSong.duration
      };
    } else {
      room.playbackState.currentTime = 0;
      room.playbackState.updatedAt = Date.now();
    }

    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return { currentSong: room.currentSong, playbackState: room.playbackState };
  }

  // --- QUEUE OPERATIONS ---

  public addSongToQueue(roomCode: string, song: Song, addedBy: { id: string; name: string }): QueueItem | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;
    if (room.settings.queueLocked) return null;

    const queueItem: QueueItem = {
      id: uuidv4(),
      song,
      addedBy,
      addedAt: Date.now(),
      votes: [addedBy.id]
    };

    if (!room.currentSong) {
      room.currentSong = song;
      room.playbackState = {
        isPlaying: true,
        currentTime: 0,
        updatedAt: Date.now(),
        duration: song.duration
      };
      room.lastActiveAt = Date.now();
      this.saveToDisk();
      return queueItem;
    }

    room.queue.push(queueItem);
    this.sortQueueByVotes(room);
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return queueItem;
  }

  public removeSongFromQueue(roomCode: string, queueItemId: string, requesterId: string, isHost: boolean): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    const index = room.queue.findIndex(item => item.id === queueItemId);
    if (index === -1) return false;

    const item = room.queue[index];
    if (!isHost && item.addedBy.id !== requesterId) {
      return false;
    }

    room.queue.splice(index, 1);
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public voteSong(roomCode: string, queueItemId: string, guestId: string): { queue: QueueItem[]; hasVoted: boolean } | null {
    const room = this.getRoom(roomCode);
    if (!room) return null;

    const item = room.queue.find(q => q.id === queueItemId);
    if (!item) return null;

    const voteIndex = item.votes.indexOf(guestId);
    let hasVoted = false;
    if (voteIndex === -1) {
      item.votes.push(guestId);
      hasVoted = true;
    } else {
      item.votes.splice(voteIndex, 1);
      hasVoted = false;
    }

    this.sortQueueByVotes(room);
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return { queue: room.queue, hasVoted };
  }

  private sortQueueByVotes(room: Room): void {
    room.queue.sort((a, b) => {
      if (b.votes.length !== a.votes.length) {
        return b.votes.length - a.votes.length;
      }
      return a.addedAt - b.addedAt;
    });
  }

  public reorderQueue(roomCode: string, startIndex: number, endIndex: number): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    if (startIndex < 0 || startIndex >= room.queue.length) return false;
    if (endIndex < 0 || endIndex >= room.queue.length) return false;

    const [removed] = room.queue.splice(startIndex, 1);
    room.queue.splice(endIndex, 0, removed);
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public clearQueue(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    room.queue = [];
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  // --- HOST CONTROLS ---

  public kickGuest(roomCode: string, targetGuestId: string): { targetSocketId?: string; success: boolean } {
    const room = this.getRoom(roomCode);
    if (!room) return { success: false };

    const targetGuest = room.guests.get(targetGuestId);
    if (!targetGuest || targetGuest.isHost) {
      return { success: false };
    }

    const targetSocketId = targetGuest.socketId;
    room.guests.delete(targetGuestId);
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return { targetSocketId, success: true };
  }

  public transferHost(roomCode: string, currentHostGuestId: string, newHostGuestId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;

    const currentHost = room.guests.get(currentHostGuestId);
    const targetGuest = room.guests.get(newHostGuestId);
    if (!currentHost || !currentHost.isHost || !targetGuest) return false;

    currentHost.isHost = false;
    targetGuest.isHost = true;
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public lockQueue(roomCode: string, locked: boolean): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    room.settings.queueLocked = locked;
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public updateSettings(roomCode: string, settings: Partial<RoomSettings>): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    room.settings = { ...room.settings, ...settings };
    room.lastActiveAt = Date.now();
    this.saveToDisk();
    return true;
  }

  public endRoom(roomCode: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    const deleted = this.rooms.delete(room.code);
    this.saveToDisk();
    return deleted;
  }

  private cleanupInactiveRooms(): void {
    const now = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;

    let changed = false;
    for (const [code, room] of this.rooms.entries()) {
      const isStale = room.guests.size === 0 && (now - room.lastActiveAt > TWO_HOURS);
      const isTooOld = now - room.createdAt > ONE_DAY;

      if (isStale || isTooOld) {
        this.rooms.delete(code);
        changed = true;
      }
    }

    if (changed) {
      this.saveToDisk();
    }
  }
}

export const roomManager = new RoomManager();