import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://61.246.67.74:4000',  // Proxy API requests to backend server
        },
    },
    build: {
        outDir: 'dist',  // Output directory for the build
    },
});
