import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { getUrl } from 'aws-amplify/storage'
import { isAmplifyConfigured } from '../lib/amplify.js'

const IMAGE_CACHE = new Map()
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

export async function resolveImageUrl(src) {
  if (!src) return ''
  if (isHttpUrl(src)) return src
  if (IMAGE_CACHE.has(src)) return IMAGE_CACHE.get(src)

  if (isAmplifyConfigured() && isStoragePath(src)) {
    try {
      const path = src.startsWith('s3://') ? src.replace(/^s3:\/\/[^/]+\//, '') : src
      const { url } = await getUrl({
        path,
        options: { expiresIn: 3600, validateObjectExistence: false },
      })
      const href = url.toString()
      IMAGE_CACHE.set(src, href)
      return href
    } catch {
      // Fall through to site-relative path.
    }
  }

  const href = siteAssetUrl(src)
  IMAGE_CACHE.set(src, href)
  return href
}

async function withResolvedImages(article) {
  if (!article) return null
  const images = await Promise.all((article.images || []).filter(Boolean).map(resolveImageUrl))
  return { ...article, images }
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

  const published = collected.filter((item) => item.status === 'published')
  return Promise.all(published.map(withResolvedImages))
}

export async function listPublishedArticles({ force } = {}) {
  if (force) {
    listCache = null
    listInflight = null
  }
  if (listCache) return listCache
  if (!listInflight) {
    listInflight = fetchAllPublished()
      .then((items) => {
        listCache = items
        return items
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
  const article = await withResolvedImages(data)
  if (article && article.status === 'published') return article
  return null
}

export function matchesFilter(article, { dir, sub, articleCat } = {}) {
  if (!article || article.status !== 'published') return false
  if (dir && !(article.dirs || []).includes(dir)) return false
  if (sub && !(article.subs || []).includes(sub)) return false
  if (articleCat && articleCat !== 'latest' && !(article.articleCats || []).includes(articleCat)) {
    return false
  }
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

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, status: 'loading', error: null }))
    listPublishedArticles()
      .then((items) => {
        if (cancelled) return
        setState({
          status: 'ready',
          items: items.filter((item) => matchesFilter(item, { dir, sub, articleCat })),
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
  }, [dir, sub, articleCat])

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
