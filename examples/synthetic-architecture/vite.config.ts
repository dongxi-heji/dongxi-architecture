import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {LikeC4VitePlugin} from 'likec4/vite-plugin'
import {offlineLikeC4Fonts} from './scripts/offline-fonts.mjs'
import {localRealityRefresh} from './scripts/reality-refresh.mjs'
export default defineConfig({plugins:[localRealityRefresh(),offlineLikeC4Fonts(),react(),LikeC4VitePlugin({ai:'disabled'})],optimizeDeps:{exclude:['likec4/react'],include:['react/compiler-runtime']},server:{host:'127.0.0.1'}})
