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
  ShieldCheck,
  Video,
  Radio,
  Globe,
  Loader2
} from "lucide-react";
import { Song } from "../types";
import { searchMusic } from "../services/api";
import { socketService } from "../services/socket";

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = [
  "🔥 Trending Hits",
  "🌸 Bollywood Classics",
  "✨ 90s Nostalgia",
  "🎤 Arijit Singh",
  "👑 Taylor Swift",
  "☕ Lo-Fi Beats",
  "⚡ EDM Party",
  "📻 Kishore Kumar"
];

export const AddMusicModal: React.FC<AddMusicModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"search" | "url" | "upload">("search");
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Custom URL Form State
  const [customTitle, setCustomTitle] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Search songs on modal open or search query change
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
      searchMusic(query)
        .then((res) => {
          setSongs(res);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [isOpen, query]);

  const handleTogglePreview = (song: Song) => {
    if (song.source === "youtube") {
      // For YouTube songs, play directly into room!
      socketService.playNow(song);
      onClose();
      return;
    }

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

  const handlePlayNow = (song: Song) => {
    socketService.playNow(song);
    onClose();
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customUrl) return;

    // Check if it's a YouTube URL
    const ytMatch = customUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    const videoId = ytMatch ? ytMatch[1] : undefined;

    const customSong: Song = {
      id: "custom-" + Date.now(),
      title: customTitle.trim(),
      artist: customArtist.trim() || "Independent Artist",
      duration: 180,
      url: customUrl.trim(),
      artwork: videoId 
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      genre: videoId ? "YouTube" : "Custom Stream",
      source: videoId ? "youtube" : "local",
      videoId
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
    const localSong: Song = {
      id: "local-file-" + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Device Audio",
      duration: 240,
      url: objectUrl,
      artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      genre: "Device Upload",
      source: "local"
    };

    socketService.addToQueue(localSong);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const s = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e101a] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Add Music to Room</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Global Search
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Search ANY new or old song, Bollywood, international, or paste a YouTube link!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-black/20">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "search"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Any Song</span>
          </button>
          <button
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "url"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Paste Link / URL</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {/* TAB 1: UNIVERSAL SEARCH */}
          {activeTab === "search" && (
            <div className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search any song, artist, Bollywood, 90s, or paste YouTube link..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Search Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {QUICK_TAGS.map((tag) => {
                  const rawQuery = tag.replace(/^[^\s]+\s/, "");
                  return (
                    <button
                      key={tag}
                      onClick={() => setQuery(rawQuery)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              {/* Songs List */}
              <div className="space-y-2 mt-2">
                {loading ? (
                  <div className="py-14 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    <span>Searching millions of songs worldwide...</span>
                  </div>
                ) : songs.length === 0 ? (
                  <div className="py-14 text-center text-slate-400 text-sm">
                    No songs found matching "{query}". Try another song name or artist.
                  </div>
                ) : (
                  songs.map((song) => {
                    const isPreviewing = previewingId === song.id;
                    const isAdded = addedIds.has(song.id);
                    const isYouTube = song.source === "youtube";

                    return (
                      <div
                        key={song.id}
                        className="flex items-center gap-3 p-3 rounded-xl glass-card hover:bg-white/[0.07] border border-white/5 transition-all group"
                      >
                        {/* Artwork */}
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 shadow-md">
                          <img
                            src={song.artwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {!isYouTube && (
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
                          )}
                        </div>

                        {/* Song Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {song.title}
                            </h4>
                            {isYouTube ? (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                YouTube
                              </span>
                            ) : (
                              <span className="flex-shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                MultiMax Original
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                            <span>{song.artist}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {formatTime(song.duration)}
                            </span>
                          </p>
                        </div>

                        {/* Play Now & Queue Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayNow(song)}
                            title="Play this song right now across all devices"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all shadow-sm active:scale-95"
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
                                : "bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 active:scale-95"
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

          {/* TAB 2: CUSTOM AUDIO / YOUTUBE URL */}
          {activeTab === "url" && (
            <form onSubmit={handleAddCustomUrl} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                💡 Paste any <strong>YouTube video link</strong> (e.g. <code>https://youtube.com/watch?v=...</code>) or direct <strong>audio stream (.mp3, .wav, .aac)</strong> to play it directly in the room!
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                  YouTube or Audio Stream URL *
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/audio.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Song Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. My Favorite Song"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Artist / Channel Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artist or Channel"
                    value={customArtist}
                    onChange={(e) => setCustomArtist(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!customTitle || !customUrl}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-sm transition-all"
              >
                Add Track to Room
              </button>
            </form>
          )}

          {/* TAB 3: LOCAL DEVICE FILE */}
          {activeTab === "upload" && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Upload Audio from Your Device</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an MP3, WAV, FLAC, or AAC audio file from your phone or computer to play in the room.
              </p>

              <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-500/25 transition-all">
                <Upload className="w-4 h-4" />
                <span>Select Audio File</span>
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
      </div>
    </div>
  );
};