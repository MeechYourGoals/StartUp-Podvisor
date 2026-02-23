/**
 * Gemini Live voice hardening layer.
 * Feature flags, circuit breaker, transport, audio contract, session store.
 */

export {
  isVoiceLiveEnabled,
  isVoiceDiagnosticsEnabled,
  isVoiceWebSocketOnly,
  isVoiceFeatureAvailable,
  voiceFeatureFlags,
} from "@/config/featureFlags";

export {
  getCircuitBreakerState,
  recordSuccess,
  recordFailure,
  resetCircuitBreaker,
  isCircuitBreakerTripped,
  type CircuitBreakerConfig,
  type CircuitBreakerState,
} from "./circuitBreaker";

export {
  createTransport,
  assertDuplexTransport,
  isWebSocketTransport,
  NonDuplexTransportError,
  type TransportType,
  type TransportConfig,
} from "./transport/createTransport";

export {
  AUDIO_CONTRACT,
  validateAudioContract,
  assertChunkFraming,
  type AudioContract,
  type AudioContractValidation,
} from "./audioContract";

export {
  getOrCreateSession,
  updateSession,
  addMessage,
  incrementQueryCount,
  canMakeQuery,
  setVoiceState,
  setLastError,
  getSession,
  clearSession,
  type ConciergeSession,
  type ConciergeMessage,
  type VoiceSessionState,
} from "./stores/conciergeSessionStore";

export { useVoiceGate, type VoiceGateResult } from "./hooks/useVoiceGate";

export {
  ConciergeSessionProvider,
  useConciergeSession,
} from "./contexts/ConciergeSessionContext";
