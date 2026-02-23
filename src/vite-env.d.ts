/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VOICE_LIVE_ENABLED?: string;
  readonly VITE_VOICE_DIAGNOSTICS_ENABLED?: string;
  readonly VITE_VOICE_USE_WEBSOCKET_ONLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
