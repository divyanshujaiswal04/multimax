import React, { useState, useEffect } from "react";
import { Info, CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react";
import { Toast } from "../types";
import { socketService } from "../services/socket";

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "info" | "success" | "warning" | "error" = "info", duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const socket = socketService.getSocket();

    const onJoined = (data: { guestName: string }) => {
      addToast(`${data.guestName} joined the room! 🎵`, "info");
    };

    const onLeft = (data: { guestName: string }) => {
      addToast(`${data.guestName} left the room`, "warning");
    };

    const onError = (data: { message: string }) => {
      addToast(data.message, "error");
    };

    socket.on("guest_joined_toast", onJoined);
    socket.on("guest_left_toast", onLeft);
    socket.on("error_message", onError);

    return () => {
      socket.off("guest_joined_toast", onJoined);
      socket.off("guest_left_toast", onLeft);
      socket.off("error_message", onError);
    };
  }, []);

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl text-xs sm:text-sm font-medium animate-in slide-in-from-right duration-200 ${
            toast.type === "error"
              ? "bg-rose-950/80 text-rose-200 border-rose-500/30"
              : toast.type === "warning"
              ? "bg-amber-950/80 text-amber-200 border-amber-500/30"
              : toast.type === "success"
              ? "bg-emerald-950/80 text-emerald-200 border-emerald-500/30"
              : "bg-slate-900/90 text-white border-white/15"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            <span className="truncate">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
