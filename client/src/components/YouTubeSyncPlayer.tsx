import React, { useEffect, useRef, useState } from "react";
import { Song, PlaybackState } from "../types";
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
  onEnded?: () => void;
}

export const YouTubeSyncPlayer: React.FC<YouTubeSyncPlayerProps> = ({
  song,
  playbackState,
  onEnded
}) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMutedByBrowser, setIsMutedByBrowser] = useState(false);
  const currentVideoIdRef = useRef<string | null>(null);

  // 1. Load YouTube IFrame API script
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
              event.target.unMute();
              event.target.setVolume(95);
            } catch {}
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0 && onEnded) {
              onEnded();
            }
          }
        }
      });
    } catch (err) {
      console.warn("YouTube player init:", err);
    }
  };

  // 2. Smooth playback sync (Zero repeated seeks!)
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

    // Expected server playback time
    const now = Date.now();
    let targetTime = playbackState.currentTime;
    if (playbackState.isPlaying) {
      const elapsed = (now - playbackState.updatedAt) / 1000;
      targetTime = Math.min(playbackState.currentTime + elapsed, playbackState.duration || 600);
    }

    // A. Video changed: Load new video and start ONCE
    if (currentVideoIdRef.current !== videoId) {
      currentVideoIdRef.current = videoId;
      try {
        player.loadVideoById({
          videoId,
          startSeconds: Math.max(0, targetTime)
        });
        player.unMute();
        player.setVolume(95);

        if (!playbackState.isPlaying) {
          player.pauseVideo();
        }
      } catch {
        setIsMutedByBrowser(true);
      }
      return;
    }

    // B. Handle Play / Pause state transitions without seeking
    try {
      if (typeof player.isMuted === "function" && player.isMuted()) {
        setIsMutedByBrowser(true);
      }

      const state = typeof player.getPlayerState === "function" ? player.getPlayerState() : -1;
      // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING

      if (playbackState.isPlaying) {
        if (state !== 1 && state !== 3) {
          player.unMute();
          player.playVideo();
        }
      } else {
        if (state === 1) {
          player.pauseVideo();
        }
      }

      // C. ONLY seek if drift is HUGE (> 6.0s)
      const currentPos = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
      const drift = Math.abs(currentPos - targetTime);

      if (drift > 6.0) {
        player.seekTo(targetTime, true);
      }
    } catch {
      setIsMutedByBrowser(true);
    }
  }, [isReady, song?.videoId, playbackState.isPlaying, playbackState.currentTime]);

  const handleUnmute = () => {
    if (playerRef.current) {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(95);
        playerRef.current.playVideo();
        setIsMutedByBrowser(false);
      } catch (e) {
        console.warn("Unmute failed:", e);
      }
    }
  };

  if (!song || song.source !== "youtube") return null;

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
            <span>🔊 Audio is muted by your browser. TAP HERE TO HEAR MUSIC!</span>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-xl text-xs">Unmute Now</span>
        </div>
      )}

      {/* Invisible YouTube Audio Streamer - Pure Audio Experience! */}
      <div 
        className="fixed -bottom-96 -right-96 w-[200px] h-[200px] opacity-0 pointer-events-none overflow-hidden" 
        aria-hidden="true"
      >
        <div id="multimax-yt-iframe" className="w-full h-full" />
      </div>
    </div>
  );
};