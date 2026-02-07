import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubActionsRoleStackProps extends cdk.StackProps {
  /**
   * The GitHub organization or username
   */
  readonly githubOrg: string;

  /**
   * The GitHub repository name
   */
  readonly githubRepo: string;

  /**
   * Branches allowed to assume this role
   * @default ['main']
   */
  readonly allowedBranches?: string[];
}

/**
 * Creates an IAM role for GitHub Actions to deploy wordles-with-friends.
 *
 * This role references the shared OIDC provider created by GitHubOidcProviderStack.
 * Permissions are scoped to only what the wordles frontend needs:
 * - S3 for static assets
 * - CloudFront for CDN
 * - ACM for certificates
 * - Lambda for CDK bucket deployment custom resource
 */
export class GitHubActionsRoleStack extends cdk.Stack {
  public readonly roleArn: string;

  constructor(
    scope: Construct,
    id: string,
    props: GitHubActionsRoleStackProps,
  ) {
    super(scope, id, props);

    const { githubOrg, githubRepo, allowedBranches = ['main'] } = props;

    // Import the shared OIDC provider ARN
    const oidcProviderArn = cdk.Fn.importValue('GitHubOidcProviderArn');

    // Build subject conditions for allowed branches
    const subjectConditions = allowedBranches
      .map(
        (branch) => `repo:${githubOrg}/${githubRepo}:ref:refs/heads/${branch}`,
      )
      .concat([`repo:${githubOrg}/${githubRepo}:*`]);

    // Create the IAM role
    const role = new iam.Role(this, 'GitHubActionsRole', {
      roleName: `GitHubActions-wordles`,
      description: `Role for GitHub Actions to deploy ${githubRepo}`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.FederatedPrincipal(
        oidcProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': subjectConditions,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    // CloudFormation permissions
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'CloudFormation',
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudformation:CreateStack',
          'cloudformation:UpdateStack',
          'cloudformation:DeleteStack',
          'cloudformation:DescribeStacks',
          'cloudformation:DescribeStackEvents',
          'cloudformation:DescribeStackResources',
          'cloudformation:GetTemplate',
          'cloudformation:ValidateTemplate',
          'cloudformation:CreateChangeSet',
          'cloudformation:DescribeChangeSet',
          'cloudformation:ExecuteChangeSet',
          'cloudformation:DeleteChangeSet',
          'cloudformation:GetTemplateSummary',
        ],
        resources: [
          `arn:aws:cloudformation:*:${this.account}:stack/WordlesWithFriendsStack/*`,
          `arn:aws:cloudformation:*:${this.account}:stack/CDKToolkit/*`,
        ],
      }),
    );

