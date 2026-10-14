/// <reference types="vite/client" />

declare const __GIT_COMMIT__: string;

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
}
