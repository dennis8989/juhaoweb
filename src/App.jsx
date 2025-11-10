import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="app">
      <Navbar />
      <HeroSection isLoaded={isLoaded} />
      <ExpertiseSection />
      <AboutSection />
      <ArticlesSection />
      <ContactSection />
      <Footer />
    </div>
  )
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <span className="logo-text">李如浩 醫師</span>
        </div>
        <ul className="nav-links">
          <li><a href="#home">首頁</a></li>
          <li><a href="#expertise">專業領域</a></li>
          <li><a href="#about">關於我</a></li>
          <li><a href="#articles">衛教文章</a></li>
          <li><a href="#contact">聯絡</a></li>
        </ul>
      </div>
    </nav>
  )
}

function HeroSection({ isLoaded }) {
  return (
    <section id="home" className="hero">
      <div className="hero-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      <div className={`hero-content ${isLoaded ? 'fade-in' : ''}`}>
        <h1 className="hero-title">
          <span className="gradient-text">李如浩 醫師</span>
        </h1>
        <p className="hero-subtitle">兒童成長門診 · 小兒內分泌專科</p>
        <p className="hero-description">
          專注於兒童生長發育及內分泌問題，成為孩子成長路上的好幫手。
          <br />
          讓專業醫師替您解惑，別再為孩子的身高問題擔心～
        </p>
        <div className="hero-buttons">
          <a href="#about" className="btn btn-primary">了解更多</a>
          <a href="#contact" className="btn btn-secondary">預約門診</a>
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="mouse"></div>
      </div>
    </section>
  )
}

