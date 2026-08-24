/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECTS_PASSWORD?: string;
  readonly APP_URL?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
