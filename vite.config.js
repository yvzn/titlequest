import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

import legacy from '@vitejs/plugin-legacy'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                cookieConsent: resolve(__dirname, 'cookie-consent.html'),
                stats: resolve(__dirname, 'stats.html'),
                redirect: resolve(__dirname, 'redirect/index.html'),
            }
        }
    },
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
    ]
})