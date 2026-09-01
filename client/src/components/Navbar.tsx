import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Music2, PlusCircle, LogIn, Radio, Info } from "lucide-react";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.startsWith("/room/");

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">
                MultiMax
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                LIVE SYNC
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden md:block">
              One Room. Every Device. One Beat.
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/how-it-works"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/how-it-works"
                ? "text-white bg-white/10"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">How It Works</span>
          </Link>

          {!isRoomPage && (
            <>
              <Link
                to="/join"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Join Room</span>
              </Link>

              <Link
                to="/create"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Room</span>
              </Link>
            </>
          )}

          {isRoomPage && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                In Room
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
