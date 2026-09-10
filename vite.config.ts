import stylex from '@stylexjs/unplugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [stylex({ useCSSLayers: true }), react()],
})
