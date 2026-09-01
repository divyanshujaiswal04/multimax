import React, { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Plus, 
  Play, 
  Pause, 
  Sparkles, 
  Link as LinkIcon, 
  Upload, 
  Check, 
  Music,
  ShieldCheck
} from "lucide-react";
import { Song } from "../types";
import { getCatalog } from "../services/api";
import { socketService } from "../services/socket";

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"catalog" | "url" | "upload">("catalog");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Custom URL Form State
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Load catalog on modal open or search change
  useEffect(() => {
    if (!isOpen) {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
        setPreviewingId(null);
      }
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(() => {
      getCatalog(query)
        .then((res) => setCatalog(res.catalog))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [isOpen, query]);

  const handleTogglePreview = (song: Song) => {
    if (previewingId === song.id && previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPreviewingId(null);
    } else {
      if (previewAudio) previewAudio.pause();
      const a = new Audio(song.url);
      a.volume = 0.6;
      a.play().catch(console.warn);
      a.onended = () => {
        setPreviewAudio(null);
        setPreviewingId(null);
      };
      setPreviewAudio(a);
      setPreviewingId(song.id);
    }
  };

  const handleAddSong = (song: Song) => {
    socketService.addToQueue(song);
    setAddedIds((prev) => new Set(prev).add(song.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }, 2000);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customUrl) return;

    const customSong: Song = {
      id: "custom-" + Date.now(),
      title: customTitle.trim(),
      artist: customArtist.trim() || "Independent Artist",
      duration: 180,
      url: customUrl.trim(),
      artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      genre: "Custom Stream"
    };

    socketService.addToQueue(customSong);
    setCustomTitle("");
    setCustomArtist("");
    setCustomUrl("");
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    const uploadedSong: Song = {
      id: "upload-" + Date.now(),
      title: fileName,
      artist: "Local Stream",
      duration: 200,
      url: objectUrl,
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      genre: "User Upload"
    };

    socketService.addToQueue(uploadedSong);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e101a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Add Music to Room</h3>
              <p className="text-xs text-slate-400">Search royalty-free tracks or add direct audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 px-6 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "catalog"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Royalty-Free Catalog
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "url"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Custom Audio URL
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === "upload"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Upload Audio
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: CATALOG SEARCH */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title, artist, or genre (e.g. Synthwave, Lo-Fi, EDM)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              {/* Song List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Loading music catalog...
                  </div>
                ) : catalog.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No songs found matching "{query}". Try "Lo-Fi" or "Synthwave".
                  </div>
                ) : (
                  catalog.map((song) => {
                    const isPreviewing = previewingId === song.id;
                    const isAdded = addedIds.has(song.id);

                    return (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 p-3 rounded-xl glass-card hover:bg-white/[0.07] border border-white/5 transition-all group"
                      >
                        {/* Artwork with Preview Play Button */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900">
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleTogglePreview(song)}
                            title={isPreviewing ? "Stop preview" : "Listen preview"}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isPreviewing ? (
                              <Pause className="w-5 h-5 text-white fill-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-white translate-x-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Song Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {song.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                            <span>{song.artist}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {formatTime(song.duration)}
                            </span>
                            {song.genre && (
                              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300">
                                {song.genre}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Play Now & Queue Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              socketService.playNow(song);
                              onClose();
                            }}
                            title="Play this song right now in the room"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Play Now</span>
                          </button>

                          <button
                            onClick={() => handleAddSong(song)}
                            disabled={isAdded}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isAdded
                                ? "bg-white/10 text-slate-400 border border-white/10"
                                : "bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30"
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Queued</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Queue</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM AUDIO URL */}
          {activeTab === "url" && (
            <form onSubmit={handleAddCustomUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Track Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chill Beats Stream"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Artist (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Music Archive"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Direct Audio Stream URL (MP3/AAC/OGG) *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/stream.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all"
              >
                Add Stream to Queue
              </button>
            </form>
          )}

          {/* TAB 3: LOCAL FILE UPLOAD */}
          {activeTab === "upload" && (
            <div className="text-center p-8 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02]">
              <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Upload Audio File</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Select an MP3, WAV, or AAC audio file from your device to stream into the room.
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm cursor-pointer shadow-lg shadow-indigo-500/25 transition-all">
                <span>Select File</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Royalty-free & CC licensed music. No illegal downloads.
          </span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
