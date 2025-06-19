# GitHub OAuth アプリケーション設定ガイド

## 概要

このアプリケーションはGitHub OAuth認証を使用してリポジトリにアクセスします。この機能を使用するために、GitHub OAuth Appの作成と設定が必要です。

## 前提条件

- GitHubアカウント
- 管理者権限（OAuth Appを作成するため）

## ステップ1: GitHub OAuth Appの作成

### 1.1 GitHub設定ページにアクセス

1. GitHubにログインします
2. 以下のURLにアクセスします：
   ```
   https://github.com/settings/developers
   ```
   または
   - 右上のプロフィール写真をクリック
   - **Settings** を選択
   - 左サイドバーの **Developer settings** をクリック

### 1.2 OAuth Appを作成

1. **OAuth Apps** タブをクリック
2. **New OAuth App** ボタンをクリック
3. 以下の情報を入力：

| フィールド | 値 | 説明 |
|-----------|-----|------|
| **Application name** | `Morinolab CMS` | アプリケーションの表示名 |
| **Homepage URL** | `http://localhost` | アプリケーションのホームページURL |
| **Application description** | `Content Management System for Morinolab` | 任意の説明 |
| **Authorization callback URL** | `http://localhost:3000/auth/callback` | **重要**: 必ずこのURLを設定 |

4. **Register application** ボタンをクリック

### 1.3 認証情報を取得

OAuth App作成後、以下の情報が表示されます：

- **Client ID**: `Ov23liUjpAYO8cq7oF3O` (既に設定済み)
- **Client Secret**: **Generate a new client secret** をクリックして取得

⚠️ **重要**: Client Secretは一度しか表示されません。必ずコピーして安全な場所に保存してください。

## ステップ2: アプリケーションへの設定

### 2.1 Client Secretの設定

1. `morinolab_cms/src/github-config.ts` ファイルを開きます

2. 以下の行を見つけます：
   ```typescript
   return {
     clientId: 'Ov23liUjpAYO8cq7oF3O', // 設定済み
     clientSecret: 'YOUR_GITHUB_CLIENT_SECRET' // ← ここを変更
   };
   ```

3. `'YOUR_GITHUB_CLIENT_SECRET'` を取得したClient Secretに置き換えます：
   ```typescript
   return {
     clientId: 'Ov23liUjpAYO8cq7oF3O',
     clientSecret: 'ghs_xxxxxxxxxxxxxxxxxxxxxxxxxxxx' // 実際のSecretを設定
   };
   ```

### 2.2 設定の検証

正しく設定されているかを確認するため、以下のコマンドでビルドします：

```bash
npm run build
```

エラーが出ず、ビルドが成功すれば設定完了です。

## ステップ3: アプリケーションの使用

### 3.1 アプリケーション起動

```bash
npm run start
```

### 3.2 初回セットアップ

1. アプリケーション起動後、初回セットアップ画面が表示されます
2. **ローカルクローン先** を設定（デフォルト: `/tmp/github-cms-repo`）
3. **「GitHubでログイン」** ボタンをクリック
4. ブラウザが自動的に開き、GitHub認証画面が表示されます
5. GitHubでログインし、アプリケーションへのアクセスを承認
6. リポジトリ一覧から連携したいリポジトリを選択
7. クローンが完了するまで待機

## セキュリティに関する重要な注意事項

### 開発環境

- Client SecretをGitにコミットしないでください
- 必要に応じて `.gitignore` を更新してください

### 本番環境

環境変数を使用することを強く推奨します：

```bash
export GITHUB_CLIENT_ID="Ov23liUjpAYO8cq7oF3O"
export GITHUB_CLIENT_SECRET="your_actual_client_secret"
```

## トラブルシューティング

### 問題1: "GitHub OAuth設定が正しくありません"

**原因と解決方法:**
- Client Secretが設定されていない → `github-config.ts` を確認
- Client Secretが間違っている → GitHubで再生成
- Client Secretに余分な文字が含まれている → 文字列をクリーンアップ

### 問題2: OAuth認証が失敗する

**原因と解決方法:**
- Callback URLが間違っている → `http://localhost:3000/auth/callback` を確認
- Client IDとSecretの組み合わせが間違っている → GitHub設定を再確認
- OAuth Appが無効化されている → GitHub設定で有効化

### 問題3: ブラウザが開かない

**原因と解決方法:**
- ポート3000が使用中 → 他のアプリケーションを終了
- ファイアウォールがブロック → ローカル接続を許可
- ブラウザの設定問題 → デフォルトブラウザを確認

### 問題4: リポジトリ一覧が空

**原因と解決方法:**
- GitHub権限が不足 → OAuth Appの権限スコープを確認
- 非公開リポジトリが表示されない → OAuth承認時に権限を確認
- ネットワーク接続問題 → インターネット接続を確認

## OAuth Appの権限について

このアプリケーションは以下の権限を要求します：

- **repo**: リポジトリの読み書きアクセス
- **user**: ユーザー情報の読み取り

これらの権限は、リポジトリのクローン、コミット、プッシュ操作に必要です。

## 設定例

### 完全な設定例

```typescript
// github-config.ts
export const getGitHubOAuthConfig = (): GitHubOAuthConfig => {
  return {
    clientId: 'Ov23liUjpAYO8cq7oF3O',
    clientSecret: 'ghs_1234567890abcdef1234567890abcdef12345678' // 実際の値
  };
};
```

### GitHub OAuth App設定画面

```
Application name: Morinolab CMS
Homepage URL: http://localhost
Application description: Content Management System for Morinolab
Authorization callback URL: http://localhost:3000/auth/callback
```

## サポート

設定に関して問題が発生した場合：

1. このドキュメントのトラブルシューティングセクションを確認
2. GitHub OAuth App設定を再確認
3. アプリケーションのログを確認
4. 必要に応じてOAuth Appを再作成

## セキュリティベストプラクティス

1. **Client Secretの管理**
   - 安全な場所に保存
   - 定期的にローテーション
   - 不要になったら無効化

2. **アクセス権限**
   - 最小権限の原則を適用
   - 不要な権限は付与しない
   - 定期的に権限を見直し

3. **監査**
   - OAuth Appのアクセスログを確認
   - 不審なアクティビティを監視
   - セキュリティインシデント対応計画を準備 