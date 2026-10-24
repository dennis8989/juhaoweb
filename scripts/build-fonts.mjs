// Runs before `vite build` (and by hand with `npm run fonts`): cuts the web fonts down to the characters
// the site actually uses and writes them to public/fonts/. A first visit then downloads about 1.4 MB of
// fonts instead of 3–4 MB of slices from font.emtech.cc, and index.html can preload them
// (see coreFontsPlugin in vite.config.js). The font.emtech.cc stylesheets stay in index.html as the
// fallback for characters that first appear in an article published after the last deploy.
//
// Characters come from scripts/fonts/chars-baseline.txt, the source under src/ (menus, static pages),
// and the published articles and site pages in the backend. If the backend or the font downloads are
// unreachable, the previous output in public/fonts/ is kept, so a deploy never fails here.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'
import { SITE_ABOUT_ID, SITE_TOPICS_ID } from '../src/data/sitePages.js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const cacheDir = join(rootDir, '.cache', 'fonts')
const outDir = join(rootDir, 'public', 'fonts')
const baselinePath = join(rootDir, 'scripts', 'fonts', 'chars-baseline.txt')

// The same faces font.emtech.cc serves today, taken from the official releases (SIL Open Font License 1.1).
const FACES = [
  {
    family: 'GenSenRoundedTW', weight: 400,
    url: 'https://raw.githubusercontent.com/ButTaiwan/gensen-font/v2.100/otf/TW/GenSenRounded2TW-R.otf',
  },
  {
    family: 'GenSenRoundedTW', weight: 700,
    url: 'https://raw.githubusercontent.com/ButTaiwan/gensen-font/v2.100/otf/TW/GenSenRounded2TW-B.otf',
  },
  {
    family: 'GenRyuMinTW', weight: 600,
    url: 'https://raw.githubusercontent.com/ButTaiwan/genryu-font/v2.100/otf/TW/GenRyuMin2TW-SB.otf',
  },
  {
    family: 'Iansui', weight: 400,
    url: 'https://raw.githubusercontent.com/ButTaiwan/iansui/v1.020/fonts/ttf/Iansui-Regular.ttf',
  },
]

const LIST_QUERY = `query ListPublishedArticles($limit: Int, $nextToken: String) {
  listPublishedArticles(limit: $limit, nextToken: $nextToken) {
    items { id title excerpt content tags }
    nextToken
  }
}`
const GET_QUERY = `query GetPublishedArticle($id: ID!) {
  getPublishedArticle(id: $id) { id title content }
}`

function log(message) {
  console.log(`[fonts] ${message}`)
}

/** Every file under dir with one of the extensions, except the admin (its text never reaches visitors). */
function sourceFiles(dir, extensions, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name !== 'admin') sourceFiles(path, extensions, files)
    } else if (extensions.some((ext) => name.endsWith(ext))) {
      files.push(path)
    }
  }
  return files
}

async function graphql(query, variables) {
  let outputs
  try {
    outputs = JSON.parse(readFileSync(join(rootDir, 'amplify_outputs.json'), 'utf8'))
  } catch {
    throw new Error('amplify_outputs.json is missing')
  }
  const { url, api_key: apiKey } = outputs.data || {}
  if (!url || !apiKey) throw new Error('amplify_outputs.json has no data url or api key')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const { data, errors } = await response.json()
  if (errors?.length) throw new Error(errors.map((error) => error.message).join('; '))
  return data
}

/** Text of every published article plus the About and topics pages, as one string. */
async function backendText() {
  const parts = []
  let nextToken = null
  do {
    const page = (await graphql(LIST_QUERY, { limit: 100, nextToken })).listPublishedArticles
    for (const item of page?.items ?? []) parts.push(JSON.stringify(item))
    nextToken = page?.nextToken ?? null
  } while (nextToken)
  for (const id of [SITE_ABOUT_ID, SITE_TOPICS_ID]) {
    const data = await graphql(GET_QUERY, { id })
    if (data?.getPublishedArticle) parts.push(JSON.stringify(data.getPublishedArticle))
  }
  return parts.join('')
}

/** Code points the site may render: printable ASCII plus every other character found in the texts. */
function collectCodepoints(texts) {
  const codepoints = new Set()
  for (let code = 0x20; code <= 0x7e; code++) codepoints.add(code)
  for (const text of texts) {
    for (const char of text) {
      const code = char.codePointAt(0)
      if (code > 0x7e && code !== 0xa0 && code !== 0xfeff) codepoints.add(code)
    }
  }
  return codepoints
}

