import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Music2, 
  Copy, 
  Check, 
  Share2, 
  Sliders, 
  LogOut, 
  Users, 
  ListMusic, 
  Disc, 
  Radio, 
  AlertCircle, 
  Loader2, 
  WifiOff, 
  Crown,
  Plus
} from "lucide-react";
import { ClientRoomView, Guest, PlaybackState, Song } from "../types";
import { socketService } from "../services/socket";
import { audioEngine } from "../services/audioEngine";
import { 
  getStoredGuestId, 
  getStoredGuestName, 
  getHostToken, 
  detectDeviceType, 
  addRecentRoom 
} from "../services/storage";
import { MusicPlayer } from "../components/MusicPlayer";
import { QueuePanel } from "../components/QueuePanel";
import { ConnectedDevicesPanel } from "../components/ConnectedDevicesPanel";
import { AddMusicModal } from "../components/AddMusicModal";
import { HostControlsModal } from "../components/HostControlsModal";
import { QRModal } from "../components/QRModal";
import { PartyReactions } from "../components/PartyReactions";

export const RoomDashboardPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<ClientRoomView | null>(null);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  // Modals state
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Mobile navigation tab: "player" | "queue" | "devices"
  const [mobileTab, setMobileTab] = useState<"player" | "queue" | "devices">("player");

  const cleanCode = roomCode ? roomCode.toUpperCase().trim() : "";

  useEffect(() => {
    if (!cleanCode) {
      navigate("/join");
      return;
    }

    addRecentRoom(cleanCode);

    const guestId = getStoredGuestId();
    const guestName = getStoredGuestName();
    const hostToken = getHostToken(cleanCode) || undefined;
    const device = detectDeviceType();

    // Connect to room via socket
    socketService.joinRoom({
      roomCode: cleanCode,
      guestId,
      guestName,
      hostToken,
      device
    });

    const socket = socketService.getSocket();

    const handleRoomJoined = (payload: { room: ClientRoomView; guest: Guest; isHost: boolean }) => {
      setRoom(payload.room);
      setCurrentGuest(payload.guest);
      setIsHost(payload.isHost);
      setLoading(false);
      setIsDisconnected(false);

      // Sync initial audio
      audioEngine.syncPlayback(payload.room.currentSong, payload.room.playbackState);
    };

    const handleRoomStateUpdated = (payload: { room: ClientRoomView }) => {
      setRoom(payload.room);
      if (payload.room.guests && currentGuest) {
        const me = payload.room.guests.find(g => g.id === currentGuest.id);
        if (me) {
          setCurrentGuest(me);
          setIsHost(me.isHost);
        }
      }
      audioEngine.syncPlayback(payload.room.currentSong, payload.room.playbackState);
    };

    const handlePlaybackUpdated = (payload: { playbackState: PlaybackState; currentSong: Song | null }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          playbackState: payload.playbackState,
          currentSong: payload.currentSong
        };
      });
      audioEngine.syncPlayback(payload.currentSong, payload.playbackState);
    };

    const handleKicked = (data: { reason: string }) => {
      alert(data.reason || "You have been removed from the room.");
      navigate("/");
    };

    const handleRoomEnded = (data: { reason: string }) => {
      alert(data.reason || "The host has ended this room.");
      navigate("/");
    };

    const handleError = (data: { message: string }) => {
      if (!room) {
        setError(data.message);
        setLoading(false);
      }
    };

    const handleDisconnect = () => {
      setIsDisconnected(true);
    };

    const handleConnect = () => {
      setIsDisconnected(false);
      socketService.joinRoom({
        roomCode: cleanCode,
        guestId,
        guestName,
        hostToken,
        device
      });
    };

    socket.on("room_joined", handleRoomJoined);
    socket.on("room_state_updated", handleRoomStateUpdated);
    socket.on("playback_updated", handlePlaybackUpdated);
    socket.on("kicked_from_room", handleKicked);
    socket.on("room_ended", handleRoomEnded);
    socket.on("error_message", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("room_joined", handleRoomJoined);
      socket.off("room_state_updated", handleRoomStateUpdated);
      socket.off("playback_updated", handlePlaybackUpdated);
      socket.off("kicked_from_room", handleKicked);
      socket.off("room_ended", handleRoomEnded);
      socket.off("error_message", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socketService.leaveRoom();
    };
  }, [cleanCode, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (confirm("Leave this MultiMax music room?")) {
      socketService.leaveRoom();
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white">Connecting to Room {cleanCode}...</h3>
        <p className="text-xs text-slate-400 mt-1">Establishing real-time audio sync...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/15 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h3 className="text-2xl font-bold text-white">Room Unavailable</h3>
          <p className="text-sm text-slate-300">
            {error || "This MultiMax room doesn't exist or has expired."}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/join"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
            >
              Join Another Room
            </Link>
            <Link
              to="/create"
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25"
            >
              Create New Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canControlPlayback = isHost || room.settings.guestsCanControlPlayback !== false;

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-12">
      {/* Reconnecting Banner */}
      {isDisconnected && (
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 sticky top-16 z-40">
          <WifiOff className="w-4 h-4 animate-bounce" />
          <span>Connection lost. Reconnecting to MultiMax server...</span>
        </div>
      )}

      {/* DASHBOARD TOP BAR */}
      <div className="sticky top-16 z-30 w-full border-b border-white/10 glass-card backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Left: Brand / Room Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-tight">MultiMax</span>
              <span className="text-slate-600">•</span>
            </div>
            {/* Center Room Code Badge */}
            <div 
              onClick={handleCopyCode}
              title="Click to copy room code"
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer text-xs font-mono font-bold text-white transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Room: {cleanCode}</span>
              {copiedCode ? (
                <Check className="w-3 h-3 text-emerald-400 ml-1" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 ml-1" />
              )}
            </div>

            {/* Quick Add Music Button in Top Bar */}
            <button
              onClick={() => setIsAddMusicOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Music</span>
            </button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Device Count Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{room.guests.length}</span>
              <span className="hidden sm:inline text-slate-400">Devices</span>
            </button>

            {/* Share / QR Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
              title="Share room & QR code"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Host Controls Button */}
            {isHost && (
              <button
                onClick={() => setIsHostControlsOpen(true)}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Room Settings"
              >
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span className="hidden sm:inline">Host Controls</span>
              </button>
            )}

            {/* Leave Room Button */}
            <button
              onClick={handleLeaveRoom}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Leave room"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full">
        {/* Single Unified Grid: Player is NEVER unmounted so audio flows continuously! */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Main Music Player Column (Always mounted so sound never cuts out) */}
          <div className={`md:col-span-7 space-y-6 ${mobileTab !== "player" ? "hidden md:block" : "block"}`}>
            <MusicPlayer
              currentSong={room.currentSong}
              playbackState={room.playbackState}
              isHost={isHost}
              canControlPlayback={true}
              onOpenAddMusic={() => setIsAddMusicOpen(true)}
            />

            {/* Quick Guest Bar */}
            <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Listening as:</span>
                <span className="font-bold text-white px-2 py-0.5 rounded-md bg-white/10">
                  {currentGuest?.name || "Guest"}
                </span>
                {isHost && (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-amber-400" /> Host
                  </span>
                )}
              </div>
              <span className="text-slate-500 font-mono">
                {room.settings.queueLocked ? "Queue locked" : "Queue open"}
              </span>
            </div>
          </div>

          {/* Up Next Queue Column */}
          <div className={`md:col-span-5 space-y-6 ${mobileTab === "player" ? "hidden md:block" : mobileTab === "queue" ? "block" : "hidden md:block"}`}>
            <QueuePanel
              queue={room.queue}
              currentGuestId={currentGuest?.id || ""}
              isHost={isHost}
              queueLocked={room.settings.queueLocked}
              onOpenAddMusic={() => setIsAddMusicOpen(true)}
            />

            {/* Connected Devices shown in desktop right column */}
            <div className="hidden md:block">
              <ConnectedDevicesPanel
                guests={room.guests}
                currentGuestId={currentGuest?.id || ""}
                isHost={isHost}
                onOpenShare={() => setIsShareOpen(true)}
              />
            </div>
          </div>

          {/* Connected Devices (Mobile tab) */}
          {mobileTab === "devices" && (
            <div className="md:hidden space-y-6">
              <ConnectedDevicesPanel
                guests={room.guests}
                currentGuestId={currentGuest?.id || ""}
                isHost={isHost}
                onOpenShare={() => setIsShareOpen(true)}
              />
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07080d]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setMobileTab("player")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileTab === "player"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Disc className="w-5 h-5" />
          <span className="text-[10px]">Now Playing</span>
        </button>

        <button
          onClick={() => setMobileTab("queue")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            mobileTab === "queue"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ListMusic className="w-5 h-5" />
          <span className="text-[10px]">Up Next ({room.queue.length})</span>
        </button>

        <button
          onClick={() => setMobileTab("devices")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileTab === "devices"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">People ({room.guests.length})</span>
        </button>
      </nav>

      {/* REAL-TIME PARTY REACTIONS OVERLAY */}
      <PartyReactions />

      {/* MODALS */}
      <AddMusicModal
        isOpen={isAddMusicOpen}
        onClose={() => setIsAddMusicOpen(false)}
      />

      <HostControlsModal
        isOpen={isHostControlsOpen}
        onClose={() => setIsHostControlsOpen(false)}
        settings={room.settings}
        guests={room.guests}
        currentGuestId={currentGuest?.id || ""}
      />

      <QRModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        roomCode={cleanCode}
      />
    </div>
  );
};
