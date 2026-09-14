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

export function uniqueTags(values) {
  return addTags([], values || [])
}

export function toggleTag(current, tag) {
  const needle = normalizeTag(tag)
  if (!needle) return uniqueTags(current)
  const list = uniqueTags(current)
  if (list.includes(needle)) return list.filter((item) => item !== needle)
  return addTags(list, needle)
}

export function articleTags(article) {
  return uniqueTags(article?.tags || [])
}

export function articleHasTag(article, tag) {
  const needle = normalizeTag(tag)
  return Boolean(needle) && articleTags(article).includes(needle)
}

export function articleHasAllTags(article, tags) {
  const selected = uniqueTags(tags)
  if (!selected.length) return true
  const have = new Set(articleTags(article))
  return selected.every((item) => have.has(item))
}

export function formatTagList(tags) {
  return uniqueTags(tags).join('、')
}

export function tagListPath(tag) {
  return `/articles/tag/${encodeURIComponent(normalizeTag(tag))}`
}

export function collectArticleTags(articles) {
  const counts = new Map()
  for (const article of articles || []) {
    for (const tag of articleTags(article)) {
      counts.set(tag, (counts.get(tag) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant'))
    .map(([tag]) => tag)
}
