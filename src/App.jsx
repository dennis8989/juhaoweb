import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ColorPalette from './ColorPalette.jsx'
import {
  APPOINTMENT_URL,
  FACEBOOK_PAGE_URL,
  aboutProfile,
  aboutStory,
  articleMenu,
  caseMenu,
  casePages,
  directoryItems,
  filterArticles,
  getArticle,
  getSectionMeta,
  secondLevel,
  specialties,
} from './data/content.js'

const logoSrc = `${import.meta.env.BASE_URL}logo.png`

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '')
  const parts = raw.split('/').filter(Boolean)
  return {
    view: parts[0] || 'about',
    sub: parts[1] || null,
    extra: parts[2] || null,
  }
}

function go(path) {
  const next = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = next
}

function App() {
  const [route, setRoute] = useState(parseHash)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace('#/about')
    }
    const onHash = () => {
      setRoute(parseHash())
      setMenuOpen(false)
      setOpenDropdown(null)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const activeDir = useMemo(() => {
    if (route.view === 'articles') {
      const map = {
        'bone-age': 'bone-age',
        'short-stature': 'short-stature',
        puberty: 'puberty',
        sga: 'short-stature',
        gh: 'gh',
        gnrh: 'gnrh',
        nutrition: 'nutrition',
        gender: 'puberty',
      }
      return map[route.sub] || ''
    }
    if (route.view === 'article') {
      const article = getArticle(route.sub)
      return article?.dirs?.[0] || 'about'
    }
    return directoryItems.some((item) => item.id === route.view) ? route.view : 'about'
  }, [route])

  const subItems = secondLevel[activeDir] || []
  const activeSub = route.view === activeDir ? route.sub : null

  return (
    <div className="app">
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        activeDir={activeDir}
      />
      <main className={`page ${route.view === 'about' ? 'page-about' : ''}`}>
        {route.view !== 'about' && (
          <header className="page-hero">
            <p className="page-brand">李如浩醫師</p>
            <p className="page-english">JU-HAO LEE, MD · 兒童成長發育專科</p>
          </header>
        )}

        {subItems.length > 0 && route.view !== 'about' && route.view !== 'articles' && route.view !== 'article' && (
          <nav className="subnav" aria-label="第二層目錄">
            {subItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`subnav-btn ${activeSub === item.id ? 'active' : ''}`}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        <div className="page-body fade-in" key={`${route.view}-${route.sub || ''}-${route.extra || ''}`}>
          <PageBody route={route} />
        </div>
      </main>
      <ClinicHours />
      <Footer />
      <ColorPalette />
    </div>
  )
}

function Navbar({ menuOpen, setMenuOpen, openDropdown, setOpenDropdown, activeDir }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name))
  }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <button type="button" className="logo" onClick={() => go('/about')}>
          <img className="logo-mark" src={logoSrc} alt="如浩醫師" />
          <span className="logo-copy">
            <span className="logo-en">DR. JUHAO LEE</span>
            <span className="logo-text">如浩醫師陪你好好成長</span>
          </span>
        </button>
        <button
          type="button"
          className="nav-toggle"
          aria-label="開啟選單"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li
            className={`has-dropdown ${openDropdown === 'cases' ? 'open' : ''}`}
            onMouseEnter={() => setOpenDropdown('cases')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button type="button" className="nav-drop-btn" onClick={() => toggleDropdown('cases')}>
              真實案例分享
            </button>
            <ul className="dropdown">
              {caseMenu.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.path}`} onClick={() => go(item.path)}>{item.label}</a>
                </li>
              ))}
            </ul>
          </li>
          <li
            className={`has-dropdown ${openDropdown === 'articles' ? 'open' : ''}`}
            onMouseEnter={() => setOpenDropdown('articles')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button type="button" className="nav-drop-btn" onClick={() => toggleDropdown('articles')}>
              衛教文章
            </button>
            <ul className="dropdown">
              {articleMenu.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.path}`} onClick={() => go(item.path)}>{item.label}</a>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="nav-appointment-link">
              預約掛號
            </a>
          </li>
        </ul>
      </nav>
      <nav className="directory" aria-label="首頁目錄">
        {directoryItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`dir-btn ${activeDir === item.id ? 'active' : ''}`}
            onClick={() => go(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}

function PageBody({ route }) {
  if (route.view === 'article') {
    return <ArticleDetail id={route.sub} />
  }
  if (route.view === 'articles') {
    const cat = route.sub || 'latest'
    const list = filterArticles({ articleCat: cat })
    const menuItem = articleMenu.find((item) => item.id === cat)
    return (
      <SectionFrame
        title={menuItem?.label || '衛教文章'}
        intro="由 Facebook 衛教文搬運至本站對應目錄，完整圖文仍可於原文閱讀。"
      >
        <ArticleGrid items={list} />
      </SectionFrame>
    )
  }
  if (route.view === 'about' || !route.view) {
    return <AboutPage />
  }
  if (route.view === 'cases') {
    return <CasePage sub={route.sub} />
  }

  const dir = route.view
  const sub = route.sub
  const meta = getSectionMeta(dir, sub)
  const list = filterArticles(sub ? { dir, sub } : { dir })

  return (
    <SectionFrame title={meta.title} intro={meta.intro}>
      <ArticleGrid items={list} emptyText="此分類文章將陸續補充。歡迎先閱讀相關主題，或預約門診個別討論。" />
    </SectionFrame>
  )
}

function SectionFrame({ title, intro, children }) {
  return (
    <section className="content-section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        {intro && <p className="section-lead">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

function goldText(text) {
  const parts = text.split(/(「[^」]+」)/g)
  return parts.map((part, index) => (
    part.startsWith('「')
      ? <em key={index} className="gold-quote">{part}</em>
      : <span key={index}>{part}</span>
  ))
}

function AboutPage() {
  return (
    <>
      <section className="about-intro">
        <div className="container about-intro-inner">
          <div className="about-intro-copy">
            <p className="about-eyebrow">兒童成長發育專科 · 小兒內分泌</p>
            <h1 className="about-brand">{aboutProfile.name}</h1>
            <p className="about-brand-en">{aboutProfile.english}</p>
            <p className="about-lead">
              以醫學實證與臨床經驗為本，陪伴孩子的身高、骨齡、性早熟、青春期與生長激素治療。
            </p>
            <div className="about-actions">
              <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                預約掛號
              </a>
              <a href="#contact" className="btn-ghost">門診時間</a>
            </div>
          </div>
          <aside className="about-portrait">
            <div className="portrait-frame">
              <img className="portrait-mark" src={logoSrc} alt="" />
              <h2>{aboutProfile.name}</h2>
              <p className="about-card-en">{aboutProfile.english}</p>
              <p className="portrait-role">兒童成長發育專科</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="block-white">
        <div className="container about-layout">
          <div className="about-story">
            <h2 className="block-title">醫師理念</h2>
            <p className="block-kicker">APPROACH</p>
            {aboutStory.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{goldText(paragraph)}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="block-beige">
        <div className="container about-lower">
          <div className="specialty-col">
            <h2 className="block-title">專長與服務項目</h2>
            <p className="block-kicker">SPECIALTIES & SERVICES</p>
            <div className="specialty-list">
              {specialties.map((item) => (
                <button key={item.id} type="button" className="specialty-row" onClick={() => go(item.path)}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                  <i aria-hidden="true">→</i>
                </button>
              ))}
            </div>
          </div>

          <aside className="cv-card">
            <h2 className="block-title">醫師簡介與經歷</h2>
            <p className="block-kicker">CURRICULUM VITAE</p>
            <p className="cv-name">{aboutProfile.name} <span>{aboutProfile.english}</span></p>
            <CvBlock title="現職" items={aboutProfile.current} />
            <CvBlock title="學經歷與專業認證" items={[...aboutProfile.education, ...aboutProfile.licenses, ...aboutProfile.teaching]} />
          </aside>
        </div>
      </section>
    </>
  )
}

function CvBlock({ title, items }) {
  return (
    <div className="cv-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function CasePage({ sub }) {
  const key = sub || null
  const meta = getSectionMeta('cases', key)
  const relatedCats = key ? casePages[key]?.relatedArticleCats || [] : []
  const related = relatedCats.flatMap((cat) => filterArticles({ articleCat: cat }))
  const unique = related.filter((item, index, arr) => arr.findIndex((row) => row.id === item.id) === index)

  return (
    <SectionFrame title={meta.title} intro={meta.intro}>
      <div className="empty-note">
        <p>個案圖文整理中。以下先提供相關衛教，方便家長對照閱讀；正式案例刊出後會更新於此。</p>
      </div>
      {!sub && (
        <div className="case-links">
          {caseMenu.map((item) => (
            <button key={item.id} type="button" className="case-link-btn" onClick={() => go(item.path)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      {unique.length > 0 && (
        <>
          <h3 className="subsection-title">相關衛教</h3>
          <ArticleGrid items={unique} />
        </>
      )}
    </SectionFrame>
  )
}

function ArticleGrid({ items, emptyText }) {
  if (!items.length) {
    return <p className="empty-note">{emptyText || '目前尚無文章。'}</p>
  }
  return (
    <div className="articles-grid">
      {items.map((article) => (
        <a key={article.id} className="article-card" href={`#/article/${article.id}`} onClick={(event) => {
          event.preventDefault()
          go(`/article/${article.id}`)
        }}>
          <div className="article-card-content">
            <h3 className="article-card-title">{article.title}</h3>
            <p className="article-card-excerpt">{article.excerpt}</p>
            <span className="read-more">閱讀全文</span>
          </div>
        </a>
      ))}
    </div>
  )
}

function ArticleDetail({ id }) {
  const article = getArticle(id)
  if (!article) {
    return (
      <SectionFrame title="找不到文章" intro="這篇文章可能已移動。請回到衛教目錄再選一次。">
        <button type="button" className="back-button" onClick={() => go('/articles/latest')}>
          ← 返回衛教文章
        </button>
      </SectionFrame>
    )
  }

  return (
    <section className="content-section article-detail">
      <div className="container">
        <button type="button" className="back-button" onClick={() => window.history.back()}>
          ← 返回
        </button>
        <article className="article-full">
          <div className="article-header">
            <h1 className="article-title-full">{article.title}</h1>
            <p className="article-kicker">李如浩醫師 · 兒童成長發育專科</p>
          </div>
          {article.content ? (
            <div className="article-content">
              {article.content.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="article-content">
              {article.excerpt}
              <br />
              <br />
              完整圖文請見 Facebook 原文。
            </p>
          )}
          <div className="article-footer">
            <p className="article-author">— 李如浩醫師</p>
            <a href={article.facebookUrl} target="_blank" rel="noopener noreferrer" className="facebook-link">
              查看 Facebook 原文 →
            </a>
          </div>
          <FacebookEmbed url={article.facebookUrl} />
        </article>
      </div>
    </section>
  )
}

function FacebookEmbed({ url }) {
  const src = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`
  return (
    <div className="fb-embed-wrap">
      <iframe
        title="Facebook 原文"
        src={src}
        width="500"
        height="640"
        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    </div>
  )
}

const clinicDays = [
  { en: 'MON', zh: '一' },
  { en: 'TUE', zh: '二' },
  { en: 'WED', zh: '三' },
  { en: 'THU', zh: '四' },
  { en: 'FRI', zh: '五' },
  { en: 'SAT', zh: '六' },
]

const clinicSlots = [
  { day: 1, period: 'evening', clinic: '菡生婦幼', time: '18:00 – 21:00' },
  { day: 2, period: 'span', clinic: '宥宥婦幼', time: '15:00 – 21:00' },
  { day: 3, period: 'evening', clinic: '菡生婦幼', time: '18:00 – 21:00' },
  { day: 4, period: 'span', clinic: '菡生婦幼', time: '15:00 – 21:00' },
  { day: 5, period: 'morning', clinic: '菡生婦幼', time: '09:00 – 12:00' },
]

function ClinicHours() {
  return (
    <section id="contact" className="clinic-hours">
      <div className="container">
        <h2 className="clinic-title">如浩醫師門診表</h2>
        <p className="clinic-lead">菡生婦幼診所 · 宥宥婦幼診所 · 請以線上掛號確認當日診次</p>
        <div className="schedule-board">
          <div className="schedule-grid" aria-hidden="false">
            <div className="schedule-corner" />
            {clinicDays.map((day) => (
              <div key={day.en} className="schedule-day">
                <span>{day.en}</span>
                <small>{day.zh}</small>
              </div>
            ))}
            <div className="schedule-period p-morning">早</div>
            <div className="schedule-period p-noon">午</div>
            <div className="schedule-period p-evening">晚</div>
            {clinicSlots.map((slot) => (
              <article key={`${slot.day}-${slot.period}`} className={`schedule-card period-${slot.period} day-${slot.day}`}>
                <strong>{slot.clinic}</strong>
                <span>{slot.time}</span>
              </article>
            ))}
          </div>
          <ul className="schedule-mobile">
            {clinicSlots.map((slot) => (
              <li key={`m-${slot.day}-${slot.period}`}>
                <b>{clinicDays[slot.day].zh}／{clinicDays[slot.day].en}</b>
                <span>{slot.clinic}</span>
                <em>{slot.time}</em>
              </li>
            ))}
          </ul>
        </div>
        <div className="clinic-cta">
          <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            線上預約掛號
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img className="footer-logo" src={logoSrc} alt="如浩醫師" />
            <h3>李如浩醫師</h3>
            <p>兒童成長發育專科 · 小兒內分泌</p>
            <p>菡生婦幼診所 · 宥宥婦幼診所</p>
          </div>
          <div className="footer-section">
            <h4>快速連結</h4>
            <ul>
              <li><a href="#/about">關於如浩醫師</a></li>
              <li><a href="#/cases">真實案例</a></li>
              <li><a href="#/articles/latest">衛教文章</a></li>
              <li>
                <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">Facebook 專頁</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>菡生婦幼診所</h4>
            <ul>
              <li>新北市板橋區中山路一段104號</li>
              <li>電話 02-29518999</li>
              <li>
                <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer">線上預約掛號</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>如浩醫師陪你好好成長 · 臺大兒童內分泌專科 · 實證醫學與溫暖陪伴</p>
        </div>
      </div>
    </footer>
  )
}

export default App
