import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'juhao-type'
const CUSTOM_STYLE_ID = 'juhao-type-custom'
const FAMILIES = {
  sans: 'var(--font-sans)',
  serif: 'var(--font-serif)',
  hand: 'var(--font-hand)',
}

const TEXT_TAGS = new Set([
  'A', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'LI', 'BUTTON',
  'LABEL', 'STRONG', 'EM', 'B', 'I', 'SMALL', 'DD', 'DT', 'TD', 'TH',
  'FIGCAPTION', 'BLOCKQUOTE', 'SUMMARY', 'LEGEND', 'CITE',
])

const IGNORE_SELECTOR = [
  '.design-toggle',
  '.type-palette',
  '.color-palette',
  '.design-export',
  '.type-float',
  '.type-pick-banner',
  'script',
  'style',
  'svg',
  'img',
  'iframe',
  'input',
  'textarea',
  'select',
].join(',')

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

function rgbToHex(color) {
  if (!color) return null
  if (color.startsWith('#')) return normalizeHex(color)
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (!match) return null
  return `#${[match[1], match[2], match[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`
}

export const TYPE_ROLES = [
  {
    id: 'logoEn',
    label: 'Logo 英文',
    group: '導覽列',
    selector: '.logo-en',
    affects: '導覽列左側 Logo 英文「DR. JUHAO LEE」。',
    defaults: { family: 'hand', weight: '400', size: 11 },
  },
  {
    id: 'logoZh',
    label: 'Logo 中文',
    group: '導覽列',
    selector: '.logo-text',
    affects: '導覽列左側 Logo 中文「如浩醫師陪你好好成長」。',
    defaults: { family: 'hand', weight: '400', size: 16 },
  },
  {
    id: 'nav',
    label: '導覽選單',
    group: '導覽列',
    selector: '.nav-links > li > a, .nav-drop-btn',
    affects: '導覽列所有選單文字（含下拉按鈕）。同組文字會一起變更。',
    defaults: { family: 'sans', weight: '400', size: 16 },
  },
  {
    id: 'aboutEyebrow',
    label: '關於頁小標',
    group: '關於我',
    selector: '.about-eyebrow',
    affects: '關於我首屏上方小標文字。',
    defaults: { family: 'hand', weight: '400', size: 15 },
  },
  {
    id: 'aboutName',
    label: '關於頁大名',
    group: '關於我',
    selector: '.about-brand',
    affects: '關於我首屏中文大標題／品牌名。',
    defaults: { family: 'serif', weight: '600', size: 42 },
  },
  {
    id: 'aboutEn',
    label: '關於頁英文',
    group: '關於我',
    selector: '.about-brand-en',
    affects: '關於我首屏英文副標。',
    defaults: { family: 'sans', weight: '400', size: 14 },
  },
  {
    id: 'aboutLead',
    label: '關於頁導言',
    group: '關於我',
    selector: '.about-lead',
    affects: '關於我首屏導言段落。',
    defaults: { family: 'hand', weight: '400', size: 18, color: '#1c1c1c' },
  },
  {
    id: 'blockTitle',
    label: '區塊標題',
    group: '共用區塊',
    selector: '.block-title',
    affects: '各內容區塊中文標題。同組標題會一起變更。',
    defaults: { family: 'serif', weight: '600', size: 26 },
  },
  {
    id: 'blockKicker',
    label: '區塊英文標',
    group: '共用區塊',
    selector: '.block-kicker',
    affects: '區塊英文／輔助標。同組會一起變更。',
    defaults: { family: 'sans', weight: '400', size: 12 },
  },
  {
    id: 'sectionBody',
    label: '區塊內文',
    group: '共用區塊',
    selector: '.about-story p, .cv-block li, .specialty-row span, .origin-copy .origin-lead, .origin-copy .origin-body',
    affects: '故事段落、履歷列表、專長說明、起源內文。同組會一起變更。',
    defaults: { family: 'sans', weight: '500', size: 18, color: '#1c1c1c' },
  },
  {
    id: 'cvName',
    label: '履歷姓名',
    group: '履歷／專長',
    selector: '.cv-name',
    affects: '履歷區塊姓名標題。',
    defaults: { family: 'serif', weight: '700', size: 23 },
  },
  {
    id: 'cvHead',
    label: '履歷小標',
    group: '履歷／專長',
    selector: '.cv-block h3',
    affects: '履歷各分區小標。同組會一起變更。',
    defaults: { family: 'sans', weight: '600', size: 17 },
  },
  {
    id: 'specTitle',
    label: '專長標題',
    group: '履歷／專長',
    selector: '.specialty-row strong',
    affects: '專長列表名稱。同組會一起變更。',
    defaults: { family: 'serif', weight: '600', size: 18 },
  },
  {
    id: 'topicTitle',
    label: '分類頁大標',
    group: '分類頁',
    selector: '.topic-hero-title',
    affects: '分類頁頂部大標題。',
    defaults: { family: 'serif', weight: '600', size: 36 },
  },
  {
    id: 'topicHeadline',
    label: '主視覺標題',
    group: '分類頁',
    selector: '.topic-hero-copy h2',
    affects: '分類頁主視覺標題。',
    defaults: { family: 'serif', weight: '600', size: 24 },
  },
  {
    id: 'topicCopy',
    label: '主視覺內文',
    group: '分類頁',
    selector: '.topic-hero-copy p',
    affects: '分類頁主視覺說明。',
    defaults: { family: 'sans', weight: '400', size: 18 },
  },
  {
    id: 'topicTab',
    label: '分類分頁',
    group: '分類頁',
    selector: '.topic-tab',
    affects: '分類頁第二層分頁文字。同組會一起變更。',
    defaults: { family: 'sans', weight: '500', size: 16 },
  },
  {
    id: 'articleTitle',
    label: '文章標題',
    group: '醫師日誌',
    selector: '.article-card-title',
    affects: '日誌卡片標題。同組會一起變更。',
    defaults: { family: 'serif', weight: '600', size: 20 },
  },
  {
    id: 'articleExcerpt',
    label: '文章摘要',
    group: '醫師日誌',
    selector: '.article-card-excerpt',
    affects: '日誌卡片摘要。同組會一起變更。',
    defaults: { family: 'sans', weight: '400', size: 16, color: '#524e4d' },
  },
  {
    id: 'clinicTitle',
    label: '門診表標題',
    group: '門診／交通',
    selector: '.clinic-title',
    affects: '門診時段表標題。',
    defaults: { family: 'serif', weight: '600', size: 26 },
  },
  {
    id: 'clinicLead',
    label: '門診表說明',
    group: '門診／交通',
    selector: '.clinic-lead',
    affects: '門診時段表說明文字。',
    defaults: { family: 'sans', weight: '400', size: 15 },
  },
  {
    id: 'visitName',
    label: '診所名稱',
    group: '門診／交通',
    selector: '.visit-info h3',
    affects: '交通停車區塊診所名稱。',
    defaults: { family: 'serif', weight: '600', size: 22 },
  },
  {
    id: 'visitBody',
    label: '交通停車內文',
    group: '門診／交通',
    selector: '.visit-info dd',
    affects: '交通停車說明內容。同組會一起變更。',
    defaults: { family: 'sans', weight: '400', size: 15 },
  },
  {
    id: 'footer',
    label: '頁尾文字',
    group: '頁尾',
    selector: '.footer-legal, .footer-copy, .footer-section ul li, .footer-section h4',
    affects: '頁尾多數文字。同組會一起變更。',
    defaults: { family: 'sans', weight: '400', size: 13 },
  },
]

