# Bedrock Claude Code PR Review

GitHub ActionsとAmazon Bedrockを使用して、プルリクエストの自動コードレビューを行うプロジェクトです。

## 機能

- GitHub ActionsからAWS Bedrockを利用するためのOIDC連携
- Claude AIモデルを使用したコードレビュー
- プルリクエストへの自動コメント

## セットアップ方法

### 1. AWS側の設定

このプロジェクトには、GitHub ActionsからAWS Bedrockを利用するためのCDKスタックが含まれています。

#### CDKのデプロイ

1. `cdk/lib/parameters.ts` ファイルを編集して、GitHubのユーザー名とリポジトリ名を設定します。

```typescript
export const GitHubOidcParameters = {
  gitHubOwner: 'your-github-username',  // GitHubのユーザー名またはOrganization名
  gitHubRepo: 'your-github-repo',       // GitHubのリポジトリ名
  gitHubBranch: undefined,              // 特定のブランチに制限する場合は指定（例: 'main'）
  roleName: undefined,                  // IAMロールの名前（未指定の場合は自動生成）
  region: undefined,                    // デプロイ先のAWSリージョン
  accountId: undefined,                 // デプロイ先のAWSアカウントID
  thumbprints: [                        // GitHub Actions OIDCプロバイダーのサムプリント
    '6938fd4d98bab03faadb97b34396831e3780aea1',
    '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
  ]
};
```

2. CDKをデプロイします。

```bash
cd cdk
npm install
npx cdk deploy
```

3. デプロイが完了すると、以下の出力値が表示されます：
   - `GitHubOidcStack.GitHubActionsRoleArn` - GitHub Actionsで使用するIAMロールのARN

### 2. GitHub側の設定

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」に移動します。

2. 以下のシークレットを追加します：
   - `AWS_ROLE_TO_ASSUME`: CDKデプロイ時に出力された`GitHubOidcStack.GitHubActionsRoleArn`の値

3. `.github/workflows/claude.yaml` を参照してください。claude.yaml の中の`aws-region: us-west-2`、`model: "us.anthropic.claude-3-7-sonnet-20250219-v1:0"`を必要に応じて変更してください。

## 使用方法

設定が完了すると、以下の方法でClaude AIを利用できます：

### PR自動レビュー

プルリクエストが作成されたときに自動的にコードレビューが実行されます。レビュー結果はプルリクエストのコメントとして表示されます。

### Claude Code Action

Claude Code Actionは以下のイベントで起動します：

1. **Issueでの利用**
   - Issue作成時に本文に `@claude` を含める
   - Issueコメントで `@claude` と記述する

2. **プルリクエストでの利用**
   - PR作成時に本文に `@claude` を含める
   - PRの更新時（新しいコミットがプッシュされた時）に `@claude` を含める
   - PRにコメントで `@claude` と記述する
   - PRの特定のコード行にレビューコメントで `@claude` と記述する
   - PRレビュー時のコメントで `@claude` と記述する

Claude Code Actionは、コードの生成や修正、質問への回答など、様々なタスクに対応できます。例えば：

- 「このコードのバグを修正して」
- 「このAPIの使い方を説明して」
- 「このコードをリファクタリングして」
- 「このコードにテストを追加して」

などの指示を出すことができます。

## カスタマイズ

### PR自動レビューのカスタマイズ

`bedrock_light_model`と`bedrock_heavy_model`のパラメータを変更することで、使用するClaudeモデルをカスタマイズできます。また、`language`パラメータを変更することで、レビューの言語を変更できます。

### Claude Code Actionのカスタマイズ

`model`パラメータを変更することで、使用するClaudeモデルをカスタマイズできます。また、特定のユーザーのみがClaudeを呼び出せるように制限することもできます。

### CLAUDE.mdによるカスタマイズ

リポジトリのルートディレクトリに`CLAUDE.md`ファイルを作成することで、Claude Code Actionの動作をさらにカスタマイズできます。このファイルには、Claudeの応答スタイルや特定のコーディング規約、プロジェクト固有の指示などを記述できます。

#### CLAUDE.mdの作成方法

1. リポジトリのルートディレクトリに`CLAUDE.md`ファイルを作成します。
2. 以下のようなセクションを含めることができます：

```markdown
# CLAUDE.md

## Character
- 応答のトーンや言葉遣いの指定（例：「関西弁で応答する」など）
- コメントスタイルの指定

## Architecture
- プロジェクトのアーキテクチャに関する情報
- 使用するAWSサービスやリージョンの指定

## Documentation
- ドキュメント作成のガイドライン
- 使用する言語や形式の指定

## Implementation
- コーディング規約
- 命名規則
- テスト方針

## Tool Use
- 特定のツールの使用方法
- 環境設定に関する情報
```

#### 使用例

```markdown
# CLAUDE.md

## Character
- ユーザーとの対話には関西弁を使ってください
- プログラム内のコメントは英語で記載してください

## Architecture
- AWS に関する相談事項については、必要に応じて MCP サーバーで根拠となるドキュメント検索をしてください
- 基本は AWS 北部バージニアやオレゴンリージョンを利用します

## Implementation
- 実装コードは省略せず、完全な形で提供する
- 大きな実装作業に入る前に、方針についてユーザーに説明して同意を求める
```

Claude Code Actionは、リポジトリ内に`CLAUDE.md`ファイルが存在する場合、自動的にその内容を読み取り、指示に従って応答します。これにより、プロジェクト固有の要件やスタイルに合わせたAIアシスタントの動作が実現できます。

## トラブルシューティング

- **OIDC認証エラー**: AWS IAMロールのARNが正しく設定されているか確認してください
- **モデルアクセスエラー**: 指定したBedrockモデルへのアクセス権があるか確認してください
- **リージョンエラー**: Bedrockがサポートされているリージョンであるかを確認してください