    // CloudFormation read permissions
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'CloudFormationRead',
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudformation:DescribeStacks',
          'cloudformation:DescribeStackEvents',
          'cloudformation:ListStacks',
        ],
        resources: ['*'],
      }),
    );

    // S3 permissions for website bucket and CDK assets
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'S3',
        effect: iam.Effect.ALLOW,
        actions: [
          's3:CreateBucket',
          's3:DeleteBucket',
          's3:GetBucketPolicy',
          's3:PutBucketPolicy',
          's3:DeleteBucketPolicy',
          's3:GetBucketAcl',
          's3:PutBucketAcl',
          's3:GetBucketCORS',
          's3:PutBucketCORS',
          's3:DeleteBucketCORS',
          's3:GetBucketPublicAccessBlock',
          's3:PutBucketPublicAccessBlock',
          's3:GetEncryptionConfiguration',
          's3:PutEncryptionConfiguration',
          's3:GetBucketTagging',
          's3:PutBucketTagging',
          's3:GetBucketVersioning',
          's3:PutBucketVersioning',
          's3:GetBucketWebsite',
          's3:PutBucketWebsite',
          's3:DeleteBucketWebsite',
          's3:GetBucketLogging',
          's3:PutBucketLogging',
          's3:GetLifecycleConfiguration',
          's3:PutLifecycleConfiguration',
          's3:ListBucket',
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
          's3:GetBucketLocation',
        ],
        resources: [
          // CDK assets bucket
          `arn:aws:s3:::cdk-*-assets-${this.account}-*`,
          `arn:aws:s3:::cdk-*-assets-${this.account}-*/*`,
          // Wordles website bucket (CDK auto-generates name)
          `arn:aws:s3:::wordleswithfriendsstack-*`,
          `arn:aws:s3:::wordleswithfriendsstack-*/*`,
        ],
      }),
    );

    // CloudFront permissions
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'CloudFront',
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudfront:CreateDistribution',
          'cloudfront:DeleteDistribution',
          'cloudfront:GetDistribution',
          'cloudfront:GetDistributionConfig',
          'cloudfront:UpdateDistribution',
          'cloudfront:TagResource',
          'cloudfront:UntagResource',
          'cloudfront:ListTagsForResource',
          'cloudfront:CreateInvalidation',
          'cloudfront:GetInvalidation',
          'cloudfront:ListInvalidations',
          'cloudfront:CreateOriginAccessControl',
          'cloudfront:DeleteOriginAccessControl',
          'cloudfront:GetOriginAccessControl',
          'cloudfront:UpdateOriginAccessControl',
          'cloudfront:ListOriginAccessControls',
          'cloudfront:CreateCachePolicy',
          'cloudfront:DeleteCachePolicy',
          'cloudfront:GetCachePolicy',
          'cloudfront:UpdateCachePolicy',
          'cloudfront:ListCachePolicies',
        ],
        resources: ['*'],
      }),
    );

    // ACM permissions for SSL certificates
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'ACM',
        effect: iam.Effect.ALLOW,
        actions: [
          'acm:RequestCertificate',
          'acm:DeleteCertificate',
          'acm:DescribeCertificate',
          'acm:ListCertificates',
          'acm:AddTagsToCertificate',
          'acm:RemoveTagsFromCertificate',
          'acm:ListTagsForCertificate',
        ],
        resources: ['*'],
      }),
    );

    // IAM permissions (scoped to wordles roles)
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'IAM',
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:CreateRole',
          'iam:DeleteRole',
          'iam:GetRole',
          'iam:UpdateRole',
          'iam:PassRole',
          'iam:AttachRolePolicy',
          'iam:DetachRolePolicy',
          'iam:PutRolePolicy',
          'iam:DeleteRolePolicy',
          'iam:GetRolePolicy',
          'iam:ListRolePolicies',
          'iam:ListAttachedRolePolicies',
          'iam:TagRole',
          'iam:UntagRole',
          'iam:ListRoleTags',
        ],
        resources: [
          `arn:aws:iam::${this.account}:role/WordlesWithFriendsStack-*`,
          `arn:aws:iam::${this.account}:role/cdk-*`,
        ],
      }),
    );

    // STS permissions - assume CDK bootstrap roles
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'AssumeBootstrapRoles',
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [
          `arn:aws:iam::${this.account}:role/cdk-*-deploy-role-${this.account}-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-file-publishing-role-${this.account}-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-image-publishing-role-${this.account}-*`,
          `arn:aws:iam::${this.account}:role/cdk-*-lookup-role-${this.account}-*`,
        ],
      }),
    );

    // SSM Parameter Store - CDK bootstrap
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'SSM',
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter', 'ssm:GetParameters'],
        resources: [`arn:aws:ssm:*:${this.account}:parameter/cdk-bootstrap/*`],
      }),
    );

    // Lambda permissions for CDK BucketDeployment custom resource
    role.addToPolicy(
      new iam.PolicyStatement({
        sid: 'Lambda',
        effect: iam.Effect.ALLOW,
        actions: [
          'lambda:CreateFunction',
          'lambda:DeleteFunction',
          'lambda:GetFunction',
          'lambda:GetFunctionConfiguration',
          'lambda:UpdateFunctionCode',
          'lambda:UpdateFunctionConfiguration',
          'lambda:InvokeFunction',
          'lambda:AddPermission',
          'lambda:RemovePermission',
          'lambda:TagResource',
          'lambda:UntagResource',
          'lambda:ListTags',
        ],
        resources: [
          `arn:aws:lambda:*:${this.account}:function:WordlesWithFriendsStack-*`,
        ],
      }),
    );

    this.roleArn = role.roleArn;

    // Output the role ARN
    new cdk.CfnOutput(this, 'RoleArn', {
      value: role.roleArn,
      description: 'ARN of the GitHub Actions role for wordles-with-friends',
      exportName: 'WordlesGitHubActionsRoleArn',
    });
  }
}
