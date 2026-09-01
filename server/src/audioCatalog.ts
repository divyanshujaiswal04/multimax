import { Song } from "./types";

export const AUDIO_CATALOG: Song[] = [
  {
    id: "track-1",
    title: "Midnight City Lights",
    artist: "Neon Pulse",
    album: "Retro Cyberwave Vol. 1",
    duration: 65,
    genre: "Synthwave",
    artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-1.wav"
  },
  {
    id: "track-2",
    title: "Coffee & Raindrops",
    artist: "Chilled Velvet",
    album: "Sunday Lo-Fi Study",
    duration: 70,
    genre: "Lo-Fi Beats",
    artwork: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-2.wav"
  },
  {
    id: "track-3",
    title: "Starlight Voyage",
    artist: "Cosmic Odyssey",
    album: "Galactic Horizons",
    duration: 75,
    genre: "Ambient",
    artwork: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-3.wav"
  },
  {
    id: "track-4",
    title: "Groove Dimension",
    artist: "The Funk Syndicate",
    album: "Solar Flare EP",
    duration: 65,
    genre: "Funk / Groove",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-4.wav"
  },
  {
    id: "track-5",
    title: "Main Stage Energy",
    artist: "Drop Voltage",
    album: "Festival Anthems",
    duration: 65,
    genre: "EDM / Dance",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-5.wav"
  },
  {
    id: "track-6",
    title: "Sunset Boulevard Chill",
    artist: "Aura Vibe",
    album: "Golden Hour Sessions",
    duration: 65,
    genre: "Acoustic Chill",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
    url: "/audio/track-6.wav"
  }
];

export function searchCatalog(query: string): Song[] {
  if (!query || !query.trim()) {
    return AUDIO_CATALOG;
  }
  const q = query.toLowerCase().trim();
  return AUDIO_CATALOG.filter(
    (song) =>
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      (song.album && song.album.toLowerCase().includes(q)) ||
      (song.genre && song.genre.toLowerCase().includes(q))
  );
}