import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink,
  Globe,
  Wifi
} from "lucide-react";
import { getNetworkInfo, NetworkInfoResponse } from "../services/api";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoResponse | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    getNetworkInfo()
      .then((info) => setNetworkInfo(info))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Prefer public URL if available so friends anywhere in the world can click and join
  const primaryBaseUrl = (networkInfo as any)?.publicUrl || networkInfo?.networkUrl || window.location.origin;
  const primaryJoinUrl = `${primaryBaseUrl}/join?code=${encodeURIComponent(roomCode)}`;

  const localBaseUrl = networkInfo?.networkUrl || `http://${window.location.hostname}:5000`;
  const localJoinUrl = `${localBaseUrl}/join?code=${encodeURIComponent(roomCode)}`;

  const hasPublicUrl = Boolean((networkInfo as any)?.publicUrl);
  const publicJoinUrl = hasPublicUrl ? `${(networkInfo as any).publicUrl}/join?code=${encodeURIComponent(roomCode)}` : "";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(primaryJoinUrl);
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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join MultiMax Room: ${roomCode}`,
          text: `Hop into my collaborative music room on MultiMax! No sign-up required.`,
          url: primaryJoinUrl
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 text-center max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Invite Friends & Devices</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Send a link to your friends anywhere in the world!
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl mx-auto mb-4">
          <QRCodeSVG
            value={primaryJoinUrl}
            size={170}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Public Internet Link Callout */}
        {hasPublicUrl && (
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-500/30 text-left space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Worldwide Link (Send to Friends):</span>
              </span>
              <button
                onClick={handleCopyPublicLink}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                {copiedPublicLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPublicLink ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-200 break-all select-all bg-black/30 p-2 rounded-xl border border-white/5">
              {publicJoinUrl}
            </p>
          </div>
        )}

        {/* Room Code Badge */}
        <div className="mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Room Code
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-lg">
            <span>{roomCode}</span>
            <button
              onClick={handleCopyCode}
              title="Copy room code"
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all active:scale-95"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4 text-cyan-400" />}
            <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};