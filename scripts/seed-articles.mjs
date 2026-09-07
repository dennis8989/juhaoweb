import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { articles } from '../src/data/content.js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const APP_ID = 'd1zwf54820xsiz'
const REGION = 'ap-northeast-1'
const CREATED_AT_BASE = Date.parse('2024-01-01T00:00:00.000Z')

function loadOutputs() {
  const raw = readFileSync(join(rootDir, 'amplify_outputs.json'), 'utf8')
  return JSON.parse(raw)
}

function toStorageKey(src) {
  const relative = String(src).replace(/^\//, '')
  if (relative.startsWith('public/')) return relative
  return `public/${relative}`
}

function toArticleItem(article, index, total) {
  const createdAt = new Date(CREATED_AT_BASE + (total - 1 - index) * 86_400_000).toISOString()
  return {
    __typename: 'Article',
    id: article.id,
    title: article.title,
    excerpt: article.excerpt ?? null,
    content: article.content ?? [],
    facebookUrl: article.facebookUrl ?? null,
    dirs: article.dirs ?? [],
    subs: article.subs ?? [],
    articleCats: article.articleCats ?? [],
    images: (article.images ?? []).map(toStorageKey),
    tags: article.tags ?? [],
    status: 'published',
    createdAt,
    updatedAt: createdAt,
  }
}

async function resolveTableName(client) {
  const listed = await client.send(new ListTablesCommand({}))
  const matches = (listed.TableNames ?? []).filter(
    (name) => name.startsWith('Article-') && name.endsWith('-NONE'),
  )
  if (matches.length !== 1) {
    throw new Error(`Expected one preview Article table, found: ${matches.join(', ') || '(none)'}`)
  }
  return matches[0]
}

const outputs = loadOutputs()
const bucket = outputs.storage?.bucket_name
if (!bucket || !bucket.includes(APP_ID)) {
  throw new Error(`Refusing to seed: bucket ${bucket ?? '(missing)'} is not the juhaoweb preview app`)
}

const dynamo = new DynamoDBClient({ region: REGION })
const tableName = await resolveTableName(dynamo)
const docs = DynamoDBDocumentClient.from(dynamo, {
  marshallOptions: { removeUndefinedValues: true },
})

console.log(`Seeding ${articles.length} articles`)
console.log(`Table  ${tableName}`)
console.log(`Bucket ${bucket}`)

execFileSync(
  'aws',
  ['s3', 'sync', join(rootDir, 'public/articles'), `s3://${bucket}/public/articles`, '--region', REGION],
  { stdio: 'inherit' },
)

for (const [index, article] of articles.entries()) {
  const item = toArticleItem(article, index, articles.length)
  await docs.send(new PutCommand({ TableName: tableName, Item: item }))
  console.log(`  wrote ${item.id} (${item.images.length} images)`)
}

console.log('Seed complete')
