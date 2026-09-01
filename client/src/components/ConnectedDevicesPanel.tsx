import React, { useState } from "react";
import { 
  Users, 
  Crown, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Edit3, 
  Check, 
  UserX, 
  Share2,
  Sparkles
} from "lucide-react";
import { Guest } from "../types";
import { socketService } from "../services/socket";
import { setStoredGuestName } from "../services/storage";

interface ConnectedDevicesPanelProps {
  guests: Guest[];
  currentGuestId: string;
  isHost: boolean;
  onOpenShare: () => void;
}

export const ConnectedDevicesPanel: React.FC<ConnectedDevicesPanelProps> = ({
  guests,
  currentGuestId,
  isHost,
  onOpenShare
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const currentGuest = guests.find(g => g.id === currentGuestId);

  const startEditName = () => {
    setNameInput(currentGuest?.name || "");
    setEditingName(true);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      socketService.updateGuestName(nameInput.trim());
      setStoredGuestName(nameInput.trim());
    }
    setEditingName(false);
  };

  const handleKick = (targetGuestId: string) => {
    if (confirm("Are you sure you want to remove this device from the room?")) {
      socketService.kickGuest(targetGuestId);
    }
  };

  const getDeviceIcon = (device: "mobile" | "tablet" | "desktop") => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-cyan-400" />;
      default:
        return <Laptop className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">People in this Room</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{guests.length} {guests.length === 1 ? "Device Connected" : "Devices Connected"}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Invite</span>
        </button>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2 max-h-[360px] pr-1">
        {guests.map((guest) => {
          const isMe = guest.id === currentGuestId;

          return (
            <div
              key={guest.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isMe
                  ? "bg-indigo-500/10 border-indigo-500/30"
                  : "glass-card border-white/5 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Device Icon Avatar */}
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {getDeviceIcon(guest.device)}
                </div>

                {/* Name & Role */}
                <div className="min-w-0">
                  {isMe && editingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="px-2 py-0.5 rounded text-xs bg-slate-900 border border-indigo-500 text-white w-28 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1 rounded bg-indigo-500 text-white hover:bg-indigo-600"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white truncate">
                        {guest.name}
                      </span>
                      {isMe && (
                        <button
                          onClick={startEditName}
                          title="Change display name"
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-0.5">
                    {guest.isHost && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Crown className="w-3 h-3 fill-amber-400" /> Host
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-medium text-indigo-400">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Host kick button */}
              {isHost && !guest.isHost && (
                <button
                  onClick={() => handleKick(guest.id)}
                  title="Remove device from room"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <UserX className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom info note */}
      <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 text-center">
        No accounts required. Guest IDs exist only for this session.
      </div>
    </div>
  );
};
