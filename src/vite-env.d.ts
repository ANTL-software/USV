/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOSTING_PLATFORM?: "cloudflare" | "vercel";
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
