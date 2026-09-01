import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  LogIn, 
  Camera, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Radio,
  Music,
  Users
} from "lucide-react";
import { getRoom, getActiveRooms, ActiveRoomSummary } from "../services/api";
import { addRecentRoom, getRecentRooms } from "../services/storage";
import { QRScannerModal } from "../components/QRScannerModal";

export const JoinRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const [activeRooms, setActiveRooms] = useState<ActiveRoomSummary[]>([]);

  useEffect(() => {
    setRecentRooms(getRecentRooms());

    // Load active rooms for easy 1-click discovery
    getActiveRooms()
      .then((res) => {
        if (res.rooms) {
          setActiveRooms(res.rooms);
        }
      })
      .catch(() => {});

    // If pre-filled by QR code scan link (/join?code=MAX-XXXX)
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setRoomCode(codeParam.toUpperCase().trim());
      validateAndJoin(codeParam);
    }
  }, [searchParams]);

  const normalizeInput = (raw: string): string => {
    if (!raw) return "";
    let clean = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean.startsWith("MAX") && clean.length > 0) {
      clean = `MAX${clean}`;
    }
    if (clean.length > 3) {
      return `MAX-${clean.substring(3)}`;
    }
    return clean;
  };

  const validateAndJoin = async (inputCode: string) => {
    const targetCode = inputCode.trim();
    if (!targetCode || targetCode.length < 3) {
      setError("Please enter a room code (e.g. 4821 or MAX-4821).");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await getRoom(targetCode);
      if (res.success && res.room) {
        addRecentRoom(res.room.code);
        navigate(`/room/${res.room.code}`);
      } else {
        setError(res.error || "Room not found or has expired. Make sure the room was created.");
      }
    } catch (err: any) {
      setError("Unable to connect to room. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndJoin(roomCode);
  };

  const handleScanSuccess = (scannedCode: string) => {
    setIsScannerOpen(false);
    setRoomCode(scannedCode);
    validateAndJoin(scannedCode);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-center relative overflow-hidden">
        {/* Glowing background */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Join a MultiMax Room
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-6">
          Enter code or scan the host's QR code. No account required.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 text-left">
                Enter Room Code
              </label>
              <span className="text-[11px] text-slate-400">e.g. 4821 or MAX-4821</span>
            </div>
            <input
              type="text"
              placeholder="MAX-4821"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl glass-input text-xl text-center font-mono font-bold text-white tracking-widest uppercase placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !roomCode}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Room...</span>
              </>
            ) : (
              <>
                <span>Join Room</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* QR Scan Button */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan QR Code with Camera</span>
          </button>
        </div>

        {/* Active Live Rooms (1-Click Join) */}
        {activeRooms.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Active Rooms (Click to Join Directly)</span>
            </div>
            <div className="space-y-2">
              {activeRooms.map((r) => (
                <button
                  key={r.code}
                  onClick={() => {
                    setRoomCode(r.code);
                    validateAndJoin(r.code);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl glass-card hover:bg-white/10 border border-emerald-500/20 text-left transition-all group"
                >
                  <div>
                    <div className="text-sm font-mono font-bold text-white group-hover:text-emerald-300 flex items-center gap-2">
                      <span>{r.code}</span>
                      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Live
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5 flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>{r.currentSong}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-white/5 px-2.5 py-1 rounded-lg">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>{r.guestCount}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Rooms Quick Rejoin */}
        {recentRooms.length > 0 && activeRooms.length === 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Joined</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentRooms.map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setRoomCode(code);
                    validateAndJoin(code);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-indigo-300 hover:text-white transition-all"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};