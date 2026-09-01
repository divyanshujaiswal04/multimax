import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import cors from "cors";
import { roomManager } from "./roomManager";
import { setupSocketHandlers } from "./socketHandler";
import { searchCatalog, AUDIO_CATALOG } from "./audioCatalog";
import { getLocalNetworkIp, getPublicTunnelUrl } from "./networkHelper";

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());

// Initialize Socket.IO with CORS & both WebSocket and Polling transports
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"],
  pingTimeout: 30000,
  pingInterval: 15000
});

// Setup Socket.IO real-time event listeners
setupSocketHandlers(io);

// REST API Routes

// 1. Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "MultiMax Server",
    time: new Date().toISOString()
  });
});

// 2. Active Rooms (returns active rooms so users on /join can see available rooms)
app.get("/api/active-rooms", (req, res) => {
  const rooms = roomManager.getActiveRoomsSummary();
  res.json({
    success: true,
    count: rooms.length,
    rooms
  });
});

// 3. Network Info
app.get("/api/network-info", (req, res) => {
  const port = process.env.PORT || 5000;
  const ip = getLocalNetworkIp();
  const publicUrl = getPublicTunnelUrl();
  res.json({
    ip,
    port,
    localUrl: `http://localhost:${port}`,
    networkUrl: `http://${ip}:${port}`,
    publicUrl: publicUrl || undefined,
    shareUrl: publicUrl || `http://${ip}:${port}`
  });
});

// 4. Create Room
app.post("/api/rooms", (req, res) => {
  try {
    const { hostName, device } = req.body;
    const { room, hostGuest, hostToken } = roomManager.createRoom(hostName, device);

    const clientView = roomManager.getClientRoomView(room.code);
    const port = process.env.PORT || 5000;
    const ip = getLocalNetworkIp();
    const publicUrl = getPublicTunnelUrl();

    res.status(201).json({
      success: true,
      roomCode: room.code,
      hostToken,
      guest: hostGuest,
      room: clientView,
      networkUrl: `http://${ip}:${port}`,
      publicUrl: publicUrl || undefined,
      shareUrl: publicUrl || `http://${ip}:${port}`
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create room", details: err.message });
  }
});

// 5. Get Room Info (for joining validation)
app.get("/api/rooms/:code", (req, res) => {
  const rawCode = req.params.code;
  const room = roomManager.getRoom(rawCode);

  if (!room) {
    return res.status(404).json({
      success: false,
      error: `Room "${rawCode}" doesn't exist or has expired. Please verify the room code.`
    });
  }

  const clientView = roomManager.getClientRoomView(room.code);
  const port = process.env.PORT || 5000;
  const ip = getLocalNetworkIp();
  const publicUrl = getPublicTunnelUrl();

  res.json({
    success: true,
    room: clientView,
    networkUrl: `http://${ip}:${port}`,
    publicUrl: publicUrl || undefined,
    shareUrl: publicUrl || `http://${ip}:${port}`
  });
});

// 6. Search Royalty-Free Music Catalog
app.get("/api/catalog", (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  const results = searchCatalog(query);
  res.json({
    success: true,
    count: results.length,
    catalog: results
  });
});

// 6. Serve Local Royalty-Free Audio Files
const audioPath = path.resolve(__dirname, "../public/audio");
app.use("/audio", express.static(audioPath));

// 7. Serve Frontend Static Build
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalNetworkIp();
  const publicUrl = getPublicTunnelUrl();
  console.log(`🎵 MultiMax server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://${ip}:${PORT}`);
  if (publicUrl) {
    console.log(`   - Public (Worldwide): ${publicUrl}`);
  }
});