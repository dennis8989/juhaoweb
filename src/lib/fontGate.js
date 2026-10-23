const MAX_WAIT_MS = 1500
const MAX_BLANK_MS = 2500
// 關於我頁要連醫師照片一起出現，所以可以多等一點；index.html 的保底顯示要比這個晚
const MAX_BLANK_WITH_PHOTO_MS = 4000

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
  Promise.all([...firstScreenFontLoads(), alsoWaitFor]).then(() => reveal(alsoWaitFor ? 'fonts-and-photo-ready' : 'fonts-ready'))
}

// 第一個畫面之後，文章、分類、關於我的正式內容才從後台載入，換頁也會畫出新的文字。
// 字型檔是依文字分成很多小檔，新出現的字常要再下載，瀏覽器會先用系統字、下載完再換字。
// 所以 container 裡一出現字型還沒載好的文字，就先把它藏起來，等畫面裡看得到的字載好再淡入，
// 一樣最多等 MAX_WAIT_MS。回傳停止監看的函式。
export function holdNewTextUntilFontsReady(container) {
  if (!container || !document.fonts?.load || !document.fonts.check) return () => {}

  let scheduled = false
  let round = 0
  // 藏起來的時間點；接連出現新文字時不重新計時，總共最多藏 MAX_WAIT_MS
  let hiddenSince = null
  const settle = () => {
    scheduled = false
    const missing = [...visibleTextByFont(container)].filter(([font, text]) => !fontReady(font, text))
    if (!missing.length) return
    const current = ++round
    const start = hiddenSince ?? performance.now()
    hiddenSince = start
    container.classList.add('fonts-pending')
    const show = (reason) => {
      if (current !== round) return
      round++
      hiddenSince = null
      container.classList.remove('fonts-pending')
      performance.measure('fonts-held', { start, detail: reason })
    }
    setTimeout(() => show('timeout'), Math.max(0, start + MAX_WAIT_MS - performance.now()))
    Promise.all(missing.map(([font, text]) => document.fonts.load(font, text).catch(() => []))).then(() => show('fonts-ready'))
  }

  const observer = new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    // 等這一輪 React 畫完、版面算好再看
    requestAnimationFrame(settle)
  })
  observer.observe(container, { childList: true, subtree: true, characterData: true })
  settle()
  return () => {
    observer.disconnect()
    round++
    hiddenSince = null
    container.classList.remove('fonts-pending')
  }
}

function fontReady(font, text) {
  try {
    return document.fonts.check(font, text)
  } catch {
    return true
  }
}

// 把第一個畫面裡的文字依字型分組，請瀏覽器載入各組需要的字型檔
function firstScreenFontLoads() {
  const root = document.getElementById('root')
  return [...visibleTextByFont(root)].map(([font, text]) => document.fonts.load(font, text).catch(() => []))
}

// root 裡目前在視窗範圍內的文字，依字型分組
function visibleTextByFont(root) {
  const textByFont = new Map()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.trim()
    const el = node.parentElement
    if (!text || !el) continue
    const rect = el.getBoundingClientRect()
    if (!rect.width || rect.bottom < 0 || rect.top > window.innerHeight) continue
    const style = getComputedStyle(el)
    const font = `${style.fontStyle} ${style.fontWeight} 16px ${style.fontFamily}`
    textByFont.set(font, (textByFont.get(font) || '') + text)
  }
  return textByFont
}
