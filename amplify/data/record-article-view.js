// AppSync JS resolver (APPSYNC_JS runtime). Amplify uploads this file as-is, so keep it plain JS.
import { util } from '@aws-appsync/utils'

// The SiteEnv enum only lets `amplify` or `dev` through, so the field name never comes from raw input.
function countField(env) {
  return env === 'amplify' ? 'viewCount' : 'devViewCount'
}

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ id: ctx.args.id }),
    update: {
      expression: 'ADD #count :one',
      expressionNames: { '#count': countField(ctx.args.env) },
      expressionValues: util.dynamodb.toMapValues({ ':one': 1 }),
    },
    // Also fails for ids that don't exist, so an unknown id can't create a new item.
    condition: {
      expression: '#status = :published',
      expressionNames: { '#status': 'status' },
      expressionValues: util.dynamodb.toMapValues({ ':published': 'published' }),
    },
  }
}

export function response(ctx) {
  // Draft or missing article: skip the count without returning an error to the reader.
  if (ctx.error) {
    return null
  }
  return { id: ctx.args.id, views: ctx.result[countField(ctx.args.env)] }
}
