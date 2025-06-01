# GitHub OIDC for AWS Bedrock

このCDKプロジェクトは、GitHub ActionsからAWS Bedrockを利用するためのOIDC連携を設定します。
OIDCを使用することで、長期間有効なアクセスキーを使わずにGitHub ActionsからAWSリソースにアクセスできます。

## 機能

- GitHub ActionsのOIDCプロバイダーを作成
- GitHub Actions用のIAMロールを作成
- BedrockのAPIを呼び出すための権限を付与
- 特定のGitHubリポジトリからのみアクセスを許可
- オプションで特定のブランチからのみアクセスを許可

## 前提条件

- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS CDK](https://aws.amazon.com/cdk/)
- Node.js 14.x以上

## デプロイ方法

### 1. パラメータの設定

`lib/parameters.ts` ファイルを編集して、GitHubのユーザー名とリポジトリ名を設定します。

```typescript
export const GitHubOidcParameters = {
  gitHubOwner: 'your-github-username',  // GitHubのユーザー名またはOrganization名
  gitHubRepo: 'your-github-repo',       // GitHubのリポジトリ名
  gitHubBranch: undefined,              // 特定のブランチに制限する場合は指定（例: 'main'）
  roleName: undefined,                  // IAMロールの名前（未指定の場合は自動生成）
  region: undefined,                    // デプロイ先のAWSリージョン
  accountId: undefined                  // デプロイ先のAWSアカウントID
};
```

### 2. プロジェクトのセットアップ

```bash
# 依存関係をインストール
npm install
```

### 3. デプロイ

```bash
# CDKをデプロイ
npx cdk deploy
```

### 4. 出力値の確認

デプロイが完了すると、以下の出力値が表示されます：

- `GitHubOidcStack.GitHubActionsRoleArn` - GitHub Actionsで使用するIAMロールのARN
- `GitHubOidcStack.GitHubOidcProviderArn` - 作成されたOIDCプロバイダーのARN

## GitHub Actionsでの使用方法

GitHub Actionsのワークフローファイル（`.github/workflows/your-workflow.yml`）に以下のように設定します：

```yaml
name: AWS Bedrock Workflow

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # OIDCトークンの取得に必要
      contents: read   # リポジトリの読み取りに必要
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}  # デプロイ時に出力されたIAMロールのARN
          aws-region: us-west-2  # 使用するリージョン
      
      # ここからBedrockを使用するステップを追加
      - name: Use Bedrock
        run: |
          # Bedrockを使用するコマンド
          # 例: aws bedrock-runtime invoke-model ...
```

GitHub Actionsのシークレットに以下の値を設定します：

- `AWS_ROLE_ARN`: デプロイ時に出力された `GitHubOidcStack.GitHubActionsRoleArn` の値

## カスタマイズ

追加のポリシーを適用したい場合は、`lib/github-oidc-stack.ts`ファイルを編集し、`additionalPolicies`プロパティを設定してください。

## クリーンアップ

```bash
npx cdk destroy
```

## 参考資料

- [GitHub Actions で OIDC を使用して AWS 認証を行う](https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [GitHub Actions - Configure AWS Credentials](https://github.com/aws-actions/configure-aws-credentials)
