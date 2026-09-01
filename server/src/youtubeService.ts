import { Song } from "./types";

function parseDurationToSeconds(durationStr: string): number {
  if (!durationStr) return 180;
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60) + parts[1];
  } else if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 180;
}

export function extractYouTubeVideoId(urlOrQuery: string): string | null {
  if (!urlOrQuery) return null;
  const match = urlOrQuery.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : null;
}

export async function searchYouTube(query: string, limit: number = 18): Promise<Song[]> {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00"
          }
        },
        query
      })
    });

    if (!res.ok) {
      console.warn("YouTube InnerTube returned status:", res.status);
      return [];
    }

    const data: any = await res.json();
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const songs: Song[] = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        const title = v.title?.runs?.map((r: any) => r.text).join("") || v.title?.simpleText || "Unknown Track";
        const artist = v.ownerText?.runs?.map((r: any) => r.text).join("") || "Various Artists";
        const durationStr = v.lengthText?.simpleText || "3:00";
        const duration = parseDurationToSeconds(durationStr);
        const thumb = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

        songs.push({
          id: `yt-${v.videoId}`,
          title,
          artist,
          album: "YouTube Music",
          duration,
          genre: "YouTube",
          artwork: thumb,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
          source: "youtube",
          videoId: v.videoId
        });

        if (songs.length >= limit) break;
      }
    }

    return songs;
  } catch (err: any) {
    console.warn("searchYouTube error:", err.message);
    return [];
  }
}

export async function getYouTubeVideoInfo(videoId: string): Promise<Song | null> {
  try {
    const results = await searchYouTube(videoId, 1);
    if (results.length > 0 && results[0].videoId === videoId) {
      return results[0];
    }
    return {
      id: `yt-${videoId}`,
      title: `YouTube Track (${videoId})`,
      artist: "YouTube",
      album: "YouTube Music",
      duration: 210,
      genre: "YouTube",
      artwork: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      source: "youtube",
      videoId
    };
  } catch {
    return null;
  }
}