/**
 * React context for concierge session state.
 * Single source of truth; routes all session access through this store.
 */

import React, { createContext, useContext, useCallback, useMemo, useState } from "react";
import {
  getOrCreateSession,
  addMessage,
  incrementQueryCount,
  canMakeQuery,
  setVoiceState,
  setLastError,
  clearSession,
  type ConciergeSession,
  type ConciergeMessage,
  type VoiceSessionState,
} from "../stores/conciergeSessionStore";

interface ConciergeSessionContextValue {
  tripId: string | null;
  session: ConciergeSession | null;
  setTripId: (id: string | null) => void;
  addMessage: (message: Omit<ConciergeMessage, "id">) => void;
  incrementQuery: () => void;
  canMakeQuery: () => boolean;
  setVoiceState: (state: VoiceSessionState) => void;
  setLastError: (error: string) => void;
  clearSession: () => void;
}

const ConciergeSessionContext = createContext<ConciergeSessionContextValue | null>(null);

const DEFAULT_QUERY_LIMIT = 5;

export function ConciergeSessionProvider({
  children,
  defaultQueryLimit = DEFAULT_QUERY_LIMIT,
}: {
  children: React.ReactNode;
  defaultQueryLimit?: number;
}) {
  const [tripId, setTripIdState] = useState<string | null>(null);
  const [session, setSessionState] = useState<ConciergeSession | null>(null);

  const setTripId = useCallback(
    (id: string | null) => {
      setTripIdState(id);
      if (id) {
        const s = getOrCreateSession(id, defaultQueryLimit);
        setSessionState(s);
      } else {
        setSessionState(null);
      }
    },
    [defaultQueryLimit]
  );

  const addMessageCb = useCallback(
    (message: Omit<ConciergeMessage, "id">) => {
      if (!tripId) return;
      const updated = addMessage(tripId, message);
      setSessionState(updated);
    },
    [tripId]
  );

  const incrementQueryCb = useCallback(() => {
    if (!tripId) return;
    const updated = incrementQueryCount(tripId);
    setSessionState(updated);
  }, [tripId]);

  const canMakeQueryCb = useCallback(() => {
    if (!tripId) return false;
    return canMakeQuery(tripId);
  }, [tripId]);

  const setVoiceStateCb = useCallback(
    (state: VoiceSessionState) => {
      if (!tripId) return;
      const updated = setVoiceState(tripId, state);
      setSessionState(updated);
    },
    [tripId]
  );

  const setLastErrorCb = useCallback(
    (error: string) => {
      if (!tripId) return;
      const updated = setLastError(tripId, error);
      setSessionState(updated);
    },
    [tripId]
  );

  const clearSessionCb = useCallback(() => {
    if (tripId) {
      clearSession(tripId);
      setSessionState(null);
      setTripIdState(null);
    }
  }, [tripId]);

  const value = useMemo(
    () => ({
      tripId,
      session,
      setTripId,
      addMessage: addMessageCb,
      incrementQuery: incrementQueryCb,
      canMakeQuery: canMakeQueryCb,
      setVoiceState: setVoiceStateCb,
      setLastError: setLastErrorCb,
      clearSession: clearSessionCb,
    }),
    [
      tripId,
      session,
      setTripId,
      addMessageCb,
      incrementQueryCb,
      canMakeQueryCb,
      setVoiceStateCb,
      setLastErrorCb,
      clearSessionCb,
    ]
  );

  return (
    <ConciergeSessionContext.Provider value={value}>
      {children}
    </ConciergeSessionContext.Provider>
  );
}

export function useConciergeSession() {
  const ctx = useContext(ConciergeSessionContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
