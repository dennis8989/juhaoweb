import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'juhao-type'
const FAMILIES = {
  sans: 'var(--font-sans)',
  serif: 'var(--font-serif)',
  hand: 'var(--font-hand)',
}

export const TYPE_ROLES = [
  { id: 'logoEn', label: 'Logo 英文', selector: '.logo-en', defaults: { family: 'hand', weight: '400', size: 11 } },
  { id: 'logoZh', label: 'Logo 中文', selector: '.logo-text', defaults: { family: 'hand', weight: '400', size: 16 } },
  { id: 'nav', label: '導覽列', selector: '.nav-links > li > a, .nav-drop-btn', defaults: { family: 'sans', weight: '400', size: 13 } },
  { id: 'aboutEyebrow', label: '關於頁小標', selector: '.about-eyebrow', defaults: { family: 'hand', weight: '400', size: 14 } },
  { id: 'aboutName', label: '關於頁大名', selector: '.about-brand', defaults: { family: 'serif', weight: '600', size: 42 } },
  { id: 'aboutEn', label: '關於頁英文', selector: '.about-brand-en', defaults: { family: 'sans', weight: '400', size: 14 } },
  { id: 'aboutLead', label: '關於頁導言', selector: '.about-lead', defaults: { family: 'sans', weight: '400', size: 17 } },
  { id: 'blockTitle', label: '區塊標題', selector: '.block-title', defaults: { family: 'serif', weight: '600', size: 22 } },
  { id: 'blockKicker', label: '區塊英文標', selector: '.block-kicker', defaults: { family: 'sans', weight: '400', size: 12 } },
  { id: 'story', label: '醫師理念內文', selector: '.about-story p', defaults: { family: 'serif', weight: '400', size: 17 } },
  { id: 'cvName', label: '履歷姓名', selector: '.cv-name', defaults: { family: 'serif', weight: '700', size: 23 } },
  { id: 'cvHead', label: '履歷小標', selector: '.cv-block h3', defaults: { family: 'sans', weight: '600', size: 17 } },
  { id: 'cvItem', label: '履歷條目', selector: '.cv-block li', defaults: { family: 'sans', weight: '400', size: 17 } },
  { id: 'specTitle', label: '專長標題', selector: '.specialty-row strong', defaults: { family: 'serif', weight: '600', size: 17 } },
  { id: 'specDetail', label: '專長說明', selector: '.specialty-row span', defaults: { family: 'sans', weight: '400', size: 16 } },
  { id: 'originLead', label: '網站緣起導語', selector: '.origin-copy .origin-lead', defaults: { family: 'serif', weight: '400', size: 20 } },
  { id: 'originBody', label: '網站緣起內文', selector: '.origin-copy > p:not(.block-kicker):not(.origin-lead)', defaults: { family: 'serif', weight: '400', size: 17 } },
  { id: 'topicTitle', label: '分類頁大標', selector: '.topic-hero-title', defaults: { family: 'serif', weight: '600', size: 36 } },
  { id: 'topicHeadline', label: '主視覺標題', selector: '.topic-hero-copy h2', defaults: { family: 'serif', weight: '600', size: 24 } },
  { id: 'topicCopy', label: '主視覺內文', selector: '.topic-hero-copy p', defaults: { family: 'sans', weight: '400', size: 16 } },
  { id: 'topicTab', label: '分類分頁', selector: '.topic-tab', defaults: { family: 'sans', weight: '500', size: 16 } },
  { id: 'articleTitle', label: '文章標題', selector: '.article-card-title', defaults: { family: 'serif', weight: '600', size: 20 } },
  { id: 'articleExcerpt', label: '文章摘要', selector: '.article-card-excerpt', defaults: { family: 'sans', weight: '400', size: 16 } },
  { id: 'clinicTitle', label: '門診表標題', selector: '.clinic-title', defaults: { family: 'serif', weight: '600', size: 26 } },
  { id: 'clinicLead', label: '門診表說明', selector: '.clinic-lead', defaults: { family: 'sans', weight: '400', size: 15 } },
  { id: 'visitName', label: '診所名稱', selector: '.visit-info h3', defaults: { family: 'serif', weight: '600', size: 22 } },
  { id: 'visitBody', label: '交通停車內文', selector: '.visit-info dd', defaults: { family: 'sans', weight: '400', size: 15 } },
  { id: 'footer', label: '頁尾文字', selector: '.footer-legal, .footer-copy, .footer-section ul li, .footer-section h4', defaults: { family: 'sans', weight: '400', size: 13 } },
]

