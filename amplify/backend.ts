import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { publicArticles } from './functions/public-articles/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  publicArticles,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSymbols: false,
  },
};

backend.data.resources.cfnResources.amplifyDynamoDbTables['Article'].pointInTimeRecoveryEnabled = true;

const { cfnBucket } = backend.storage.resources.cfnResources;
cfnBucket.versioningConfiguration = {
  status: 'Enabled',
};

const articleTable = backend.data.resources.tables['Article'];
const publicArticlesLambda = backend.publicArticles.resources.lambda;
articleTable.grantReadData(publicArticlesLambda);
publicArticlesLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Query'],
    resources: [articleTable.tableArn, `${articleTable.tableArn}/index/*`],
  }),
);
backend.publicArticles.resources.cfnResources.cfnFunction.addPropertyOverride(
  'Environment.Variables.ARTICLE_TABLE_NAME',
  articleTable.tableName,
);
