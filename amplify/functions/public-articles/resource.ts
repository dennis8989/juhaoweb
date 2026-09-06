import { defineFunction } from '@aws-amplify/backend';

export const publicArticles = defineFunction({
  name: 'public-articles',
  entry: './handler.ts',
  timeoutSeconds: 10,
  memoryMB: 256,
  resourceGroupName: 'data',
});
