import { useEffect, useState } from 'react'

const STORAGE_KEY = 'juhao-theme'
const DEFAULT_THEME = {
  bar: '#2c2622',
  content: '#ffffff',
  navText: null,
}

export const COLOR_ROLES = [
  {
    id: 'navText',
    label: '選單文字',
    selector: '.nav-links > li > a, .nav-drop-btn, .logo-text, .logo-en',
    themeKey: 'navText',
  },
]

const PRESETS = [
  { name: 'COMO', bar: '#2c2622', content: '#ffffff' },
  { name: '墨黑', bar: '#000000', content: '#f5f2ee' },
  { name: '炭灰', bar: '#2b2b2b', content: '#f7f7f5' },
  { name: '森綠', bar: '#2f3d34', content: '#f4f6f2' },
  { name: '深藍', bar: '#1f2a37', content: '#f3f5f8' },
]

function normalizeHex(value) {
  const raw = String(value || '').trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw.split('').map((ch) => ch + ch).join('').toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`
  }
  return null
}

function hexToRgb(hex) {
  const n = normalizeHex(hex)
  if (!n) return null
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  }
}

function mixHex(a, b, amount) {
  const x = hexToRgb(a)
  const y = hexToRgb(b)
  if (!x || !y) return a
  const t = amount
  const ch = (p, q) => Math.round(p + (q - p) * t)
  return `#${[ch(x.r, y.r), ch(x.g, y.g), ch(x.b, y.b)].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}

function isLight(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const y = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
  return y > 0.62
}

function applyTheme(theme) {
  const bar = normalizeHex(theme.bar) || DEFAULT_THEME.bar
  const content = normalizeHex(theme.content) || DEFAULT_THEME.content
  const navText = normalizeHex(theme.navText)
  const root = document.documentElement
  const barFgAuto = isLight(bar) ? '#2c2622' : '#ffffff'
  const barFg = navText || barFgAuto
  const barMuted = isLight(barFg) ? '#6b5340' : '#c8b9a6'
  const alt = mixHex(content, bar, 0.08)

  root.style.setProperty('--ink', bar)
  root.style.setProperty('--bar-fg', barFg)
  root.style.setProperty('--bar-muted', barMuted)
  root.dataset.navTextCustom = navText ? 'true' : 'false'
  root.style.setProperty('--paper', content)
  root.style.setProperty('--cream', alt)
  root.style.setProperty('--cream-deep', mixHex(content, bar, 0.14))
  root.style.setProperty('--bg-dark', content)
  root.style.setProperty('--bg-light', alt)
  root.style.setProperty('--bg-section', alt)
  root.style.setProperty('--text-primary', isLight(content) ? '#3d342f' : '#f4efe8')
  root.style.setProperty('--text-secondary', isLight(content) ? '#5c534c' : '#d9d0c6')
  root.style.setProperty('--text-muted', isLight(content) ? '#8a8178' : '#b8aea3')
  root.style.setProperty('--ink-soft', isLight(content) ? '#5c534c' : '#d9d0c6')
  root.style.setProperty('--gold-soft', isLight(bar) ? '#6b5340' : '#c8b9a6')
  root.dataset.barLight = isLight(bar) ? 'true' : 'false'
  root.dataset.contentDark = isLight(content) ? 'false' : 'true'
}

function loadTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return {
      bar: normalizeHex(saved?.bar) || DEFAULT_THEME.bar,
      content: normalizeHex(saved?.content) || DEFAULT_THEME.content,
      navText: normalizeHex(saved?.navText) || null,
    }
  } catch {
    return { ...DEFAULT_THEME, navText: null }
  }
}

applyTheme(loadTheme())

