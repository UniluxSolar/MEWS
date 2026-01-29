import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            // Aliases handled by nodePolyfills are removed.
            // Keeping them might conflict or be redundant.
        },
    },
    server: {
        port: 8080,
        host: "0.0.0.0",
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    optimizeDeps: {
        include: ['xlsx-js-style']
    }
})
