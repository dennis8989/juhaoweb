import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

type AppSyncEvent = {
  info?: { fieldName?: string };
  fieldName?: string;
  arguments: {
    id?: string;
    limit?: number | null;
    nextToken?: string | null;
  };
};

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function tableName() {
  const name = process.env.ARTICLE_TABLE_NAME;
  if (!name) {
    throw new Error('ARTICLE_TABLE_NAME is not set');
  }
  return name;
}

function encodeToken(key: Record<string, unknown> | undefined) {
  if (!key) return null;
  return Buffer.from(JSON.stringify(key)).toString('base64');
}

function decodeToken(token: string | null | undefined) {
  if (!token) return undefined;
  return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
}

function toArticle(item: Record<string, unknown> | undefined) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    excerpt: item.excerpt ?? null,
    content: item.content ?? null,
    facebookUrl: item.facebookUrl ?? null,
    dirs: item.dirs ?? null,
    subs: item.subs ?? null,
    articleCats: item.articleCats ?? null,
    images: item.images ?? null,
    status: item.status,
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  };
}

export const handler = async (event: AppSyncEvent) => {
  const field = event.info?.fieldName ?? event.fieldName;
  const table = tableName();

  if (field === 'getPublishedArticle' || event.arguments.id) {
    const id = event.arguments.id;
    if (!id) return null;
    const result = await doc.send(
      new GetCommand({
        TableName: table,
        Key: { id },
      }),
    );
    const article = toArticle(result.Item as Record<string, unknown> | undefined);
    if (!article || article.status !== 'published') return null;
    return article;
  }

  const args = event.arguments;
  const result = await doc.send(
    new QueryCommand({
      TableName: table,
      IndexName: 'articlesByStatus',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':status': 'published' },
      Limit: args.limit ?? 100,
      ExclusiveStartKey: decodeToken(args.nextToken),
      ScanIndexForward: false,
    }),
  );

  return {
    items: (result.Items ?? []).map((item) => toArticle(item as Record<string, unknown>)),
    nextToken: encodeToken(result.LastEvaluatedKey as Record<string, unknown> | undefined),
  };
};
