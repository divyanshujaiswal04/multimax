import React, { useState } from "react";
import { 
  X, 
  Crown, 
  Lock, 
  Unlock, 
  Sliders, 
  Trash2, 
  Power, 
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { Guest, RoomSettings } from "../types";
import { socketService } from "../services/socket";

interface HostControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RoomSettings;
  guests: Guest[];
  currentGuestId: string;
}

export const HostControlsModal: React.FC<HostControlsModalProps> = ({
  isOpen,
  onClose,
  settings,
  guests,
  currentGuestId
}) => {
  const [selectedHostId, setSelectedHostId] = useState("");

  if (!isOpen) return null;

  const handleToggleLockQueue = () => {
    socketService.lockQueue(!settings.queueLocked);
  };

  const handleTogglePlaybackControl = () => {
    socketService.updateSettings({
      guestsCanControlPlayback: !settings.guestsCanControlPlayback
    });
  };

  const handleClearQueue = () => {
    if (confirm("Are you sure you want to clear the entire music queue?")) {
      socketService.clearQueue();
    }
  };

  const handleTransferHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHostId) {
      if (confirm("Are you sure you want to transfer host privileges to this guest?")) {
        socketService.transferHost(selectedHostId);
        onClose();
      }
    }
  };

  const handleEndRoom = () => {
    if (confirm("Are you sure you want to end this room for all connected devices?")) {
      socketService.endRoom();
      onClose();
    }
  };

  const eligibleNewHosts = guests.filter(g => g.id !== currentGuestId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0e101a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Host Controls</h3>
              <p className="text-xs text-slate-400">Manage room permissions and playback</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Permissions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Queue & Playback Permissions
            </h4>

            {/* Lock Queue Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.queueLocked ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400"}`}>
                  {settings.queueLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Lock Queue</div>
                  <div className="text-xs text-slate-400">
                    {settings.queueLocked ? "Only host can add songs" : "Anyone can add songs"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleLockQueue}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  settings.queueLocked
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                {settings.queueLocked ? "Locked" : "Unlocked"}
              </button>
            </div>

            {/* Guest Playback Controls Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Guest Playback Controls</div>
                  <div className="text-xs text-slate-400">
                    {settings.guestsCanControlPlayback
                      ? "Guests can pause, resume, and skip"
                      : "Only host can control playback"}
                  </div>
                </div>
              </div>

              <button
                onClick={handleTogglePlaybackControl}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  settings.guestsCanControlPlayback
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-white/5 text-slate-300 border-white/10 hover:text-white"
                }`}
              >
                {settings.guestsCanControlPlayback ? "Allowed" : "Host Only"}
              </button>
            </div>
          </div>

          {/* Section 2: Queue Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Queue Maintenance
            </h4>

            <button
              onClick={handleClearQueue}
              className="w-full flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Clear All Upcoming Songs</div>
                  <div className="text-xs text-slate-400">Removes all items from the current queue</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-rose-400">Clear</span>
            </button>
          </div>

          {/* Section 3: Transfer Host */}
          {eligibleNewHosts.length > 0 && (
            <form onSubmit={handleTransferHost} className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transfer Host Role
              </h4>
              <div className="flex items-center gap-2">
                <select
                  value={selectedHostId}
                  onChange={(e) => setSelectedHostId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white"
                >
                  <option value="" disabled className="bg-slate-900">
                    Select a connected guest...
                  </option>
                  {eligibleNewHosts.map((g) => (
                    <option key={g.id} value={g.id} className="bg-slate-900">
                      {g.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedHostId}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-40 text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Transfer</span>
                </button>
              </div>
            </form>
          )}

          {/* Section 4: End Room Danger Zone */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h4>

            <button
              onClick={handleEndRoom}
              className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>End Room For Everyone</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
