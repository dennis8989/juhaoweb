// Runs after `vite build`: writes dist/robots.txt, and dist/sitemap.xml for the production build.
// Dev and local builds get no sitemap; their pages carry a noindex tag instead (see vite.config.js).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_ORIGIN, articleMenu, directoryItems, secondLevel } from '../src/data/content.js'
import { isSitePageId } from '../src/data/sitePages.js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(rootDir, 'dist')
const isProduction = process.env.VITE_SITE_ENV === 'amplify'

const LIST_QUERY = `query ListPublishedArticles($limit: Int, $nextToken: String) {
  listPublishedArticles(limit: $limit, nextToken: $nextToken) {
    items { id status createdAt updatedAt }
    nextToken
  }
}`

function loadOutputs() {
  try {
    return JSON.parse(readFileSync(join(rootDir, 'amplify_outputs.json'), 'utf8'))
  } catch {
    return {}
  }
}

async function fetchPublishedArticles() {
  const { url, api_key: apiKey } = loadOutputs().data || {}
  if (!url || !apiKey) throw new Error('amplify_outputs.json has no data url or api key')

  const items = []
  let nextToken = null
  do {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query: LIST_QUERY, variables: { limit: 100, nextToken } }),
    })
    if (!response.ok) throw new Error(`listPublishedArticles HTTP ${response.status}`)
    const { data, errors } = await response.json()
    if (errors?.length) throw new Error(errors.map((error) => error.message).join('; '))
    const page = data?.listPublishedArticles
    items.push(...(page?.items ?? []).filter(Boolean))
    nextToken = page?.nextToken ?? null
  } while (nextToken)

  return items.filter((item) => item.status === 'published' && !isSitePageId(item.id))
}

/** Pages that render on their own. A topic with sub-tabs redirects to its first tab, so only the tabs are listed. */
function staticPaths() {
  const paths = ['/about', '/collaborate']
  for (const dir of directoryItems) {
    if (dir.id === 'about') continue
    const children = secondLevel[dir.id] || []
    if (children.length) paths.push(...children.map((child) => child.path))
    else paths.push(dir.path)
  }
  paths.push(...articleMenu.map((item) => item.path))
  return paths
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function lastmodOf(article) {
  const time = Date.parse(article.updatedAt || article.createdAt || '')
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : ''
}

function sitemapXml(entries) {
  const rows = entries.map(({ path, lastmod }) => [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    '  </url>',
  ].join('\n'))
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...rows,
    '</urlset>',
    '',
  ].join('\n')
}

async function main() {
  if (!isProduction) {
    // Left crawlable on purpose: Google has to fetch a page to see its noindex tag.
    writeFileSync(join(distDir, 'robots.txt'), 'User-agent: *\nDisallow:\n')
    console.log('[seo] non-production build: robots.txt without a sitemap')
    return
  }

  writeFileSync(
    join(distDir, 'robots.txt'),
    `User-agent: *\nDisallow: /admin\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
  )

  const entries = staticPaths().map((path) => ({ path, lastmod: '' }))
  try {
    const articles = await fetchPublishedArticles()
    entries.push(...articles.map((article) => ({
      path: `/article/${encodeURIComponent(article.id)}`,
      lastmod: lastmodOf(article),
    })))
    console.log(`[seo] sitemap.xml: ${entries.length} URLs, ${articles.length} of them articles`)
  } catch (err) {
    // Don't block the deploy over this; the static pages still go out.
    console.warn(`[seo] WARN: could not list articles, sitemap.xml has static pages only: ${err.message}`)
  }
  writeFileSync(join(distDir, 'sitemap.xml'), sitemapXml(entries))
}

await main()