function emptyRoles() {
  return Object.fromEntries(
    TYPE_ROLES.map((role) => [
      role.id,
      {
        family: role.defaults.family,
        weight: role.defaults.weight,
        size: role.defaults.size,
        color: role.defaults.color ?? null,
      },
    ]),
  )
}

function emptyStore() {
  return { roles: emptyRoles(), custom: {} }
}

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const base = emptyStore()
    if (!saved || typeof saved !== 'object') return base

    const roleSource = saved.roles && typeof saved.roles === 'object' ? saved.roles : saved
    for (const role of TYPE_ROLES) {
      const item = roleSource[role.id]
      if (!item || typeof item !== 'object') continue
      base.roles[role.id] = {
        family: FAMILIES[item.family] ? item.family : role.defaults.family,
        weight: String(item.weight || role.defaults.weight),
        size: Number(item.size) || role.defaults.size,
        color: normalizeHex(item.color) || role.defaults.color || null,
      }
    }

    if (!roleSource.sectionBody && !saved.roles) {
      const legacy = saved.story || saved.originBody || saved.cvItem || saved.specDetail || saved.originLead
      if (legacy) {
        base.roles.sectionBody = {
          family: FAMILIES[legacy.family] ? legacy.family : base.roles.sectionBody.family,
          weight: String(legacy.weight || base.roles.sectionBody.weight),
          size: Number(legacy.size) || base.roles.sectionBody.size,
          color: normalizeHex(legacy.color) || null,
        }
      }
    }

    if (saved.custom && typeof saved.custom === 'object') {
      for (const [key, item] of Object.entries(saved.custom)) {
        if (!item || typeof item !== 'object' || !item.selector) continue
        base.custom[key] = {
          selector: String(item.selector),
          label: String(item.label || '自訂文字'),
          sample: String(item.sample || ''),
          affects: String(item.affects || '此處點選到的文字。'),
          family: FAMILIES[item.family] ? item.family : 'sans',
          weight: String(item.weight || '400'),
          size: Number(item.size) || 16,
          color: normalizeHex(item.color) || null,
        }
      }
    }
    return base
  } catch {
    return emptyStore()
  }
}

