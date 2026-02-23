/**
 * Circuit breaker for Gemini Live voice.
 * Triggers on repeated failures; falls back to text mode.
 * Prevents infinite reconnect loops; stops mic capture + closes streams on fallback.
 */

import { isVoiceDiagnosticsEnabled } from "@/config/featureFlags";

const STORAGE_KEY = "voice_circuit_breaker";
const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const EXPIRY_MS = 30 * 60 * 1000; // 30 min expiry for stored state

export interface CircuitBreakerConfig {
  failureThreshold: number;
  windowMs: number;
}

export interface CircuitBreakerState {
  failures: number;
  firstFailureAt: number | null;
  trippedAt: number | null;
  tripped: boolean;
}

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: DEFAULT_FAILURE_THRESHOLD,
  windowMs: DEFAULT_WINDOW_MS,
};

let inMemoryState: CircuitBreakerState = {
  failures: 0,
  firstFailureAt: null,
  trippedAt: null,
  tripped: false,
};

function loadFromStorage(): CircuitBreakerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CircuitBreakerState & { storedAt?: number };
    if (parsed.storedAt && Date.now() - parsed.storedAt > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: CircuitBreakerState): void {
  try {
    const toStore = { ...state, storedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // ignore
  }
}

export function getCircuitBreakerState(): CircuitBreakerState {
  const stored = loadFromStorage();
  if (stored) {
    inMemoryState = { ...inMemoryState, ...stored };
  }
  return { ...inMemoryState };
}

export function recordSuccess(): void {
  inMemoryState = {
    failures: 0,
    firstFailureAt: null,
    trippedAt: null,
    tripped: false,
  };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  if (isVoiceDiagnosticsEnabled()) {
    console.log("[Voice] Circuit breaker: success recorded, state reset.");
  }
}

export function recordFailure(config: CircuitBreakerConfig = defaultConfig): CircuitBreakerState {
  const now = Date.now();
  let { failures, firstFailureAt } = inMemoryState;

  if (firstFailureAt && now - firstFailureAt > config.windowMs) {
    failures = 0;
    firstFailureAt = null;
  }

  failures += 1;
  if (!firstFailureAt) firstFailureAt = now;

  const tripped = failures >= config.failureThreshold;
  inMemoryState = {
    failures,
    firstFailureAt,
    trippedAt: tripped ? now : null,
    tripped,
  };

  saveToStorage(inMemoryState);

  if (isVoiceDiagnosticsEnabled()) {
    console.log(
      `[Voice] Circuit breaker: failure ${failures}/${config.failureThreshold}, tripped=${tripped}`
    );
  }

  return { ...inMemoryState };
}

export function resetCircuitBreaker(): void {
  recordSuccess();
}

export function isCircuitBreakerTripped(): boolean {
  const state = getCircuitBreakerState();
  if (state.tripped && state.trippedAt) {
    if (Date.now() - state.trippedAt > EXPIRY_MS) {
      recordSuccess();
      return false;
    }
    return true;
  }
  return false;
}
