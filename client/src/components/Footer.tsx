import React from "react";
import { Link } from "react-router-dom";
import { Music2, ShieldCheck, Zap, Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#07080d]/80 backdrop-blur-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">MultiMax</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              One Room. Every Device. One Beat. Connect phones, tablets, and laptops to a single synchronized music room without accounts, sign-ups, or passwords.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> No Registration
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-400" /> Instant Real-Time
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-400" /> Pure Music
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white transition-colors">Create Room</Link>
              </li>
              <li>
                <Link to="/join" className="hover:text-white transition-colors">Join Room</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Privacy & About */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Zero-Account Privacy
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              MultiMax does not store passwords, emails, or personal profiles. Sessions are temporary and automatically self-destruct when inactive.
            </p>
            <div className="text-xs text-slate-500">
              Built for seamless music sharing everywhere.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MultiMax. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for collaborative music lovers
          </p>
        </div>
      </div>
    </footer>
  );
};