export default function ColorPalette() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState(loadTheme)
  const [barText, setBarText] = useState(theme.bar)
  const [contentText, setContentText] = useState(theme.content)
  const [navTextInput, setNavTextInput] = useState(theme.navText || '')
  const [activeColorId, setActiveColorId] = useState(null)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    setBarText(theme.bar)
    setContentText(theme.content)
    setNavTextInput(theme.navText || '')
  }, [theme])

  const apply = (next) => {
    setTheme(next)
    setBarText(next.bar)
    setContentText(next.content)
    setNavTextInput(next.navText || '')
  }

  const commit = (key, value) => {
    const hex = normalizeHex(value)
    if (!hex) return
    apply({ ...theme, [key]: hex })
  }

  const navTextDisplay = theme.navText || (isLight(theme.bar) ? '#2c2622' : '#ffffff')

  return (
    <>
      <ColorChips
        activeId={activeColorId}
        setActiveId={setActiveColorId}
        navTextDisplay={navTextDisplay}
        onCommitNavText={(value) => commit('navText', value)}
      />
      <aside className={`color-palette ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="color-palette-tab"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        調色
      </button>
      <div className="color-palette-panel">
        <p className="color-palette-title">網站配色</p>
        <ColorField
          label="選單列"
          value={theme.bar}
          text={barText}
          onText={setBarText}
          onCommit={(value) => commit('bar', value)}
        />
        <ColorField
          label="內容底色"
          value={theme.content}
          text={contentText}
          onText={setContentText}
          onCommit={(value) => commit('content', value)}
        />
        <ColorField
          label="選單文字"
          value={navTextDisplay}
          text={navTextInput}
          onText={setNavTextInput}
          onCommit={(value) => commit('navText', value)}
        />
        <div className="color-presets">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="color-preset"
              title={preset.name}
              onClick={() => apply({ bar: preset.bar, content: preset.content, navText: null })}
            >
              <i style={{ background: preset.bar }} />
              <b style={{ background: preset.content }} />
            </button>
          ))}
        </div>
        <button type="button" className="color-reset" onClick={() => apply({ ...DEFAULT_THEME, navText: null })}>
          還原預設
        </button>
        <p className="color-hint">用右下角開關可關閉整個設計工具。選單列上會出現「色」標籤，可直接調整選單文字色。</p>
      </div>
    </aside>
    </>
  )
}

function visibleTarget(selector) {
  const nodes = [...document.querySelectorAll(selector)]
  return nodes.find((node) => {
    const rect = node.getBoundingClientRect()
    const style = window.getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
  }) || null
}

function ColorChips({ activeId, setActiveId, navTextDisplay, onCommitNavText }) {
  const [pin, setPin] = useState(null)
  const [navTextDraft, setNavTextDraft] = useState(navTextDisplay)

  useEffect(() => {
    setNavTextDraft(navTextDisplay)
  }, [navTextDisplay])

  useEffect(() => {
    const measure = () => {
      const role = COLOR_ROLES[0]
      const el = visibleTarget(role.selector)
      if (!el) {
        setPin(null)
        return
      }
      const rect = el.getBoundingClientRect()
      if (rect.bottom < 60 || rect.top > window.innerHeight - 8) {
        setPin(null)
        return
      }
      setPin({
        id: role.id,
        label: role.label,
        top: Math.max(72, rect.top),
        left: Math.min(window.innerWidth - 140, Math.max(8, rect.right + 6)),
      })
    }

    measure()
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    window.addEventListener('hashchange', measure)
    const timer = window.setInterval(measure, 600)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
      window.removeEventListener('hashchange', measure)
      window.clearInterval(timer)
    }
  }, [])

  if (!pin) return null

  const open = activeId === pin.id

  return (
    <div className="type-chips">
      <div
        className={`type-chip ${open ? 'open' : ''}`}
        style={{ top: pin.top, left: pin.left }}
      >
        <button type="button" className="type-chip-btn" onClick={() => setActiveId(open ? null : pin.id)}>
          色 {pin.label}
        </button>
        {open && (
          <div className="type-chip-pop">
            <ColorField
              label={pin.label}
              value={navTextDisplay}
              text={navTextDraft}
              onText={setNavTextDraft}
              onCommit={onCommitNavText}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ColorField({ label, value, text, onText, onCommit }) {
  return (
    <div className="color-field">
      <span>{label}</span>
      <div className="color-field-row">
        <input
          type="color"
          value={normalizeHex(value) || value}
          onChange={(event) => onCommit(event.target.value)}
          aria-label={`${label}色盤`}
        />
        <input
          type="text"
          value={text}
          spellCheck={false}
          placeholder="#000000"
          aria-label={`${label}色號`}
          onChange={(event) => {
            const next = event.target.value
            onText(next)
            const raw = next.trim().replace(/^#/, '')
            if (/^[0-9a-fA-F]{6}$/.test(raw)) onCommit(`#${raw}`)
          }}
          onBlur={(event) => {
            const hex = normalizeHex(event.target.value)
            if (hex) onCommit(hex)
            else onText(value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
        />
      </div>
    </div>
  )
}
