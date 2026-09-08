import { generateClient } from 'aws-amplify/data'
import { isAmplifyConfigured } from '../lib/amplify.js'
import { invalidatePublishedArticles } from './articlesRepository.js'
import { SITE_TOPICS_ID } from './sitePages.js'
import {
  defaultTopicHeroes,
  invalidateTopicHeroes,
  parseTopicHeroes,
  serializeTopicHeroes,
  topicImageKeys,
} from './topicsPage.js'

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

export async function getAdminTopics() {
  const client = getClient()
  const { data, errors } = await client.models.Article.get({ id: SITE_TOPICS_ID })
  throwIfErrors(errors)
  if (!data) {
    return {
      exists: false,
      page: defaultTopicHeroes(),
    }
  }
  return {
    exists: true,
    page: parseTopicHeroes(data),
  }
}

export async function saveAdminTopics(page) {
  const client = getClient()
  const next = mergeSafe(page)
  const payload = {
    title: '主題頁主視覺',
    excerpt: '主題頁圖片與敘述',
    content: [serializeTopicHeroes(next)],
    facebookUrl: null,
    dirs: [],
    subs: [],
    articleCats: [],
    images: topicImageKeys(next),
    tags: [],
    status: 'published',
  }

  const { data: existing, errors: getErrors } = await client.models.Article.get({ id: SITE_TOPICS_ID })
  throwIfErrors(getErrors)

  const write = (body) => (existing
    ? client.models.Article.update({ id: SITE_TOPICS_ID, ...body })
    : client.models.Article.create({ id: SITE_TOPICS_ID, ...body, createdAt: new Date().toISOString() }))

  let { data, errors } = await write(payload)
  if ((errors || []).some((error) => /\btags\b/i.test(String(error.message || ''))) && 'tags' in payload) {
    const { tags: _tags, ...withoutTags } = payload
    ;({ data, errors } = await write(withoutTags))
  }
  throwIfErrors(errors)
  invalidatePublishedArticles()
  invalidateTopicHeroes()
  return data
}

function mergeSafe(page) {
  return {
    topics: page?.topics && typeof page.topics === 'object' ? page.topics : defaultTopicHeroes().topics,
  }
}
