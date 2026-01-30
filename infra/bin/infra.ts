#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfraStack } from '../lib/infra-stack';

const app: cdk.App = new cdk.App();

new InfraStack(app, 'WordlesWithFriendsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // Must be us-east-1 for CloudFront to use the ACM certificate
    region: 'us-east-1',
  },
  description: 'S3 + CloudFront infrastructure for Wordles with Friends',
});
