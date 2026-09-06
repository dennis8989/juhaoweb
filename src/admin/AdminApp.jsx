import { useEffect, useMemo, useState } from 'react'
import {
  confirmResetPassword,
  confirmSignIn,
  getCurrentUser,
  resetPassword,
  signIn,
  signOut,
} from 'aws-amplify/auth'
import { go } from '../lib/hash.js'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { contentToHtml } from '../lib/articleHtml.js'
import {
  deleteAdminArticle,
  getAdminArticle,
  listAdminArticles,
  makeArticleId,
  saveAdminArticle,
  uploadAdminImages,
} from '../data/adminArticles.js'
import { articleCats, topicDirs, topicSubs } from './taxonomy.js'
import ArticleRichText from './ArticleRichText.jsx'
import './admin.css'

function authErrorMessage(error) {
  const name = error?.name || ''
  const message = String(error?.message || '')
  if (name === 'NotAuthorizedException' || message.includes('Incorrect username or password')) {
    return '帳號或密碼不正確。'
  }
  if (name === 'UserNotFoundException') return '找不到這個帳號。'
  if (name === 'LimitExceededException') return '嘗試太多次，請稍後再試。'
  if (name === 'CodeMismatchException') return '驗證碼不正確。'
  if (name === 'ExpiredCodeException') return '驗證碼已過期，請重新寄送。'
  if (name === 'InvalidPasswordException' || message.includes('Password')) {
    return '密碼需至少 8 碼，並含大寫、小寫與數字。'
  }
  if (message.includes('SignUp is not permitted')) return '此後台不開放註冊。'
  return '目前無法完成操作，請稍後再試。'
}

export default function AdminApp({ route }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    getCurrentUser()
      .then((current) => {
        if (!cancelled) setUser(current)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!isAmplifyConfigured()) {
    return (
      <div className="admin-shell">
        <p className="admin-note">後台尚未接上 Amplify 設定，無法登入。</p>
      </div>
    )
  }

  if (user === undefined) {
    return (
      <div className="admin-shell">
        <p className="admin-note">確認登入狀態…</p>
      </div>
    )
  }

  if (!user) {
    if (route.sub === 'forgot') return <ForgotForm />
    return <LoginForm onSignedIn={setUser} />
  }

  if (route.sub === 'new') {
    return <Editor user={user} setUser={setUser} />
  }
  if (route.sub === 'edit' && route.extra) {
    return <Editor user={user} setUser={setUser} articleId={route.extra} />
  }
  return <ArticleIndex user={user} setUser={setUser} />
}

function AdminBar({ user, setUser, title }) {
  async function handleSignOut() {
    await signOut()
    setUser(null)
    go('/admin')
  }

  return (
    <header className="admin-bar">
      <div>
        <p className="admin-kicker">李如浩醫師 · 衛教後台</p>
        <h1>{title}</h1>
      </div>
      <div className="admin-bar-actions">
        <span className="admin-user">{user?.signInDetails?.loginId || user?.username}</span>
        <button type="button" className="btn-ghost" onClick={() => go('/articles/latest')}>
          看公開站
        </button>
        <button type="button" className="btn-ghost" onClick={handleSignOut}>
          登出
        </button>
      </div>
    </header>
  )
}

function LoginForm({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [needNewPassword, setNeedNewPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (needNewPassword) {
        const confirmed = await confirmSignIn({ challengeResponse: newPassword })
        if (!confirmed.isSignedIn) throw new Error('仍未完成登入')
        onSignedIn(await getCurrentUser())
        return
      }
      const result = await signIn({ username: email.trim(), password })
      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        setNeedNewPassword(true)
        return
      }
      if (!result.isSignedIn) throw new Error('仍未完成登入')
      onSignedIn(await getCurrentUser())
    } catch (err) {
      if (err?.name === 'UserAlreadyAuthenticatedException') {
        onSignedIn(await getCurrentUser())
        return
      }
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell admin-shell-narrow">
      <form className="admin-card" onSubmit={handleSubmit}>
        <p className="admin-kicker">私人後台</p>
        <h1>登入後才能改衛教</h1>
        <p className="admin-lead">不開放註冊。訪客看不到這個編輯器，也沒有寫入權限。</p>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={needNewPassword}
          />
        </label>
        <label>
          密碼
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={needNewPassword}
          />
        </label>
        {needNewPassword && (
          <label>
            第一次登入請設定新密碼
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>
        )}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? '處理中…' : needNewPassword ? '儲存新密碼並登入' : '登入'}
        </button>
        <button type="button" className="admin-text-btn" onClick={() => go('/admin/forgot')}>
          忘記密碼
        </button>
      </form>
    </div>
  )
}

