import DOMPurify from 'dompurify'
import { resolveImageUrl } from '../data/articlesRepository.js'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'mark',
  'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote',
]
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'style', 'class', 'data-s3-key']

export function looksLikeHtml(content) {
  const blocks = Array.isArray(content) ? content : [content]
  return blocks.some((block) => /<[a-z][\s\S]*>/i.test(String(block || '')))
}

function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function contentToHtml(content) {
  const blocks = Array.isArray(content) ? content.filter(Boolean) : [content].filter(Boolean)
  if (!blocks.length) return '<p></p>'
  if (looksLikeHtml(blocks)) return blocks.join('')
  return blocks.map((block) => `<p>${escapeText(block)}</p>`).join('')
}

export function sanitizeArticleHtml(html) {
  if (typeof window === 'undefined' || !html) return html || ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
  })
}

export function persistableHtml(html) {
  if (!html || typeof document === 'undefined') return html || ''
  const holder = document.createElement('div')
  holder.innerHTML = sanitizeArticleHtml(html)
  holder.querySelectorAll('img').forEach((img) => {
    const stored = img.getAttribute('data-s3-key') || ''
    const src = img.getAttribute('src') || ''
    const key = stored.startsWith('public/') ? stored : src.startsWith('public/') ? src : ''
    if (key) {
      img.setAttribute('data-s3-key', key)
      img.setAttribute('src', key)
    }
  })
  return holder.innerHTML
}

export function collectImageKeys(html) {
  if (!html || typeof document === 'undefined') return []
  const holder = document.createElement('div')
  holder.innerHTML = html
  return [...holder.querySelectorAll('img')]
    .map((img) => img.getAttribute('data-s3-key') || img.getAttribute('src') || '')
    .filter((src) => src.startsWith('public/'))
}

export function htmlHasImages(html) {
  return /<img[\s>]/i.test(html || '')
}

export async function resolveArticleHtml(html) {
  const clean = sanitizeArticleHtml(html)
  if (typeof document === 'undefined') return clean
  const holder = document.createElement('div')
  holder.innerHTML = clean
  const images = [...holder.querySelectorAll('img')]
  await Promise.all(
    images.map(async (img) => {
      const key = img.getAttribute('data-s3-key') || img.getAttribute('src') || ''
      if (!key.startsWith('public/')) return
      img.setAttribute('data-s3-key', key)
      img.setAttribute('src', await resolveImageUrl(key))
    }),
  )
  return holder.innerHTML
}
