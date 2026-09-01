import { Song, PlaybackState } from "../types";

type AudioEventCallback = (event: string, data?: any) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private currentSong: Song | null = null;
  private isSyncEnabled: boolean = true;
  private listeners: AudioEventCallback[] = [];
  public isUnlocked: boolean = false;
  public needsUserGesture: boolean = false;

  constructor() {
    // Lazy init on first user action
  }

  public init() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.volume = 0.9;
    this.audio.muted = false;

    this.audio.addEventListener("play", () => {
      this.emit("play");
    });

    this.audio.addEventListener("pause", () => {
      this.emit("pause");
    });

    this.audio.addEventListener("ended", () => {
      this.emit("ended");
    });

    this.audio.addEventListener("timeupdate", () => {
      this.emit("timeupdate", this.audio?.currentTime || 0);
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Audio element playback note:", e);
      this.emit("error", e);
    });
  }

  public unlock(): Promise<void> {
    this.init();
    this.isUnlocked = true;
    this.needsUserGesture = false;
    this.emit("unlocked");

    if (this.audio && this.currentSong && this.currentSong.source !== "youtube") {
      this.audio.muted = false;
      this.audio.volume = 0.9;
      return this.audio.play().catch((e) => {
        console.warn("Unlock play rejected:", e);
      });
    }
    return Promise.resolve();
  }

  public syncPlayback(song: Song | null, playbackState: PlaybackState) {
    this.init();

    if (!this.isSyncEnabled || !song || song.source === "youtube") {
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
      this.currentSong = song;
      return;
    }

    const isNewSong = !this.currentSong || this.currentSong.id !== song.id;
    this.currentSong = song;

    // Compute expected server playback position
    const now = Date.now();
    let targetTime = playbackState.currentTime;
    if (playbackState.isPlaying) {
      const elapsed = (now - playbackState.updatedAt) / 1000;
      targetTime = Math.min(playbackState.currentTime + elapsed, playbackState.duration || 60);
    }

    if (this.audio) {
      if (isNewSong) {
        this.audio.src = song.url;
        this.audio.muted = false;
        try {
          this.audio.currentTime = Math.max(0, targetTime);
        } catch {}

        if (playbackState.isPlaying) {
          const playPromise = this.audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err.name === "NotAllowedError") {
                this.needsUserGesture = true;
                this.emit("needs_gesture");
              }
            });
          }
        }
      } else {
        const timeDiff = Math.abs(this.audio.currentTime - targetTime);
        if (timeDiff > 1.5) {
          try {
            this.audio.currentTime = Math.max(0, targetTime);
          } catch {}
        }

        if (playbackState.isPlaying) {
          if (this.audio.paused) {
            this.audio.muted = false;
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                if (err.name === "NotAllowedError") {
                  this.needsUserGesture = true;
                  this.emit("needs_gesture");
                }
              });
            }
          }
        } else {
          if (!this.audio.paused) {
            this.audio.pause();
          }
        }
      }
    }
  }

  public setVolume(val: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, val));
    }
  }

  public setMuted(muted: boolean) {
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  public setSyncEnabled(enabled: boolean) {
    this.isSyncEnabled = enabled;
    if (!enabled && this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  public getSyncEnabled(): boolean {
    return this.isSyncEnabled;
  }

  public toggleSync(override?: boolean): boolean {
    this.isSyncEnabled = typeof override === "boolean" ? override : !this.isSyncEnabled;
    if (!this.isSyncEnabled && this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    return this.isSyncEnabled;
  }

  public getFrequencyData(): Uint8Array {
    const data = new Uint8Array(32);
    if (this.audio && !this.audio.paused) {
      const t = Date.now() / 120;
      for (let i = 0; i < 32; i++) {
        data[i] = Math.floor(100 + 70 * Math.sin(t + i * 0.4) + Math.random() * 50);
      }
    }
    return data;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public addListener(callback: AudioEventCallback) {
    this.listeners.push(callback);
  }

  public removeListener(callback: AudioEventCallback) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  private emit(event: string, data?: any) {
    this.listeners.forEach((cb) => {
      try {
        cb(event, data);
      } catch (err) {
        console.error("AudioEngine listener error:", err);
      }
    });
  }
}

export const audioEngine = new AudioEngine();