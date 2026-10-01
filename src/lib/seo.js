import { useEffect } from 'react'
import { SITE_ORIGIN, articleMenu, directoryItems, secondLevel } from '../data/content.js'
import { normalizeTag } from './tags.js'

const SITE_NAME = '李如浩醫師'
const SNIPPET_LENGTH = 120

function siteTitle(...parts) {
  return [...parts, SITE_NAME].filter(Boolean).join(' | ')
}

const NOT_FOUND = { title: siteTitle('找不到頁面'), noindex: true }

function oneLine(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Plain-text opening of an article body (HTML or the older plain paragraphs), cut to `limit` characters. */
export function contentSnippet(content, limit = SNIPPET_LENGTH) {
  const blocks = Array.isArray(content) ? content : [content]
  const text = decodeEntities(blocks.filter(Boolean).join(' ').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  const chars = Array.from(text)
  return chars.length > limit ? `${chars.slice(0, limit - 1).join('')}…` : text
}

function articlePageMeta(id, { status, article }) {
  // Loading, a failed request, or the previous article still in state: leave the head as it is.
  if (status !== 'ready') return null
  if (!article) return { title: siteTitle('找不到文章'), noindex: true }
  if (article.id !== id) return null
  return {
    title: siteTitle(article.title),
    description: oneLine(article.excerpt) || contentSnippet(article.content),
    path: `/article/${encodeURIComponent(article.id)}`,
    type: 'article',
  }
}

function articleListMeta(route) {
  if (route.sub === 'tag') {
    const tag = normalizeTag(route.extra || '')
    if (!tag) return { title: siteTitle('標籤'), noindex: true }
    return {
      title: siteTitle(`標籤：${tag}`),
      description: `李如浩醫師標有「${tag}」的兒童成長衛教文章。`,
      path: `/articles/tag/${encodeURIComponent(tag)}`,
    }
  }
  const item = articleMenu.find((entry) => entry.id === (route.sub || 'latest'))
  if (!item) return NOT_FOUND
  return {
    title: siteTitle(item.label, '衛教文章'),
    description: item.id === 'latest'
      ? '李如浩醫師的兒童成長衛教文章：骨齡、身材矮小、性早熟與青春期、生長激素治療與兒童營養。'
      : `李如浩醫師整理的「${item.label}」兒童成長衛教文章。`,
    path: item.path,
  }
}

function topicPageMeta(dir, route, topicMeta) {
  const children = secondLevel[dir.id] || []
  let path = dir.path
  let label = dir.label
  if (children.length) {
    // A topic without a sub-tab is redirected to its first tab right away.
    if (!route.sub) return null
    const child = children.find((item) => item.id === route.sub)
    if (!child) return NOT_FOUND
    path = child.path
    label = child.label
  } else if (route.sub) {
    // /cases/<anything> is redirected to /cases; other topics have no sub pages.
    return dir.id === 'cases' ? null : NOT_FOUND
  }
  return {
    title: siteTitle(topicMeta?.title || label),
    description: oneLine(topicMeta?.intro) || null,
    path,
  }
}

/**
 * What the head should say for a route. Null means "leave it alone" (still loading or about to redirect).
 * A null title or description falls back to the site-wide one in index.html.
 */
export function pageMetaFor({ route, topicMeta, articleState }) {
  const view = route.view || 'about'
  if (view === 'about') return { path: '/about' }
  if (view === 'admin') return { title: siteTitle('網站管理'), noindex: true }
  if (view === 'collaborate') {
    return {
      title: siteTitle('代言或演講合作邀約'),
      description: '代言、演講與合作邀約，請透過 Facebook 或 Instagram 私訊聯繫李如浩醫師。',
      path: '/collaborate',
    }
  }
  if (view === 'article') return articlePageMeta(route.sub, articleState)
  if (view === 'articles') return articleListMeta(route)
  const dir = directoryItems.find((item) => item.id === view)
  return dir ? topicPageMeta(dir, route, topicMeta) : NOT_FOUND
}

/** Only the real domain may be indexed; the amplifyapp.com hosts and localhost serve the same pages. */
export function isIndexableHost(hostname) {
  return hostname === new URL(SITE_ORIGIN).hostname
}

// What index.html shipped with, so pages without their own title or description can fall back to it.
const initialValues = new Map()

function headElement(selector, tag, attrs) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement(tag)
    Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, value))
    document.head.appendChild(element)
  }
  return element
}

function setMeta(selector, attrs, value, { fallback = false } = {}) {
  const existing = document.head.querySelector(selector)
  if (fallback && !initialValues.has(selector)) initialValues.set(selector, existing?.getAttribute('content') ?? null)
  const next = value || (fallback ? initialValues.get(selector) : null)
  if (!next) {
    existing?.remove()
    return
  }
  headElement(selector, 'meta', attrs).setAttribute('content', next)
}

function setCanonical(href) {
  const existing = document.head.querySelector('link[rel="canonical"]')
  if (!href) {
    existing?.remove()
    return
  }
  headElement('link[rel="canonical"]', 'link', { rel: 'canonical' }).setAttribute('href', href)
}

export function applyPageMeta(meta) {
  if (!initialValues.has('title')) initialValues.set('title', document.title)
  document.title = meta.title || initialValues.get('title')

  const url = meta.path ? `${SITE_ORIGIN}${meta.path}` : ''
  const noindex = meta.noindex || !isIndexableHost(window.location.hostname)

  setMeta('meta[name="description"]', { name: 'description' }, meta.description, { fallback: true })
  setMeta('meta[property="og:title"]', { property: 'og:title' }, meta.title, { fallback: true })
  setMeta('meta[property="og:description"]', { property: 'og:description' }, meta.description, { fallback: true })
  setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, meta.title, { fallback: true })
  setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, meta.description, { fallback: true })
  setMeta('meta[property="og:type"]', { property: 'og:type' }, meta.type, { fallback: true })
  setMeta('meta[property="og:url"]', { property: 'og:url' }, url)
  setMeta('meta[name="robots"]', { name: 'robots' }, noindex ? 'noindex' : '')
  setCanonical(url)
}

/** Keeps the document head in step with the page being shown. */
export function usePageMeta(meta) {
  const key = meta ? JSON.stringify(meta) : ''
  useEffect(() => {
    if (key) applyPageMeta(JSON.parse(key))
  }, [key])
}
