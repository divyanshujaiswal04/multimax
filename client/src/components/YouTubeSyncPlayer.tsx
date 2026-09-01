import React, { useEffect, useRef, useState } from "react";
import { Song, PlaybackState } from "../types";
import { Play, Volume2, Video, VideoOff, Disc, Sparkles } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeSyncPlayerProps {
  song: Song | null;
  playbackState: PlaybackState;
  showVideo: boolean;
  onToggleVideo: () => void;
  onEnded?: () => void;
}

export const YouTubeSyncPlayer: React.FC<YouTubeSyncPlayerProps> = ({
  song,
  playbackState,
  showVideo,
  onToggleVideo,
  onEnded
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const currentVideoIdRef = useRef<string | null>(null);

  // 1. Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      initPlayer();
    };

    if (!document.getElementById("yt-iframe-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  const initPlayer = () => {
    if (!containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player("multimax-yt-iframe", {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          setIsReady(true);
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0 && onEnded) {
            onEnded();
          }
        },
        onError: (e: any) => {
          console.warn("YouTube player error:", e);
        }
      }
    });
  };

  // 2. Synchronize playback with server state
  useEffect(() => {
    if (!isReady || !playerRef.current || !song || song.source !== "youtube" || !song.videoId) {
      if (isReady && playerRef.current && playerRef.current.pauseVideo) {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
      return;
    }

    const player = playerRef.current;
    const videoId = song.videoId;

    // Calculate current expected server time
    const now = Date.now();
    let targetTime = playbackState.currentTime;
    if (playbackState.isPlaying) {
      const elapsed = (now - playbackState.updatedAt) / 1000;
      targetTime = Math.min(playbackState.currentTime + elapsed, playbackState.duration || 600);
    }

    // New Video check
    if (currentVideoIdRef.current !== videoId) {
      currentVideoIdRef.current = videoId;
      try {
        player.loadVideoById({
          videoId,
          startSeconds: Math.max(0, targetTime)
        });
        if (!playbackState.isPlaying) {
          player.pauseVideo();
        }
      } catch (err) {
        setNeedsGesture(true);
      }
      return;
    }

    // Drift synchronization & Play/Pause state
    try {
      const currentTime = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
      const drift = Math.abs(currentTime - targetTime);

      if (drift > 1.8) {
        player.seekTo(targetTime, true);
      }

      const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
      // 1 = PLAYING, 2 = PAUSED
      if (playbackState.isPlaying && state !== 1 && state !== 3) {
        player.playVideo();
      } else if (!playbackState.isPlaying && state === 1) {
        player.pauseVideo();
      }
    } catch (e) {
      // Browser autoplay policy might block
      setNeedsGesture(true);
    }
  }, [isReady, song, playbackState.isPlaying, playbackState.currentTime, playbackState.updatedAt]);

  const handleUnlockGesture = () => {
    if (playerRef.current && playerRef.current.playVideo) {
      try {
        playerRef.current.playVideo();
        setNeedsGesture(false);
      } catch {}
    }
  };

  if (!song || song.source !== "youtube") return null;

  return (
    <div className="w-full relative my-2">
      {/* Autoplay Unlock Banner if blocked by mobile browser */}
      {needsGesture && (
        <div className="mb-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Tap to sync YouTube audio on this device</span>
          </div>
          <button
            onClick={handleUnlockGesture}
            className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Sync Audio
          </button>
        </div>
      )}

      {/* Video Container */}
      <div 
        ref={containerRef}
        className={`w-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative ${
          showVideo 
            ? "aspect-video bg-black block" 
            : "h-0 opacity-0 pointer-events-none absolute -top-[9999px]"
        }`}
      >
        <div id="multimax-yt-iframe" className="w-full h-full" />
      </div>

      {/* Video / Audio Mode Pill Toggle */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>YouTube Music</span>
        </div>

        <button
          onClick={onToggleVideo}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
        >
          {showVideo ? (
            <>
              <Disc className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vinyl Art View</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Watch Music Video</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};