/** Code points the font has a glyph for, read from its cmap table (formats 4 and 12). */
function fontCodepoints(buffer) {
  const u16 = (offset) => buffer.readUInt16BE(offset)
  const u32 = (offset) => buffer.readUInt32BE(offset)
  const fontStart = buffer.toString('latin1', 0, 4) === 'ttcf' ? u32(12) : 0
  let cmap = -1
  for (let i = 0; i < u16(fontStart + 4); i++) {
    const record = fontStart + 12 + i * 16
    if (buffer.toString('latin1', record, record + 4) === 'cmap') cmap = u32(record + 8)
  }
  if (cmap < 0) throw new Error('font has no cmap table')
  const codepoints = new Set()
  for (let i = 0; i < u16(cmap + 2); i++) {
    const table = cmap + u32(cmap + 4 + i * 8 + 4)
    const format = u16(table)
    if (format === 4) {
      const segCount = u16(table + 6) / 2
      for (let seg = 0; seg < segCount; seg++) {
        const end = u16(table + 14 + seg * 2)
        const start = u16(table + 16 + segCount * 2 + seg * 2)
        for (let code = start; code <= end && code !== 0xffff; code++) codepoints.add(code)
      }
    } else if (format === 12) {
      const groups = u32(table + 12)
      for (let group = 0; group < groups; group++) {
        const record = table + 16 + group * 12
        const start = u32(record)
        const end = u32(record + 4)
        for (let code = start; code <= end; code++) codepoints.add(code)
      }
    }
  }
  return codepoints
}

/** Sorted code points as a CSS unicode-range value, runs collapsed: U+20-7E,U+4E00,… */
function unicodeRange(codepoints) {
  const sorted = [...codepoints].sort((a, b) => a - b)
  const ranges = []
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i]
    while (i + 1 < sorted.length && sorted[i + 1] === sorted[i] + 1) i++
    const end = sorted[i]
    ranges.push(start === end ? `U+${start.toString(16)}` : `U+${start.toString(16)}-${end.toString(16)}`)
  }
  return ranges.join(',')
}

async function sourceFont(face) {
  mkdirSync(cacheDir, { recursive: true })
  const path = join(cacheDir, face.url.split('/').pop())
  if (!existsSync(path)) {
    log(`downloading ${face.url}`)
    const response = await fetch(face.url)
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${face.url}`)
    writeFileSync(path, Buffer.from(await response.arrayBuffer()))
  }
  return readFileSync(path)
}

async function main() {
  const texts = [readFileSync(baselinePath, 'utf8'), readFileSync(join(rootDir, 'index.html'), 'utf8')]
  for (const file of sourceFiles(join(rootDir, 'src'), ['.js', '.jsx'])) texts.push(readFileSync(file, 'utf8'))
  try {
    texts.push(await backendText())
  } catch (err) {
    log(`WARN: could not read the backend, using the baseline and source text only: ${err.message}`)
  }
  const wanted = collectCodepoints(texts)
  log(`${wanted.size} characters in use`)

  const built = []
  for (const face of FACES) {
    const source = await sourceFont(face)
    const available = fontCodepoints(source)
    const covered = new Set([...wanted].filter((code) => available.has(code)))
    const text = [...covered].map((code) => String.fromCodePoint(code)).join('')
    // Glyphs reachable only through layout features (vertical forms and the like) are left out.
    const woff2 = await subsetFont(source, text, { targetFormat: 'woff2', noLayoutClosure: true })
    const hash = createHash('sha1').update(woff2).digest('hex').slice(0, 8)
    const file = `${face.family}-${face.weight}.${hash}.woff2`
    built.push({ family: face.family, weight: face.weight, file, bytes: woff2.length, data: woff2, ranges: unicodeRange(covered) })
    log(`${file}: ${covered.size} characters, ${(woff2.length / 1024).toFixed(0)} KB`)
  }

  mkdirSync(outDir, { recursive: true })
  for (const name of readdirSync(outDir)) rmSync(join(outDir, name))
  for (const face of built) writeFileSync(join(outDir, face.file), face.data)
  writeFileSync(
    join(outDir, 'manifest.json'),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      characters: wanted.size,
      faces: built.map(({ family, weight, file, bytes, ranges }) => ({ family, weight, file, bytes, ranges })),
    }, null, 2),
  )
}

try {
  await main()
} catch (err) {
  // Keep whatever public/fonts/ already holds; without it the page still works on font.emtech.cc alone.
  log(`WARN: fonts not rebuilt, keeping the previous output: ${err.message}`)
}
