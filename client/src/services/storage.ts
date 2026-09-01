const STORAGE_PREFIX = "multimax_";

// Use sessionStorage for guestId so each browser tab/window is treated as a distinct device!
export function getStoredGuestId(): string {
  let id = sessionStorage.getItem(`${STORAGE_PREFIX}guest_id`);
  if (!id) {
    id = "guest_" + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem(`${STORAGE_PREFIX}guest_id`, id);
  }
  return id;
}

export function getStoredGuestName(): string {
  return sessionStorage.getItem(`${STORAGE_PREFIX}guest_name`) || localStorage.getItem(`${STORAGE_PREFIX}guest_name`) || "";
}

export function setStoredGuestName(name: string): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}guest_name`, name);
  localStorage.setItem(`${STORAGE_PREFIX}guest_name`, name);
}

export function saveHostToken(roomCode: string, token: string): void {
  const clean = roomCode.toUpperCase().trim();
  localStorage.setItem(`${STORAGE_PREFIX}host_${clean}`, token);
  sessionStorage.setItem(`${STORAGE_PREFIX}host_${clean}`, token);
}

export function getHostToken(roomCode: string): string | null {
  const clean = roomCode.toUpperCase().trim();
  return sessionStorage.getItem(`${STORAGE_PREFIX}host_${clean}`) || localStorage.getItem(`${STORAGE_PREFIX}host_${clean}`);
}

export function addRecentRoom(roomCode: string): void {
  const clean = roomCode.toUpperCase().trim();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}recent_rooms`);
    let list: string[] = raw ? JSON.parse(raw) : [];
    list = [clean, ...list.filter(c => c !== clean)].slice(0, 5);
    localStorage.setItem(`${STORAGE_PREFIX}recent_rooms`, JSON.stringify(list));
  } catch (e) {
    // Ignore JSON error
  }
}

export function getRecentRooms(): string[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}recent_rooms`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}