/**
 * Hook to gate voice initialization and handle circuit breaker.
 * Use at voice UI entrypoints; when disabled or tripped, do not initialize.
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { isVoiceLiveEnabled } from "@/config/featureFlags";
import {
  isCircuitBreakerTripped,
  resetCircuitBreaker,
  recordFailure,
  recordSuccess,
} from "../circuitBreaker";

const VOICE_FALLBACK_TOAST_ID = "voice-fallback-toast";

export interface VoiceGateResult {
  /** Voice can be initialized (flag on + circuit not tripped). */
  canUseVoice: boolean;
  /** Circuit breaker is tripped; show fallback UI. */
  isTripped: boolean;
  /** Reset circuit breaker (Try voice again). */
  tryVoiceAgain: () => void;
  /** Record a voice failure (increments circuit breaker). */
  recordVoiceFailure: () => void;
  /** Record a voice success (resets circuit breaker). */
  recordVoiceSuccess: () => void;
}

export function useVoiceGate(): VoiceGateResult {
  const [tripped, setTripped] = useState(isCircuitBreakerTripped());

  useEffect(() => {
    const check = () => {
      const nowTripped = isCircuitBreakerTripped();
      if (nowTripped && !tripped) {
        setTripped(true);
        toast("Voice is temporarily unavailable—switched to text.", {
          id: VOICE_FALLBACK_TOAST_ID,
          duration: 10000,
          action: {
            label: "Try voice again",
            onClick: () => {
              resetCircuitBreaker();
              setTripped(false);
              toast.dismiss(VOICE_FALLBACK_TOAST_ID);
            },
          },
        });
      } else if (!nowTripped) {
        setTripped(false);
      }
    };
    check();
  }, [tripped]);

  const tryVoiceAgain = useCallback(() => {
    resetCircuitBreaker();
    setTripped(false);
    toast.dismiss(VOICE_FALLBACK_TOAST_ID);
  }, []);

  const recordVoiceFailure = useCallback(() => {
    const state = recordFailure();
    if (state.tripped) {
      setTripped(true);
      toast("Voice is temporarily unavailable—switched to text.", {
        id: VOICE_FALLBACK_TOAST_ID,
        duration: 10000,
        action: {
          label: "Try voice again",
          onClick: tryVoiceAgain,
        },
      });
    }
  }, [tryVoiceAgain]);

  const recordVoiceSuccess = useCallback(() => {
    recordSuccess();
    setTripped(false);
  }, []);

  const enabled = isVoiceLiveEnabled();
  const circuitTripped = tripped || isCircuitBreakerTripped();
  const canUseVoice = enabled && !circuitTripped;

  return {
    canUseVoice,
    isTripped: circuitTripped,
    tryVoiceAgain,
    recordVoiceFailure,
    recordVoiceSuccess,
  };
}
