# Bedrock Claude Code Action Reviewer

[Claude Code Action](https://github.com/anthropics/claude-code-action) と [Amazon Bedrock](https://aws.amazon.com/jp/bedrock/) を使用した、Issue 対応 & コードレビューのサンプル実装です。

## 動作例
- Issue 対応:  [テトリスの機能追加案を考える #1](https://github.com/ymhiroki/bedrock-claude-code-action-reviewer/issues/1)
- コードレビュー: [テトリスにカスタムテーマ機能を実装 #3](https://github.com/ymhiroki/bedrock-claude-code-action-reviewer/pull/3)

## リポジトリ構成

このリポジトリは以下のような構成になっています：

```
bedrock-claude-code-action-reviewer/
├── .github/workflows/          # GitHub Actions ワークフロー定義
│   ├── claude.yaml             # Claude Code Action の設定
│   └── static.yml              # GitHub Pages デプロイ用設定
├── cdk/                        # AWS CDK プロジェクト
│   ├── bin/                    # CDK アプリケーションのエントリーポイント
│   ├── lib/                    # CDK スタック定義
│   │   ├── github-oidc-stack.ts  # GitHub OIDC 認証用スタック
│   │   └── parameters.ts       # 設定パラメータ
│   └── test/                   # テストコード
├── tetris/                     # テトリスゲーム実装（サンプルプロジェクト）
│   ├── js/                     # JavaScript モジュール
│   │   ├── board.js           # ゲームボード管理
│   │   ├── game.js            # ゲームロジック
│   │   ├── pieces.js          # テトリスピース定義
│   │   ├── renderer.js        # 描画処理
│   │   ├── ui.js              # ユーザーインターフェース
│   │   └── utils.js           # ユーティリティ関数
│   ├── index.html             # メインHTML
│   ├── script.js              # メインスクリプト
│   ├── style.css              # スタイルシート
│   └── README.md              # テトリスプロジェクトの説明
├── CLAUDE.md                   # Claude の動作カスタマイズ設定
└── README.md                   # プロジェクト全体の説明
```

### 主要コンポーネント

1. **GitHub Actions 設定**

   - `claude.yaml`: Issue や PR で `@claude` とメンションされた時に Claude Code Action を実行
   - `static.yml`: テトリスゲームを GitHub Pages にデプロイ

2. **CDK プロジェクト**

   - GitHub Actions から AWS Bedrock にアクセスするための IAM ロールを作成と OIDC 設定を実施

3. **テトリスプロジェクト**
   - Claude Code Actions の動作確認用のサンプル実装
   - モジュール化された JavaScript コードで構成

## セットアップ方法

### 1. AWS 側の設定

このプロジェクトには、GitHub Actions から Amazon Bedrock を利用するための CDK スタックが含まれています。
CDK の利用方法については [AWS CDK で使用する環境を設定する](https://docs.aws.amazon.com/ja_jp/cdk/v2/guide/configure-env.html) をご確認ください。

#### CDK のデプロイ

1. `cdk/lib/parameters.ts` ファイルを編集して、GitHub のユーザー名とリポジトリ名を設定します。

```typescript
export const GitHubOidcParameters = {
  gitHubOwner: "your-github-username", // GitHubのユーザー名またはOrganization名
  gitHubRepo: "your-github-repo", // GitHubのリポジトリ名
  gitHubBranch: undefined, // 特定のブランチに制限する場合は指定（例: 'main'）
  roleName: undefined, // IAMロールの名前（未指定の場合は自動生成）
  region: undefined, // デプロイ先のAWSリージョン
  accountId: undefined, // デプロイ先のAWSアカウントID
};
```

2. CDK をデプロイします。

```bash
cd cdk
npm install
cdk deploy
```

3. デプロイが完了すると、以下の出力値が表示されます：
   - `GitHubOidcStack.GitHubActionsRoleArn` - GitHub Actions で使用する IAM ロールの ARN

### 2. GitHub 側の設定

1. GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」に移動します。

2. Repository secrets に以下のシークレットを追加します：

   - `AWS_ROLE_TO_ASSUME`: CDK デプロイ時に出力された `GitHubOidcStack.GitHubActionsRoleArn` の値

3. `.github/workflows/claude.yaml` を参照し、Claude Code Action を利用したいリポジトリのワークフローを設定します。
   - claude.yaml の中の`aws-region: us-west-2`, `model: "us.anthropic.claude-3-7-sonnet-20250219-v1:0"`を必要に応じて変更してください。
   - 対応しているモデルおよび推論プロファイルは [Supported Regions and models for inference profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html) から確認できます。
     - US Claude Sonnet 4: `us.anthropic.claude-sonnet-4-20250514-v1:0`
     - US Claude Opus 4: `us.anthropic.claude-opus-4-20250514-v1:0`

## 利用方法

Claude Code Action は以下のイベントで起動します：

1. **Issue での利用**

   - Issue 作成時に本文に `@claude` を含める
   - Issue コメントで `@claude` と記述する

2. **プルリクエストでの利用**
   - PR 作成時に本文 (descriptions) に `@claude` を含める
   - PR にコメントで `@claude` と記述する
   - PR の特定のコード行にレビューコメントで `@claude` と記述する
   - PR レビュー時のコメントで `@claude` と記述する

Claude Code Action は、コードの生成や修正、質問への回答など、様々なタスクに対応できます。例えば：

- 「このコードのバグを修正して」
- 「この API の使い方を説明して」
- 「このコードをリファクタリングして」
- 「このコードにテストを追加して」

などの指示を出すことができます。

## カスタマイズ

### Claude Code Action のカスタマイズ

[Claude Code Action のドキュメント](https://github.com/anthropics/claude-code-action?tab=readme-ov-file#inputs) を参考にカスタマイズできます。

### CLAUDE.md によるカスタマイズ

リポジトリのルートディレクトリに`CLAUDE.md`ファイルを作成することで、Claude Code Action の動作をさらにカスタマイズできます。このファイルには、Claude の応答スタイルや特定のコーディング規約、プロジェクト固有の指示などを記述できます。

#### CLAUDE.md の作成方法

リポジトリのルートディレクトリに`CLAUDE.md`ファイルを作成します。
本リポジトリにも [CLAUDE.md](https://github.com/ymhiroki/bedrock-claude-code-action-reviewer/blob/main/CLAUDE.md) が含まれます。

## トラブルシューティング

- **OIDC 認証エラー**: Repository Secrets に IAM ロールの ARN が正しく設定されているか確認してください
- **モデルアクセスエラー**: 指定した Bedrock モデルへのアクセス権があるか確認してください
- **リージョンエラー**: Bedrock がサポートされているリージョンであるかを確認してください

## ユースケース

Claude Code Action を活用できる具体的なシナリオをいくつか紹介します：

### コードレビュー・支援

- **PR の自動レビュー**: プルリクエストが作成されたときに、コードの品質、バグ、セキュリティ問題などを自動的にチェック
- **コードスタイルの改善提案**: コーディング規約に沿っていない部分を指摘し、修正案を提示
- **ドキュメント不足の検出**: コメントやドキュメントが不足している箇所を特定し、追加案を提案
- **パフォーマンス改善の提案**: パフォーマンスに影響する可能性のあるコードパターンを特定し、最適化案を提示

### 開発支援

- **バグ修正の実装**: 「このバグを修正して」と指示するだけで、Claude が修正コードを提案
- **テストコードの生成**: 既存のコードに対するユニットテストや E2E テストの自動生成
- **リファクタリングの実施**: 複雑なコードをより読みやすく保守しやすい形に改善
- **新機能の実装サポート**: 「〇〇の機能を追加して」という指示から基本的な実装を提案

### ドキュメント作成・管理

- **README の自動更新**: コードの変更に合わせてドキュメントを自動的に更新
- **API ドキュメントの生成**: コードから API エンドポイントの仕様を抽出してドキュメント化
- **使用例の作成**: 新しい機能や API の使用例を自動的に生成
- **変更履歴の要約**: PR の内容を分かりやすく要約し、CHANGELOG に追加できる形式で提供

### チーム協業の効率化

- **新メンバーのオンボーディング支援**: コードベースについての質問に回答し、理解を促進
- **コードの説明**: 複雑なコードブロックの動作や意図を詳細に説明
- **技術的な質問への回答**: アーキテクチャやデザインパターンに関する質問に回答
- **コードの移行支援**: 古い API や非推奨機能から新しいものへの移行方法を提案

### 自動化タスク

- **依存関係の更新**: セキュリティアップデートが必要なパッケージの更新 PR を自動作成
- **コード整形の自動化**: コードスタイルの一貫性を保つための自動フォーマット
- **TODO コメントの実装**: コード内の TODO コメントを検出し、実装案を提案
- **デプロイ前チェック**: リリース前の最終チェックとして、潜在的な問題を特定

これらのユースケースは、`@claude`メンションを使って簡単に実行できます。また、特定のファイルパスやユーザーに対して自動的に実行するようにワークフローをカスタマイズすることも可能です。

## テトリスプロジェクト

`tetris/`ディレクトリには、Claude Code Actions の動作確認用のテトリスゲーム実装が含まれています。このプロジェクトは、GitHub 上で Claude Code Actions を使用した際の挙動や機能を検証するための実践的なサンプルとして作成されました。

こちらのリンクから遊べます: [GitHub Pages](https://ymhiroki.github.io/bedrock-claude-code-action-reviewer/)

詳細は `tetris/README.md` を参照してください。

## 参考資料

- [GitHub Actions で OIDC を使用して AWS 認証を行う](https://zenn.dev/kou_pg_0131/articles/gh-actions-oidc-aws)
- [プルリクしたら Bedrock にコードレビューしてもらいたい](https://zenn.dev/ryoyoshii/articles/b394253dd09d0a)
- [ClaudeCode ＋ Amazon Bedrock を GitHub Actions で動かす](https://zenn.dev/watany/articles/a734e058747550)
- [AI-based PR reviewer and summarizer w/ Amazon Bedrock Claude](https://github.com/tmokmss/bedrock-pr-reviewer)
- [Claude Code GitHub Actions](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Using Claude Code with Bedrock Backend](https://3sztof.github.io/posts/using-claude-code-with-bedrock/)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)
