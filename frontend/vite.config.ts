import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        global: 'window',
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
    },
    optimizeDeps: {
        include: ['@stacks/connect'],
    },
})
