import React, { useState, useEffect } from "react";
import { FloatingReaction } from "../types";
import { socketService } from "../services/socket";

const EMOJIS = ["🔥", "🎵", "⚡", "❤️", "🕺", "🔊", "🎉"];

export const PartyReactions: React.FC = () => {
  const [floatingItems, setFloatingItems] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    const socket = socketService.getSocket();

    const handleReaction = (payload: { emoji: string; senderName: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const left = 15 + Math.floor(Math.random() * 70); // 15% to 85%

      const newItem: FloatingReaction = {
        id,
        emoji: payload.emoji,
        senderName: payload.senderName,
        left
      };

      setFloatingItems((prev) => [...prev.slice(-15), newItem]);

      setTimeout(() => {
        setFloatingItems((prev) => prev.filter((item) => item.id !== id));
      }, 3000);
    };

    socket.on("party_reaction_received", handleReaction);

    return () => {
      socket.off("party_reaction_received", handleReaction);
    };
  }, []);

  const sendEmoji = (emoji: string) => {
    socketService.sendReaction(emoji);
  };

  return (
    <>
      {/* Floating Floating Particles Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingItems.map((item) => (
          <div
            key={item.id}
            className="absolute bottom-16 flex flex-col items-center animate-float-up opacity-0"
            style={{
              left: `${item.left}%`,
              animation: "floatUp 2.8s ease-out forwards"
            }}
          >
            <span className="text-3xl sm:text-4xl filter drop-shadow-lg transform hover:scale-125 transition-transform">
              {item.emoji}
            </span>
            <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-slate-300 px-1.5 py-0.5 rounded-full mt-1 border border-white/10 whitespace-nowrap">
              {item.senderName}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          75% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-280px) scale(1);
            opacity: 0;
          }
        }
      `}</style>

      {/* Floating Reaction Bar */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel border border-white/15 shadow-2xl backdrop-blur-xl">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendEmoji(emoji)}
            title={`React with ${emoji}`}
            className="p-1.5 sm:p-2 text-base sm:text-lg hover:scale-130 active:scale-90 transition-transform rounded-xl hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};
