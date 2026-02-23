# Gemini Live Voice Hardening — Runbook

## Overview

Ship-safe hardening layer for Gemini Live voice/duplex. Five guardrail features enable reliable iteration without regressions to text chat, trip navigation, or concierge UI.

---

## 1. Feature Flags

**Location:** `src/config/featureFlags.ts`

| Flag | Default | Purpose |
|------|---------|---------|
| `VITE_VOICE_LIVE_ENABLED` | `false` | Gate voice UI + initialization. Disabled = no initialization. |
| `VITE_VOICE_DIAGNOSTICS_ENABLED` | `false` | Log connection codes, sample rates, chunk framing. |
| `VITE_VOICE_USE_WEBSOCKET_ONLY` | `true` | Prevent silent downgrade to SSE/HTTP polling. |

### How to Toggle

1. Add to `.env` (or `.env.local`):
   ```
   VITE_VOICE_LIVE_ENABLED=true
   VITE_VOICE_DIAGNOSTICS_ENABLED=true
   ```
2. Restart dev server: `npm run dev`
3. Verify: `isVoiceLiveEnabled()` and `isVoiceDiagnosticsEnabled()` return `true`

### Gate Usage

```tsx
import { isVoiceLiveEnabled } from "@/config/featureFlags";

if (!isVoiceLiveEnabled()) {
  return null; // or text-only UI
}
// Initialize voice
```

---

## 2. Kill Switch + Circuit Breaker

**Location:** `src/voice/circuitBreaker.ts`, `src/voice/hooks/useVoiceGate.ts`

- **Threshold:** 3 failures within 5 minutes → trip
- **Fallback:** Toast "Voice is temporarily unavailable—switched to text." + "Try voice again" button
- **Storage:** `localStorage` key `voice_circuit_breaker` with 30-min expiry

### Integration

```tsx
import { useVoiceGate } from "@/voice";

function VoiceUI() {
  const { canUseVoice, recordVoiceFailure, recordVoiceSuccess, tryVoiceAgain } = useVoiceGate();

  if (!canUseVoice) {
    return <TextOnlyFallback onRetry={tryVoiceAgain} />;
  }

  const handleVoiceError = () => {
    recordVoiceFailure();
    // MUST: stop mic capture, close streams, release MediaStream
  };

  const handleVoiceSuccess = () => {
    recordVoiceSuccess();
  };
}
```

### On Fallback — Required Cleanup

When circuit breaker trips or `canUseVoice` becomes false:

1. Stop `MediaStreamTrack` (mic) via `track.stop()`
2. Close WebSocket if open
3. Release `AudioContext` if used
4. Do NOT retry until user clicks "Try voice again"

---

## 3. Transport Sanity (Duplex Required)

**Location:** `src/voice/transport/createTransport.ts`

- Live voice **rejects** SSE/HTTP polling
- `createTransport({ url, type: "websocket" })` creates WebSocket
- `assertDuplexTransport(type)` throws `NonDuplexTransportError` if not websocket/webrtc

### Usage

```ts
import { createTransport, assertDuplexTransport } from "@/voice";

// At init
assertDuplexTransport("websocket"); // throws if sse/http
const ws = createTransport({ url: wssUrl, type: "websocket" });
```

### Diagnostics

When `VITE_VOICE_DIAGNOSTICS_ENABLED=true`, logs:

- WebSocket `open`
- WebSocket `close` (code, reason, wasClean)
- WebSocket `error`

---

## 4. Audio Invariants

**Location:** `src/voice/audioContract.ts`

| Parameter | Value |
|-----------|-------|
| expectedSampleRateHz | 16000 |
| expectedEncoding | PCM16 little-endian |
| chunkDurationMs | 32 |
| maxBufferedPlaybackMs | 250 |
| vadThresholdRms | 0.01 |
| vadHangoverMs | 300 |

### Usage

```ts
import { AUDIO_CONTRACT, validateAudioContract, assertChunkFraming } from "@/voice";

// At AudioContext creation
const ctx = new AudioContext();
const validation = validateAudioContract(ctx.sampleRate);
if (!validation.ok) {
  // Resample or fail fast
  throw new Error(validation.errors.join("; "));
}

// Per chunk
assertChunkFraming(chunk.byteLength, isVoiceDiagnosticsEnabled());
```

### iOS Safari

Handle `AudioContext.resume()` on user gesture before capture.

---

## 5. Concierge Session Store

**Location:** `src/voice/stores/conciergeSessionStore.ts`, `src/voice/contexts/ConciergeSessionContext.tsx`

Single source of truth keyed by `trip_id`:

- Message history (persistent in UI)
- Query counts/limits (Free=5, Explorer=10)
- Voice session state machine
- last_error, last_success timestamps

### Usage

```tsx
// Wrap app or trip view
<ConciergeSessionProvider defaultQueryLimit={5}>
  <TripView />
</ConciergeSessionProvider>

// In component
const concierge = useConciergeSession();
concierge?.setTripId(tripId);
concierge?.addMessage({ role: "user", content: "...", timestamp: Date.now() });
concierge?.incrementQuery();
concierge?.canMakeQuery();
concierge?.setVoiceState("listening");
```

### Hydration Rules

- On trip open: `setTripId(tripId)` loads session from store
- On tab switch: session stays alive (no reset)
- Demo mode: session exists; network calls stubbed; UI stable

---

## How to Test

### 1. Flags

```bash
# .env.local
VITE_VOICE_LIVE_ENABLED=true
VITE_VOICE_DIAGNOSTICS_ENABLED=true
```

- Voice UI appears when enabled
- Voice UI hidden when disabled
- Console shows `[Voice]` logs when diagnostics on

### 2. Circuit Breaker

1. Enable voice
2. Simulate 3 failures (e.g., invalid API key, network error)
3. Toast appears: "Voice is temporarily unavailable—switched to text."
4. Click "Try voice again" → circuit resets
5. Verify no infinite reconnect loops

### 3. Transport

```ts
import { createTransport } from "@/voice";
// createTransport({ url: "...", type: "sse" }) → throws NonDuplexTransportError
```

### 4. Audio Contract

```ts
import { validateAudioContract } from "@/voice";
validateAudioContract(48000); // returns { ok: false, errors: [...] }
```

### 5. Session Persistence

1. Open trip, add messages
2. Navigate away, return
3. Messages and query count persist

---

## Files Changed

| File | Purpose |
|------|---------|
| `src/config/featureFlags.ts` | Feature flags |
| `src/voice/audioContract.ts` | Audio invariants |
| `src/voice/circuitBreaker.ts` | Circuit breaker |
| `src/voice/transport/createTransport.ts` | Duplex transport |
| `src/voice/stores/conciergeSessionStore.ts` | Session store |
| `src/voice/hooks/useVoiceGate.ts` | Voice gate hook |
| `src/voice/contexts/ConciergeSessionContext.tsx` | Session context |
| `src/voice/index.ts` | Public API |
| `src/vite-env.d.ts` | Env var types |
| `.env.example` | Env template |

---

## Acceptance Checklist

- [x] Flags reliably gate voice UI + initialization
- [x] Circuit breaker prevents loops; clean fallback to text
- [x] Transport duplex-only for Live voice; explicit errors
- [x] Audio contract enforced; mismatches handled
- [x] Concierge history + query limits persist across navigation
- [x] No regressions (build passes; no changes to text chat, trip tabs)
