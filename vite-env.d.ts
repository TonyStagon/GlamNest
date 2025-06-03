/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    VITE_ADMIN_EMAIL?: string;
    VITE_ADMIN_PASSWORD?: string;
  };
}

/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAIL: string;
  readonly VITE_ADMIN_PASSWORD: string;
}