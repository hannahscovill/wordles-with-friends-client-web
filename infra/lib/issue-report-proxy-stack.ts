import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface IssueReportProxyStackProps extends cdk.StackProps {
  /**
   * The GitHub repository to create issues in (e.g., "hannahscovill/wordles-with-friends-client-web")
   */
  readonly githubRepo: string;

  /**
   * Allowed CORS origins (e.g., ["https://wordles.dev"])
   */
  readonly allowedOrigins: string[];
}

/**
 * Creates a Lambda function URL for anonymous issue reporting.
 *
 * The Lambda authenticates as a GitHub App to create issues on behalf of users
 * without requiring a GitHub account. Spam prevention via Cloudflare Turnstile.
 *
 * SSM Parameters (must be created manually before deploying):
 * - /wordles/issue-proxy/github-app-id: GitHub App ID
 * - /wordles/issue-proxy/github-app-private-key: GitHub App private key (PEM)
 * - /wordles/issue-proxy/github-installation-id: GitHub App installation ID
 * - /wordles/issue-proxy/turnstile-secret-key: Cloudflare Turnstile secret key
 */
export class IssueReportProxyStack extends cdk.Stack {
  public readonly functionUrl: string;

  constructor(scope: Construct, id: string, props: IssueReportProxyStackProps) {
    super(scope, id, props);

    const { githubRepo, allowedOrigins } = props;

    // Reference existing SSM parameters (created manually)
    const githubAppId = ssm.StringParameter.fromStringParameterName(
      this,
      'GitHubAppId',
      '/wordles/issue-proxy/github-app-id',
    );

    const githubPrivateKey =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'GitHubPrivateKey',
        {
          parameterName: '/wordles/issue-proxy/github-app-private-key',
        },
      );

    const githubInstallationId = ssm.StringParameter.fromStringParameterName(
      this,
      'GitHubInstallationId',
      '/wordles/issue-proxy/github-installation-id',
    );

    const turnstileSecretKey =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'TurnstileSecretKey',
        {
          parameterName: '/wordles/issue-proxy/turnstile-secret-key',
        },
      );

    // Lambda function
    // The Lambda binary is built by GHA before CDK deploy (cargo lambda build --release --arm64)
    // For local synth/testing, create a placeholder: mkdir -p issue-proxy/target/lambda/issue-proxy
    const fn = new lambda.Function(this, 'IssueProxyFunction', {
      functionName: 'wordles-issue-proxy',
      description: 'Proxies anonymous issue reports to GitHub',
      runtime: lambda.Runtime.PROVIDED_AL2023,
      architecture: lambda.Architecture.ARM_64,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../issue-proxy/target/lambda/issue-proxy', {
        // Exclude common dev files that might be in the directory
        exclude: ['*.pdb', '*.d'],
      }),
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        GITHUB_REPO: githubRepo,
        GITHUB_APP_ID: githubAppId.stringValue,
        GITHUB_INSTALLATION_ID: githubInstallationId.stringValue,
        // Secure strings are passed via environment variable references
        GITHUB_PRIVATE_KEY_PARAM: '/wordles/issue-proxy/github-app-private-key',
        TURNSTILE_SECRET_KEY_PARAM: '/wordles/issue-proxy/turnstile-secret-key',
        RUST_LOG: 'info',
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Grant Lambda permission to read SSM parameters
    githubAppId.grantRead(fn);
    githubInstallationId.grantRead(fn);
    githubPrivateKey.grantRead(fn);
    turnstileSecretKey.grantRead(fn);

    // Function URL with CORS
    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins,
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['Content-Type'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    this.functionUrl = fnUrl.url;

    // Outputs
    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: fnUrl.url,
      description: 'URL for the issue report proxy Lambda',
      exportName: 'WordlesIssueProxyUrl',
    });

    new cdk.CfnOutput(this, 'FunctionArn', {
      value: fn.functionArn,
      description: 'ARN of the issue report proxy Lambda',
      exportName: 'WordlesIssueProxyArn',
    });
  }
}
