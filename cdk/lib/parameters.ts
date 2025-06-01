/**
 * GitHub OIDC連携のためのパラメータ設定
 * このファイルを編集して、GitHub連携の設定を行います
 */
export const GitHubOidcParameters = {
  /**
   * GitHub ユーザー名またはOrganization名
   * 例: 'your-github-username'
   */
  gitHubOwner: 'your-github-username',

  /**
   * GitHub リポジトリ名
   * 例: 'your-github-repo'
   */
  gitHubRepo: 'your-github-repo',

  /**
   * 特定のブランチに制限する場合は指定する
   * 指定しない場合はリポジトリ全体にアクセス権を付与
   * 例: 'main'
   */
  gitHubBranch: undefined, // undefinedの場合はブランチ制限なし

  /**
   * IAMロールの名前
   * 未指定の場合は自動生成される
   * 例: 'GitHubActions-BedrockRole'
   */
  roleName: undefined,

  /**
   * デプロイ先のAWSリージョン
   * 未指定の場合はデフォルトのリージョンが使用される
   * 例: 'us-west-2'
   */
  region: undefined,

  /**
   * デプロイ先のAWSアカウントID
   * 未指定の場合はデフォルトのアカウントが使用される
   * 例: '123456789012'
   */
  accountId: undefined,

  /**
   * GitHub Actions OIDCプロバイダーのサムプリント
   * 通常は変更する必要はありません
   * 最新の値は GitHub ドキュメントで確認できます
   * https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
   */
  thumbprints: [
    '6938fd4d98bab03faadb97b34396831e3780aea1',
    '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
  ]
};
