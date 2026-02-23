/**
 * Single source of truth for concierge session persistence.
 * Keyed by trip_id (or context_id); unifies message history, query limits, voice state.
 */

export type VoiceSessionState =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "error"
  | "fallback_text";

export interface ConciergeMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ConciergeSession {
  tripId: string;
  messages: ConciergeMessage[];
  queryCount: number;
  queryLimit: number; // Free=5, Explorer=10, etc.
  voiceState: VoiceSessionState;
  lastError: string | null;
  lastErrorAt: number | null;
  lastSuccessAt: number | null;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = "concierge_session_";

function storageKey(tripId: string): string {
  return `${STORAGE_KEY_PREFIX}${tripId}`;
}

const DEFAULT_QUERY_LIMIT_FREE = 5;
const DEFAULT_QUERY_LIMIT_EXPLORER = 10;

const sessions = new Map<string, ConciergeSession>();

function loadFromStorage(tripId: string): ConciergeSession | null {
  try {
    const raw = localStorage.getItem(storageKey(tripId));
    if (!raw) return null;
    return JSON.parse(raw) as ConciergeSession;
  } catch {
    return null;
  }
}

function saveToStorage(session: ConciergeSession): void {
  try {
    localStorage.setItem(storageKey(session.tripId), JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function getOrCreateSession(
  tripId: string,
  queryLimit: number = DEFAULT_QUERY_LIMIT_FREE
): ConciergeSession {
  let session = sessions.get(tripId) ?? loadFromStorage(tripId);
  if (!session) {
    session = {
      tripId,
      messages: [],
      queryCount: 0,
      queryLimit,
      voiceState: "idle",
      lastError: null,
      lastErrorAt: null,
      lastSuccessAt: null,
      createdAt: Date.now(),
    };
    sessions.set(tripId, session);
    saveToStorage(session);
  }
  return { ...session };
}

export function updateSession(
  tripId: string,
  updates: Partial<Omit<ConciergeSession, "tripId" | "createdAt">>
): ConciergeSession {
  const existing = getOrCreateSession(tripId);
  const updated: ConciergeSession = {
    ...existing,
    ...updates,
    tripId,
    createdAt: existing.createdAt,
  };
  sessions.set(tripId, updated);
  saveToStorage(updated);
  return updated;
}

export function addMessage(tripId: string, message: Omit<ConciergeMessage, "id">): ConciergeSession {
  const session = getOrCreateSession(tripId);
  const msg: ConciergeMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  };
  const updated: ConciergeSession = {
    ...session,
    messages: [...session.messages, msg],
  };
  sessions.set(tripId, updated);
  saveToStorage(updated);
  return updated;
}

export function incrementQueryCount(tripId: string): ConciergeSession {
  const session = getOrCreateSession(tripId);
  const newCount = session.queryCount + 1;
  return updateSession(tripId, { queryCount: newCount, lastSuccessAt: Date.now() });
}

export function canMakeQuery(tripId: string): boolean {
  const session = getOrCreateSession(tripId);
  return session.queryCount < session.queryLimit;
}

export function setVoiceState(tripId: string, state: VoiceSessionState): ConciergeSession {
  return updateSession(tripId, { voiceState: state });
}

export function setLastError(tripId: string, error: string): ConciergeSession {
  return updateSession(tripId, {
    lastError: error,
    lastErrorAt: Date.now(),
    voiceState: "error",
  });
}

export function getSession(tripId: string): ConciergeSession | null {
  return sessions.get(tripId) ?? loadFromStorage(tripId);
}

export function clearSession(tripId: string): void {
  sessions.delete(tripId);
  try {
    localStorage.removeItem(storageKey(tripId));
  } catch {
    // ignore
  }
}
