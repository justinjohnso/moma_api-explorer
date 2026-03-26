import type { HistoryReplayPayload, RequestHistory } from './types';
import type { MoMAObject } from './types';

const STORAGE_KEYS = {
  HISTORY: 'moma_request_history',
  THEME: 'moma_theme',
  HISTORY_REPLAY: 'moma_history_replay',
  DISCOVER_ARTWORK: 'moma_discover_artwork',
  DISCOVER_ARTWORKS: 'moma_discover_artworks',
} as const;

const MAX_HISTORY_ITEMS = 10;
const LEGACY_TOKEN_KEY = 'moma_api_token';
const SESSION_TOKEN_KEY = 'moma_api_token_session';
let tokenMemory: string | null = null;
let legacyTokenPurged = false;

function purgeLegacyTokenStorage(): void {
  if (typeof window === 'undefined' || legacyTokenPurged) return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  legacyTokenPurged = true;
}

export function getToken(): string | null {
  purgeLegacyTokenStorage();
  if (tokenMemory) return tokenMemory;
  if (typeof window === 'undefined') return null;
  const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!sessionToken) return null;
  tokenMemory = sessionToken;
  return tokenMemory;
}

export function setToken(token: string): void {
  purgeLegacyTokenStorage();
  tokenMemory = token;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearToken(): void {
  purgeLegacyTokenStorage();
  tokenMemory = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

export function getRequestHistory(): RequestHistory[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored) as Array<Partial<RequestHistory> & { url?: string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => typeof item.endpointId === 'string' && typeof item.endpointTitle === 'string')
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
        endpointId: item.endpointId as string,
        endpointTitle: item.endpointTitle as string,
        method: typeof item.method === 'string' ? item.method : 'GET',
        status: typeof item.status === 'number' ? item.status : 0,
        duration: typeof item.duration === 'number' ? item.duration : 0,
        safeUrl: typeof item.safeUrl === 'string' ? item.safeUrl : (item.url ?? ''),
      }));
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
    const parsed = JSON.parse(stored) as Partial<HistoryReplayPayload> & { url?: string };
    const safeUrl = parsed.safeUrl ?? parsed.url;
    if (typeof parsed.endpointId !== 'string' || typeof safeUrl !== 'string') return null;
    return { endpointId: parsed.endpointId, safeUrl };
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
