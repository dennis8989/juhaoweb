import { useEffect, useState } from 'react'
import { go } from '../lib/hash.js'
import ArticleRichText from './ArticleRichText.jsx'
import { getAdminAbout, saveAdminAbout } from '../data/adminAbout.js'

function patchAt(list, index, partial) {
  return list.map((item, i) => (i === index ? { ...item, ...partial } : item))
}

function ListEditor({ items, onChange, allowHighlight, addLabel }) {
  return (
    <div className="admin-list-editor">
      {items.map((item, index) => (
        <div key={index} className="admin-list-row">
          <input
            value={item.text}
            onChange={(event) => onChange(patchAt(items, index, { text: event.target.value }))}
          />
          {allowHighlight && (
            <label className="admin-check">
              <input
                type="checkbox"
                checked={Boolean(item.highlight)}
                onChange={(event) => onChange(patchAt(items, index, { highlight: event.target.checked }))}
              />
              粗體強調
            </label>
          )}
          <button type="button" className="danger" onClick={() => onChange(items.filter((_, i) => i !== index))}>
            刪除
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-ghost"
        onClick={() => onChange([...items, { text: '', highlight: false }])}
      >
        {addLabel}
      </button>
    </div>
  )
}

export default function AboutEditor({ user, AdminBar, authErrorMessage }) {
  const [page, setPage] = useState(null)
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')

  useEffect(() => {
    let cancelled = false
    getAdminAbout()
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

  function patchHero(partial) {
    setPage((current) => ({ ...current, hero: { ...current.hero, ...partial } }))
  }

  function patchStory(partial) {
    setPage((current) => ({ ...current, story: { ...current.story, ...partial } }))
  }

  function patchOrigin(partial) {
    setPage((current) => ({ ...current, origin: { ...current.origin, ...partial } }))
  }

  function patchProfile(key, items) {
    setPage((current) => ({
      ...current,
      profile: { ...current.profile, [key]: items },
    }))
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!page) return
    setBusy(true)
    setError('')
    setSavedAt('')
    try {
      await saveAdminAbout(page)
      setSavedAt('已儲存，公開頁會立刻更新。')
    } catch (err) {
      setError(authErrorMessage(err) || '儲存失敗。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell">
      <AdminBar user={user} title="編輯關於我" />
      <div className="admin-toolbar">
        <button type="button" className="btn-ghost" onClick={() => go('/admin')}>← 回到文章列表</button>
        <button type="button" className="btn-ghost" onClick={() => go('/about')}>查看公開頁</button>
      </div>
      {status === 'loading' && <p className="admin-note">載入中…</p>}
      {status === 'error' && error && <p className="admin-error" role="alert">{error}</p>}
      {status === 'ready' && page && (
        <form className="admin-editor" onSubmit={handleSave}>
          {error && <p className="admin-error" role="alert">{error}</p>}
          {savedAt && <p className="admin-note">{savedAt}</p>}

          <fieldset>
            <legend>頁首簡介</legend>
            <label>
              眉標
              <input value={page.hero.eyebrow} onChange={(event) => patchHero({ eyebrow: event.target.value })} />
            </label>
            <label>
              姓名
              <input value={page.hero.name} onChange={(event) => patchHero({ name: event.target.value })} required />
            </label>
            <label>
              英文名
              <input value={page.hero.english} onChange={(event) => patchHero({ english: event.target.value })} />
            </label>
            <label>
              簡介
              <textarea rows={4} value={page.hero.lead} onChange={(event) => patchHero({ lead: event.target.value })} />
            </label>
          </fieldset>

          <fieldset>
            <legend>醫師理念</legend>
            <label>
              標題
              <input value={page.story.title} onChange={(event) => patchStory({ title: event.target.value })} />
            </label>
            <label>
              英文小標
              <input value={page.story.kicker} onChange={(event) => patchStory({ kicker: event.target.value })} />
            </label>
            <div className="admin-field">
              <span>內文</span>
              <ArticleRichText
                key="about-story"
                value={page.story.html}
                onChange={(html) => patchStory({ html })}
                disabled={busy}
                placeholder="撰寫醫師理念。先選字再設粗體。"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>醫師簡歷</legend>
            <div className="admin-field">
              <span>現職</span>
              <ListEditor
                items={page.profile.current}
                onChange={(items) => patchProfile('current', items)}
                addLabel="新增現職"
              />
            </div>
            <div className="admin-field">
              <span>學經歷</span>
              <ListEditor
                items={page.profile.education}
                onChange={(items) => patchProfile('education', items)}
                addLabel="新增學經歷"
              />
            </div>
            <div className="admin-field">
              <span>專業認證</span>
              <ListEditor
                items={page.profile.licenses}
                onChange={(items) => patchProfile('licenses', items)}
                allowHighlight
                addLabel="新增證照"
              />
            </div>
            <div className="admin-field">
              <span>教學／演講</span>
              <ListEditor
                items={page.profile.teaching}
                onChange={(items) => patchProfile('teaching', items)}
                addLabel="新增項目"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>專長與服務項目</legend>
            <div className="admin-list-editor">
              {page.specialties.map((item, index) => (
                <div key={item.id || index} className="admin-specialty-row">
                  <input
                    value={item.title}
                    placeholder="專長名稱"
                    onChange={(event) => setPage((current) => ({
                      ...current,
                      specialties: patchAt(current.specialties, index, { title: event.target.value }),
                    }))}
                  />
                  <textarea
                    rows={2}
                    value={item.detail}
                    placeholder="說明"
                    onChange={(event) => setPage((current) => ({
                      ...current,
                      specialties: patchAt(current.specialties, index, { detail: event.target.value }),
                    }))}
                  />
                  <button
                    type="button"
                    className="danger"
                    onClick={() => setPage((current) => ({
                      ...current,
                      specialties: current.specialties.filter((_, i) => i !== index),
                    }))}
                  >
                    刪除
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPage((current) => ({
                  ...current,
                  specialties: [
                    ...current.specialties,
                    { id: `specialty-${Date.now().toString(36)}`, title: '', detail: '', path: '/about' },
                  ],
                }))}
              >
                新增專長
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>網站緣起</legend>
            <label>
              標題
              <input value={page.origin.title} onChange={(event) => patchOrigin({ title: event.target.value })} />
            </label>
            <label>
              英文小標
              <input value={page.origin.kicker} onChange={(event) => patchOrigin({ kicker: event.target.value })} />
            </label>
            <div className="admin-field">
              <span>內文</span>
              <ArticleRichText
                key="about-origin"
                value={page.origin.html}
                onChange={(html) => patchOrigin({ html })}
                disabled={busy}
                placeholder="撰寫網站緣起。可用分隔線或粗體。"
              />
            </div>
          </fieldset>

          <div className="admin-editor-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '儲存中…' : '儲存關於我'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
