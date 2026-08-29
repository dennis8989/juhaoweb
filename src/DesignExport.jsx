import { useEffect, useMemo, useState } from 'react'
import { TYPE_ROLES } from './TypeEditor.jsx'

const THEME_KEY = 'juhao-theme'
const TYPE_KEY = 'juhao-type'
const EVENT_NAME = 'juhao-design-change'
const RESET_EVENT = 'juhao-design-reset'

const FAMILY_LABEL = {
  sans: '黑體 GenSen',
  serif: '明體 GenRyu',
  hand: '手寫 芫荽',
}

const DEFAULT_THEME = {
  bar: '#2c2622',
  content: '#ffffff',
  navText: null,
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null')
  } catch {
    return null
  }
}

function roleChanged(role, value) {
  if (!value) return false
  return (
    value.family !== role.defaults.family
    || String(value.weight) !== String(role.defaults.weight)
    || Number(value.size) !== Number(role.defaults.size)
    || Boolean(value.color)
  )
}

function formatTypeValue(value) {
  const parts = [
    `字型=${FAMILY_LABEL[value.family] || value.family}`,
    `字重=${value.weight}`,
    `大小=${value.size}px`,
  ]
  if (value.color) parts.push(`顏色=${value.color}`)
  else parts.push('顏色=預設')
  return parts.join('、')
}

function countChanges() {
  const theme = readJson(THEME_KEY) || {}
  const typeStore = readJson(TYPE_KEY) || {}
  const roles = typeStore.roles && typeof typeStore.roles === 'object' ? typeStore.roles : typeStore
  const customCount = typeStore.custom ? Object.keys(typeStore.custom).length : 0
  const roleCount = TYPE_ROLES.filter((role) => roleChanged(role, roles[role.id])).length
  const themeCount = [
    theme.bar && theme.bar !== DEFAULT_THEME.bar,
    theme.content && theme.content !== DEFAULT_THEME.content,
    Boolean(theme.navText),
  ].filter(Boolean).length
  return themeCount + roleCount + customCount
}

export function buildDesignReport() {
  const theme = readJson(THEME_KEY) || {}
  const typeStore = readJson(TYPE_KEY) || {}
  const roles = typeStore.roles && typeof typeStore.roles === 'object'
    ? typeStore.roles
    : typeStore
  const custom = typeStore.custom && typeof typeStore.custom === 'object'
    ? typeStore.custom
    : {}

  const themeLines = []
  if (theme.bar && theme.bar !== DEFAULT_THEME.bar) {
    themeLines.push(`- 選單列：${theme.bar}`)
  }
  if (theme.content && theme.content !== DEFAULT_THEME.content) {
    themeLines.push(`- 內容底色：${theme.content}`)
  }
  if (theme.navText) {
    themeLines.push(`- 選單文字（預設）：${theme.navText}（會影響 Logo／導覽預設字色）`)
  }

  const changedRoles = TYPE_ROLES.filter((role) => roleChanged(role, roles[role.id]))
  const roleLines = changedRoles.map((role) => {
    const value = roles[role.id]
    return [
      `- ${role.label}：${formatTypeValue(value)}`,
      `  牽動：${role.affects}`,
    ].join('\n')
  })

  const customItems = Object.values(custom)
  const customLines = customItems.map((item) => {
    const rows = [
      `- ${item.label || item.sample || '自訂文字'}：${formatTypeValue(item)}`,
    ]
    if (item.sample) rows.push(`  範例：「${item.sample}」`)
    rows.push(`  牽動：${item.affects || '僅此段文字'}`)
    rows.push(`  選擇器：${item.selector}`)
    return rows.join('\n')
  })

  const total = themeLines.length + changedRoles.length + customItems.length
  const lines = []
  lines.push('【設計調整清單｜僅列與預設不同項目】')
  lines.push(`產生時間：${new Date().toLocaleString('zh-TW')}`)
  lines.push(`異動筆數：${total}`)

  if (total === 0) {
    lines.push('')
    lines.push('目前沒有與預設不同的調整。')
    return lines.join('\n')
  }

  if (themeLines.length) {
    lines.push('')
    lines.push('【調色】')
    lines.push(...themeLines)
  }

  if (roleLines.length) {
    lines.push('')
    lines.push('【文字調整｜預設分組】')
    lines.push(...roleLines)
  }

  if (customLines.length) {
    lines.push('')
    lines.push('【文字調整｜點選自訂】')
    lines.push(...customLines)
  }

  lines.push('')
  lines.push('【請正式套用】')
  lines.push('請把以上調整寫進正式網站程式碼／CSS 變數預設值，讓未開設計工具時也呈現相同結果。')

  return lines.join('\n')
}

function resetDesignDefaults() {
  localStorage.removeItem(THEME_KEY)
  localStorage.removeItem(TYPE_KEY)
  window.dispatchEvent(new Event(RESET_EVENT))
  window.dispatchEvent(new Event(EVENT_NAME))
  window.location.reload()
}

export default function DesignExport() {
  const [open, setOpen] = useState(false)
  const [report, setReport] = useState(buildDesignReport)
  const [copied, setCopied] = useState(false)

  const refresh = () => setReport(buildDesignReport())

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener(EVENT_NAME, onChange)
    window.addEventListener('storage', onChange)
    const timer = window.setInterval(refresh, 800)
    return () => {
      window.removeEventListener(EVENT_NAME, onChange)
      window.removeEventListener('storage', onChange)
      window.clearInterval(timer)
    }
  }, [])

  const summary = useMemo(() => countChanges(), [report])

  const copyReport = async () => {
    const text = buildDesignReport()
    setReport(text)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <aside className={`design-export ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="design-export-tab"
        onClick={() => {
          setOpen((value) => !value)
          refresh()
        }}
        aria-expanded={open}
      >
        清單{summary > 0 ? ` ${summary}` : ''}
      </button>
      <div className="design-export-panel">
        <p className="design-export-title">調整清單</p>
        <p className="design-export-hint">
          只列出與預設不同的調色／文字調整。複製後貼給我，就能寫進正式程式。
        </p>
        <pre className="design-export-report">{report}</pre>
        <div className="design-export-actions">
          <button type="button" className="design-export-copy" onClick={copyReport}>
            {copied ? '已複製' : '複製調整清單'}
          </button>
          <button
            type="button"
            className="design-export-reset"
            onClick={() => {
              if (window.confirm('確定恢復全部調色與文字調整為預設？')) {
                resetDesignDefaults()
              }
            }}
          >
            恢復預設
          </button>
        </div>
      </div>
    </aside>
  )
}