function applyRoles(roles) {
  const root = document.documentElement
  for (const role of TYPE_ROLES) {
    const value = roles[role.id] || role.defaults
    root.style.setProperty(`--type-${role.id}-family`, FAMILIES[value.family] || FAMILIES.sans)
    root.style.setProperty(`--type-${role.id}-weight`, String(value.weight))
    root.style.setProperty(`--type-${role.id}-size`, `${value.size}px`)
    if (value.color) root.style.setProperty(`--type-${role.id}-color`, value.color)
    else root.style.removeProperty(`--type-${role.id}-color`)
  }
}

function cssEscape(value) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value)
  return String(value).replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1')
}

function applyCustom(custom) {
  let style = document.getElementById(CUSTOM_STYLE_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = CUSTOM_STYLE_ID
    document.head.appendChild(style)
  }
  const rules = Object.values(custom).map((item) => {
    const color = item.color ? `color: ${item.color} !important;` : ''
    return `${item.selector} {
      font-family: ${FAMILIES[item.family] || FAMILIES.sans} !important;
      font-weight: ${item.weight} !important;
      font-size: ${item.size}px !important;
      ${color}
    }`
  })
  style.textContent = rules.join('\n')
}

function applyStore(store) {
  applyRoles(store.roles)
  applyCustom(store.custom)
}

try {
  applyStore(loadStore())
} catch {
  /* ignore */
}

function isIgnored(el) {
  return !el || !(el instanceof Element) || el.closest(IGNORE_SELECTOR)
}

