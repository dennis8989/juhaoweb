import { useEffect, useState } from 'react'
import { generateClient } from 'aws-amplify/data'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { collectImageKeys } from '../lib/articleHtml.js'
import { resolveImageUrl } from './articlesRepository.js'
import {
  aboutOrigin,
  aboutProfile,
  aboutStory,
  specialties as defaultSpecialties,
} from './content.js'

import { SITE_ABOUT_ID } from './sitePages.js'

const DEFAULT_BACKGROUND_PATH = 'patterns/warm-hero-texture.png'
const DEFAULT_DOCTOR_PHOTO_PATH = 'doctor.jpg'

let aboutCache = null
let aboutInflight = null

export function defaultSiteBackgroundUrl() {
  return `${import.meta.env.BASE_URL}${DEFAULT_BACKGROUND_PATH}`
}

export function defaultDoctorPhotoUrl() {
  return `${import.meta.env.BASE_URL}${DEFAULT_DOCTOR_PHOTO_PATH}`
}

export const DOCTOR_PHOTO_ZOOM_MIN = 0.5
export const DOCTOR_PHOTO_ZOOM_MAX = 3

/** Zoom 1 fits the whole photo in the square frame; x/y (0–100) is the point of the photo pinned to the same point of the frame. */
export function defaultDoctorPhotoFrame() {
  return { zoom: 1, x: 50, y: 0 }
}

function clampNumber(value, min, max, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  const number = Number(value)
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback
}

export function normalizeDoctorPhotoFrame(raw) {
  const fallback = defaultDoctorPhotoFrame()
  const source = raw && typeof raw === 'object' ? raw : {}
  return {
    zoom: clampNumber(source.zoom, DOCTOR_PHOTO_ZOOM_MIN, DOCTOR_PHOTO_ZOOM_MAX, fallback.zoom),
    x: clampNumber(source.x, 0, 100, fallback.x),
    y: clampNumber(source.y, 0, 100, fallback.y),
  }
}

/** Inline style for .portrait-photo: zooming keeps the (x%, y%) point in place, so panning never reveals past the photo's edges. */
export function doctorPhotoStyle(frame) {
  const { zoom, x, y } = normalizeDoctorPhotoFrame(frame)
  const position = `${x}% ${y}%`
  return { objectPosition: position, transformOrigin: position, transform: `scale(${zoom})` }
}

export function applySiteBackground(href) {
  if (typeof document === 'undefined') return
  const next = href || defaultSiteBackgroundUrl()
  document.documentElement.style.setProperty('--warm-hero-pattern', `url("${next}")`)
  const isDefault = !href || next.includes(DEFAULT_BACKGROUND_PATH)
  document.documentElement.dataset.siteBg = isDefault ? 'default' : 'custom'
}

export function invalidateAboutPage() {
  aboutCache = null
  aboutInflight = null
}

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
    backgroundImage: '',
    doctorPhoto: '',
    doctorPhotoFrame: defaultDoctorPhotoFrame(),
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
    backgroundImage: asText(source.backgroundImage, ''),
    doctorPhoto: asText(source.doctorPhoto, ''),
    doctorPhotoFrame: normalizeDoctorPhotoFrame(source.doctorPhotoFrame),
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
    String(page?.backgroundImage || '').startsWith('public/') ? page.backgroundImage : '',
    String(page?.doctorPhoto || '').startsWith('public/') ? page.doctorPhoto : '',
  ].filter(Boolean))]
}

function publicClient() {
  if (!isAmplifyConfigured()) return null
  return generateClient({ authMode: 'apiKey' })
}

export async function loadPublishedAbout() {
  if (aboutCache) return aboutCache
  if (!aboutInflight) {
    aboutInflight = (async () => {
      const client = publicClient()
      if (!client) return defaultAboutPage()
      try {
        const { data, errors } = await client.queries.getPublishedArticle({ id: SITE_ABOUT_ID })
        if (errors?.length || !data) return defaultAboutPage()
        return parseAboutPage(data)
      } catch {
        return defaultAboutPage()
      }
    })().then((page) => {
      aboutCache = page
      return page
    }).finally(() => {
      aboutInflight = null
    })
  }
  return aboutInflight
}

async function resolveSiteBackgroundUrl(page) {
  const key = String(page?.backgroundImage || '')
  if (!key) return defaultSiteBackgroundUrl()
  return (await resolveImageUrl(key)) || defaultSiteBackgroundUrl()
}

export async function syncSiteBackground(page) {
  applySiteBackground(await resolveSiteBackgroundUrl(page))
}

export function useSiteBackground() {
  useEffect(() => {
    let cancelled = false
    loadPublishedAbout()
      .then((page) => resolveSiteBackgroundUrl(page))
      .then((href) => {
        if (!cancelled) applySiteBackground(href)
      })
    return () => {
      cancelled = true
    }
  }, [])
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

/** Uploaded doctor photo (or the bundled one) with its framing. src stays empty until the About page loads, so the old photo never flashes. */
export function useDoctorPhoto() {
  const [photo, setPhoto] = useState(() => ({ src: '', frame: defaultDoctorPhotoFrame() }))

  useEffect(() => {
    let cancelled = false
    loadPublishedAbout()
      .then(async (page) => {
        const src = page.doctorPhoto ? await resolveImageUrl(page.doctorPhoto).catch(() => '') : ''
        return { src: src || defaultDoctorPhotoUrl(), frame: page.doctorPhotoFrame }
      })
      .catch(() => ({ src: defaultDoctorPhotoUrl(), frame: defaultDoctorPhotoFrame() }))
      .then((next) => {
        if (!cancelled) setPhoto(next)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return photo
}
