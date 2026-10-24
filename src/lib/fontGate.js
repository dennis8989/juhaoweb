const MAX_WAIT_MS = 1500
const MAX_BLANK_MS = 2500
// 關於我頁要連醫師照片一起出現，所以可以多等一點；index.html 的保底顯示要比這個晚
const MAX_BLANK_WITH_PHOTO_MS = 4000

// 網頁字型分兩層（見 index.html）：
// 1. 核心字型檔：建置時依網站內容切好的四個檔（public/fonts/，scripts/build-fonts.mjs），index.html 會預先載入，
//    @font-face 寫在 <style id="core-fonts">，unicode-range 列出它們有的字。
// 2. 備援字型：font.emtech.cc 依字切片的字型 CSS。只有核心字型檔沒有的字（部署後新文章才出現的字）才需要它，
//    所以第一次遇到這種字才掛上，而且掛在核心 @font-face 前面，核心字型檔有的字才會繼續用核心檔。
//    （document.fonts.load / check 會把同一家族所有涵蓋該字的字型檔都算進去，備援一掛上，
//    對核心檔有的字再呼叫它們就會多下載幾十個切片，所以傳給它們的文字只能是備援才有的字。）
const FALLBACK_FONT_CSS = [
  'https://font.emtech.cc/css/GenSenRoundedTW/400',
  'https://font.emtech.cc/css/GenSenRoundedTW/700',
  'https://font.emtech.cc/css/GenRyuMinTW/400',
  'https://font.emtech.cc/css/GenRyuMinTW/600',
  'https://font.emtech.cc/css/Iansui/400',
]

// 第一次開網頁時字型檔還沒下載，瀏覽器會先用系統字、下載完再換字。
// index.html 先用 fonts-loading 把畫面藏起來；這裡只等第一個畫面用到的字型再淡入。
// 最多等 MAX_WAIT_MS，而且從打開網頁起算不超過 MAX_BLANK_MS，網路慢時不讓訪客空等。
// 有傳 alsoWaitFor（關於我頁的醫師照片）時，字型和照片都好了才一起淡入，
// 從打開網頁起算最多等 MAX_BLANK_WITH_PHOTO_MS；照片來不及就先顯示網頁，照片之後再淡入。
export function revealWhenFontsReady({ alsoWaitFor = null } = {}) {
  const html = document.documentElement
  if (!html.classList.contains('fonts-loading')) return

  let revealed = false
  const reveal = (reason) => {
    if (revealed) return
    revealed = true
    html.classList.remove('fonts-loading')
    performance.mark('fonts-revealed', { detail: reason })
  }

  if (!document.fonts?.load) {
    reveal('unsupported')
    return
  }

  const waitMs = alsoWaitFor
    ? Math.max(0, MAX_BLANK_WITH_PHOTO_MS - performance.now())
    : Math.min(MAX_WAIT_MS, Math.max(0, MAX_BLANK_MS - performance.now()))
  setTimeout(() => reveal('timeout'), waitMs)
  const loads = [...visibleTextByFont(document.getElementById('root'))].flatMap(([font, group]) => fontLoads(font, group))
  Promise.all([...loads, alsoWaitFor]).then(() => reveal(alsoWaitFor ? 'fonts-and-photo-ready' : 'fonts-ready'))
}

// 第一個畫面之後，文章、分類、關於我的正式內容才從後台載入，換頁也會畫出新的文字。
// container 裡新加進來的區塊，若看得到的文字字型還沒載好（核心字型檔還在下載，或有備援才有的字），
// 就先只把那一塊藏起來，等字載好再淡入，一樣最多等 MAX_WAIT_MS。已經在畫面上的部分不受影響。
// 回傳停止監看的函式。
export function holdNewTextUntilFontsReady(container) {
  if (!container || !document.fonts?.load || !document.fonts.check) return () => {}

  const fadeIn = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  let added = new Set()
  let held = new Set()
  // 目前藏著的區塊還在等的字型
  let pendingLoads = []
  let scheduled = false
  let round = 0
  // 藏起來的時間點；接連出現新區塊時不重新計時，總共最多藏 MAX_WAIT_MS
  let hiddenSince = null

  const settle = () => {
    scheduled = false
    const blocks = [...added].filter((el) => el.isConnected)
    added = new Set()
    const loads = []
    for (const el of blocks) {
      const missing = [...visibleTextByFont(el)].filter(([font, group]) => !fontReady(font, group))
      if (!missing.length) continue
      el.classList.add('fonts-pending')
      held.add(el)
      loads.push(...missing.flatMap(([font, group]) => fontLoads(font, group)))
    }
    if (!loads.length) return
    const current = ++round
    const start = hiddenSince ?? performance.now()
    hiddenSince = start
    const show = (reason) => {
      if (current !== round) return
      round++
      hiddenSince = null
      for (const el of held) {
        el.classList.remove('fonts-pending')
        if (fadeIn && el.isConnected) el.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 250, easing: 'ease' })
      }
      held = new Set()
      pendingLoads = []
      performance.measure('fonts-held', { start, detail: reason })
    }
    setTimeout(() => show('timeout'), Math.max(0, start + MAX_WAIT_MS - performance.now()))
    // 前一輪還藏著的區塊也一起等，前一輪的 show 已經作廢
    Promise.all([...loads, ...pendingLoads]).then(() => show('fonts-ready'))
    pendingLoads = loads
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') {
        if (record.target.parentElement) added.add(record.target.parentElement)
        continue
      }
      for (const node of record.addedNodes) {
        const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement
        if (el) added.add(el)
      }
    }
    if (scheduled || !added.size) return
    scheduled = true
    // 等這一輪 React 畫完、版面算好再看
    requestAnimationFrame(settle)
  })
  observer.observe(container, { childList: true, subtree: true, characterData: true })
  return () => {
    observer.disconnect()
    round++
    hiddenSince = null
    for (const el of held) el.classList.remove('fonts-pending')
    held = new Set()
  }
}