function emptySettings() {
  return Object.fromEntries(TYPE_ROLES.map((role) => [role.id, { ...role.defaults }]))
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const base = emptySettings()
    if (!saved || typeof saved !== 'object') return base
    for (const role of TYPE_ROLES) {
      const item = saved[role.id]
      if (!item) continue
      base[role.id] = {
        family: FAMILIES[item.family] ? item.family : role.defaults.family,
        weight: String(item.weight || role.defaults.weight),
        size: Number(item.size) || role.defaults.size,
      }
    }
    return base
  } catch {
    return emptySettings()
  }
}

function applyType(settings) {
  const root = document.documentElement
  for (const role of TYPE_ROLES) {
    const value = settings[role.id] || role.defaults
    root.style.setProperty(`--type-${role.id}-family`, FAMILIES[value.family] || FAMILIES.sans)
    root.style.setProperty(`--type-${role.id}-weight`, String(value.weight))
    root.style.setProperty(`--type-${role.id}-size`, `${value.size}px`)
  }
}

try {
  if (localStorage.getItem(STORAGE_KEY)) applyType(loadSettings())
} catch {
  /* ignore */
}

function visibleTarget(selector) {
  const nodes = [...document.querySelectorAll(selector)]
  return nodes.find((node) => {
    const rect = node.getBoundingClientRect()
    const style = window.getComputedStyle(node)
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
  }) || null
}

export default function TypeEditor() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState(loadSettings)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    applyType(settings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const update = (id, key, value) => {
    setSettings((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: key === 'size' ? Number(value) : value,
      },
    }))
  }

  return (
    <>
      <TypeChips
        settings={settings}
        activeId={activeId}
        setActiveId={setActiveId}
        onChange={update}
      />
      <aside className={`type-palette ${open ? 'open' : ''}`}>
        <button
          type="button"
          className="type-palette-tab"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          字型
        </button>
        <div className="type-palette-panel">
          <p className="type-palette-title">字體調整</p>
          <button type="button" className="type-reset" onClick={() => setSettings(emptySettings())}>
            還原預設
          </button>
          {TYPE_ROLES.map((role) => (
            <TypeControls
              key={role.id}
              role={role}
              value={settings[role.id]}
              onChange={update}
            />
          ))}
        </div>
      </aside>
    </>
  )
}

function TypeChips({ settings, activeId, setActiveId, onChange }) {
  const [pins, setPins] = useState([])

  useEffect(() => {
    const measure = () => {
      const next = TYPE_ROLES.map((role) => {
        const el = visibleTarget(role.selector)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        if (rect.bottom < 60 || rect.top > window.innerHeight - 8) return null
        return {
          id: role.id,
          label: role.label,
          top: Math.max(72, rect.top),
          left: Math.min(window.innerWidth - 140, Math.max(8, rect.right + 6)),
        }
      }).filter(Boolean)
      setPins(next)
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

  const roleMap = useMemo(() => Object.fromEntries(TYPE_ROLES.map((role) => [role.id, role])), [])

  return (
    <div className="type-chips">
      {pins.map((pin) => {
        const role = roleMap[pin.id]
        const open = activeId === pin.id
        return (
          <div
            key={pin.id}
            className={`type-chip ${open ? 'open' : ''}`}
            style={{ top: pin.top, left: pin.left }}
          >
            <button type="button" className="type-chip-btn" onClick={() => setActiveId(open ? null : pin.id)}>
              Aa {role.label}
            </button>
            {open && (
              <div className="type-chip-pop">
                <TypeControls role={role} value={settings[pin.id]} onChange={onChange} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TypeControls({ role, value, onChange }) {
  const current = value || role.defaults
  return (
    <div className="type-controls">
      <span className="type-controls-label">{role.label}</span>
      <label>
        字型
        <select value={current.family} onChange={(event) => onChange(role.id, 'family', event.target.value)}>
          <option value="sans">黑體 GenSen</option>
          <option value="serif">明體 GenRyu</option>
          <option value="hand">手寫 芫荽</option>
        </select>
      </label>
      <label>
        字重
        <select value={current.weight} onChange={(event) => onChange(role.id, 'weight', event.target.value)}>
          <option value="400">400 Regular</option>
          <option value="500">500 Medium</option>
          <option value="600">600 Semibold</option>
          <option value="700">700 Bold</option>
        </select>
      </label>
      <label>
        大小 {current.size}px
        <input
          type="range"
          min="10"
          max="56"
          step="1"
          value={current.size}
          onChange={(event) => onChange(role.id, 'size', event.target.value)}
        />
      </label>
    </div>
  )
}
