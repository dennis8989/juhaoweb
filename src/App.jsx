import { useEffect, useMemo, useState } from 'react'
import './App.css'
import DesignTools from './DesignToggle.jsx'
import {
  APPOINTMENT_URL,
  FACEBOOK_PAGE_URL,
  INSTAGRAM_URL,
  clinicLocations,
  aboutProfile,
  aboutStory,
  aboutOrigin,
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
    if (route.view === 'collaborate') return ''
    return directoryItems.some((item) => item.id === route.view) ? route.view : 'about'
  }, [route])

  const subItems = secondLevel[activeDir] || []
  const activeSub = route.view === activeDir ? route.sub : null
  const isTopicPage = directoryItems.some((item) => item.id === route.view && item.id !== 'about')
  const topicMeta = isTopicPage ? getSectionMeta(route.view, route.sub) : null

  return (
    <div className="app">
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        activeDir={activeDir}
        activeSub={activeSub}
        activeView={route.view}
        heroSurface={route.view === 'about'}
      />
      <main className={`page ${route.view === 'about' ? 'page-about' : ''}`}>
        {isTopicPage && (
          <TopicHero
            parentLabel={directoryItems.find((item) => item.id === route.view)?.label || topicMeta.title}
            meta={topicMeta}
          />
        )}

        {subItems.length > 0 && isTopicPage && (
          <nav className="topic-tabs" aria-label="第二層目錄">
            {subItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`topic-tab ${activeSub === item.id ? 'active' : ''}`}
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
      <DesignTools />
    </div>
  )
}

function Navbar({ menuOpen, setMenuOpen, openDropdown, setOpenDropdown, activeDir, activeSub, activeView, heroSurface }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? null : name))
  }

  return (
    <header className={`navbar ${heroSurface ? 'navbar-hero' : ''} ${scrolled ? 'scrolled' : ''}`}>
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
          className={`nav-toggle ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? '關閉選單' : '開啟選單'}
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((open) => !open)
            setOpenDropdown(null)
          }}
        >
          <span />
          <span />
          <span />
        </button>
        {menuOpen && (
          <button
            type="button"
            className="nav-backdrop"
            aria-label="關閉選單"
            onClick={() => {
              setMenuOpen(false)
              setOpenDropdown(null)
            }}
          />
        )}
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {directoryItems.map((item) => {
            const children = secondLevel[item.id]

            if (item.id === 'cases') {
              return (
                <li
                  key={item.id}
                  className={`has-dropdown ${openDropdown === 'cases' ? 'open' : ''}`}
                  onMouseEnter={() => { if (!menuOpen) setOpenDropdown('cases') }}
                  onMouseLeave={() => { if (!menuOpen) setOpenDropdown(null) }}
                >
                  <a
                    href={`#${item.path}`}
                    className={activeDir === item.id ? 'active' : ''}
                    aria-current={activeDir === item.id ? 'page' : undefined}
                    onClick={() => go(item.path)}
                  >
                    {item.label}
                  </a>
                  <ul className="dropdown">
                    <li>
                      <span className="dropdown-soon">開發中</span>
                    </li>
                  </ul>
                </li>
              )
            }

            if (children?.length) {
              return (
                <li
                  key={item.id}
                  className={`has-dropdown ${openDropdown === item.id ? 'open' : ''}`}
                  onMouseEnter={() => { if (!menuOpen) setOpenDropdown(item.id) }}
                  onMouseLeave={() => { if (!menuOpen) setOpenDropdown(null) }}
                >
                  <a
                    href={`#${item.path}`}
                    className={activeDir === item.id ? 'active' : ''}
                    aria-current={activeDir === item.id && !activeSub ? 'page' : undefined}
                    onClick={(event) => {
                      if (menuOpen && openDropdown !== item.id) {
                        event.preventDefault()
                        toggleDropdown(item.id)
                        return
                      }
                      go(item.path)
                    }}
                  >
                    {item.label}
                  </a>
                  <ul className="dropdown">
                    {children.map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={`#${sub.path}`}
                          className={activeDir === item.id && activeSub === sub.id ? 'active' : ''}
                          aria-current={activeDir === item.id && activeSub === sub.id ? 'page' : undefined}
                          onClick={() => go(sub.path)}
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              )
            }

            return (
              <li key={item.id}>
                <a
                  href={`#${item.path}`}
                  className={activeDir === item.id ? 'active' : ''}
                  aria-current={activeDir === item.id ? 'page' : undefined}
                  onClick={() => go(item.path)}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
          <li
            className={`has-dropdown ${openDropdown === 'contact' ? 'open' : ''}`}
            onMouseEnter={() => { if (!menuOpen) setOpenDropdown('contact') }}
            onMouseLeave={() => { if (!menuOpen) setOpenDropdown(null) }}
          >
            <button
              type="button"
              className={`nav-drop-btn nav-appointment-link ${activeView === 'collaborate' ? 'active' : ''}`}
              onClick={() => toggleDropdown('contact')}
            >
              預約或合作
            </button>
            <ul className="dropdown dropdown-end">
              <li>
                <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer">
                  預約掛號
                </a>
              </li>
              <li>
                <a href="#/collaborate" onClick={() => go('/collaborate')}>合作邀約</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  )
}

