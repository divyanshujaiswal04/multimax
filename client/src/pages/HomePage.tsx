import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  PlusCircle, 
  LogIn, 
  Music, 
  Zap, 
  Smartphone, 
  Unlock, 
  QrCode, 
  Crown, 
  Radio, 
  Volume2, 
  Laptop, 
  Tablet, 
  Play, 
  Pause,
  Disc3, 
  ArrowRight,
  ShieldCheck,
  Headphones
} from "lucide-react";
import { AudioVisualizer } from "../components/AudioVisualizer";

export const HomePage: React.FC = () => {
  const [demoPlaying, setDemoPlaying] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Subtle Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-white/10 text-xs font-semibold text-indigo-300 mb-6 shadow-inner animate-in fade-in duration-500">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Next-Generation Social Audio Streaming</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
            One Room. <br className="hidden sm:block" />
            <span className="text-gradient">Every Device. One Beat.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Connect your phones and laptops to the same music room. No sign-up. No login. Just join, add music, and enjoy together.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 transform hover:-translate-y-0.5 active:translate-y-0 transition-all glow-btn"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create a Room</span>
            </Link>

            <Link
              to="/join"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 hover:text-white font-bold text-base border border-white/15 shadow-lg active:scale-95 transition-all"
            >
              <LogIn className="w-5 h-5 text-cyan-400" />
              <span>Join a Room</span>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 shadow-sm">
              <Music className="w-3.5 h-3.5 text-pink-400" /> Real-Time Music
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 shadow-sm">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Any Device
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Sync
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 shadow-sm">
              <Unlock className="w-3.5 h-3.5 text-emerald-400" /> No Sign-Up
            </span>
          </div>

          {/* Multi-Device Room Mockup Visual */}
          <div className="relative max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 glass-panel border border-white/15 shadow-2xl overflow-hidden">
            {/* Top Mockup Header Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 px-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">MultiMax Live Session • MAX-4821</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-emerald-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>3 Devices in Sync</span>
              </div>
            </div>

            {/* Mockup Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Device 1: Host Laptop */}
              <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 relative group">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Laptop className="w-4 h-4 text-indigo-400" /> Living Room (Host)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    HOST
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800">
                    <img 
                      src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80" 
                      alt="Midnight City Lights"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Midnight City Lights</h4>
                    <p className="text-[11px] text-slate-400">Neon Pulse</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-indigo-500 w-3/5 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>01:45</span>
                    <span>03:05</span>
                  </div>
                </div>
              </div>

              {/* Device 2: Guest Phone */}
              <div className="glass-card rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <Smartphone className="w-4 h-4 text-purple-400" /> Alex's Phone
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px]">
                    Guest-731
                  </span>
                </div>
                <p className="text-xs font-semibold text-white mb-2">Up Next In Queue</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="truncate text-slate-300">Coffee & Raindrops</span>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">▲ 4 votes</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="truncate text-slate-300">Starlight Voyage</span>
                    <span className="text-[10px] font-mono text-slate-400">▲ 2 votes</span>
                  </div>
                </div>
              </div>

              {/* Device 3: Tablet Remote */}
              <div className="glass-card rounded-2xl p-4 border border-cyan-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <Tablet className="w-4 h-4 text-cyan-400" /> Kitchen Tablet
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px]">
                      SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">
                    "Zero delay between the speaker in the living room and tablet in the kitchen!"
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>Latency: &lt;15ms</span>
                  <span className="text-emerald-400 font-semibold">100% Lock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="py-20 bg-[#0a0c14]/60 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              Effortless Setup
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three Simple Steps to Sync Music
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
              <div className="text-5xl font-black text-white/10 group-hover:text-indigo-500/20 transition-colors mb-4 font-mono">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Create</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Click "Create Room". Your unique room code like <strong>MAX-4821</strong> and an instant QR code are generated on the spot.
              </p>
              <div className="inline-flex items-center text-xs font-semibold text-indigo-400 gap-1">
                <span>Instant Room Creation</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="text-5xl font-black text-white/10 group-hover:text-purple-500/20 transition-colors mb-4 font-mono">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Connect</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Share the QR code or room code. Friends point their phone cameras and hop directly into your room—no apps, no logins.
              </p>
              <div className="inline-flex items-center text-xs font-semibold text-purple-400 gap-1">
                <span>Zero Account Friction</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
              <div className="text-5xl font-black text-white/10 group-hover:text-cyan-500/20 transition-colors mb-4 font-mono">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Play</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Add royalty-free beats or custom streams, vote on the queue, and hear the rhythm synchronize across every device in real time.
              </p>
              <div className="inline-flex items-center text-xs font-semibold text-cyan-400 gap-1">
                <span>Shared Control & Audio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE CARDS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
            Pure Social Audio
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Shared Listening
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
              <Music className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Shared Music Queue</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Everyone in the room can add songs, browse tracks, and upvote their favorite upcoming jams.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Real-Time Updates</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              WebSocket-driven synchronization ensures votes, pauses, seeks, and queue additions reflect across devices instantly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Any Device</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Runs in any modern browser on iPhones, Android devices, MacBooks, Windows PCs, and iPads without installing anything.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Unlock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">No Sign-Up</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Zero login forms, zero email verification, zero password resets. Join instantly with a temporary guest identity.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-pink-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">QR Join</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scan the host's screen with your camera or an image upload to jump into the music room in under 2 seconds.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-panel rounded-2xl p-7 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Crown className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Host Controls</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              The room creator retains authoritative controls to lock the queue, skip tracks, remove users, or transfer ownership.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-16">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/30 shadow-2xl text-center overflow-hidden">
          <div className="relative z-10 space-y-5">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Start the Party?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Create a free room in 1 second, project it on your screen, and let your friends take control of the beat together.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/create"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all"
              >
                Create Room Now
              </Link>
              <Link
                to="/join"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-card hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all"
              >
                Enter with Code
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
