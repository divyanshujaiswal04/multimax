import React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Smartphone, 
  Laptop, 
  Volume2, 
  QrCode, 
  Lock, 
  HelpCircle,
  ArrowRight,
  Headphones
} from "lucide-react";

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-card border border-white/10 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Understanding MultiMax</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          How MultiMax Works
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Designed from the ground up for zero-friction collaborative listening. No apps, no accounts, no barriers.
        </p>
      </div>

      {/* The Core Concept */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              One Room. Every Device. One Beat.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              MultiMax turns any collection of smartphones, tablets, and laptops into a unified musical collective. One person starts a room and gets a code (e.g. <strong>MAX-4821</strong>). Friends scan the QR code or enter the code in their browser.
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Everyone is immediately granted a temporary guest profile (such as <em>Guest-482</em>). You can search royalty-free tracks, add songs to the shared queue, upvote upcoming tracks, and feel the beats sync in real time.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Zero-Account Architecture
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>No Sign-Up:</strong> Never ask for an email, phone number, or password.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Instant Ephemeral Sessions:</strong> Guest profiles and rooms expire automatically after inactivity.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>No Tracking:</strong> Zero third-party trackers, cookies, or profiling.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Party Setups */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Playback Modes
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ways to Use MultiMax
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Setup 1: Party Jukebox */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Party Jukebox Mode</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect the host laptop or tablet to your sound system or Bluetooth speaker. Guests use their phones in <strong>Remote Mode</strong> to search songs and vote on the queue without their phones playing audio.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-indigo-400 font-semibold">
              Best for House Parties & BBQs
            </div>
          </div>

          {/* Setup 2: Multi-Speaker Sync */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Multi-Device Sync Mode</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Everyone turns on <strong>Audio Synced</strong> mode. Devices across the room or across different rooms play the identical beat in rhythm with microsecond drift correction.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-purple-400 font-semibold">
              Best for Multi-Room Audio
            </div>
          </div>

          {/* Setup 3: Study & Relax */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Co-Working & Study Sessions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tune into the same curated Lo-Fi study beats with your remote friends. Send floating emoji reactions and vote for the next chill track together.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-cyan-400 font-semibold">
              Best for Remote Friends & Study Groups
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Got Questions?
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Do I need a Spotify, Apple Music, or YouTube account?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              No! MultiMax is completely standalone. It comes with a built-in library of high-quality royalty-free and Creative Commons tracks across genres like Synthwave, Lo-Fi, EDM, and Funk. You can also add custom direct MP3 stream URLs or local audio files.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              What happens if the Host closes their browser?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              If the room creator disconnects, MultiMax automatically promotes the next guest in the room to Host, ensuring the music never stops. If everyone leaves, the room stays open for 30 minutes in case friends want to reconnect.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <h4 className="text-sm font-bold text-white mb-1.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Why do I see "Tap to listen along" on my phone?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Modern mobile browsers (iOS Safari & Android Chrome) block web pages from playing unmuted audio automatically without an initial screen tap. Tapping the prompt unlocks the audio hardware so you can hear the synced music!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/create"
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <span>Create a Free Room</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/join"
            className="px-6 py-3.5 rounded-2xl glass-card hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 transition-all"
          >
            Join Existing Room
          </Link>
        </div>
      </div>
    </div>
  );
};