function TopicHero({ parentLabel, meta }) {
  const [imgOk, setImgOk] = useState(true)

  useEffect(() => {
    setImgOk(true)
  }, [meta.image])

  return (
    <section className="topic-hero">
      <div className="container">
        <h1 className="topic-hero-title">{parentLabel}</h1>
        <div className="topic-hero-grid">
          <div className="topic-hero-visual">
            {meta.image && imgOk ? (
              <img src={meta.image} alt="" onError={() => setImgOk(false)} />
            ) : (
              <div className="topic-hero-placeholder" aria-hidden="true" />
            )}
          </div>
          <div className="topic-hero-copy">
            <h2>{meta.headline}</h2>
            {meta.intro && <p>{meta.intro}</p>}
          </div>
        </div>
      </div>
    </section>
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
  if (route.view === 'collaborate') {
    return <CollaboratePage />
  }
  if (route.view === 'cases') {
    return <CasePage sub={route.sub} />
  }

  const dir = route.view
  const sub = route.sub
  const meta = getSectionMeta(dir, sub)
  const list = filterArticles(sub ? { dir, sub } : { dir })

  return (
    <section className="content-section topic-list">
      <div className="container">
        <ArticleGrid items={list} emptyText="此分類文章將陸續補充。歡迎先閱讀相關主題，或預約門診個別討論。" />
      </div>
    </section>
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
      <section className="about-intro warm-hero-surface">
        <div className="container about-intro-inner">
          <div className="about-intro-copy">
            <p className="about-eyebrow">兒童成長發育專科 · 小兒內分泌</p>
            <h1 className="about-brand">{aboutProfile.name}</h1>
            <p className="about-brand-en">{aboutProfile.english}</p>
            <p className="about-lead">
              具台大兒童內分泌科完整訓練、兒童內分泌次專科證照，以及多年醫學中心主治歷練與豐富自費治療經驗；提供健康至疾病的兒童成長全光譜照護，陪伴孩子走好成長每一步。
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

      <section className="block-beige cv-band">
        <div className="container">
          <div className="cv-panel">
            <div className="cv-copy">
              <h2 className="block-title">醫師簡歷</h2>
              <p className="block-kicker">CURRICULUM VITAE</p>
              <p className="cv-name">{aboutProfile.name} <span>{aboutProfile.english}</span></p>
              <CvBlock title="現職" items={aboutProfile.current} />
              <CvBlock title="學經歷與專業認證" items={[...aboutProfile.education, ...aboutProfile.licenses, ...aboutProfile.teaching]} />
            </div>
            <aside className="cv-certs" aria-label="專業證書預留區">
              <div className="cert-slot" />
              <div className="cert-slot" />
            </aside>
          </div>
        </div>
      </section>

      <section className="block-white specialty-band">
        <div className="container">
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
      </section>

      <section className="block-beige origin-band">
        <div className="container origin-copy">
          <h2 className="block-title">{aboutOrigin.title}</h2>
          <p className="block-kicker">ORIGIN</p>
          <p className="origin-lead">{aboutOrigin.lead}</p>
          {aboutOrigin.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{goldText(paragraph)}</p>
          ))}
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
    <section className="content-section topic-list">
      <div className="container">
        <div className="empty-note">
          <p>個案圖文整理中。以下先提供相關衛教，方便家長對照閱讀；正式案例刊出後會更新於此。</p>
        </div>
        {unique.length > 0 && (
          <>
            <h3 className="subsection-title">相關衛教</h3>
            <ArticleGrid items={unique} />
          </>
        )}
      </div>
    </section>
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
        <div className="visit-list">
          {clinicLocations.map((clinic) => (
            <article key={clinic.id} className="visit-card">
              <div className="visit-map">
                <iframe
                  title={`${clinic.name}地圖`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(clinic.mapQuery)}&hl=zh-TW&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="visit-info">
                <h3>{clinic.name}</h3>
                <dl>
                  <div>
                    <dt>地址</dt>
                    <dd>{clinic.address}</dd>
                  </div>
                  <div>
                    <dt>電話</dt>
                    <dd><a href={clinic.phoneHref}>{clinic.phone}</a></dd>
                  </div>
                  <div>
                    <dt>大眾交通</dt>
                    <dd>{clinic.transit}</dd>
                  </div>
                  <div>
                    <dt>停車</dt>
                    <dd>{clinic.parking}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
        <div className="clinic-cta">
          <p className="clinic-cta-note">請至預約頁自行選擇菡生或宥宥診次</p>
          <a href={APPOINTMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            線上預約掛號
          </a>
        </div>
      </div>
    </section>
  )
}

function CollaboratePage() {
  const onSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <section className="collaborate-section">
      <div className="container collaborate-wrap">
        <h1 className="collaborate-title">代言或演講合作邀約</h1>
        <form className="collaborate-form" onSubmit={onSubmit}>
          <div className="collaborate-grid">
            <label className="collaborate-field">
              <span>Name: <i>*</i></span>
              <input type="text" name="name" required autoComplete="name" />
            </label>
            <label className="collaborate-field">
              <span>Email: <i>*</i></span>
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <label className="collaborate-field">
              <span>Phone:</span>
              <input type="tel" name="phone" autoComplete="tel" />
            </label>
            <label className="collaborate-field collaborate-message">
              <span>Message: <i>*</i></span>
              <textarea name="message" rows="8" required />
            </label>
          </div>
          <button type="submit" className="collaborate-submit">發送郵件</button>
        </form>
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
            <p className="footer-copy">© {new Date().getFullYear()} 李如浩醫師</p>
            <p className="footer-legal">
              【版權聲明與警告】本站全數衛教文章與案例皆為醫師原創，並留存最初發布之時間紀錄。嚴禁任何未經同意之轉載、抄襲或改寫。任何侵權行為，一經發現必由法律途徑追究到底。
            </p>
          </div>
          <div className="footer-section">
            <h4>快速連結</h4>
            <ul>
              <li>
                <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noopener noreferrer">Facebook</a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
              <li><a href="#/collaborate">合作邀約</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>看診據點</h4>
            <ul>
              <li>菡生婦幼診所 · 板橋區中山路一段104號</li>
              <li>宥宥婦幼診所 · 蘆洲區長榮路58號</li>
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
