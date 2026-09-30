import { useEffect, useRef, useState } from 'react'
import { go } from '../lib/hash.js'
import ArticleRichText from './ArticleRichText.jsx'
import { uploadAdminImages } from '../data/adminArticles.js'
import { getAdminAbout, saveAdminAbout } from '../data/adminAbout.js'
import {
  DOCTOR_PHOTO_ZOOM_MAX,
  DOCTOR_PHOTO_ZOOM_MIN,
  defaultDoctorPhotoFrame,
  defaultDoctorPhotoUrl,
  doctorPhotoStyle,
  normalizeDoctorPhotoFrame,
} from '../data/aboutPage.js'
import { useResolvedImage } from '../data/articlesRepository.js'

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

function SiteBackgroundEditor({ page, onChange, disabled }) {
  const preview = useResolvedImage(page.backgroundImage)
  const isCustom = Boolean(page.backgroundImage)

  async function handleFile(event) {
    const files = event.target.files
    if (!files?.length) return
    try {
      const [key] = await uploadAdminImages(files, 'backgrounds')
      if (key) onChange(key)
    } catch (err) {
      window.alert(err?.message || '背景圖片上傳失敗。')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <aside className="admin-about-bg">
      <h2>背景圖片</h2>
      <p className="admin-muted">導覽列與主題頁使用這張紙質背景。目前為預設圖，可上傳更換，隨時可還原。</p>
      <div className={`admin-bg-preview${isCustom ? '' : ' is-default'}`}>
        {isCustom && preview ? <img src={preview} alt="背景預覽" /> : <span>目前：預設背景</span>}
      </div>
      <div className="admin-bg-actions">
        <label className="admin-topic-upload">
          上傳背景圖片
          <input type="file" accept="image/*" hidden disabled={disabled} onChange={handleFile} />
        </label>
        {isCustom && (
          <button type="button" className="btn-ghost" disabled={disabled} onClick={() => onChange('')}>
            還原預設背景
          </button>
        )}
      </div>
      <p className="admin-muted">儲存「關於我」後，導覽列與主題頁會一起更新。</p>
    </aside>
  )
}

function clampPercent(value) {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10
}

function DoctorPhotoEditor({ value, frame, onChange, disabled }) {
  const uploaded = useResolvedImage(value)
  const preview = value ? uploaded : defaultDoctorPhotoUrl()
  const [uploading, setUploading] = useState(false)
  const dragRef = useRef(null)
  const current = normalizeDoctorPhotoFrame(frame)
  const locked = disabled || uploading

  function setFrame(partial) {
    onChange({ doctorPhotoFrame: { ...current, ...partial } })
  }

  async function handleFile(event) {
    const files = event.target.files
    if (!files?.length) return
    setUploading(true)
    try {
      const [key] = await uploadAdminImages(files, 'doctor')
      if (key) onChange({ doctorPhoto: key, doctorPhotoFrame: defaultDoctorPhotoFrame() })
    } catch (err) {
      window.alert(err?.message || '醫師照片上傳失敗。')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function handlePointerDown(event) {
    if (locked || event.button !== 0) return
    const img = event.currentTarget.querySelector('img')
    if (!img?.naturalWidth) return
    const box = event.currentTarget.getBoundingClientRect()
    const fit = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight)
    // How far the photo can travel on each axis; negative once it is larger than the frame.
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      frame: current,
      roomX: box.width - img.naturalWidth * fit * current.zoom,
      roomY: box.height - img.naturalHeight * fit * current.zoom,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const shift = (start, delta, room) => (Math.abs(room) < 1 ? start : clampPercent(start + (delta * 100) / room))
    onChange({
      doctorPhotoFrame: {
        ...drag.frame,
        x: shift(drag.frame.x, event.clientX - drag.startX, drag.roomX),
        y: shift(drag.frame.y, event.clientY - drag.startY, drag.roomY),
      },
    })
  }

  function handlePointerEnd(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  return (
    <div className="admin-field">
      <span>醫師照片</span>
      <div className="admin-doctor-photo">
        <div
          className={`admin-doctor-preview${preview && !locked ? ' is-draggable' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {preview
            ? <img src={preview} alt="醫師照片預覽" draggable={false} style={doctorPhotoStyle(current)} />
            : <span>載入中…</span>}
        </div>
        <div className="admin-doctor-controls">
          <p className="admin-muted">
            {value ? '目前：已上傳的照片' : '目前：預設照片'}。去背（透明背景）的 PNG 會直接透出網站背景。
          </p>
          <label className="admin-doctor-zoom">
            <span>縮放 {Math.round(current.zoom * 100)}%</span>
            <input
              type="range"
              min={DOCTOR_PHOTO_ZOOM_MIN * 100}
              max={DOCTOR_PHOTO_ZOOM_MAX * 100}
              step={5}
              value={Math.round(current.zoom * 100)}
              disabled={locked}
              onChange={(event) => setFrame({ zoom: Number(event.target.value) / 100 })}
            />
          </label>
          <p className="admin-muted">100% 為完整顯示整張照片；在左邊預覽上拖曳可移動照片位置。</p>
          <div className="admin-bg-actions">
            <label className="admin-topic-upload">
              {uploading ? '上傳中…' : '上傳醫師照片'}
              <input type="file" accept="image/*" hidden disabled={locked} onChange={handleFile} />
            </label>
            <button type="button" className="btn-ghost" disabled={locked} onClick={() => setFrame(defaultDoctorPhotoFrame())}>
              重設縮放與位置
            </button>
            {value && (
              <button
                type="button"
                className="btn-ghost"
                disabled={locked}
                onClick={() => onChange({ doctorPhoto: '', doctorPhotoFrame: defaultDoctorPhotoFrame() })}
              >
                還原預設照片
              </button>
            )}
          </div>
          <p className="admin-muted">按「儲存關於我」後，公開頁才會換上新照片與新的縮放位置。</p>
        </div>
      </div>
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
        <div className="admin-about-layout">
          <SiteBackgroundEditor
            page={page}
            disabled={busy}
            onChange={(backgroundImage) => setPage((current) => ({ ...current, backgroundImage }))}
          />
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
            <DoctorPhotoEditor
              value={page.doctorPhoto}
              frame={page.doctorPhotoFrame}
              disabled={busy}
              onChange={(partial) => setPage((current) => ({ ...current, ...partial }))}
            />
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
        </div>
      )}
    </div>
  )
}