function hasOwnText(el) {
  return [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
}

function findTextTarget(start) {
  if (isIgnored(start)) return null
  let el = start
  while (el && el !== document.body) {
    if (isIgnored(el)) return null
    if (TEXT_TAGS.has(el.tagName) && (hasOwnText(el) || el.children.length === 0) && el.textContent.trim()) {
      return el
    }
    el = el.parentElement
  }

  el = start
  while (el && el !== document.body) {
    if (!isIgnored(el) && el.textContent && el.textContent.trim() && TEXT_TAGS.has(el.tagName)) return el
    el = el.parentElement
  }
  return null
}

function buildSelector(el) {
  if (el.id) return `#${cssEscape(el.id)}`
  const parts = []
  let node = el
  while (node && node.nodeType === 1 && parts.length < 8) {
    if (node.id) {
      parts.unshift(`#${cssEscape(node.id)}`)
      break
    }
    const parent = node.parentElement
    let part = node.tagName.toLowerCase()
    if (node.classList?.length) {
      const cls = [...node.classList].find((name) => !name.startsWith('type-pick'))
      if (cls) part += `.${cssEscape(cls)}`
    }
    if (parent) {
      const siblings = [...parent.children].filter((child) => child.tagName === node.tagName)
      if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`
    }
    parts.unshift(part)
    if (node.classList?.contains('app')) break
    node = parent
  }
  return parts.join(' > ')
}

function matchRole(el) {
  for (const role of TYPE_ROLES) {
    try {
      if (el.matches(role.selector)) return role
      const host = el.closest(role.selector)
      if (host) return role
    } catch {
      /* ignore invalid selector */
    }
  }
  return null
}

function guessFamily(fontFamily) {
  const ff = String(fontFamily || '').toLowerCase()
  if (ff.includes('iansui') || ff.includes('cursive') || ff.includes('hand')) return 'hand'
  if (ff.includes('genryu') || ff.includes('serif') || ff.includes('song')) return 'serif'
  return 'sans'
}

function readComputedType(el) {
  const cs = window.getComputedStyle(el)
  const weightRaw = cs.fontWeight
  const weight = weightRaw === 'bold' ? '700' : weightRaw === 'normal' ? '400' : String(weightRaw)
  return {
    family: guessFamily(cs.fontFamily),
    weight: ['400', '500', '600', '700'].includes(weight) ? weight : '400',
    size: Math.max(10, Math.min(72, Math.round(parseFloat(cs.fontSize) || 16))),
    color: rgbToHex(cs.color),
  }
}

function sampleText(el) {
  return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28)
}

function resolveTarget(el) {
  const role = matchRole(el)
  if (role) {
    return {
      kind: 'role',
      id: role.id,
      label: role.label,
      affects: role.affects,
      selector: role.selector,
      sample: sampleText(el),
    }
  }
  const selector = buildSelector(el)
  const key = `custom:${selector}`
  return {
    kind: 'custom',
    id: key,
    label: sampleText(el) || `${el.tagName.toLowerCase()} 文字`,
    affects: `僅調整這段文字（選擇器：${selector}）。`,
    selector,
    sample: sampleText(el),
  }
}

export default function TypeEditor() {
  const [store, setStore] = useState(loadStore)
  const [active, setActive] = useState(null)
  const popRef = useRef(null)
  const storeRef = useRef(store)

  useEffect(() => {
    storeRef.current = store
    applyStore(store)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    window.dispatchEvent(new Event('juhao-design-change'))
  }, [store])

  useEffect(() => {
    document.documentElement.dataset.typePick = 'true'
    const clearHover = () => {
      document.querySelectorAll('.type-pick-hover').forEach((node) => node.classList.remove('type-pick-hover'))
    }
    const clearActive = () => {
      document.querySelectorAll('.type-pick-active').forEach((node) => node.classList.remove('type-pick-active'))
    }

    const onMove = (event) => {
      if (event.target.closest?.('.type-float, .type-palette, .color-palette, .design-export, .design-toggle, .type-pick-banner')) {
        clearHover()
        return
      }
      const target = findTextTarget(event.target)
      clearHover()
      if (!target) return
      target.classList.add('type-pick-hover')
    }

    const onClick = (event) => {
      if (event.target.closest?.('.type-float, .type-palette, .color-palette, .design-export, .design-toggle, .type-pick-banner')) return
      const target = findTextTarget(event.target)
      if (!target) return
      event.preventDefault()
      event.stopPropagation()
      clearActive()
      target.classList.add('type-pick-active')
      const resolved = resolveTarget(target)
      const rect = target.getBoundingClientRect()
      const currentStore = storeRef.current
      let value
      if (resolved.kind === 'role') {
        value = currentStore.roles[resolved.id] || TYPE_ROLES.find((role) => role.id === resolved.id)?.defaults
      } else {
        value = currentStore.custom[resolved.id] || { ...readComputedType(target), color: null }
      }
      setActive({
        ...resolved,
        value: {
          family: value.family,
          weight: String(value.weight),
          size: Number(value.size),
          color: value.color || null,
        },
        top: Math.min(window.innerHeight - 320, Math.max(72, rect.bottom + 8)),
        left: Math.min(window.innerWidth - 280, Math.max(12, rect.left)),
      })
    }

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setActive(null)
        clearActive()
      }
    }

    document.addEventListener('mousemove', onMove, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.dataset.typePick = 'false'
      clearHover()
      clearActive()
      document.removeEventListener('mousemove', onMove, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (!active) return undefined
    const onDown = (event) => {
      if (popRef.current?.contains(event.target)) return
      if (event.target.closest?.('.type-palette, .color-palette, .design-toggle')) return
      setActive(null)
      document.querySelectorAll('.type-pick-active').forEach((node) => node.classList.remove('type-pick-active'))
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [active])

  const updateActive = (key, raw) => {
    if (!active) return
    const nextValue = {
      ...active.value,
      [key]: key === 'size'
        ? Number(raw)
        : key === 'color'
          ? (raw ? normalizeHex(raw) || null : null)
          : raw,
    }
    setActive((current) => current ? { ...current, value: nextValue } : null)

    setStore((current) => {
      if (active.kind === 'role') {
        return {
          ...current,
          roles: {
            ...current.roles,
            [active.id]: { ...current.roles[active.id], ...nextValue },
          },
        }
      }
      return {
        ...current,
        custom: {
          ...current.custom,
          [active.id]: {
            selector: active.selector,
            label: active.label,
            sample: active.sample,
            affects: active.affects,
            ...nextValue,
          },
        },
      }
    })
  }

  return (
    <>
      {active && (
        <div
          ref={popRef}
          className="type-float"
          style={{ top: active.top, left: active.left }}
        >
          <div className="type-float-head">
            <strong>{active.label}</strong>
            <button type="button" onClick={() => setActive(null)} aria-label="關閉">×</button>
          </div>
          <p className="type-controls-affects">牽動：{active.affects}</p>
          {active.sample && <p className="type-float-sample">「{active.sample}」</p>}
          <TypeControls
            value={active.value}
            onChange={updateActive}
          />
        </div>
      )}
    </>
  )
}

function TypeControls({ value, onChange }) {
  const current = value || { family: 'sans', weight: '400', size: 16, color: null }
  const colorValue = normalizeHex(current.color) || '#2c2622'
  const [colorText, setColorText] = useState(current.color || '')

  useEffect(() => {
    setColorText(current.color || '')
  }, [current.color])

  return (
    <div className="type-controls">
      <label>
        字型
        <select value={current.family} onChange={(event) => onChange('family', event.target.value)}>
          <option value="sans">黑體 GenSen</option>
          <option value="serif">明體 GenRyu</option>
          <option value="hand">手寫 芫荽</option>
        </select>
      </label>
      <label>
        字重
        <select value={current.weight} onChange={(event) => onChange('weight', event.target.value)}>
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
          max="72"
          step="1"
          value={current.size}
          onChange={(event) => onChange('size', event.target.value)}
        />
      </label>
      <label>
        顏色
        <div className="color-field-row">
          <input
            type="color"
            value={colorValue}
            onChange={(event) => onChange('color', event.target.value)}
            aria-label="文字色盤"
          />
          <input
            type="text"
            value={colorText}
            spellCheck={false}
            placeholder="預設"
            aria-label="文字色號"
            onChange={(event) => {
              const next = event.target.value
              setColorText(next)
              if (!next.trim()) onChange('color', null)
              else {
                const hex = normalizeHex(next)
                if (hex) onChange('color', hex)
              }
            }}
            onBlur={(event) => {
              const hex = normalizeHex(event.target.value)
              if (hex) onChange('color', hex)
              else if (!event.target.value.trim()) onChange('color', null)
              else setColorText(current.color || '')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.blur()
              }
            }}
          />
        </div>
        {current.color && (
          <button type="button" className="type-color-reset" onClick={() => onChange('color', null)}>
            還原預設色
          </button>
        )}
      </label>
    </div>
  )
}
