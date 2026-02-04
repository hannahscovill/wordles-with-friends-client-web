# Wordles with Friends

A multiplayer Wordle game built with React + Rsbuild.

## Development

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run test       # unit tests (rstest)
npm run test:e2e   # e2e tests (Playwright)
npm run storybook  # component dev at http://localhost:6006
```

## Infrastructure

CDK stacks for the frontend deployment.

| Stack                           | Command        | Purpose                                                               |
| ------------------------------- | -------------- | --------------------------------------------------------------------- |
| `WordlesWithFriendsStack`       | (default)      | S3 bucket, CloudFront distribution, ACM certificate for `wordles.dev` |
| `WordlesGitHubActionsRoleStack` | `-c role=true` | IAM role for GitHub Actions CI/CD                                     |

The main stack deploys to **us-east-1** (required for CloudFront ACM certificates). The role stack deploys to us-west-2.

### GitHub Actions Role

The role stack imports `GitHubOidcProviderArn` from [shared-infrastructure](https://github.com/hannahscovill/shared-infrastructure). The shared OIDC provider must be deployed first.

Permissions include: S3, CloudFront, ACM, Lambda (CDK BucketDeployment), IAM, and CloudFormation.

### Deploying

```bash
cd infra
npm install

# GitHub Actions role (once, or when permissions change)
npx cdk deploy -c role=true -c githubOrg=hannahscovill WordlesGitHubActionsRoleStack

# Main application
npx cdk deploy
```

## CI/CD

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). Triggered on push to `main`.

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `AWS_ACCOUNT_ID`    | AWS account ID                       |
| `AWS_REGION`        | AWS region (e.g., `us-west-2`)       |
| `AWS_OIDC_ROLE_ARN` | IAM role ARN for OIDC authentication |
