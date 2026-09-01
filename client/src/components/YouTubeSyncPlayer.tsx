import React, { useEffect, useRef, useState } from "react";
import { Song, PlaybackState } from "../types";
import { Play, Volume2, VolumeX, Video, Disc, Sparkles } from "lucide-react";

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
  const [isMutedByBrowser, setIsMutedByBrowser] = useState(false);
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
    if (playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player("multimax-yt-iframe", {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            try {
              event.target.unMute();
              event.target.setVolume(90);
            } catch {}
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
    } catch (err) {
      console.warn("Could not instantiate YT.Player:", err);
    }
  };

  // 2. Synchronize playback with server state
  useEffect(() => {
    if (!isReady || !playerRef.current || !song || song.source !== "youtube" || !song.videoId) {
      if (isReady && playerRef.current && typeof playerRef.current.pauseVideo === "function") {
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
        player.unMute();
        player.setVolume(90);
        if (!playbackState.isPlaying) {
          player.pauseVideo();
        }
      } catch (err) {
        setIsMutedByBrowser(true);
      }
      return;
    }

    // Drift synchronization & Play/Pause state
    try {
      if (typeof player.isMuted === "function" && player.isMuted()) {
        setIsMutedByBrowser(true);
      }

      const currentTime = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
      const drift = Math.abs(currentTime - targetTime);

      if (drift > 2.0) {
        player.seekTo(targetTime, true);
      }

      const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
      // 1 = PLAYING, 2 = PAUSED
      if (playbackState.isPlaying && state !== 1 && state !== 3) {
        player.unMute();
        player.playVideo();
      } else if (!playbackState.isPlaying && state === 1) {
        player.pauseVideo();
      }
    } catch (e) {
      setIsMutedByBrowser(true);
    }
  }, [isReady, song, playbackState.isPlaying, playbackState.currentTime, playbackState.updatedAt]);

  const handleUnmuteClick = () => {
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(90);
        playerRef.current.playVideo();
        setIsMutedByBrowser(false);
      } catch (e) {
        console.warn("Unmute failed:", e);
      }
    }
  };

  if (!song || song.source !== "youtube") return null;

  return (
    <div className="w-full relative my-3">
      {/* Tap to Unmute / Play Sound Banner if browser blocked audio */}
      {isMutedByBrowser && (
        <div 
          onClick={handleUnmuteClick}
          className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 text-white flex items-center justify-between text-xs font-bold shadow-xl shadow-rose-500/25 cursor-pointer transform hover:scale-[1.01] active:scale-95 transition-all animate-bounce"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse" />
            <span>🔊 Audio is muted by browser. TAP HERE TO UNMUTE & PLAY SOUND!</span>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-xl">Tap to Unmute</span>
        </div>
      )}

      {/* Video Container - Always visible when YouTube is playing */}
      <div 
        ref={containerRef}
        className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black relative"
      >
        <div id="multimax-yt-iframe" className="w-full h-full" />
      </div>

      {/* Badge & Toggle */}
      <div className="flex items-center justify-between mt-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>YouTube Music • Live Stream</span>
        </div>

        <button
          onClick={handleUnmuteClick}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Unmute / Max Volume</span>
        </button>
      </div>
    </div>
  );
};