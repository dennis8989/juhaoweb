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

// Preloads the subset web fonts that scripts/build-fonts.mjs wrote to public/fonts/ and declares their
// @font-face rules inline in <style id="core-fonts">, which src/lib/fontGate.js reads to know which
// characters they cover (the rest come from font.emtech.cc, added by fontGate.js on demand).
// Without a manifest (fonts not built yet) nothing is injected and the page runs on font.emtech.cc alone.
function coreFontsPlugin() {
  const manifestPath = path.join(rootDir, 'public', 'fonts', 'manifest.json')
  let base = '/'
  return {
    name: 'core-fonts',
    configResolved(config) {
      base = config.base
    },
    transformIndexHtml() {
      if (!fs.existsSync(manifestPath)) return []
      const { faces } = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      const href = (face) => `${base}fonts/${face.file}`
      const css = faces
        .map((face) => `@font-face{font-family:'${face.family}';font-style:normal;font-weight:${face.weight};font-display:swap;src:url(${href(face)}) format('woff2');unicode-range:${face.ranges}}`)
        .join('\n')
      return [
        ...faces.map((face) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: href(face), crossorigin: true },
          injectTo: 'head',
        })),
        { tag: 'style', attrs: { id: 'core-fonts' }, children: css, injectTo: 'head' },
      ]
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
    coreFontsPlugin(),
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

