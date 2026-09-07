function parseArticleDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function formatArticleDate(value) {
  const date = parseArticleDate(value)
  if (!date) return ''
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function toDateInputValue(value) {
  const date = parseArticleDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateInputValue(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return new Date().toISOString()
  return date.toISOString()
}
