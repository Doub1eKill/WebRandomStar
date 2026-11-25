/// <reference types="vitest" />
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * S5: Content-Security-Policy for the production build. Added only at build time because the
 * dev server injects inline scripts (React Fast Refresh) that `script-src 'self'` would block.
 * - Google Fonts hosts are allowed only for the "custom font" option in Appearance, which
 *   loads a fonts.googleapis.com stylesheet the operator types in; the built-in fonts are local.
 * - Media is allowed from any host because music can be added from any URL (plus blob: for
 *   uploaded files kept in IndexedDB).
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  'media-src * blob: data:',
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
        injectTo: 'head-prepend'
      }
    ]
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contentSecurityPolicy()],
  resolve: {
    // A7: `@/x` = `src/x` (mirrored in tsconfig.json "paths")
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    environmentOptions: {
      // happy-dom 21 blocks external stylesheets by default (tests stay offline);
      // treat the blocked load as a success instead of logging a DOMException.
      happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: true } },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
