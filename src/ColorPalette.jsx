import { useEffect, useState } from 'react'

const STORAGE_KEY = 'juhao-theme'
const DEFAULT_THEME = {
  bar: '#2c2622',
  content: '#fcfaf2',
  navText: null,
}

const PRESETS = [
  { name: 'COMO', bar: '#2c2622', content: '#fcfaf2' },
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

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    setBarText(theme.bar)
    setContentText(theme.content)
    setNavTextInput(theme.navText || '')
    window.dispatchEvent(new Event('juhao-design-change'))
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
        <p className="color-hint" style={{ marginTop: 0, marginBottom: '0.85rem' }}>
          這裡調整全站底色與預設字色。文字請直接點網頁上的字；調整結果可在左側「清單」複製。
        </p>
        <ColorField
          label="選單列"
          affects="牽動：導覽列底色，以及由此衍生的深色主題色（--ink）。"
          value={theme.bar}
          text={barText}
          onText={setBarText}
          onCommit={(value) => commit('bar', value)}
        />
        <ColorField
          label="內容底色"
          affects="牽動：頁面內容底色、區塊底色，以及內文主色／次要字色的自動對比。"
          value={theme.content}
          text={contentText}
          onText={setContentText}
          onCommit={(value) => commit('content', value)}
        />
        <ColorField
          label="選單文字（預設）"
          affects="牽動：導覽列預設字色（Logo、選單、按鈕）。若在「調整」分頁另設個別文字色，會覆蓋該項。"
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
      </div>
    </aside>
  )
}

function ColorField({ label, affects, value, text, onText, onCommit }) {
  return (
    <div className="color-field">
      <span>{label}</span>
      {affects && <p className="type-controls-affects">{affects}</p>}
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
