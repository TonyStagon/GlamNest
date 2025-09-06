import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Enable mkcert for HTTPS development server
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), mkcert()],
    server: {
        https: true,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: path => path.replace(/^\/api/, '')
            }
        }
    }
})