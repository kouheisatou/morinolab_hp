# GitHub OAuth設定手順

## 概要

アプリケーションにGitHub OAuth Credentialsが内蔵されており、ユーザーは認証情報を入力することなく直接GitHubログイン画面にアクセスできます。

## セットアップ手順

### 1. Client Secretの設定

現在、Client IDは既に設定済みです：
```
Client ID: Ov23liUjpAYO8cq7oF3O
```

**Client Secretを設定してください：**

1. `morinolab_cms/src/github-config.ts` ファイルを開く
2. 以下の行を見つける：
   ```typescript
   clientSecret: 'YOUR_GITHUB_CLIENT_SECRET' // ここに実際のClient Secretを設定
   ```
3. `'YOUR_GITHUB_CLIENT_SECRET'` を実際のClient Secretに置き換える

### 2. OAuth App設定の確認

GitHub OAuth Appで以下の設定が正しいことを確認してください：

- **Authorization callback URL**: `http://localhost:3000/auth/callback`
- **Client ID**: `Ov23liUjpAYO8cq7oF3O`
- **Client Secret**: 取得した値

### 3. 使用方法

Client Secretを設定後：

1. アプリケーションをビルド：
   ```bash
   npm run build
   ```

2. アプリケーションを起動：
   ```bash
   npm run start
   ```

3. 初回セットアップ画面で：
   - ローカルクローン先を設定（デフォルト: `/tmp/github-cms-repo`）
   - 「GitHubでログイン」ボタンをクリック
   - ブラウザが自動的に開いてGitHub認証画面が表示される

## セキュリティ

### 本番環境での推奨設定

本番環境では環境変数を使用することを強く推奨します：

```bash
export GITHUB_CLIENT_ID="Ov23liUjpAYO8cq7oF3O"
export GITHUB_CLIENT_SECRET="your_actual_client_secret"
```

### 設定ファイルの管理

- `github-config.ts` にはClient Secretをコミットしないでください
- 本番環境では必ず環境変数を使用してください
- 開発環境でのみハードコードを使用してください

## トラブルシューティング

### エラー: "GitHub OAuth設定が正しくありません"

- Client Secretが正しく設定されているか確認
- Client Secretの長さが10文字以上であることを確認
- 文字列にスペースや改行が含まれていないことを確認

### OAuth認証失敗

- GitHub OAuth Appの設定を確認
- Authorization callback URLが `http://localhost:3000/auth/callback` に設定されていることを確認
- Client IDとClient Secretの組み合わせが正しいことを確認

## 現在の設定状況

- ✅ Client ID設定済み
- ⏳ Client Secret設定待ち
- ✅ UIの最適化完了
- ✅ セキュリティ対策実装済み 