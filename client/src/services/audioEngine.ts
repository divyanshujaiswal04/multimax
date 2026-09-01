import { PlaybackState, Song } from "../types";

export type AudioEventListener = (event: string, data?: any) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isUnlocked: boolean = false;
  private currentSong: Song | null = null;
  private listeners: Set<AudioEventListener> = new Set();
  public isSyncEnabled: boolean = true;
  public volume: number = 0.8;
  public needsUserGesture: boolean = false;

  constructor() {
    // Lazy initialized on first user interaction or mount
  }

  public init() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "auto";
    this.audio.volume = this.volume;

    this.audio.addEventListener("ended", () => {
      this.emit("ended");
    });

    this.audio.addEventListener("timeupdate", () => {
      this.emit("timeupdate", this.audio?.currentTime || 0);
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Audio element error, will fallback if necessary:", e);
      this.emit("error", e);
    });
  }

  private setupWebAudio() {
    if (this.audioContext || !this.audio) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      try {
        this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      } catch (err) {
        // In case CORS blocks createMediaElementSource, audio still plays natively through element
        console.log("Web Audio CORS note: Analyser using fallback simulation if restricted.");
      }
    } catch (e) {
      console.warn("Web Audio API not fully available:", e);
    }
  }

  public unlock(): Promise<void> {
    this.init();
    this.setupWebAudio();

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.isUnlocked = true;
    this.needsUserGesture = false;
    this.emit("unlocked");

    if (this.audio && this.currentSong) {
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
      if (song?.source === "youtube") {
        this.currentSong = song;
      }
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

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.emit("volume_change", this.volume);
  }

  public toggleSync(enabled: boolean) {
    this.isSyncEnabled = enabled;
    if (!enabled && this.audio) {
      this.audio.pause();
    }
    this.emit("sync_toggle", this.isSyncEnabled);
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser) {
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      return dataArray;
    }
    // Simulated frequency data if audio context analyser is unavailable
    const mock = new Uint8Array(16);
    if (this.audio && !this.audio.paused) {
      const time = Date.now() / 200;
      for (let i = 0; i < mock.length; i++) {
        mock[i] = Math.floor(60 + 120 * Math.abs(Math.sin(time + i * 0.4)));
      }
    }
    return mock;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public isPlaying(): boolean {
    return Boolean(this.audio && !this.audio.paused);
  }

  public addListener(listener: AudioEventListener) {
    this.listeners.add(listener);
  }

  public removeListener(listener: AudioEventListener) {
    this.listeners.delete(listener);
  }

  private emit(event: string, data?: any) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (e) {
        console.error("Listener error", e);
      }
    }
  }
}

export const audioEngine = new AudioEngine();
