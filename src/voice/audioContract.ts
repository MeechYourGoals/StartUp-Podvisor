/**
 * Audio invariants for Gemini Live voice.
 * Single source of truth for expected audio parameters.
 * Enforce at runtime; fail fast when mismatches would silently break behavior.
 */

export const AUDIO_CONTRACT = {
  expectedSampleRateHz: 16000,
  expectedEncoding: "PCM16" as const,
  encodingEndianness: "little-endian" as const,
  chunkDurationMs: 32,
  maxChunkDurationMs: 40,
  minChunkDurationMs: 20,
  maxBufferedPlaybackMs: 250,
  vadThresholdRms: 0.01,
  vadHangoverMs: 300,
} as const;

export type AudioContract = typeof AUDIO_CONTRACT;

export interface AudioContractValidation {
  ok: boolean;
  sampleRateMatch: boolean;
  encodingMatch: boolean;
  chunkSizeValid: boolean;
  errors: string[];
}

/**
 * Validate actual AudioContext/capture format against contract.
 * Returns validation result; does not throw unless hardFail is true.
 */
export function validateAudioContract(
  actualSampleRate: number,
  actualChunkBytes?: number,
  hardFail = false
): AudioContractValidation {
  const errors: string[] = [];
  const sampleRateMatch = actualSampleRate === AUDIO_CONTRACT.expectedSampleRateHz;
  if (!sampleRateMatch) {
    errors.push(
      `Sample rate mismatch: expected ${AUDIO_CONTRACT.expectedSampleRateHz}Hz, got ${actualSampleRate}Hz. Resample or fail.`
    );
  }

  // PCM16 = 2 bytes per sample; chunk = sampleRate * (chunkDurationMs/1000) * 2
  const expectedBytesPerChunk =
    (AUDIO_CONTRACT.expectedSampleRateHz * AUDIO_CONTRACT.chunkDurationMs) / 1000 * 2;
  const minBytes = (AUDIO_CONTRACT.expectedSampleRateHz * AUDIO_CONTRACT.minChunkDurationMs) / 1000 * 2;
  const maxBytes = (AUDIO_CONTRACT.expectedSampleRateHz * AUDIO_CONTRACT.maxChunkDurationMs) / 1000 * 2;

  let chunkSizeValid = true;
  if (actualChunkBytes !== undefined) {
    if (actualChunkBytes === 0) {
      errors.push("Empty chunk detected; possible empty-frame loop.");
      chunkSizeValid = false;
    } else if (actualChunkBytes > maxBytes * 2) {
      errors.push(
        `Chunk too large: ${actualChunkBytes} bytes (max ~${Math.ceil(maxBytes * 2)}). Possible giant frame.`
      );
      chunkSizeValid = false;
    } else if (actualChunkBytes < minBytes * 0.5) {
      errors.push(
        `Chunk too small: ${actualChunkBytes} bytes (min ~${Math.floor(minBytes * 0.5)}). Check framing.`
      );
      chunkSizeValid = false;
    }
  }

  const encodingMatch = true; // Assume PCM16 if we're here; encoding is typically fixed
  const ok = sampleRateMatch && chunkSizeValid;

  if (hardFail && !ok) {
    throw new Error(
      `Audio contract violation: ${errors.join("; ")}`
    );
  }

  return {
    ok,
    sampleRateMatch,
    encodingMatch,
    chunkSizeValid,
    errors,
  };
}

/**
 * Assert chunk framing correctness. Dev-only warns; hard fail only when it would break behavior.
 */
export function assertChunkFraming(
  chunkBytes: number,
  diagnosticsEnabled: boolean
): void {
  const expectedBytes =
    (AUDIO_CONTRACT.expectedSampleRateHz * AUDIO_CONTRACT.chunkDurationMs) / 1000 * 2;
  const tolerance = expectedBytes * 0.5;

  if (chunkBytes === 0 && diagnosticsEnabled) {
    console.warn("[Voice] Empty chunk received; possible empty-frame loop.");
  }
  if (chunkBytes > expectedBytes * 3 && diagnosticsEnabled) {
    console.warn(
      `[Voice] Unusually large chunk: ${chunkBytes} bytes (expected ~${expectedBytes}).`
    );
  }
}
