import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { SITE_TOPICS_ID } from './sitePages.js'
import { directoryItems, getSectionMeta, secondLevel } from './content.js'

let topicsCache = null
let topicsInflight = null

export function listTopicPages() {
  const items = []
  for (const dir of directoryItems) {
    if (dir.id === 'about') continue
    const children = secondLevel[dir.id] || []
    if (dir.id === 'cases' || children.length === 0) {
      items.push({
        key: dir.id,
        group: dir.label,
        label: dir.label,
        path: dir.path,
      })
    }
    for (const sub of children) {
      items.push({
        key: `${dir.id}/${sub.id}`,
        group: dir.label,
        label: `${dir.label} · ${sub.label}`,
        path: sub.path,
      })
    }
  }
  return items
}

function heroFromMeta(item) {
  const [view, sub] = item.key.includes('/') ? item.key.split('/') : [item.key, null]
  const meta = getSectionMeta(view, sub)
  return {
    title: meta.title || item.label,
    headline: meta.headline || '',
    intro: meta.intro || '',
    image: meta.image || '',
  }
}

export function defaultTopicHeroes() {
  const topics = {}
  for (const item of listTopicPages()) {
    topics[item.key] = heroFromMeta(item)
  }
  return { topics }
}

function mergeTopicHeroes(raw) {
  const fallback = defaultTopicHeroes()
  const source = raw && typeof raw === 'object' ? raw.topics : null
  const topics = {}
  for (const item of listTopicPages()) {
    const overlay = source && typeof source[item.key] === 'object' ? source[item.key] : {}
    const base = fallback.topics[item.key]
    topics[item.key] = {
      title: String(overlay.title ?? base.title ?? ''),
      headline: String(overlay.headline ?? base.headline ?? ''),
      intro: String(overlay.intro ?? base.intro ?? ''),
      image: String(overlay.image ?? base.image ?? ''),
    }
  }
  return { topics }
}

export function parseTopicHeroes(article) {
  const raw = Array.isArray(article?.content) ? article.content[0] : article?.content
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      return mergeTopicHeroes(JSON.parse(raw))
    } catch {
      return defaultTopicHeroes()
    }
  }
  return defaultTopicHeroes()
}

export function serializeTopicHeroes(page) {
  return JSON.stringify(mergeTopicHeroes(page))
}

export function topicImageKeys(page) {
  return [...new Set(
    Object.values(page?.topics || {})
      .map((item) => item?.image || '')
      .filter((src) => src.startsWith('public/')),
  )]
}

function publicClient() {
  if (!isAmplifyConfigured()) return null
  return generateClient({ authMode: 'apiKey' })
}

export function invalidateTopicHeroes() {
  topicsCache = null
  topicsInflight = null
}

export async function loadPublishedTopics() {
  if (topicsCache) return topicsCache
  if (!topicsInflight) {
    topicsInflight = (async () => {
      const client = publicClient()
      if (!client) return defaultTopicHeroes()
      try {
        const { data, errors } = await client.queries.getPublishedArticle({ id: SITE_TOPICS_ID })
        if (errors?.length || !data) return defaultTopicHeroes()
        return parseTopicHeroes(data)
      } catch {
        return defaultTopicHeroes()
      }
    })().then((page) => {
      topicsCache = page
      return page
    }).finally(() => {
      topicsInflight = null
    })
  }
  return topicsInflight
}

function overlayMeta(defaults, overlay) {
  if (!overlay) return defaults
  return {
    ...defaults,
    title: overlay.title || defaults.title,
    headline: overlay.headline || defaults.headline,
    intro: overlay.intro || defaults.intro,
    image: overlay.image || defaults.image,
  }
}

export function useSectionMeta(view, sub) {
  const key = view ? (sub ? `${view}/${sub}` : view) : null
  const defaults = view ? getSectionMeta(view, sub) : null
  const [meta, setMeta] = useState(defaults)

  useEffect(() => {
    if (!view) {
      setMeta(null)
      return undefined
    }
    const nextDefaults = getSectionMeta(view, sub)
    setMeta(nextDefaults)
    let cancelled = false
    loadPublishedTopics().then((page) => {
      if (cancelled) return
      setMeta(overlayMeta(nextDefaults, page.topics?.[key]))
    })
    return () => {
      cancelled = true
    }
  }, [view, sub, key])

  return meta
}
