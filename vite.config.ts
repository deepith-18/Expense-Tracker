import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'FIREBASE_'])
  const getVal = (viteKey: string, plainKey: string) =>
    process.env[viteKey] || env[viteKey] || process.env[plainKey] || env[plainKey] || ''

  return {
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(getVal('VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY')),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(getVal('VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN')),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(getVal('VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID')),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(getVal('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET')),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(getVal('VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID')),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(getVal('VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID')),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(getVal('VITE_FIREBASE_MEASUREMENT_ID', 'FIREBASE_MEASUREMENT_ID')),
    },
    envPrefix: ['VITE_', 'FIREBASE_'],
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
        manifest: {
          name: 'SpendSense — Smart Expense Intelligence',
          short_name: 'SpendSense',
          description: 'Instant clarity on how much you spend, where it goes, and what to do next.',
          theme_color: '#090D16',
          background_color: '#090D16',
          display: 'standalone',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