// 這組文字的字型都好了嗎
function fontReady(font, { family, text }) {
  const { covered, uncovered } = splitByCoverage(family, text)
  if (covered && !coreFaces().every((face) => face.status === 'loaded')) return false
  if (!uncovered) return true
  if (!fallbackReady) return false
  try {
    return document.fonts.check(font, uncovered)
  } catch {
    return true
  }
}

// 請瀏覽器載入這組文字需要的字型：核心字型檔，加上備援才有的字的切片。回傳不會 reject 的 promise 陣列
function fontLoads(font, { family, text }) {
  const { covered, uncovered } = splitByCoverage(family, text)
  const loads = []
  if (covered) loads.push(...coreFaces().map((face) => face.load().catch(() => {})))
  if (uncovered) loads.push(ensureFallbackFonts().then(() => document.fonts.load(font, uncovered)).catch(() => []))
  return loads
}

// 把文字分成核心字型檔有的字（covered）和沒有的字（uncovered）；family 是元素的 font-family 清單
function splitByCoverage(family, text) {
  const map = coreFontMap()
  const core = family
    .split(',')
    .map((name) => name.trim().replace(/^["']|["']$/g, ''))
    .map((name) => map.get(name))
    .find(Boolean)
  if (!core) return { covered: '', uncovered: text }
  let covered = ''
  let uncovered = ''
  for (const char of text) {
    if (core.chars.has(char.codePointAt(0))) covered += char
    else uncovered += char
  }
  return { covered, uncovered }
}

let coreFontMapCache = null

// 核心字型檔：family → { chars: 有的字的 code point, faces: FontFace }。第一次呼叫時從 <style id="core-fonts"> 讀，
// 一定要在掛上備援字型之前，這時 document.fonts 裡只有核心字型檔
function coreFontMap() {
  if (coreFontMapCache) return coreFontMapCache
  const map = new Map()
  const sheet = document.getElementById('core-fonts')?.sheet
  try {
    for (const rule of sheet?.cssRules ?? []) {
      if (!(rule instanceof CSSFontFaceRule)) continue
      const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim()
      const entry = map.get(family) ?? { chars: new Set(), faces: [] }
      for (const code of parseUnicodeRange(rule.style.getPropertyValue('unicode-range'))) entry.chars.add(code)
      map.set(family, entry)
    }
    for (const face of document.fonts) {
      map.get(face.family.replace(/["']/g, '').trim())?.faces.push(face)
    }
  } catch {
    map.clear()
  }
  coreFontMapCache = map
  return map
}

function coreFaces() {
  return [...coreFontMap().values()].flatMap((entry) => entry.faces)
}

// "U+20-7E, U+A9, …" → code point 陣列
function parseUnicodeRange(value) {
  const codes = []
  for (const part of value.split(',')) {
    const match = /U\+([0-9a-f]+)(?:-([0-9a-f]+))?/i.exec(part)
    if (!match) continue
    const start = parseInt(match[1], 16)
    const end = match[2] ? parseInt(match[2], 16) : start
    for (let code = start; code <= end; code++) codes.push(code)
  }
  return codes
}

let fallbackLoading = null
let fallbackReady = false

// 掛上備援字型 CSS（只做一次），放在核心 @font-face 前面；回傳 CSS 都載好（或失敗）時 resolve 的 promise
function ensureFallbackFonts() {
  if (fallbackLoading) return fallbackLoading
  coreFontMap()
  const before = document.getElementById('core-fonts')
  fallbackLoading = Promise.all(FALLBACK_FONT_CSS.map((href) => new Promise((resolve) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = resolve
    link.onerror = resolve
    if (before) before.before(link)
    else document.head.appendChild(link)
  }))).then(() => {
    fallbackReady = true
  })
  return fallbackLoading
}

// root 裡目前在視窗範圍內的文字，依字型分組：font 字串 → { family: font-family 清單, text }
function visibleTextByFont(root) {
  const textByFont = new Map()
  if (!root) return textByFont
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.trim()
    const el = node.parentElement
    if (!text || !el) continue
    const rect = el.getBoundingClientRect()
    if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) continue
    const style = getComputedStyle(el)
    const font = `${style.fontStyle} ${style.fontWeight} 16px ${style.fontFamily}`
    const group = textByFont.get(font) ?? { family: style.fontFamily, text: '' }
    group.text += text
    textByFont.set(font, group)
  }
  return textByFont
}
