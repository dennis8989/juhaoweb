import { useCallback, useEffect, useRef, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { getUrl } from 'aws-amplify/storage'
import { SITE_ENV, isAmplifyConfigured } from '../lib/amplify.js'
import { articleHasTag } from '../lib/tags.js'
import { isSitePageId } from './sitePages.js'

// Storage images are served through signed URLs that S3 stops honoring after about an hour, so every
// cached URL carries its expiry and is signed again before then. expiresAt 0 means it never expires.
const IMAGE_CACHE = new Map()
const SIGNED_URL_MARGIN_MS = 5 * 60 * 1000
const LIST_MAX_AGE_MS = 50 * 60 * 1000
let listCache = null
let listInflight = null

function siteAssetUrl(path) {
  const relative = String(path).replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${relative}`
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value)
}

function isStoragePath(value) {
  return value.startsWith('public/') || value.startsWith('s3://')
}

/** When a signed S3 URL stops working: X-Amz-Date plus X-Amz-Expires, or 0 when the URL isn't signed. */
function signedUrlExpiry(href) {
  try {
    const params = new URL(href).searchParams
    const stamp = params.get('X-Amz-Date') || ''
    const seconds = Number(params.get('X-Amz-Expires'))
    const match = stamp.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/)
    if (!match || !seconds) return 0
    const [, y, mo, d, h, mi, se] = match
    return Date.UTC(y, mo - 1, d, h, mi, se) + seconds * 1000
  } catch {
    return 0
  }
}

function isUsable(entry) {
  return Boolean(entry) && (!entry.expiresAt || entry.expiresAt - Date.now() > SIGNED_URL_MARGIN_MS)
}

async function resolveImage(src, { fresh = false } = {}) {
  if (!src) return { href: '', expiresAt: 0 }
  if (isHttpUrl(src)) return { href: src, expiresAt: 0 }
  const cached = IMAGE_CACHE.get(src)
  if (!fresh && isUsable(cached)) return cached

  if (isAmplifyConfigured() && isStoragePath(src)) {
    try {
      const path = src.startsWith('s3://') ? src.replace(/^s3:\/\/[^/]+\//, '') : src
      const { url, expiresAt } = await getUrl({
        path,
        options: { expiresIn: 3600, validateObjectExistence: false },
      })
      const href = url.toString()
      // The signature can end sooner than asked when the guest credentials do, and the URL says when.
      const entry = { href, expiresAt: signedUrlExpiry(href) || expiresAt?.getTime?.() || Date.now() + 3600 * 1000 }
      IMAGE_CACHE.set(src, entry)
      return entry
    } catch {
      // Signing failed (e.g. no guest credentials right now): show the site-relative path this time, but
      // don't cache it, so the next request signs again instead of keeping a broken URL.
      return { href: siteAssetUrl(src), expiresAt: 0 }
    }
  }

  const entry = { href: siteAssetUrl(src), expiresAt: 0 }
  IMAGE_CACHE.set(src, entry)
  return entry
}

/** A displayable URL for an image key. `fresh` signs it again even if a cached URL still looks valid. */
export async function resolveImageUrl(src, options) {
  return (await resolveImage(src, options)).href
}

/**
 * Signs a storage image again, once per element, after it failed to load (its URL went stale while the
 * page sat open, or signing had failed). Skips article HTML that still shows the raw key awaiting its URL.
 */
export async function retryStaleImage(img, storageKey) {
  if (!img || !storageKey || !isStoragePath(storageKey) || img.dataset.resignedKey === storageKey) return
  if (img.getAttribute('src') === storageKey) return
  img.dataset.resignedKey = storageKey
  const href = await resolveImageUrl(storageKey, { fresh: true })
  if (href && href !== img.src) img.src = href
}

/** Callback ref for a container of article HTML: retries its stale storage images (they carry data-s3-key). */
export function useStaleImageRetry() {
  const detach = useRef(null)
  return useCallback((node) => {
    detach.current?.()
    detach.current = null
    if (!node) return
    // Image errors don't bubble, so listen in the capture phase.
    const onError = (event) => {
      const img = event.target
      if (img?.tagName === 'IMG') retryStaleImage(img, img.getAttribute('data-s3-key'))
    }
    node.addEventListener('error', onError, true)
    detach.current = () => node.removeEventListener('error', onError, true)
  }, [])
}

/** Article with `images` as displayable URLs and `imageKeys` as the stored keys, plus when the URLs go stale. */
async function withResolvedImages(article) {
  if (!article) return null
  const imageKeys = (article.images || []).filter(Boolean)
  const entries = await Promise.all(imageKeys.map((key) => resolveImage(key)))
  const expiries = entries.map((entry) => entry.expiresAt).filter(Boolean)
  return {
    article: { ...article, images: entries.map((entry) => entry.href), imageKeys },
    expiresAt: expiries.length ? Math.min(...expiries) : 0,
  }
}

function getClient() {
  if (!isAmplifyConfigured()) return null
  return generateClient({ authMode: 'apiKey' })
}

function throwIfErrors(errors) {
  if (!errors?.length) return
  throw new Error(errors.map((error) => error.message).join('; '))
}

async function fetchPublishedPage(client, nextToken) {
  const { data, errors } = await client.queries.listPublishedArticles({
    limit: 100,
    nextToken: nextToken || undefined,
  })
  throwIfErrors(errors)
  return data
}

async function fetchAllPublished() {
  const client = getClient()
  if (!client) return []

  const collected = []
  let nextToken = null
  do {
    const page = await fetchPublishedPage(client, nextToken)
    collected.push(...(page?.items ?? []).filter(Boolean))
    nextToken = page?.nextToken ?? null
  } while (nextToken)

  const published = collected.filter((item) => item.status === 'published' && !isSitePageId(item.id))
  const resolved = await Promise.all(published.map(withResolvedImages))
  // Fetch again before the first signed image URL in the list stops working.
  const staleAt = Math.min(
    Date.now() + LIST_MAX_AGE_MS,
    ...resolved.map((entry) => entry.expiresAt).filter(Boolean).map((time) => time - SIGNED_URL_MARGIN_MS),
  )
  return { items: resolved.map((entry) => entry.article), staleAt }
}

export function invalidatePublishedArticles() {
  listCache = null
  listInflight = null
  IMAGE_CACHE.clear()
}

export async function listPublishedArticles({ force } = {}) {
  if (force) invalidatePublishedArticles()
  if (listCache && Date.now() < listCache.staleAt) return listCache.items
  if (!listInflight) {
    listInflight = fetchAllPublished()
      .then((result) => {
        listCache = result
        return result.items
      })
      .finally(() => {
        listInflight = null
      })
  }
  return listInflight
}

export async function getArticle(id) {
  if (!id) return null
  const items = await listPublishedArticles()
  const cached = items.find((item) => item.id === id)
  if (cached) return cached

  const client = getClient()
  if (!client) return null
  const { data, errors } = await client.queries.getPublishedArticle({ id })
  throwIfErrors(errors)
  const article = (await withResolvedImages(data))?.article
  if (article && article.status === 'published') return article
  return null
}

const VIEW_WINDOW_MS = 24 * 60 * 60 * 1000
const BOT_USER_AGENT = /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse/i
const viewedThisVisit = new Set()

function viewStorageKey(id) {
  return `article-viewed:${id}`
}

function viewedRecently(id) {
  if (viewedThisVisit.has(id)) return true
  try {
    const last = Number(localStorage.getItem(viewStorageKey(id)))
    return Boolean(last) && Date.now() - last < VIEW_WINDOW_MS
  } catch {
    return false
  }
}

function markViewed(id) {
  viewedThisVisit.add(id)
  try {
    localStorage.setItem(viewStorageKey(id), String(Date.now()))
  } catch {
    // Storage can be blocked (private mode); the in-memory set still covers this visit.
  }
}

/** Count at most one view per browser, per article, per day. Failures are ignored. */
export async function recordArticleView(id) {
  if (!id || isSitePageId(id) || viewedRecently(id)) return
  if (navigator.webdriver || BOT_USER_AGENT.test(navigator.userAgent || '')) return
  const client = getClient()
  // A bundle built against outputs without this mutation just skips counting.
  if (!client?.mutations?.recordArticleView) return

  // Mark before the request so StrictMode's second effect run doesn't count twice.
  markViewed(id)
  try {
    await client.mutations.recordArticleView({ id, env: SITE_ENV })
  } catch {
    // A missed view isn't worth surfacing to readers.
  }
}

export function matchesFilter(article, { dir, sub, articleCat, tag } = {}) {
  if (!article || article.status !== 'published' || isSitePageId(article.id)) return false
  if (dir && !(article.dirs || []).includes(dir)) return false
  if (sub && !(article.subs || []).includes(sub)) return false
  if (articleCat && articleCat !== 'latest' && !(article.articleCats || []).includes(articleCat)) {
    return false
  }
  if (tag && !articleHasTag(article, tag)) return false
  return true
}

export async function filterArticles(criteria = {}) {
  const items = await listPublishedArticles()
  return items.filter((item) => matchesFilter(item, criteria))
}

export function usePublishedArticles(criteria) {
  const [state, setState] = useState({ status: 'loading', items: [], error: null })
  const dir = criteria?.dir || null
  const sub = criteria?.sub || null
  const articleCat = criteria?.articleCat || null
  const tag = criteria?.tag || null

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, status: 'loading', error: null }))
    listPublishedArticles()
      .then((items) => {
        if (cancelled) return
        setState({
          status: 'ready',
          items: items.filter((item) => matchesFilter(item, { dir, sub, articleCat, tag })),
          error: null,
        })
      })
      .catch((error) => {
        if (cancelled) return
        setState({ status: 'error', items: [], error })
      })
    return () => {
      cancelled = true
    }
  }, [dir, sub, articleCat, tag])

  return state
}

export function useArticle(id) {
  const [state, setState] = useState({ status: 'loading', article: null, error: null })

  useEffect(() => {
    let cancelled = false
    if (!id) {
      setState({ status: 'ready', article: null, error: null })
      return undefined
    }
    setState((current) => ({ ...current, status: 'loading', error: null }))
    getArticle(id)
      .then((article) => {
        if (cancelled) return
        setState({ status: 'ready', article, error: null })
      })
      .catch((error) => {
        if (cancelled) return
        setState({ status: 'error', article: null, error })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return state
}

export function useResolvedImage(src) {
  const [href, setHref] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!src) {
      setHref('')
      return undefined
    }
    resolveImageUrl(src).then((next) => {
      if (!cancelled) setHref(next)
    })
    return () => {
      cancelled = true
    }
  }, [src])

  return href
}