## 参考資料

- [GitHub Actions で OIDC を使用して AWS 認証を行う](https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws)
- [プルリクしたら Bedrock にコードレビューしてもらいたい](https://zenn.dev/ryoyoshii/articles/b394253dd09d0a)
- [ClaudeCode＋Amazon BedrockをGitHub Actionsで動かす](https://zenn.dev/watany/articles/a734e058747550)
- [AI-based PR reviewer and summarizer w/ Amazon Bedrock Claude](https://github.com/tmokmss/bedrock-pr-reviewer)
- [Claude Code GitHub Actions](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Using Claude Code with Bedrock Backend](https://3sztof.github.io/posts/using-claude-code-with-bedrock/)

## ユースケース

Claude Code Actionを活用できる具体的なシナリオをいくつか紹介します：

### コードレビュー・支援

- **PRの自動レビュー**: プルリクエストが作成されたときに、コードの品質、バグ、セキュリティ問題などを自動的にチェック
- **コードスタイルの改善提案**: コーディング規約に沿っていない部分を指摘し、修正案を提示
- **ドキュメント不足の検出**: コメントやドキュメントが不足している箇所を特定し、追加案を提案
- **パフォーマンス改善の提案**: パフォーマンスに影響する可能性のあるコードパターンを特定し、最適化案を提示

### 開発支援

- **バグ修正の実装**: 「このバグを修正して」と指示するだけで、Claudeが修正コードを提案
- **テストコードの生成**: 既存のコードに対するユニットテストやE2Eテストの自動生成
- **リファクタリングの実施**: 複雑なコードをより読みやすく保守しやすい形に改善
- **新機能の実装サポート**: 「〇〇の機能を追加して」という指示から基本的な実装を提案

### ドキュメント作成・管理

- **READMEの自動更新**: コードの変更に合わせてドキュメントを自動的に更新
- **APIドキュメントの生成**: コードからAPIエンドポイントの仕様を抽出してドキュメント化
- **使用例の作成**: 新しい機能やAPIの使用例を自動的に生成
- **変更履歴の要約**: PRの内容を分かりやすく要約し、CHANGELOGに追加できる形式で提供

### チーム協業の効率化

- **新メンバーのオンボーディング支援**: コードベースについての質問に回答し、理解を促進
- **コードの説明**: 複雑なコードブロックの動作や意図を詳細に説明
- **技術的な質問への回答**: アーキテクチャやデザインパターンに関する質問に回答
- **コードの移行支援**: 古いAPIや非推奨機能から新しいものへの移行方法を提案

### 自動化タスク

- **依存関係の更新**: セキュリティアップデートが必要なパッケージの更新PRを自動作成
- **コード整形の自動化**: コードスタイルの一貫性を保つための自動フォーマット
- **TODOコメントの実装**: コード内のTODOコメントを検出し、実装案を提案
- **デプロイ前チェック**: リリース前の最終チェックとして、潜在的な問題を特定

これらのユースケースは、`@claude`メンションや`claude-review`ラベルを使って簡単に実行できます。また、特定のファイルパスやユーザーに対して自動的に実行するようにワークフローをカスタマイズすることも可能です。
## 機能と制限

### Claudeができること

- **単一コメントでの応答**: Claudeは初期コメントを更新して進捗状況や結果を表示します
- **質問への回答**: コードを分析して詳細な説明を提供します
- **コード変更の実装**: リクエストに基づいて簡単から中程度の複雑さのコード変更を行います
- **プルリクエストの準備**: ブランチにコミットを作成し、PR作成ページへのリンクを提供します
- **コードレビュー**: PR変更を分析して詳細なフィードバックを提供します
- **スマートなブランチ処理**:
  - **Issue上でトリガーされた場合**: 作業用の新しいブランチを作成します
  - **オープンPR上でトリガーされた場合**: 既存のPRブランチに直接プッシュします
  - **クローズドPR上でトリガーされた場合**: 元のブランチがアクティブでないため、新しいブランチを作成します

### Claudeができないこと

- **PRレビューの提出**: Claudeは正式なGitHub PRレビューを提出できません
- **PRの承認**: セキュリティ上の理由から、Claudeはプルリクエストを承認できません
- **複数コメントの投稿**: Claudeは初期コメントの更新のみで動作します
- **コンテキスト外のコマンド実行**: トリガーされたリポジトリとPR/issueコンテキストにのみアクセスできます
- **任意のBashコマンドの実行**: デフォルトでは、`allowed_tools`設定で明示的に許可されていない限り、Bashコマンドを実行できません
- **CI/CDの結果の閲覧**: 追加のツールやMCPサーバーが設定されていない限り、CIシステム、テスト結果、ビルドログにアクセスできません
- **ブランチ操作の実行**: コミットのプッシュ以外のブランチのマージ、リベース、その他のgit操作を実行できません
## テトリスプロジェクト

`tetris/`ディレクトリには、Claude Code Actionsの動作確認用のテトリスゲーム実装が含まれています。このプロジェクトは、GitHub上でClaude Code Actionsを使用した際の挙動や機能を検証するための実践的なサンプルとして作成されました。

### 目的

- Claude Code Actionsによるコードレビュー機能の確認
- コード修正提案の精度と適切さの検証
- モジュール化されたコードに対するClaudeの理解度の確認
- 複雑なJavaScriptプロジェクトでのClaudeの動作検証

### 機能

- Tailwind CSSを使用したモダンなUI
- モジュール化されたJavaScriptコード構造
- 基本的なテトリス機能に加え、ゴーストピース、ホールド機能などの追加機能
- バージョン管理ルールを含むCLAUDE.mdファイル

詳細は `tetris/README.md` を参照してください。
