import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { collectImageKeys } from '../lib/articleHtml.js'
import {
  aboutOrigin,
  aboutProfile,
  aboutStory,
  specialties as defaultSpecialties,
} from './content.js'

import { SITE_ABOUT_ID } from './sitePages.js'

function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function markdownToHtml(text) {
  return escapeText(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

function storyToHtml(blocks) {
  return (blocks || [])
    .map((block) => {
      const inner = (block.lines || []).map((line) => markdownToHtml(line)).join('<br>')
      return `<p>${inner}</p>`
    })
    .join('')
}

function originToHtml(origin) {
  return (origin?.blocks || [])
    .map((block) => {
      if (block.divider) return '<hr>'
      return `<p>${markdownToHtml(block.text || '')}</p>`
    })
    .join('')
}

function normalizeItems(items) {
  return (items || [])
    .map((item) => {
      if (typeof item === 'string') return { text: item, highlight: false }
      return { text: String(item?.text || ''), highlight: Boolean(item?.highlight) }
    })
    .filter((item) => item.text)
}

function cloneSpecialties(items) {
  return (items || []).map((item, index) => ({
    id: item.id || `specialty-${index + 1}`,
    title: item.title || '',
    detail: item.detail || '',
    path: item.path || '/about',
  }))
}

export function defaultAboutPage() {
  return {
    hero: {
      eyebrow: aboutProfile.eyebrow,
      name: aboutProfile.name,
      english: aboutProfile.english,
      lead: aboutProfile.lead,
    },
    story: {
      title: '醫師理念',
      kicker: 'APPROACH',
      html: storyToHtml(aboutStory),
    },
    profile: {
      current: normalizeItems(aboutProfile.current),
      education: normalizeItems(aboutProfile.education),
      licenses: normalizeItems(aboutProfile.licenses),
      teaching: normalizeItems(aboutProfile.teaching),
    },
    specialties: cloneSpecialties(defaultSpecialties),
    origin: {
      title: aboutOrigin.title,
      kicker: 'ORIGIN',
      html: originToHtml(aboutOrigin),
    },
  }
}

function asText(value, fallback = '') {
  return String(value ?? fallback)
}

function mergeAboutPage(raw) {
  const fallback = defaultAboutPage()
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    hero: {
      eyebrow: asText(source.hero?.eyebrow, fallback.hero.eyebrow),
      name: asText(source.hero?.name, fallback.hero.name),
      english: asText(source.hero?.english, fallback.hero.english),
      lead: asText(source.hero?.lead, fallback.hero.lead),
    },
    story: {
      title: asText(source.story?.title, fallback.story.title),
      kicker: asText(source.story?.kicker, fallback.story.kicker),
      html: asText(source.story?.html, fallback.story.html),
    },
    profile: {
      current: Array.isArray(source.profile?.current) ? normalizeItems(source.profile.current) : fallback.profile.current,
      education: Array.isArray(source.profile?.education) ? normalizeItems(source.profile.education) : fallback.profile.education,
      licenses: Array.isArray(source.profile?.licenses) ? normalizeItems(source.profile.licenses) : fallback.profile.licenses,
      teaching: Array.isArray(source.profile?.teaching) ? normalizeItems(source.profile.teaching) : fallback.profile.teaching,
    },
    specialties: cloneSpecialties(Array.isArray(source.specialties) ? source.specialties : fallback.specialties),
    origin: {
      title: asText(source.origin?.title, fallback.origin.title),
      kicker: asText(source.origin?.kicker, fallback.origin.kicker),
      html: asText(source.origin?.html, fallback.origin.html),
    },
  }
}

export function parseAboutPage(article) {
  const raw = Array.isArray(article?.content) ? article.content[0] : article?.content
  if (!raw) return defaultAboutPage()
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('{')) {
      try {
        return mergeAboutPage(JSON.parse(trimmed))
      } catch {
        return defaultAboutPage()
      }
    }
  }
  return defaultAboutPage()
}

export function serializeAboutPage(page) {
  return JSON.stringify(mergeAboutPage(page))
}

export function aboutImageKeys(page) {
  return [...new Set([
    ...collectImageKeys(page?.story?.html),
    ...collectImageKeys(page?.origin?.html),
  ])]
}

function publicClient() {
  if (!isAmplifyConfigured()) return null
  return generateClient({ authMode: 'apiKey' })
}

export async function loadPublishedAbout() {
  const client = publicClient()
  if (!client) return defaultAboutPage()
  try {
    const { data, errors } = await client.queries.getPublishedArticle({ id: SITE_ABOUT_ID })
    if (errors?.length || !data) return defaultAboutPage()
    return parseAboutPage(data)
  } catch {
    return defaultAboutPage()
  }
}

export function useAboutPage() {
  const [page, setPage] = useState(defaultAboutPage)

  useEffect(() => {
    let cancelled = false
    loadPublishedAbout().then((next) => {
      if (!cancelled) setPage(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return page
}
