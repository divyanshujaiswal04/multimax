import { ClientRoomView, Guest, Song } from "../types";

export interface CreateRoomResponse {
  success: boolean;
  roomCode: string;
  hostToken: string;
  guest: Guest;
  room: ClientRoomView;
  networkUrl?: string;
  publicUrl?: string;
  shareUrl?: string;
}

export interface GetRoomResponse {
  success: boolean;
  room?: ClientRoomView;
  error?: string;
  networkUrl?: string;
  publicUrl?: string;
  shareUrl?: string;
}

export interface NetworkInfoResponse {
  ip: string;
  port: number;
  localUrl: string;
  networkUrl: string;
  publicUrl?: string;
  shareUrl: string;
}

export interface CatalogResponse {
  success: boolean;
  count: number;
  catalog: Song[];
}

export interface ActiveRoomSummary {
  code: string;
  currentSong: string;
  guestCount: number;
  createdAt: number;
}

export interface ActiveRoomsResponse {
  success: boolean;
  count: number;
  rooms: ActiveRoomSummary[];
}

export async function createRoom(hostName?: string, device?: string): Promise<CreateRoomResponse> {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostName, device })
  });
  if (!res.ok) {
    throw new Error("Failed to create room");
  }
  return res.json();
}

export async function getRoom(roomCode: string): Promise<GetRoomResponse> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode.trim())}`);
  if (!res.ok) {
    if (res.status === 404) {
      return { success: false, error: `Room "${roomCode}" not found or has expired.` };
    }
    throw new Error("Failed to fetch room info");
  }
  return res.json();
}

export async function getActiveRooms(): Promise<ActiveRoomsResponse> {
  try {
    const res = await fetch("/api/active-rooms");
    if (!res.ok) return { success: true, count: 0, rooms: [] };
    return res.json();
  } catch {
    return { success: true, count: 0, rooms: [] };
  }
}

export async function getNetworkInfo(): Promise<NetworkInfoResponse> {
  const res = await fetch("/api/network-info");
  if (!res.ok) {
    return {
      ip: window.location.hostname,
      port: Number(window.location.port) || 5000,
      localUrl: window.location.origin,
      networkUrl: window.location.origin,
      shareUrl: window.location.origin
    };
  }
  return res.json();
}

export async function getCatalog(query?: string): Promise<CatalogResponse> {
  const url = query ? `/api/catalog?q=${encodeURIComponent(query)}` : "/api/catalog";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load music catalog");
  }
  return res.json();
}

export async function searchMusic(query: string): Promise<Song[]> {
  try {
    const url = query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/search";
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error("searchMusic error:", e);
    return [];
  }
}