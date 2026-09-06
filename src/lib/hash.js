function decodeSegment(value) {
  if (!value) return value
  try {
    value = decodeURIComponent(value)
  } catch {
    // Keep the raw segment if it is not valid URI encoding.
  }
  return value.replace(/[)）\]】>'"，。、；：]+$/g, '').trim()
}

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '')
  const parts = raw.split('/').filter(Boolean).map(decodeSegment).filter(Boolean)
  return {
    view: parts[0] || 'about',
    sub: parts[1] || null,
    extra: parts[2] || null,
  }
}

export function go(path) {
  const next = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}