function ExpertiseSection() {
  const expertise = [
    {
      icon: '📏',
      title: '兒童生長問題',
      description: '專業評估與診治兒童身高發育問題，幫助孩子不再矮人一截'
    },
    {
      icon: '🔬',
      title: '小兒內分泌專科',
      description: '小兒內分泌特別門診，解決成長及內分泌相關問題'
    },
    {
      icon: '⚕️',
      title: '性早熟診治',
      description: '專業診斷與治療青春期性徵問題，守護孩子健康成長'
    },
    {
      icon: '💉',
      title: '成長針治療',
      description: '針對生長激素缺乏等問題，提供專業的成長針治療方案'
    },
    {
      icon: '👶',
      title: '兒童成長門診',
      description: '成為孩子成長路上的好幫手，讓專業醫師替您解惑'
    },
    {
      icon: '🏥',
      title: '菡生婦幼診所',
      description: '菡生婦幼診所小兒科專任醫師，提供專業醫療服務'
    }
  ]

  return (
    <section id="expertise" className="features">
      <div className="container">
        <h2 className="section-title">
          <span className="gradient-text">專業領域</span>
        </h2>
        <div className="features-grid">
          {expertise.map((item, index) => (
            <div key={index} className="feature-card slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon">{item.icon}</div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2 className="section-title">
              <span className="gradient-text">關於我</span>
            </h2>
            <p>
              我是李如浩醫師，菡生婦幼診所小兒科專任醫師，專精於兒童成長發育及內分泌問題。
              當父母都擔心自家孩子矮人一截時，我理解您內心的困擾與擔憂。
            </p>
            <p>
              我專注於兒童生長問題、性早熟、青春期性徵問題等領域，提供專業的診斷與治療。
              自113年9月1日起，小兒內分泌特別門診增加門診及時段，讓更多有需要的家庭能夠獲得專業協助。
            </p>
            <p>
              無論是長不高、性早熟、打成長針等相關問題，我都會耐心傾聽、專業評估，
              成為孩子成長路上的好幫手，讓您不再自己瞎擔心。
            </p>
            <div className="tech-stack">
              <span className="tech-badge">兒童生長問題</span>
              <span className="tech-badge">小兒內分泌</span>
              <span className="tech-badge">性早熟診治</span>
              <span className="tech-badge">成長針治療</span>
            </div>
          </div>
          <div className="about-visual">
            <div className="visual-card float">
              <div className="card-glow"></div>
              <div className="profile-placeholder">
                <span className="profile-icon">👨‍⚕️</span>
                <p>李如浩 醫師</p>
                <p className="profile-subtitle">小兒內分泌專科</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticlesSection() {
  // Facebook 文章數據 - 可以從 Facebook 頁面複製內容到這裡
  const articles = [
    {
      id: 1,
      title: '兒童成長門診 - 別再為孩子的身高擔心',
      date: '2024-01-15',
      excerpt: '當父母都擔心自家孩子矮人一截時，我理解您內心的困擾與擔憂。有任何長孩子成長及內分泌相關問題，快來找我們帥氣的李醫生。讓專業醫生替您解惑，別自己瞎擔心～',
      content: `當父母都擔心自家孩子矮人一截時，我理解您內心的困擾與擔憂。

您是不是也正在煩惱孩子的身高問題？內心總有非常多問題困擾您。

你們心聲＃菡生婦幼聽到，有任何長孩子成長及內分泌相關問題，快來找我們帥氣的李醫生。

讓專業醫生替您解惑，別自己瞎擔心～

自113年9/1起 #小兒內分泌特別門診 增加門診及時段

成為孩子成長路上的好幫手，別再矮人一截

#青春期性徵問題 #兒童生長問題 #身材矮小

#菡生婦幼診所 #小兒科 #成長門診`,
      tags: ['兒童生長問題', '性早熟', '小兒內分泌', '成長門診'],
      image: null
    },
    {
      id: 2,
      title: '了解兒童生長發育的重要性',
      date: '2024-01-10',
      excerpt: '兒童的生長發育是一個複雜的過程，需要專業的評估和監測。及早發現問題，及早治療，才能幫助孩子健康成長。',
      content: `兒童的生長發育是一個複雜的過程，需要專業的評估和監測。

許多家長可能會擔心孩子的身高、體重是否正常，或者是否出現性早熟的跡象。

這些都是需要專業醫師來評估的問題。透過定期檢查和專業診斷，我們可以及早發現問題，及早治療。

如果您對孩子的成長有任何疑問，歡迎預約門診諮詢。`,
      tags: ['兒童生長', '發育評估', '健康檢查'],
      image: null
    },
    {
      id: 3,
      title: '性早熟的認識與處理',
      date: '2024-01-05',
      excerpt: '性早熟是兒童內分泌常見的問題之一。了解性早熟的症狀、原因和治療方法，有助於及早發現和處理。',
      content: `性早熟是指兒童在正常發育年齡之前就出現第二性徵的發育。

這可能包括女孩在8歲前出現乳房發育，或男孩在9歲前出現睪丸增大等現象。

性早熟可能影響孩子的最終身高，也可能造成心理和社交問題。

如果發現孩子有性早熟的跡象，應及早尋求專業醫師的評估和治療。

透過適當的治療，可以有效控制性早熟的進展，保護孩子的健康成長。`,
      tags: ['性早熟', '內分泌', '兒童健康'],
      image: null
    }
  ]

  const [selectedArticle, setSelectedArticle] = useState(null)

  const handleArticleClick = (article) => {
    setSelectedArticle(article)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToList = () => {
    setSelectedArticle(null)
  }

  if (selectedArticle) {
    return (
      <section id="articles" className="articles article-detail">
        <div className="container">
          <button onClick={handleBackToList} className="back-button">
            ← 返回文章列表
          </button>
          <article className="article-full">
            <div className="article-header">
              <h1 className="article-title-full">{selectedArticle.title}</h1>
              <div className="article-meta">
                <span className="article-date">{selectedArticle.date}</span>
                <div className="article-tags">
                  {selectedArticle.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="article-content">
              {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="article-footer">
              <p className="article-author">— 李如浩 醫師</p>
              <a
                href="https://www.facebook.com/profile.php?id=61564963711521"
                target="_blank"
                rel="noopener noreferrer"
                className="facebook-link"
              >
                查看 Facebook 原文 →
              </a>
            </div>
          </article>
        </div>
      </section>
    )
  }

  return (
    <section id="articles" className="articles">
      <div className="container">
        <h2 className="section-title">
          <span className="gradient-text">衛教文章</span>
        </h2>
        <p className="section-subtitle">
          分享兒童成長發育相關的專業知識與資訊
        </p>
        <div className="articles-grid">
          {articles.map((article) => (
            <div
              key={article.id}
              className="article-card slide-in"
              onClick={() => handleArticleClick(article)}
            >
              <div className="article-card-content">
                <div className="article-date-badge">{article.date}</div>
                <h3 className="article-card-title">{article.title}</h3>
                <p className="article-card-excerpt">{article.excerpt}</p>
                <div className="article-card-tags">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="article-tag">{tag}</span>
                  ))}
                </div>
                <div className="article-card-footer">
                  <span className="read-more">閱讀更多 →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="articles-footer">
          <p>更多文章請關注我們的 Facebook 專頁</p>
          <a
            href="https://www.facebook.com/profile.php?id=61564963711521"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            前往 Facebook
          </a>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('感謝您的預約諮詢！我們會盡快與您聯繫，安排門診時間。\n\n您也可以直接撥打：02-29518999')
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">
          <span className="gradient-text">預約門診</span>
        </h2>
        <div className="contact-info">
          <div className="info-card">
            <h3>🏥 菡生婦幼診所</h3>
            <p><strong>地址：</strong>新北市板橋區中山路一段104號</p>
            <p><strong>電話：</strong>02-29518999</p>
            <p><strong>電子信箱：</strong>hsobsmarketing1@gmail.com</p>
          </div>
          <div className="info-card">
            <h3>📅 門診資訊</h3>
            <p><strong>專科：</strong>小兒內分泌特別門診</p>
            <p><strong>服務項目：</strong></p>
            <ul className="service-list">
              <li>兒童生長問題</li>
              <li>身材矮小</li>
              <li>青春期性徵問題</li>
              <li>性早熟診治</li>
              <li>成長針治療</li>
            </ul>
          </div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">家長姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">聯絡電話</label>
            <input
              type="tel"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">諮詢問題（請簡述孩子的狀況）</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              placeholder="例如：孩子身高問題、性早熟相關問題等..."
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary btn-large">
            送出預約諮詢
          </button>
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
            <h3>李如浩 醫師</h3>
            <p>兒童成長門診 · 小兒內分泌專科</p>
            <p>菡生婦幼診所</p>
          </div>
          <div className="footer-section">
            <h4>快速連結</h4>
            <ul>
              <li><a href="#home">首頁</a></li>
              <li><a href="#expertise">專業領域</a></li>
              <li><a href="#about">關於我</a></li>
              <li><a href="#articles">衛教文章</a></li>
              <li><a href="#contact">預約門診</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>聯絡資訊</h4>
            <ul>
              <li>📍 新北市板橋區中山路一段104號</li>
              <li>📞 02-29518999</li>
              <li>✉️ hsobsmarketing1@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 菡生婦幼診所 - 李如浩醫師. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default App

