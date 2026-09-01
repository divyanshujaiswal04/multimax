import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  ArrowRight, 
  Users, 
  Radio, 
  Loader2, 
  AlertCircle, 
  Globe, 
  Smartphone 
} from "lucide-react";
import { createRoom } from "../services/api";
import { saveHostToken, setStoredGuestName, addRecentRoom, detectDeviceType } from "../services/storage";
import { socketService } from "../services/socket";
import confetti from "canvas-confetti";

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [hostToken, setHostToken] = useState<string>("");
  const [deviceCount, setDeviceCount] = useState<number>(1);
  const [networkUrl, setNetworkUrl] = useState<string>("");
  const [publicUrl, setPublicUrl] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const device = detectDeviceType();

    createRoom(undefined, device)
      .then((res) => {
        setRoomCode(res.roomCode);
        setHostToken(res.hostToken);
        saveHostToken(res.roomCode, res.hostToken);
        setStoredGuestName(res.guest.name);
        addRecentRoom(res.roomCode);

        if ((res as any).publicUrl) {
          setPublicUrl((res as any).publicUrl);
        }

        if (res.networkUrl && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
          setNetworkUrl((res as any).publicUrl || res.networkUrl);
        } else {
          setNetworkUrl(window.location.origin);
        }

        socketService.joinRoom({
          roomCode: res.roomCode,
          guestId: res.guest.id,
          guestName: res.guest.name,
          hostToken: res.hostToken,
          device
        });

        const socket = socketService.getSocket();
        socket.on("room_state_updated", (payload) => {
          if (payload.room?.guests) {
            setDeviceCount(payload.room.guests.length);
          }
        });
      })
      .catch((err) => {
        console.error("Create room error:", err);
        setError("Failed to create room. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      const socket = socketService.getSocket();
      socket.off("room_state_updated");
    };
  }, []);

  const baseOrigin = publicUrl || networkUrl || window.location.origin;
  const joinUrl = roomCode ? `${baseOrigin}/join?code=${roomCode}` : "";
  const publicJoinUrl = (publicUrl && roomCode) ? `${publicUrl}/join?code=${roomCode}` : "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPublicLink = () => {
    if (publicJoinUrl) {
      navigator.clipboard.writeText(publicJoinUrl);
      setCopiedPublicLink(true);
      setTimeout(() => setCopiedPublicLink(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MultiMax Room: ${roomCode}`,
          text: `Join my collaborative music room without creating an account!`,
          url: joinUrl
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEnterRoom = () => {
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Generating your music room...</p>
          </div>
        ) : error ? (
          <div className="py-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Oops! Something went wrong</h3>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-5 relative z-10">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Room Created</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your Room Is Ready 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Share this link or scan the QR code to join instantly.
              </p>
            </div>

            {/* Public Link Callout for Friends Anywhere */}
            {publicJoinUrl && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-indigo-500/15 border border-emerald-500/30 text-left space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>Send this link to friends (Worldwide):</span>
                  </span>
                  <button
                    onClick={handleCopyPublicLink}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    {copiedPublicLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPublicLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-200 break-all select-all bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {publicJoinUrl}
                </p>
              </div>
            )}

            {/* Room Code Big Display */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Room Code
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-wider">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  title="Copy room code"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-3.5 bg-white rounded-2xl inline-block shadow-2xl mx-auto">
              <QRCodeSVG
                value={joinUrl}
                size={155}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Live Waiting Status */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for people to join...</span>
              </div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Connected Devices: {deviceCount}</span>
              </div>
            </div>

            {/* Sharing Action Buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>Copy Code</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />}
                <span>Copy Link</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Share</span>
              </button>
            </div>

            {/* Enter Room Main Button */}
            <button
              onClick={handleEnterRoom}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <span>Enter Room</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};