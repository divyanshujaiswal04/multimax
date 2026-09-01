export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  genre?: string;
  artwork?: string;
  url: string; // stream URL or YouTube URL
  source?: "local" | "youtube";
  videoId?: string;
}

export interface QueueItem {
  id: string;
  song: Song;
  addedBy: {
    id: string;
    name: string;
  };
  addedAt: number;
  votes: string[];
}

export interface Guest {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  device: "mobile" | "tablet" | "desktop";
}

export interface RoomSettings {
  queueLocked: boolean;
  guestsCanControlPlayback: boolean;
  guestCanAddSongs: boolean;
  votesRequiredToSkip: number;
  autoPlayNext: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  duration: number;
}

export interface ClientRoomView {
  id: string;
  code: string;
  createdAt: number;
  currentSong: Song | null;
  playbackState: PlaybackState;
  queue: QueueItem[];
  guests: Guest[];
  settings: RoomSettings;
  hostId: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  left: number; // percentage 10% - 90%
}
