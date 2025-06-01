#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GitHubOidcStack } from '../lib/github-oidc-stack';
import { GitHubOidcParameters } from '../lib/parameters';

const app = new cdk.App();

// GitHub OIDC スタックをデプロイ
new GitHubOidcStack(app, 'GitHubOidcStack', {
  gitHubOwner: GitHubOidcParameters.gitHubOwner,
  gitHubRepo: GitHubOidcParameters.gitHubRepo,
  gitHubBranch: GitHubOidcParameters.gitHubBranch,
  roleName: GitHubOidcParameters.roleName,
  thumbprints: GitHubOidcParameters.thumbprints,
  
  // 環境設定
  env: { 
    account: GitHubOidcParameters.accountId || process.env.CDK_DEFAULT_ACCOUNT, 
    region: GitHubOidcParameters.region || process.env.CDK_DEFAULT_REGION 
  },
});
