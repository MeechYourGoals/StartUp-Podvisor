/**
 * Transport sanity for Gemini Live voice.
 * Enforces duplex-only (WebSocket) for Live voice.
 * Rejects SSE/HTTP polling; fails fast with explicit errors.
 */

import { isVoiceDiagnosticsEnabled, isVoiceWebSocketOnly } from "@/config/featureFlags";

export type TransportType = "websocket" | "webrtc" | "sse" | "http";

export interface TransportConfig {
  url: string;
  type: TransportType;
  apiKey?: string;
}

export class NonDuplexTransportError extends Error {
  constructor(transport: TransportType) {
    super(
      `Gemini Live voice requires duplex transport (WebSocket/WebRTC). ` +
        `Got: ${transport}. SSE/HTTP polling cannot support real barge-in duplex.`
    );
    this.name = "NonDuplexTransportError";
  }
}

/**
 * Assert that transport is duplex (WebSocket or WebRTC).
 * Call at initialization; fail fast if not.
 */
export function assertDuplexTransport(type: TransportType): void {
  const duplex = type === "websocket" || type === "webrtc";
  if (!duplex) {
    throw new NonDuplexTransportError(type);
  }
  if (isVoiceWebSocketOnly() && type === "webrtc") {
    // If strict WebSocket-only, we could reject WebRTC too; spec says "WebSocket or WebRTC"
    // so we allow both when webSocketOnly is about preventing SSE downgrade
  }
}

/**
 * Create transport for Gemini Live voice.
 * Centralizes transport creation; enforces duplex.
 */
export function createTransport(config: TransportConfig): WebSocket {
  assertDuplexTransport(config.type);

  if (config.type !== "websocket") {
    throw new NonDuplexTransportError(config.type);
  }

  const ws = new WebSocket(config.url);

  if (isVoiceDiagnosticsEnabled()) {
    ws.addEventListener("open", () => {
      console.log("[Voice] WebSocket connection opened.");
    });
    ws.addEventListener("close", (ev) => {
      console.log(
        `[Voice] WebSocket closed: code=${ev.code}, reason=${ev.reason || "(none)"}, clean=${ev.wasClean}`
      );
    });
    ws.addEventListener("error", () => {
      console.warn("[Voice] WebSocket error.");
    });
  }

  return ws;
}

/**
 * Validate that a given transport instance is WebSocket.
 */
export function isWebSocketTransport(transport: unknown): transport is WebSocket {
  return transport instanceof WebSocket;
}
