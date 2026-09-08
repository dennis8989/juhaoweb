import { generateClient } from 'aws-amplify/data'
import { uploadData } from 'aws-amplify/storage'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { collectImageKeys, persistableHtml } from '../lib/articleHtml.js'
import { fromDateInputValue } from '../lib/dates.js'
import { addTags } from '../lib/tags.js'
import { isSitePageId } from './sitePages.js'
import { invalidatePublishedArticles, resolveImageUrl } from './articlesRepository.js'

function getClient() {
  if (!isAmplifyConfigured()) {
    throw new Error('Amplify 尚未設定')
  }
  return generateClient({ authMode: 'userPool' })
}

function throwIfErrors(errors) {
  if (!errors?.length) return
  throw new Error(errors.map((error) => error.message).join('; '))
}

export async function listAdminArticles() {
  const client = getClient()
  const collected = []
  let nextToken
  do {
    const { data, errors, nextToken: token } = await client.models.Article.list({
      limit: 100,
      nextToken,
    })
    throwIfErrors(errors)
    collected.push(...(data ?? []).filter(Boolean))
    nextToken = token
  } while (nextToken)

    collected.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
  return Promise.all(
    collected
      .filter((article) => !isSitePageId(article.id))
      .map(async (article) => ({
      ...article,
      previewImages: await Promise.all((article.images || []).map(resolveImageUrl)),
    })),
  )
}

export async function getAdminArticle(id) {
  const client = getClient()
  const { data, errors } = await client.models.Article.get({ id })
  throwIfErrors(errors)
  if (!data) return null
  return {
    ...data,
    previewImages: await Promise.all((data.images || []).map(resolveImageUrl)),
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function payloadFromForm(form) {
  const html = persistableHtml(form.content)
  const inlineKeys = collectImageKeys(html)
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || null,
    content: [html],
    facebookUrl: form.facebookUrl.trim() || null,
    dirs: form.dirs,
    subs: form.subs,
    articleCats: form.articleCats,
    images: unique([...(form.images || []), ...inlineKeys]),
    tags: addTags([], form.tags),
    status: form.status,
    createdAt: fromDateInputValue(form.createdAt),
  }
}

function isUnknownTagsField(errors) {
  return (errors || []).some((error) => /\btags\b/i.test(String(error.message || '')))
}

export async function saveAdminArticle(form) {
  const client = getClient()
  const input = payloadFromForm(form)
  if (!input.title) throw new Error('請填寫標題')

  async function write(payload) {
    if (form.isNew) {
      return client.models.Article.create({
        id: form.id,
        ...payload,
      })
    }
    return client.models.Article.update({
      id: form.id,
      ...payload,
    })
  }

  let { data, errors } = await write(input)
  if (isUnknownTagsField(errors) && 'tags' in input) {
    const { tags: _tags, ...withoutTags } = input
    ;({ data, errors } = await write(withoutTags))
  }
  throwIfErrors(errors)
  invalidatePublishedArticles()
  return data
}

export async function deleteAdminArticle(id) {
  const client = getClient()
  const { errors } = await client.models.Article.delete({ id })
  throwIfErrors(errors)
  invalidatePublishedArticles()
}

function safeFileName(name) {
  return String(name || 'image.jpg')
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-80) || 'image.jpg'
}

export async function uploadAdminImages(fileList, folder = 'articles') {
  const files = Array.from(fileList || [])
  const keys = []
  for (const file of files) {
    const key = `public/${folder}/${Date.now()}-${safeFileName(file.name)}`
    await uploadData({
      path: key,
      data: file,
      options: { contentType: file.type || 'image/jpeg' },
    }).result
    keys.push(key)
  }
  return keys
}

export function makeArticleId(title) {
  const slug = String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug || `article-${Date.now().toString(36)}`
}
