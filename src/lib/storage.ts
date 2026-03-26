import type { HistoryReplayPayload, RequestHistory } from './types';
import type { MoMAObject } from './types';

const STORAGE_KEYS = {
  TOKEN: 'moma_api_token',
  HISTORY: 'moma_request_history',
  THEME: 'moma_theme',
  HISTORY_REPLAY: 'moma_history_replay',
  DISCOVER_ARTWORK: 'moma_discover_artwork',
  DISCOVER_ARTWORKS: 'moma_discover_artworks',
} as const;

const MAX_HISTORY_ITEMS = 10;

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getRequestHistory(): RequestHistory[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<RequestHistory, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  const history = getRequestHistory();
  const newEntry: RequestHistory = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
  };
  
  // Add to front and limit to MAX_HISTORY_ITEMS
  const updated = [newEntry, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getPendingHistoryReplay(): HistoryReplayPayload | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEYS.HISTORY_REPLAY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<HistoryReplayPayload>;
    if (typeof parsed.endpointId !== 'string' || typeof parsed.url !== 'string') return null;
    return { endpointId: parsed.endpointId, url: parsed.url };
  } catch {
    return null;
  }
}

export function setPendingHistoryReplay(payload: HistoryReplayPayload): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEYS.HISTORY_REPLAY, JSON.stringify(payload));
}

export function clearPendingHistoryReplay(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEYS.HISTORY_REPLAY);
}

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return (stored as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function getDiscoverArtwork(): MoMAObject | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.DISCOVER_ARTWORK);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as MoMAObject;
  } catch {
    return null;
  }
}

export function setDiscoverArtwork(artwork: MoMAObject): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DISCOVER_ARTWORK, JSON.stringify(artwork));
}

export function getDiscoverArtworks(): MoMAObject[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.DISCOVER_ARTWORKS);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as MoMAObject[]) : [];
  } catch {
    return [];
  }
}

export function setDiscoverArtworks(artworks: MoMAObject[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DISCOVER_ARTWORKS, JSON.stringify(artworks.slice(0, 3)));
}
