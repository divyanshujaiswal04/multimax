export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  url: string;      // direct audio stream URL
  artwork: string;  // cover image URL
  genre?: string;
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
  votes: string[]; // array of guest IDs who upvoted
}

export interface Guest {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  device: 'mobile' | 'tablet' | 'desktop';
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
  currentTime: number; // in seconds
  updatedAt: number;   // epoch ms when state was set
  duration: number;
}

export interface Room {
  id: string;
  code: string;       // e.g. "MAX-4821"
  hostToken: string;  // private secret only given to host
  createdAt: number;
  lastActiveAt: number;
  currentSong: Song | null;
  playbackState: PlaybackState;
  queue: QueueItem[];
  history: Song[];
  guests: Map<string, Guest>; // key: guestId
  settings: RoomSettings;
}

// Client-safe view of the Room (omits sensitive hostToken and formats map as array)
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
