import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const outputsPath = path.join(rootDir, 'amplify_outputs.json')

function amplifyOutputsPlugin() {
  const virtualId = 'virtual:amplify-outputs'
  const resolvedId = `\0${virtualId}`
  return {
    name: 'amplify-outputs',
    buildStart() {
      this.addWatchFile(outputsPath)
    },
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      if (fs.existsSync(outputsPath)) {
        return `export default ${fs.readFileSync(outputsPath, 'utf8')}`
      }
      return 'export default {}'
    },
  }
}

// Only the production branch (VITE_SITE_ENV=amplify) may be indexed; dev and local builds say noindex
// in the HTML itself, so crawlers that don't run JavaScript see it too.
function noindexOutsideProductionPlugin(siteEnv) {
  return {
    name: 'noindex-outside-production',
    transformIndexHtml() {
      if (siteEnv === 'amplify') return []
      return [{ tag: 'meta', attrs: { name: 'robots', content: 'noindex' }, injectTo: 'head-prepend' }]
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  appType: 'spa',
  // GitHub Pages 專案站點網址為 https://<user>.github.io/<repo>/
  base: process.env.GITHUB_ACTIONS ? '/juhaoweb/' : '/',
  plugins: [
    react(),
    amplifyOutputsPlugin(),
    noindexOutsideProductionPlugin(loadEnv(mode, rootDir, 'VITE_').VITE_SITE_ENV),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}))