function ForgotForm() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (!sent) {
        await resetPassword({ username: email.trim() })
        setSent(true)
        return
      }
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword: password,
      })
      setDone(true)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell admin-shell-narrow">
      <form className="admin-card" onSubmit={handleSubmit}>
        <p className="admin-kicker">重設密碼</p>
        <h1>用信箱收取驗證碼</h1>
        {done ? (
          <>
            <p className="admin-lead">密碼已更新，請用新密碼登入。</p>
            <button type="button" className="btn-primary" onClick={() => go('/admin')}>
              回到登入
            </button>
          </>
        ) : (
          <>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            {sent && (
              <>
                <label>
                  驗證碼
                  <input value={code} onChange={(event) => setCode(event.target.value)} required />
                </label>
                <label>
                  新密碼
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
                </label>
              </>
            )}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '處理中…' : sent ? '確認新密碼' : '寄送驗證碼'}
            </button>
            <button type="button" className="admin-text-btn" onClick={() => go('/admin')}>
              回到登入
            </button>
          </>
        )}
      </form>
    </div>
  )
}

function ArticleIndex({ user, setUser }) {
  const [state, setState] = useState({ status: 'loading', items: [], error: '' })
  const [pendingDelete, setPendingDelete] = useState(null)

  async function load() {
    setState((current) => ({ ...current, status: 'loading', error: '' }))
    try {
      const items = await listAdminArticles()
      setState({ status: 'ready', items, error: '' })
    } catch (error) {
      setState({ status: 'error', items: [], error: authErrorMessage(error) })
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteAdminArticle(pendingDelete.id)
      setPendingDelete(null)
      await load()
    } catch (error) {
      setState((current) => ({ ...current, error: authErrorMessage(error) }))
    }
  }

  return (
    <div className="admin-shell">
      <AdminBar user={user} setUser={setUser} title="文章列表" />
      <div className="admin-toolbar">
        <p>共 {state.items.length} 篇。下架文只在後台看得到。</p>
        <button type="button" className="btn-primary" onClick={() => go('/admin/new')}>
          新增文章
        </button>
      </div>
      {state.error && <p className="admin-error" role="alert">{state.error}</p>}
      {state.status === 'loading' && <p className="admin-note">載入中…</p>}
      {state.status === 'ready' && state.items.length === 0 && <p className="admin-note">尚無文章。</p>}
      {state.status === 'ready' && state.items.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>標題</th>
                <th>狀態</th>
                <th>分類</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.items.map((article) => (
                <tr key={article.id}>
                  <td>
                    <strong>{article.title}</strong>
                    <div className="admin-muted">{article.id}</div>
                  </td>
                  <td>
                    <span className={`admin-status ${article.status}`}>{article.status === 'published' ? '上架' : '下架'}</span>
                  </td>
                  <td>{(article.articleCats || []).join('、') || '—'}</td>
                  <td className="admin-row-actions">
                    <button type="button" onClick={() => go(`/admin/edit/${article.id}`)}>編輯</button>
                    {article.status === 'published' && (
                      <button type="button" onClick={() => go(`/article/${article.id}`)}>公開頁</button>
                    )}
                    <button type="button" className="danger" onClick={() => setPendingDelete(article)}>刪除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pendingDelete && (
        <div className="admin-confirm" role="dialog" aria-labelledby="delete-title">
          <div className="admin-card">
            <h2 id="delete-title">確定刪除？</h2>
            <p>「{pendingDelete.title}」會從雲端移除，公開站也會立刻看不到。種子文請特別小心。</p>
            <div className="admin-confirm-actions">
              <button type="button" className="btn-ghost" onClick={() => setPendingDelete(null)}>取消</button>
              <button type="button" className="btn-primary" onClick={confirmDelete}>確認刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function emptyForm() {
  return {
    isNew: true,
    id: makeArticleId(),
    title: '',
    excerpt: '',
    content: '',
    facebookUrl: '',
    dirs: [],
    subs: [],
    articleCats: [],
    images: [],
    previewImages: [],
    status: 'draft',
    createdAt: '',
  }
}

function formFromArticle(article) {
  return {
    isNew: false,
    id: article.id,
    title: article.title || '',
    excerpt: article.excerpt || '',
    content: contentToHtml(article.content),
    facebookUrl: article.facebookUrl || '',
    dirs: article.dirs || [],
    subs: article.subs || [],
    articleCats: article.articleCats || [],
    images: article.images || [],
    previewImages: article.previewImages || [],
    status: article.status || 'draft',
    createdAt: article.createdAt || '',
  }
}

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function Editor({ user, setUser, articleId }) {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState(articleId ? 'loading' : 'ready')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const groupedSubs = useMemo(() => {
    const groups = {}
    for (const sub of topicSubs) {
      groups[sub.dir] = groups[sub.dir] || { label: sub.dirLabel, items: [] }
      groups[sub.dir].items.push(sub)
    }
    return groups
  }, [])

  useEffect(() => {
    if (!articleId) return undefined
    let cancelled = false
    getAdminArticle(articleId)
      .then((article) => {
        if (cancelled) return
        if (!article) {
          setStatus('missing')
          return
        }
        setForm(formFromArticle(article))
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
  }, [articleId])

  function patch(partial) {
    setForm((current) => ({ ...current, ...partial }))
  }

  async function handleFiles(event) {
    const files = event.target.files
    if (!files?.length) return
    setBusy(true)
    setError('')
    try {
      const keys = await uploadAdminImages(files)
      const previews = Array.from(files).map((file) => URL.createObjectURL(file))
      setForm((current) => ({
        ...current,
        images: [...current.images, ...keys],
        previewImages: [...current.previewImages, ...previews],
      }))
    } catch (err) {
      setError(authErrorMessage(err) || '圖片上傳失敗。')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  function removeImage(index) {
    patch({
      images: form.images.filter((_, i) => i !== index),
      previewImages: form.previewImages.filter((_, i) => i !== index),
    })
  }

  async function handleSave(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const saved = await saveAdminArticle({
        ...form,
        id: form.isNew ? (form.id.trim() || makeArticleId(form.title)) : form.id,
      })
      go(`/admin/edit/${saved.id}`)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell">
      <AdminBar user={user} setUser={setUser} title={form.isNew ? '新增文章' : '編輯文章'} />
      <div className="admin-toolbar">
        <button type="button" className="btn-ghost" onClick={() => go('/admin')}>← 回到列表</button>
      </div>
      {status === 'loading' && <p className="admin-note">載入中…</p>}
      {status === 'missing' && <p className="admin-note">找不到這篇文章。</p>}
      {status === 'ready' && (
        <form className="admin-editor" onSubmit={handleSave}>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <label>
            網址 id
            <input
              value={form.id}
              onChange={(event) => patch({ id: event.target.value })}
              disabled={!form.isNew}
              required
            />
          </label>
          <label>
            標題
            <input value={form.title} onChange={(event) => patch({ title: event.target.value })} required />
          </label>
          <label>
            摘要
            <textarea rows={3} value={form.excerpt} onChange={(event) => patch({ excerpt: event.target.value })} />
          </label>
          <div className="admin-field">
            <span>內文</span>
            <ArticleRichText
              key={form.id}
              value={form.content}
              onChange={(html) => patch({ content: html })}
              disabled={busy}
            />
          </div>
          <label>
            Facebook 原文網址
            <input value={form.facebookUrl} onChange={(event) => patch({ facebookUrl: event.target.value })} />
          </label>

          <fieldset>
            <legend>上架狀態</legend>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.status === 'published'}
                onChange={(event) => patch({ status: event.target.checked ? 'published' : 'draft' })}
              />
              上架（訪客看得到）
            </label>
          </fieldset>

          <fieldset>
            <legend>主題頁 dirs</legend>
            <div className="admin-checks">
              {topicDirs.map((dir) => (
                <label key={dir.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={form.dirs.includes(dir.id)}
                    onChange={() => patch({ dirs: toggleValue(form.dirs, dir.id) })}
                  />
                  {dir.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>第二層 subs</legend>
            {Object.entries(groupedSubs).map(([dir, group]) => (
              <div key={dir} className="admin-sub-group">
                <p>{group.label}</p>
                <div className="admin-checks">
                  {group.items.map((sub) => (
                    <label key={`${dir}-${sub.id}`} className="admin-check">
                      <input
                        type="checkbox"
                        checked={form.subs.includes(sub.id)}
                        onChange={() => patch({ subs: toggleValue(form.subs, sub.id) })}
                      />
                      {sub.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend>衛教分類 articleCats</legend>
            <div className="admin-checks">
              {articleCats.map((cat) => (
                <label key={cat.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={form.articleCats.includes(cat.id)}
                    onChange={() => patch({ articleCats: toggleValue(form.articleCats, cat.id) })}
                  />
                  {cat.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>列表縮圖（選填）</legend>
            <p className="admin-muted">公開列表用的封面。文章裡的圖請把游標放到該段，再按編輯器的「插入圖片」。</p>
            <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={busy} />
            <div className="admin-thumbs">
              {form.images.map((key, index) => (
                <figure key={`${key}-${index}`}>
                  <img src={form.previewImages[index] || ''} alt="" />
                  <button type="button" onClick={() => removeImage(index)}>移除</button>
                </figure>
              ))}
            </div>
          </fieldset>

          <div className="admin-editor-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '儲存中…' : '儲存'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
