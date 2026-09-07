const MAX_TAGS = 12
const MAX_LENGTH = 16

export function normalizeTag(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_LENGTH)
}

export function parseTagDraft(value) {
  return String(value || '')
    .split(/[，,]/)
    .map(normalizeTag)
    .filter(Boolean)
}

export function addTags(current, incoming) {
  const next = [...(current || [])]
  const extras = Array.isArray(incoming) ? incoming : parseTagDraft(incoming)
  for (const raw of extras) {
    const tag = normalizeTag(raw)
    if (!tag || next.includes(tag) || next.length >= MAX_TAGS) continue
    next.push(tag)
  }
  return next
}

export function articleTags(article) {
  return addTags([], article?.tags || [])
}
