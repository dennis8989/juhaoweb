const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')

function decodeSegment(value) {
  if (!value) return value
  try {
    value = decodeURIComponent(value)
  } catch {
    // Keep the raw segment if it is not valid URI encoding.
  }
  return value.replace(/[)）\]】>'"，。、；：]+$/g, '').trim()
}

function withBase(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${BASE}${normalized}`
}

function stripBase(pathname) {
  if (!pathname) return '/'
  if (BASE && pathname === BASE) return '/'
  if (BASE && pathname.startsWith(`${BASE}/`)) return pathname.slice(BASE.length) || '/'
  return pathname
}

function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean).map(decodeSegment).filter(Boolean)
  return {
    view: parts[0] || 'about',
    sub: parts[1] || null,
    extra: parts[2] || null,
  }
}

function currentUrl(path) {
  return `${withBase(path)}${window.location.search}`
}

function isModifiedClick(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0
}

function isRootPath(pathname) {
  return pathname === '/' || pathname === '' || (BASE && (pathname === BASE || pathname === `${BASE}/`))
}

/** Public href for in-app routes, including Vite `base`. */
export function toHref(path) {
  let normalized = path || '/'
  if (normalized.startsWith('#')) normalized = normalized.slice(1)
  if (!normalized.startsWith('/')) normalized = `/${normalized}`
  return withBase(normalized)
}

/** Move leftover `/#/about` URLs to `/about`, and `/` to `/about`. */
export function migrateLegacyHash() {
  if (typeof window === 'undefined') return

  const hash = window.location.hash || ''
  if (isRootPath(window.location.pathname) && hash.startsWith('#/')) {
    window.history.replaceState(null, '', currentUrl(hash.slice(1)))
    return
  }

  if (isRootPath(window.location.pathname) && !hash) {
    window.history.replaceState(null, '', currentUrl('/about'))
  }
}

export function parseHash() {
  if (typeof window === 'undefined') {
    return { view: 'about', sub: null, extra: null }
  }
  return parsePath(stripBase(window.location.pathname))
}

export function go(path, { replace = false } = {}) {
  const next = toHref(path) + window.location.search
  const current = `${window.location.pathname}${window.location.search}`
  if (current === next) {
    window.dispatchEvent(new PopStateEvent('popstate'))
    return
  }
  if (replace) window.history.replaceState(null, '', next)
  else window.history.pushState(null, '', next)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function handleRouteClick(path) {
  return (event) => {
    if (event.defaultPrevented || isModifiedClick(event)) return
    event.preventDefault()
    go(path)
  }
}

if (typeof window !== 'undefined') {
  migrateLegacyHash()
}
