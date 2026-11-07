import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { LikeC4VitePlugin } from 'likec4/vite-plugin'

export default defineConfig({
  plugins: [react(), LikeC4VitePlugin()],
  server: {
    host: '127.0.0.1',
  },
})
