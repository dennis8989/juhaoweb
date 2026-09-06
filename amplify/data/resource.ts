import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { publicArticles } from '../functions/public-articles/resource';

const schema = a.schema({
  ArticleStatus: a.enum(['published', 'draft']),

  PublishedArticle: a.customType({
    id: a.id().required(),
    title: a.string().required(),
    excerpt: a.string(),
    content: a.string().array(),
    facebookUrl: a.string(),
    dirs: a.string().array(),
    subs: a.string().array(),
    articleCats: a.string().array(),
    images: a.string().array(),
    status: a.string().required(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  }),

  PublishedArticlePage: a.customType({
    items: a.ref('PublishedArticle').required().array().required(),
    nextToken: a.string(),
  }),

  Article: a
    .model({
      title: a.string().required(),
      excerpt: a.string(),
      content: a.string().array(),
      facebookUrl: a.string(),
      dirs: a.string().array(),
      subs: a.string().array(),
      articleCats: a.string().array(),
      images: a.string().array(),
      status: a.ref('ArticleStatus').required(),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('status').sortKeys(['createdAt']).name('articlesByStatus').queryField('articlesByStatus'),
    ])
    .authorization((allow) => [
      allow.authenticated().to(['read', 'create', 'update', 'delete']),
    ]),

  listPublishedArticles: a
    .query()
    .arguments({
      limit: a.integer(),
      nextToken: a.string(),
    })
    .returns(a.ref('PublishedArticlePage'))
    .handler(a.handler.function(publicArticles))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),

  getPublishedArticle: a
    .query()
    .arguments({
      id: a.id().required(),
    })
    .returns(a.ref('PublishedArticle'))
    .handler(a.handler.function(publicArticles))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
