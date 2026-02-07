import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

/**
 * Context configuration for the issue proxy (defined in cdk.json under "issueProxy")
 */
interface IssueProxyContext {
  readonly ssmPrefix: string;
  readonly ssmParams: {
    readonly githubAppId: string;
    readonly githubPrivateKey: string;
    readonly githubInstallationId: string;
    readonly turnstileSecretKey: string;
  };
  readonly functionName: string;
  readonly githubRepo: string;
  readonly allowedOrigins: string[];
  readonly turnstileVerifyUrl: string;
  readonly memorySize: number;
  readonly timeoutSeconds: number;
  readonly rustLogLevel: string;
}

/**
 * Creates a Lambda function URL for anonymous issue reporting.
 *
 * The Lambda authenticates as a GitHub App to create issues on behalf of users
 * without requiring a GitHub account. Spam prevention via Cloudflare Turnstile.
 *
 * Configuration is read from CDK context (cdk.json "issueProxy" key).
 *
 * SSM Parameters (must be created manually before deploying):
 * - {ssmPrefix}/github-app-id: GitHub App ID
 * - {ssmPrefix}/github-app-private-key: GitHub App private key (PEM)
 * - {ssmPrefix}/github-installation-id: GitHub App installation ID
 * - {ssmPrefix}/turnstile-secret-key: Cloudflare Turnstile secret key
 */
export class IssueReportProxyStack extends cdk.Stack {
  public readonly functionUrl: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Read configuration from CDK context
    const config = this.node.tryGetContext('issueProxy') as IssueProxyContext;
    if (!config) {
      throw new Error('Missing "issueProxy" context in cdk.json');
    }

    const {
      ssmPrefix,
      ssmParams,
      functionName,
      githubRepo,
      allowedOrigins,
      turnstileVerifyUrl,
      memorySize,
      timeoutSeconds,
      rustLogLevel,
    } = config;

    // SSM parameter paths: prefix + param name from context
    const ssmPaths = {
      githubAppId: `${ssmPrefix}/${ssmParams.githubAppId}`,
      githubPrivateKey: `${ssmPrefix}/${ssmParams.githubPrivateKey}`,
      githubInstallationId: `${ssmPrefix}/${ssmParams.githubInstallationId}`,
      turnstileSecretKey: `${ssmPrefix}/${ssmParams.turnstileSecretKey}`,
    };

    // Reference existing SSM parameters (created manually)
    const githubAppId = ssm.StringParameter.fromStringParameterName(
      this,
      'GitHubAppId',
      ssmPaths.githubAppId,
    );

    const githubPrivateKey =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'GitHubPrivateKey',
        { parameterName: ssmPaths.githubPrivateKey },
      );

    const githubInstallationId = ssm.StringParameter.fromStringParameterName(
      this,
      'GitHubInstallationId',
      ssmPaths.githubInstallationId,
    );

    const turnstileSecretKey =
      ssm.StringParameter.fromSecureStringParameterAttributes(
        this,
        'TurnstileSecretKey',
        { parameterName: ssmPaths.turnstileSecretKey },
      );

    // Lambda function
    // The Lambda binary is built by GHA before CDK deploy (cargo lambda build --release --arm64)
    // For local synth/testing, create a placeholder: mkdir -p issue-proxy/target/lambda/issue-proxy
    const fn = new lambda.Function(this, 'IssueProxyFunction', {
      functionName,
      description: 'Proxies anonymous issue reports to GitHub',
      runtime: lambda.Runtime.PROVIDED_AL2023,
      architecture: lambda.Architecture.ARM_64,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('../issue-proxy/target/lambda/issue-proxy', {
        exclude: ['*.pdb', '*.d'],
      }),
      memorySize,
      timeout: cdk.Duration.seconds(timeoutSeconds),
      environment: {
        GITHUB_REPO: githubRepo,
        GITHUB_APP_ID: githubAppId.stringValue,
        GITHUB_INSTALLATION_ID: githubInstallationId.stringValue,
        GITHUB_PRIVATE_KEY_PARAM: ssmPaths.githubPrivateKey,
        TURNSTILE_SECRET_KEY_PARAM: ssmPaths.turnstileSecretKey,
        TURNSTILE_VERIFY_URL: turnstileVerifyUrl,
        RUST_LOG: rustLogLevel,
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
    });

    new cdk.CfnOutput(this, 'FunctionArn', {
      value: fn.functionArn,
      description: 'ARN of the issue report proxy Lambda',
    });
  }
}
