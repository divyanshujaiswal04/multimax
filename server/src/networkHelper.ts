import os from "os";
import fs from "fs";
import path from "path";

export function getPublicTunnelUrl(): string | null {
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
  if (process.env.RAILWAY_STATIC_URL) return `https://${process.env.RAILWAY_STATIC_URL}`;

  try {
    const p = path.resolve(__dirname, "../public_url.txt");
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8").trim();
      if (content.startsWith("http")) return content;
    }
  } catch {}
  return null;
}

export function getLocalNetworkIp(): string {
  const nets = os.networkInterfaces();
  const candidates: { name: string; address: string; priority: number }[] = [];

  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (!netList) continue;

    for (const net of netList) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254.")) {
        const lower = name.toLowerCase();
        let priority = 10;

        if (lower.includes("wi-fi") || lower.includes("wifi") || lower.includes("wireless")) {
          priority = 100;
        } else if (lower.includes("ethernet") && !lower.includes("vEthernet")) {
          priority = 90;
        } else if (lower.includes("vmnet") || lower.includes("vethernet") || lower.includes("wsl") || lower.includes("virtual")) {
          priority = 1;
        }

        candidates.push({ name, address: net.address, priority });
      }
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.length > 0 ? candidates[0].address : "localhost";
}