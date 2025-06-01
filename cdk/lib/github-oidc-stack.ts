import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubOidcStackProps extends cdk.StackProps {
  /**
   * GitHub ユーザー名またはOrganization名
   */
  gitHubOwner: string;

  /**
   * GitHub リポジトリ名
   */
  gitHubRepo: string;

  /**
   * 特定のブランチに制限する場合は指定する
   * 指定しない場合はリポジトリ全体にアクセス権を付与
   */
  gitHubBranch?: string;

  /**
   * IAMロールの名前
   * 未指定の場合は自動生成される
   */
  roleName?: string;

  /**
   * GitHub Actions OIDCプロバイダーのサムプリント
   */
  thumbprints: string[];

  /**
   * IAMロールに付与するポリシー
   * デフォルトではBedrockの基本的なアクセス権限を付与
   */
  additionalPolicies?: iam.PolicyStatement[];
}

export class GitHubOidcStack extends cdk.Stack {
  /**
   * 作成したIAMロールのARN
   */
  public readonly roleArn: string;

  /**
   * 作成したOIDCプロバイダーのARN
   */
  public readonly oidcProviderArn: string;

  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    // GitHub OIDC プロバイダーを作成
    const githubOidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      // パラメータから渡されたサムプリントを使用
      thumbprints: props.thumbprints
    });

    // 信頼ポリシーの条件を設定
    let trustPolicyCondition: {[key: string]: any} = {
      StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
      }
    };

    // ブランチが指定されている場合は特定のブランチに制限
    if (props.gitHubBranch) {
      trustPolicyCondition.StringEquals['token.actions.githubusercontent.com:sub'] = 
        `repo:${props.gitHubOwner}/${props.gitHubRepo}:ref:refs/heads/${props.gitHubBranch}`;
    } else {
      // ブランチ指定がない場合はリポジトリ全体にアクセス権を付与
      trustPolicyCondition.StringLike = {
        'token.actions.githubusercontent.com:sub': `repo:${props.gitHubOwner}/${props.gitHubRepo}:*`
      };
    }

    // Bedrockへのアクセス権限を持つポリシーを作成
    const bedrockPolicy = new iam.Policy(this, 'BedrockPolicy', {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream'
          ],
          resources: ['*']
        })
      ]
    });

    // GitHub Actions用のIAMロールを作成
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidcProvider.openIdConnectProviderArn, 
        trustPolicyCondition
      ),
      description: 'Role for GitHub Actions to access AWS services including Bedrock',
      roleName: props.roleName || `GitHubActions-${props.gitHubOwner}-${props.gitHubRepo}`
    });

    // Bedrockポリシーをロールにアタッチ
    bedrockPolicy.attachToRole(githubActionsRole);

    // 追加のポリシーがあれば適用
    if (props.additionalPolicies) {
      props.additionalPolicies.forEach((policy, index) => {
        githubActionsRole.addToPolicy(policy);
      });
    }

    // 出力値を設定
    this.roleArn = githubActionsRole.roleArn;
    this.oidcProviderArn = githubOidcProvider.openIdConnectProviderArn;

    // CloudFormation出力を設定
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: githubActionsRole.roleArn,
      description: 'ARN of the role for GitHub Actions',
      exportName: `${this.stackName}-RoleArn`
    });

    new cdk.CfnOutput(this, 'GitHubOidcProviderArn', {
      value: githubOidcProvider.openIdConnectProviderArn,
      description: 'ARN of the GitHub OIDC provider',
      exportName: `${this.stackName}-OidcProviderArn`
    });
  }
}
