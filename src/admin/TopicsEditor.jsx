import { useEffect, useState } from 'react'
import { go } from '../lib/hash.js'
import { uploadAdminImages } from '../data/adminArticles.js'
import { getAdminTopics, saveAdminTopics } from '../data/adminTopics.js'
import { defaultTopicHeroes, listTopicPages } from '../data/topicsPage.js'
import { useResolvedImage } from '../data/articlesRepository.js'

function TopicCard({ item, hero, defaultImage, onChange, disabled }) {
  const preview = useResolvedImage(hero.image)

  async function handleFile(event) {
    const files = event.target.files
    if (!files?.length) return
    try {
      const [key] = await uploadAdminImages(files, 'topics')
      if (key) onChange({ image: key })
    } catch (err) {
      window.alert(err?.message || '圖片上傳失敗。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <article className="admin-topic-card">
      <div className="admin-topic-card-head">
        <h3>{item.label}</h3>
        <button type="button" className="btn-ghost" onClick={() => go(item.path)}>查看公開頁</button>
      </div>
      <div className="admin-topic-grid">
        <div className="admin-topic-image">
          <div className="admin-topic-preview">
            {preview ? <img src={preview} alt="" /> : <span>尚未設定圖片</span>}
          </div>
          <label className="admin-topic-upload">
            置換圖片
            <input type="file" accept="image/*" hidden disabled={disabled} onChange={handleFile} />
          </label>
          {defaultImage && hero.image !== defaultImage && (
            <button type="button" className="btn-ghost" disabled={disabled} onClick={() => onChange({ image: defaultImage })}>
              還原預設圖
            </button>
          )}
        </div>
        <div className="admin-topic-fields">
          <label>
            頁面標題
            <input
              value={hero.title}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          </label>
          <label>
            圖片下方標題
            <input
              value={hero.headline}
              onChange={(event) => onChange({ headline: event.target.value })}
            />
          </label>
          <label>
            圖片下方敘述
            <textarea
              rows={4}
              value={hero.intro}
              onChange={(event) => onChange({ intro: event.target.value })}
            />
          </label>
        </div>
      </div>
    </article>
  )
}

export default function TopicsEditor({ user, AdminBar, authErrorMessage }) {
  const pages = listTopicPages()
  const defaults = defaultTopicHeroes()
  const [page, setPage] = useState(null)
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    let cancelled = false
    getAdminTopics()
      .then((result) => {
        if (cancelled) return
        setPage(result.page)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(authErrorMessage(err))
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [authErrorMessage])

  function patchTopic(key, partial) {
    setPage((current) => ({
      ...current,
      topics: {
        ...current.topics,
        [key]: { ...current.topics[key], ...partial },
      },
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!page) return
    setBusy(true)
    setError('')
    setSavedAt('')
    try {
      await saveAdminTopics(page)
      setSavedAt('已儲存，公開主題頁會立刻更新。')
    } catch (err) {
      setError(authErrorMessage(err) || '儲存失敗。')
    } finally {
      setBusy(false)
    }
  }

  const groups = pages.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <div className="admin-shell">
      <AdminBar user={user} title="編輯主題頁主視覺" />
      <div className="admin-toolbar">
        <button type="button" className="btn-ghost" onClick={() => go('/admin')}>← 回到文章列表</button>
      </div>
      {status === 'loading' && <p className="admin-note">載入中…</p>}
      {status === 'error' && error && <p className="admin-error" role="alert">{error}</p>}
      {status === 'ready' && page && (
        <form className="admin-editor" onSubmit={handleSave}>
          <p className="admin-lead">每一個主題頁都可以換圖，並改圖片下方的標題與敘述。儲存後不必再 git。</p>
          {error && <p className="admin-error" role="alert">{error}</p>}
          {savedAt && <p className="admin-note">{savedAt}</p>}
          {Object.entries(groups).map(([group, items]) => (
            <fieldset key={group}>
              <legend>{group}</legend>
              {items.map((item) => (
                <TopicCard
                  key={item.key}
                  item={item}
                  hero={page.topics[item.key] || defaults.topics[item.key]}
                  defaultImage={defaults.topics[item.key]?.image || ''}
                  disabled={busy}
                  onChange={(partial) => patchTopic(item.key, partial)}
                />
              ))}
            </fieldset>
          ))}
          <div className="admin-editor-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '儲存中…' : '儲存主題頁'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
