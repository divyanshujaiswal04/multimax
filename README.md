# 🎵 MultiMax — Real-Time Collaborative Music Room

> **One Room. Every Device. One Beat.**

MultiMax is a modern, production-quality, real-time collaborative music room platform. It connects phones, tablets, and laptops to the same synchronized music room **without requiring an account, sign-up, email, or password**.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 🔓 **Zero Sign-Up / No Logins**: No accounts, passwords, or emails. Visitors join instantly as temporary guests (`Guest-482`, `Guest-731`) and can optionally change their display name.
- ⚡ **Instant Synchronized Playback**: Authoritative server timestamp engine with microsecond drift correction so all connected devices play the exact same beat in rhythm.
- 📱 **Cross-Device & Mobile-First**: Mobile-optimized bottom navigation, swipe-friendly queue, compact player, and camera QR scanner. On desktop, a 3-column dashboard.
- 🎵 **Collaborative Queue & Voting**: Any connected guest can add songs from the catalog or paste audio streams. Upvoting songs automatically reorders the queue.
- 👑 **Authoritative Host Controls**: The room creator can lock/unlock the queue, skip or remove songs, clear the queue, kick users, or transfer host privileges.
- 📷 **Instant QR Code & Link Sharing**: Dynamic SVG QR code generated for every room with 1-click copy link, copy code, and camera QR scanning.
- 🔊 **Direct Local Audio Streaming**: Ships with built-in royalty-free tracks (Synthwave, Lo-Fi Chill, EDM, Funk, Ambient, Acoustic) served directly by Express without third-party CDN blocks or 403 errors.
- 🎉 **Party Reactions**: Real-time floating emoji bursts (🔥, 🎵, ⚡, ❤️, 🕺, 🔊, 🎉) showing sender names across all connected screens.
- 📻 **Audio Synced vs. Remote Mode**: Use a phone as a remote control without playing sound on the phone, while a laptop acts as the room speaker.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │      Client (Vite)     │
                                  │  React + TS + Tailwind │
                                  └──────────┬─────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │ REST API (Fetch)          Socket.IO (WSS) │
                       ▼                                           ▼
          ┌────────────────────────┐                   ┌────────────────────────┐
          │     Express Server     │                   │   Socket.IO Gateway    │
          │   - /api/rooms         │                   │   - Room state sync    │
          │   - /api/catalog       │                   │   - Queue operations   │
          │   - /audio/*           │                   │   - Host controls      │
          └────────────┬───────────┘                   └───────────┬────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │     In-Memory / File      │
                               │  - Authoritative Rooms    │
                               │  - Queues & Votes         │
                               │  - Auto-cleanup Expirer   │
                               └───────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/multimax.git
cd multimax
```

### 2. Install dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Run in Development Mode
In one terminal (Server):
```bash
cd server
npm run dev
```

In a second terminal (Client):
```bash
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Run in Production Mode
```bash
# Build frontend and backend
cd client && npm run build
cd ../server && npm run build

# Start server (serves both API, WebSockets, and Frontend)
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 📱 Connecting Multiple Devices

### Over Local Wi-Fi (Same Network)
1. Find your computer's local IP address (`ipconfig` on Windows or `ifconfig` on Mac/Linux).
2. Open **`http://YOUR_LOCAL_IP:5000`** on your phone, tablet, or another computer.
3. Or scan the QR code displayed on the host screen!

### Over the Internet (Public Sharing)
You can expose your local server securely to friends anywhere using [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):
```bash
cloudflared tunnel --url http://localhost:5000
```
Share the generated `https://xxxx.trycloudflare.com` link with friends!

---

## 📂 Project Structure

```
multimax/
├── .gitignore
├── README.md
├── server/
│   ├── src/
│   │   ├── server.ts         # Express & Socket.IO server setup
│   │   ├── roomManager.ts    # Authoritative room state, queue & voting
│   │   ├── socketHandler.ts  # Real-time WebSocket event listeners
│   │   ├── audioCatalog.ts   # Royalty-free music library
│   │   ├── networkHelper.ts  # Network IP & tunnel URL resolver
│   │   └── types.ts          # Shared TypeScript interfaces
│   ├── public/audio/         # Bundled royalty-free audio tracks
│   └── package.json
└── client/
    ├── src/
    │   ├── components/       # Player, Queue, Devices, Visualizer, Modals
    │   ├── pages/            # Home, Create, Join, RoomDashboard, HowItWorks
    │   ├── services/         # Socket.IO client, Web Audio engine, REST API
    │   ├── types/            # Frontend TypeScript types
    │   ├── App.tsx & main.tsx
    │   └── index.css         # Glassmorphism & dark music styling
    ├── tailwind.config.js
    └── package.json
```

---

## 📜 License

MIT License. Designed and engineered for collaborative music lovers.