import React from "react";
import { 
  Music, 
  Plus, 
  Trash2, 
  ThumbsUp, 
  Lock, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  User
} from "lucide-react";
import { QueueItem } from "../types";
import { socketService } from "../services/socket";

interface QueuePanelProps {
  queue: QueueItem[];
  currentGuestId: string;
  isHost: boolean;
  queueLocked: boolean;
  onOpenAddMusic: () => void;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  currentGuestId,
  isHost,
  queueLocked,
  onOpenAddMusic
}) => {
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVote = (itemId: string) => {
    socketService.voteSong(itemId);
  };

  const handleRemove = (itemId: string) => {
    socketService.removeFromQueue(itemId);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      socketService.reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < queue.length - 1) {
      socketService.reorderQueue(index, index + 1);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Up Next</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                {queue.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {queueLocked ? "Queue is locked by host" : "Vote to move favorite tracks up"}
            </p>
          </div>
        </div>

        {/* Add Music CTA */}
        <button
          onClick={onOpenAddMusic}
          disabled={queueLocked && !isHost}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            queueLocked && !isHost
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 active:scale-95"
          }`}
        >
          {queueLocked && !isHost ? (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Locked</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Music</span>
            </>
          )}
        </button>
      </div>

      {/* Queue List / Empty State */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1 max-h-[500px]">
        {queue.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Your queue is empty</h4>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Add some royalty-free beats or custom streams and get the party started.
            </p>
            <button
              onClick={onOpenAddMusic}
              disabled={queueLocked && !isHost}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Track</span>
            </button>
          </div>
        ) : (
          queue.map((item, index) => {
            const hasVoted = item.votes.includes(currentGuestId);
            const isOwner = item.addedBy.id === currentGuestId;
            const canDelete = isOwner || isHost;

            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-xl glass-card hover:bg-white/[0.07] border border-white/5 transition-all"
              >
                {/* Position Index */}
                <div className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                  {index + 1}
                </div>

                {/* Artwork */}
                <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-900 border border-white/10">
                  <img
                    src={item.song.artwork}
                    alt={item.song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Song Meta */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate leading-tight">
                    {item.song.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                    <span>{item.song.artist}</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {formatTime(item.song.duration)}
                    </span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-400">
                      <User className="w-2.5 h-2.5" />
                      {item.addedBy.name}
                      {isOwner && " (You)"}
                    </span>
                  </div>
                </div>

                {/* Actions: Play Now, Host Reorder, Vote, Delete */}
                <div className="flex items-center gap-1.5">
                  {/* Play Now Button */}
                  <button
                    onClick={() => socketService.playNow(item.song)}
                    title="Play this track now"
                    className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/20 transition-all group-hover:scale-105"
                  >
                    <Music className="w-3.5 h-3.5" />
                  </button>

                  {/* Host manual reorder buttons */}
                  {isHost && (
                    <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Move up"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === queue.length - 1}
                        title="Move down"
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleVote(item.id)}
                    title={hasVoted ? "Remove upvote" : "Upvote track"}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      hasVoted
                        ? "bg-indigo-500/25 text-indigo-300 border border-indigo-500/40"
                        : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5"
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? "fill-current" : ""}`} />
                    <span>{item.votes.length}</span>
                  </button>

                  {/* Remove Button */}
                  {canDelete && (
                    <button
                      onClick={() => handleRemove(item.id)}
                      title="Remove from queue"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
