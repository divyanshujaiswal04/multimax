import React, { useEffect, useRef, useState } from "react";
import { Song, PlaybackState } from "../types";
import { socketService } from "../services/socket";
import { Volume2 } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeSyncPlayerProps {
  song: Song | null;
  playbackState: PlaybackState;
  volume: number;
  isMuted: boolean;
  onEnded?: () => void;
}

export const YouTubeSyncPlayer: React.FC<YouTubeSyncPlayerProps> = ({
  song,
  playbackState,
  volume,
  isMuted,
  onEnded
}) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMutedByBrowser, setIsMutedByBrowser] = useState(false);
  const currentVideoIdRef = useRef<string | null>(null);

  // 1. Safe YouTube IFrame API script loader
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function" && prev !== window.onYouTubeIframeAPIReady) {
        try { prev(); } catch {}
      }
      initPlayer();
    };

    if (!document.getElementById("yt-iframe-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    const el = document.getElementById("multimax-yt-iframe");
    if (!el) {
      setTimeout(initPlayer, 150);
      return;
    }

    try {
      playerRef.current = new window.YT.Player("multimax-yt-iframe", {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          controls: 0,
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
              const targetVol = Math.round((volume || 0.8) * 100);
              if (isMuted) {
                event.target.mute();
                event.target.setVolume(0);
              } else {
                event.target.unMute();
                event.target.setVolume(targetVol);
              }
            } catch {}
          },
          onStateChange: (event: any) => {
            if (event.data === 0 && onEnded) {
              onEnded();
            }
          },
          onError: (e: any) => {
            console.warn("YouTube player warning:", e);
          }
        }
      });
    } catch (err) {
      console.warn("YouTube player init error:", err);
    }
  };

  // 2. Real-time Volume & Mute Synchronization
  useEffect(() => {
    if (!isReady || !playerRef.current) return;
    const player = playerRef.current;
    try {
      if (typeof player.setVolume === "function") {
        if (isMuted || volume === 0) {
          if (typeof player.mute === "function") player.mute();
          player.setVolume(0);
        } else {
          if (typeof player.unMute === "function") player.unMute();
          const targetVol = Math.max(0, Math.min(100, Math.round(volume * 100)));
          player.setVolume(targetVol);
        }
      }
    } catch (err) {
      console.warn("Volume adjustment warning:", err);
    }
  }, [isReady, volume, isMuted]);

  // 3. Continuous, frame-accurate playback sync across all devices
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

    // Use NTP server-synchronized time across all devices
    const now = socketService.getServerTime();
    let targetTime = playbackState.currentTime;
    if (playbackState.isPlaying) {
      const elapsed = (now - playbackState.updatedAt) / 1000;
      targetTime = Math.min(playbackState.currentTime + elapsed, playbackState.duration || 600);
    }

    // A. Video changed: Load new track and seek to target time ONCE
    if (currentVideoIdRef.current !== videoId) {
      currentVideoIdRef.current = videoId;
      try {
        player.loadVideoById({
          videoId,
          startSeconds: Math.max(0, targetTime)
        });
        
        if (isMuted || volume === 0) {
          player.mute();
          player.setVolume(0);
        } else {
          player.unMute();
          player.setVolume(Math.round(volume * 100));
        }

        if (!playbackState.isPlaying) {
          player.pauseVideo();
        }
      } catch {
        setIsMutedByBrowser(true);
      }
      return;
    }

    // B. Synchronize Play / Pause and Align Starting Timestamp
    try {
      if (typeof player.isMuted === "function" && player.isMuted() && !isMuted && volume > 0) {
        setIsMutedByBrowser(true);
      }

      const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
      const currentPos = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
      const drift = Math.abs(currentPos - targetTime);

      if (playbackState.isPlaying) {
        if (state !== 1 && state !== 3) {
          player.seekTo(targetTime, true);
          if (!isMuted && volume > 0) player.unMute();
          player.playVideo();
        } else if (drift > 2.2) {
          player.seekTo(targetTime, true);
        }
      } else {
        if (state === 1) {
          player.pauseVideo();
        }
      }
    } catch {
      setIsMutedByBrowser(true);
    }
  }, [isReady, song?.videoId, playbackState.isPlaying, playbackState.currentTime, playbackState.updatedAt]);

  const handleUnmute = () => {
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(Math.max(20, Math.round(volume * 100)));
        playerRef.current.playVideo();
        setIsMutedByBrowser(false);
      } catch (e) {
        console.warn("Unmute failed:", e);
      }
    }
  };

  return (
    <div className="w-full relative">
      {/* Tap to Unmute Banner if browser auto-muted audio */}
      {isMutedByBrowser && (
        <div 
          onClick={handleUnmute}
          className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-between text-xs font-bold shadow-xl shadow-indigo-500/25 cursor-pointer transform hover:scale-[1.01] active:scale-95 transition-all animate-bounce"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse text-yellow-300" />
            <span>🔊 Sound is muted by your browser. TAP HERE TO SYNC AUDIO!</span>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-xl text-xs">Unmute Now</span>
        </div>
      )}

      {/* Invisible YouTube Audio Streamer - Always present in DOM */}
      <div 
        className="fixed -bottom-96 -right-96 w-[200px] h-[200px] opacity-0 pointer-events-none overflow-hidden" 
        aria-hidden="true"
      >
        <div id="multimax-yt-iframe" className="w-full h-full" />
      </div>
    </div>
  );
};