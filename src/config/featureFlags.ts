/**
 * Feature flags for Gemini Live voice.
 * Resolved at runtime for safe defaults in production.
 * Gate UI entrypoints + initialization so disabled = no initialization.
 */

const parseBool = (val: string | undefined): boolean =>
  val === "true" || val === "1" || val === "yes";

/** Voice Live enabled. Default false in production until confirmed. */
export function isVoiceLiveEnabled(): boolean {
  const val = import.meta.env?.VITE_VOICE_LIVE_ENABLED ?? "false";
  return parseBool(String(val));
}

/** Diagnostics logging for voice (connection codes, sample rates, etc.). */
export function isVoiceDiagnosticsEnabled(): boolean {
  const val = import.meta.env?.VITE_VOICE_DIAGNOSTICS_ENABLED ?? "false";
  return parseBool(String(val));
}

/** Require WebSocket-only; prevents silent downgrade to SSE/HTTP polling. */
export function isVoiceWebSocketOnly(): boolean {
  const val = import.meta.env?.VITE_VOICE_USE_WEBSOCKET_ONLY ?? "true";
  return parseBool(String(val));
}

/** Combined: voice feature is available (enabled + not blocked). */
export function isVoiceFeatureAvailable(): boolean {
  return isVoiceLiveEnabled();
}

export const voiceFeatureFlags = {
  liveEnabled: isVoiceLiveEnabled,
  diagnosticsEnabled: isVoiceDiagnosticsEnabled,
  webSocketOnly: isVoiceWebSocketOnly,
  featureAvailable: isVoiceFeatureAvailable,
} as const;
