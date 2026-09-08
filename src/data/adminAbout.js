import { generateClient } from 'aws-amplify/data'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { persistableHtml } from '../lib/articleHtml.js'
import { invalidatePublishedArticles } from './articlesRepository.js'
import { SITE_ABOUT_ID } from './sitePages.js'
import {
  aboutImageKeys,
  defaultAboutPage,
  parseAboutPage,
  serializeAboutPage,
} from './aboutPage.js'

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

export async function getAdminAbout() {
  const client = getClient()
  const { data, errors } = await client.models.Article.get({ id: SITE_ABOUT_ID })
  throwIfErrors(errors)
  if (!data) {
    return {
      exists: false,
      page: defaultAboutPage(),
      createdAt: null,
    }
  }
  return {
    exists: true,
    page: parseAboutPage(data),
    createdAt: data.createdAt || null,
  }
}

export async function saveAdminAbout(page) {
  const client = getClient()
  const next = {
    ...page,
    story: { ...page.story, html: persistableHtml(page.story?.html) },
    origin: { ...page.origin, html: persistableHtml(page.origin?.html) },
  }
  const payload = {
    title: next.hero?.name?.trim() || '關於我',
    excerpt: '關於我頁面',
    content: [serializeAboutPage(next)],
    facebookUrl: null,
    dirs: [],
    subs: [],
    articleCats: [],
    images: aboutImageKeys(next),
    tags: [],
    status: 'published',
  }

  const { data: existing, errors: getErrors } = await client.models.Article.get({ id: SITE_ABOUT_ID })
  throwIfErrors(getErrors)

  const write = (body) => (existing
    ? client.models.Article.update({ id: SITE_ABOUT_ID, ...body })
    : client.models.Article.create({ id: SITE_ABOUT_ID, ...body, createdAt: new Date().toISOString() }))

  let { data, errors } = await write(payload)
  if ((errors || []).some((error) => /\btags\b/i.test(String(error.message || ''))) && 'tags' in payload) {
    const { tags: _tags, ...withoutTags } = payload
    ;({ data, errors } = await write(withoutTags))
  }
  throwIfErrors(errors)
  invalidatePublishedArticles()
  return data
}
