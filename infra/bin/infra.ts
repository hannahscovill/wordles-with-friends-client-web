#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';
import { GitHubActionsRoleStack } from '../lib/github-actions-role-stack';
import { IssueReportProxyStack } from '../lib/issue-report-proxy-stack';

const app: cdk.App = new cdk.App();

const githubOrg = app.node.tryGetContext('githubOrg');

// SECURITY: Role stack must be deployed manually from a local machine.
// The GitHub Actions role does NOT have permissions to modify this stack.
new GitHubActionsRoleStack(app, 'WordlesGitHubActionsRoleStack', {
  githubOrg,
  githubRepo: 'wordles-with-friends-client-web',
  allowedBranches: ['main'],
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'GitHub Actions IAM role for wordles-with-friends',
});

// Issue report proxy Lambda — config read from cdk.json context
new IssueReportProxyStack(app, 'IssueReportProxyStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  description: 'Lambda proxy for anonymous GitHub issue reporting',
});

new InfraStack(app, 'WordlesWithFriendsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // Must be us-east-1 for CloudFront to use the ACM certificate
    region: 'us-east-1',
  },
  description: 'S3 + CloudFront infrastructure for Wordles with Friends',
});
