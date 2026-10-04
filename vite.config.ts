import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { copyFileSync } from 'node:fs'

// Deployed to GitHub Pages at https://<user>.github.io/<repo>/.
// Override with VITE_BASE=/ for root deploys, or leave as-is for the default.
const BASE = process.env.VITE_BASE ?? '/Learn-Finnish/'

// Copy dist/index.html -> dist/404.html so GitHub Pages serves the SPA
// regardless of the requested path (client-side React Router handles it).
const spaFallback = () => ({
  name: 'spa-404-fallback',
  closeBundle() {
    const out = 'dist'
    try {
      copyFileSync(`${out}/index.html`, `${out}/404.html`)
      // eslint-disable-next-line no-console
      console.log(`\n✨ Wrote ${out}/404.html for SPA fallback on GitHub Pages.`)
    } catch (e) {
      console.warn('Could not create 404.html:', (e as Error).message)
    }
  }
})

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'Learn Finnish',
        short_name: 'Finnish',
        description: 'Learn Finnish vocabulary and grammar with games and spaced repetition.',
        theme_color: '#003580',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        // The course content is bundled into JS; keep the whole app precached for offline use.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // When the SW can't match a route (e.g. deep link into the SPA),
        // fall back to the app shell so React Router can take over.
        navigateFallback: `${command === 'build' ? BASE : '/'}index.html`
      }
    }),
    spaFallback()
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: { host: true, port: 5173 }
}))
