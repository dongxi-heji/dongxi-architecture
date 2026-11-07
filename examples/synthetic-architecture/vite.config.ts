import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {LikeC4VitePlugin} from 'likec4/vite-plugin'
import {offlineLikeC4Fonts} from './scripts/offline-fonts.mjs'
export default defineConfig({plugins:[offlineLikeC4Fonts(),react(),LikeC4VitePlugin({ai:'disabled'})],optimizeDeps:{exclude:['likec4/react']},server:{host:'127.0.0.1'}})
