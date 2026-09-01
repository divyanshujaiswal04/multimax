import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Radio, 
  Disc3,
  Music,
  Headphones
} from "lucide-react";
import { PlaybackState, Song } from "../types";
import { socketService } from "../services/socket";
import { audioEngine } from "../services/audioEngine";
import { AudioVisualizer } from "./AudioVisualizer";
import { YouTubeSyncPlayer } from "./YouTubeSyncPlayer";

interface MusicPlayerProps {
  currentSong: Song | null;
  playbackState: PlaybackState;
  isHost: boolean;
  canControlPlayback: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  playbackState,
  isHost,
  canControlPlayback
}) => {
  const [localProgress, setLocalProgress] = useState<number>(playbackState.currentTime);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [syncAudio, setSyncAudio] = useState<boolean>(true);
  const [shuffleOn, setShuffleOn] = useState<boolean>(false);
  const [repeatOn, setRepeatOn] = useState<boolean>(false);
  const [needsGesture, setNeedsGesture] = useState<boolean>(false);

  // Sync with audio engine events
  useEffect(() => {
    const handleAudioEvent = (event: string, data?: any) => {
      if (event === "needs_gesture") {
        setNeedsGesture(true);
      } else if (event === "unlocked") {
        setNeedsGesture(false);
      }
    };

    audioEngine.addListener(handleAudioEvent);
    return () => {
      audioEngine.removeListener(handleAudioEvent);
    };
  }, []);

  // Update progress timer smoothly when playing
  useEffect(() => {
    if (isScrubbing) return;

    setLocalProgress(playbackState.currentTime);

    if (!playbackState.isPlaying) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - playbackState.updatedAt) / 1000;
      const computed = Math.min(
        playbackState.currentTime + elapsed,
        playbackState.duration || currentSong?.duration || 100
      );
      setLocalProgress(computed);
    }, 250);

    return () => clearInterval(interval);
  }, [playbackState, isScrubbing, currentSong]);

  const formatTime = (seconds: number) => {
    const s = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    if (needsGesture) {
      audioEngine.unlock();
    }
    if (!canControlPlayback) return;
    if (playbackState.isPlaying) {
      socketService.pause();
    } else {
      socketService.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setLocalProgress(target);
  };

  const handleSeekCommit = () => {
    setIsScrubbing(false);
    if (canControlPlayback) {
      socketService.seek(localProgress);
    }
  };

  const handleNext = () => {
    if (canControlPlayback) {
      socketService.skip();
    }
  };

  const handlePrevious = () => {
    if (canControlPlayback) {
      socketService.previous();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) setIsMuted(false);
    audioEngine.setVolume(val);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const toggleSyncAudio = () => {
    const newState = !syncAudio;
    setSyncAudio(newState);
    audioEngine.toggleSync(newState);
    if (newState) {
      audioEngine.unlock();
      socketService.requestSync();
    }
  };

  const duration = currentSong?.duration || playbackState.duration || 180;
  const progressPercent = duration > 0 ? (localProgress / duration) * 100 : 0;

  return (
    <div className="relative glass-panel rounded-2xl p-5 sm:p-7 border border-white/10 shadow-2xl overflow-hidden group">
      {/* Background Ambient Glow */}
      <div 
        className="absolute -inset-10 opacity-20 blur-3xl pointer-events-none transition-all duration-700"
        style={{
          background: currentSong?.artwork
            ? `radial-gradient(circle, #6366f1 10%, #a855f7 40%, transparent 80%)`
            : "radial-gradient(circle, #6366f1 0%, transparent 70%)"
        }}
      />

      {/* Autoplay Unlock Notice for Mobile/Browser Autoplay Policy */}
      {needsGesture && (
        <div 
          onClick={() => audioEngine.unlock()}
          className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border border-indigo-500/40 text-center cursor-pointer hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 text-sm font-semibold text-white shadow-lg"
        >
          <Headphones className="w-4 h-4 text-indigo-300 animate-bounce" />
          <span>Tap to sync audio and listen along on this device! 🔊</span>
        </div>
      )}

      {/* Background YouTube Audio Streamer */}
      <YouTubeSyncPlayer
        song={currentSong}
        playbackState={playbackState}
        onEnded={handleNext}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        {/* Left: Spinning Disc / Artwork */}
        <div className="relative flex-shrink-0">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-indigo-500/30 transition-all duration-300">
            {currentSong?.artwork ? (
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  playbackState.isPlaying ? "scale-105" : "scale-100"
                }`}
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500">
                <Disc3 className="w-16 h-16 animate-spin-slow text-indigo-400/40 mb-2" />
                <span className="text-xs">No Track Playing</span>
              </div>
            )}

            {/* Glowing disc center spindle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
              {currentSong?.genre && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20">
                  {currentSong.genre}
                </span>
              )}
            </div>
          </div>

          {/* Playing Pulse Dot */}
          {playbackState.isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#07080d]"></span>
            </span>
          )}
        </div>

        {/* Right: Info & Controls */}
        <div className="flex-1 w-full space-y-4">
          {/* Track Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight line-clamp-1">
                {currentSong ? currentSong.title : "Waiting for next track..."}
              </h2>
              <p className="text-sm font-medium text-slate-400 line-clamp-1 flex items-center gap-2">
                <span>{currentSong ? currentSong.artist : "MultiMax Collaborative Room"}</span>
                {currentSong?.album && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 text-xs">{currentSong.album}</span>
                  </>
                )}
              </p>
            </div>

            {/* Sync Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSyncAudio}
                title={syncAudio ? "Playing audio on this device" : "Device is muted / Remote mode"}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  syncAudio
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${syncAudio ? "animate-pulse" : ""}`} />
                <span>{syncAudio ? "Audio Synced" : "Remote Mode"}</span>
              </button>
            </div>
          </div>

          {/* Real-time Frequency Visualizer */}
          <div className="w-full bg-black/20 rounded-xl p-2 border border-white/5">
            <AudioVisualizer isPlaying={playbackState.isPlaying && syncAudio} />
          </div>

          {/* Waveform Scrubber / Progress Bar */}
          <div className="space-y-1.5">
            <div className="relative group/scrub flex items-center">
              <input
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={localProgress}
                onChange={handleSeek}
                onMouseDown={() => setIsScrubbing(true)}
                onTouchStart={() => setIsScrubbing(true)}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                disabled={!canControlPlayback}
                aria-label="Seek track"
                className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-indigo-500 disabled:cursor-not-allowed transition-all"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${progressPercent}%, #1e2235 ${progressPercent}%, #1e2235 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>{formatTime(localProgress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls & Volume */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            {/* Left Controls: Shuffle */}
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button
                onClick={() => setShuffleOn(!shuffleOn)}
                title="Shuffle"
                className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${
                  shuffleOn ? "text-indigo-400 bg-indigo-500/15" : ""
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>

            {/* Center Main Controls: Prev, Play/Pause, Next */}
            <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
              <button
                onClick={handlePrevious}
                disabled={!canControlPlayback}
                title="Previous track"
                className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={handlePlayPause}
                disabled={!canControlPlayback && !needsGesture}
                title={playbackState.isPlaying ? "Pause" : "Play"}
                className={`p-4 rounded-full text-white shadow-xl transition-all transform active:scale-90 ${
                  playbackState.isPlaying
                    ? "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/30 hover:scale-105"
                    : "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/40 hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {playbackState.isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                disabled={!canControlPlayback}
                title="Next track"
                className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Right: Volume & Repeat */}
            <div className="flex items-center gap-3 order-3">
              <button
                onClick={() => setRepeatOn(!repeatOn)}
                title="Repeat track"
                className={`p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all ${
                  repeatOn ? "text-indigo-400 bg-indigo-500/15" : ""
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume control"
                  className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
