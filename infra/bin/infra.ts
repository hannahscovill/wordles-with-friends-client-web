#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';
import { GitHubActionsRoleStack } from '../lib/github-actions-role-stack';

const app: cdk.App = new cdk.App();

// Check if we're deploying the role stack
// Usage: cdk deploy -c role=true WordlesGitHubActionsRoleStack
const isRoleStack = app.node.tryGetContext('role') === 'true';

// GitHub configuration for role stack
const githubOrg = app.node.tryGetContext('githubOrg') || process.env.GITHUB_ORG;

// SECURITY: Role stack must be deployed manually from a local machine.
// The GitHub Actions role does NOT have permissions to modify this stack.
// Prerequisite: Deploy shared-infrastructure/GitHubOidcProviderStack first
// Deploy with: cdk deploy -c role=true -c githubOrg=your-org WordlesGitHubActionsRoleStack
if (isRoleStack) {
  if (!githubOrg) {
    throw new Error(
      'GitHub organization is required for role stack. Provide via -c githubOrg=your-org or GITHUB_ORG env var',
    );
  }

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
}

// Main infrastructure stack
if (!isRoleStack) {
  new InfraStack(app, 'WordlesWithFriendsStack', {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      // Must be us-east-1 for CloudFront to use the ACM certificate
      region: 'us-east-1',
    },
    description: 'S3 + CloudFront infrastructure for Wordles with Friends',
  });
}
