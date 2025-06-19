# GitHub統合機能ガイド

> 🔒 **推奨**: [SECURE_GITHUB_SETUP.md](SECURE_GITHUB_SETUP.md) の新しいセキュアシステムを使用してください

この機能により、CMSアプリケーションから直接GitHubリポジトリと連携し、コンテンツの編集後にワンボタンでコミット・プッシュが可能になります。

## 機能概要

- **ブラウザベースOAuth認証**: GitHub OAuth Appを使用した安全な認証
- **初回セットアップ画面**: わかりやすいガイド付きセットアップ
- **リポジトリ選択**: ユーザーのリポジトリ一覧から選択
- **プログレスバー**: Mac OS 9スタイルのプログレス表示
- **自動クローン**: 選択したリポジトリの自動クローン
- **同期機能**: リモートリポジトリから最新の変更をプル
- **ワンボタンプッシュ**: 編集後の変更をコミット・プッシュ

## セットアップ手順

### 1. GitHub OAuth アプリケーションの作成

1. GitHubにログインし、Settings > Developer settings > OAuth Apps に移動
2. "New OAuth App" をクリック
3. 以下の情報を入力:
   - **Application name**: 任意の名前（例: "Morinolab CMS"）
   - **Homepage URL**: `http://localhost` または実際のサイトURL
   - **Authorization callback URL**: `http://localhost:3000/auth/callback`
   - **Application description**: 任意の説明
4. "Register application" をクリック
5. **Client ID** と **Client Secret** をコピー（後で使用）

### 2. CMSアプリケーションでの初回セットアップ

#### 🔒 新しいセキュアシステム（推奨）

```bash
# セットアップスクリプトで自動設定（直接指定）
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
npm run build
npm run start
```

詳細は [SECURE_GITHUB_SETUP.md](SECURE_GITHUB_SETUP.md) をご覧ください。

#### 従来システム（非推奨）

1. CMSアプリケーションを起動
2. 初回起動時に自動的にセットアップ画面が表示されます
3. 以下の情報を入力:
   - **GitHub Client ID**: 作成したOAuth AppのClient ID
   - **GitHub Client Secret**: 作成したOAuth AppのClient Secret
   - **ローカルクローン先**: ローカルでのクローン先パス（例: `/tmp/github-cms-repo`）
4. 「GitHub認証を開始」ボタンをクリック
5. ブラウザが開き、GitHub認証画面が表示されます
6. GitHubでアプリケーションへのアクセスを承認
7. 認証完了後、リポジトリ一覧が表示されます
8. 連携したいリポジトリを選択
9. 「選択したリポジトリをクローン」ボタンをクリック
10. プログレスバーでクローンの進行状況を確認
11. セットアップ完了！

## 使用方法

### 初回セットアップ後

セットアップが完了すると、通常のCMS画面が表示されます：

- **同期ボタン**: リモートリポジトリから最新の変更を取得
- **コミット&プッシュボタン**: 編集した変更をリモートリポジトリにプッシュ

### コンテンツ編集フロー

1. サイドバーからコンテンツタイプを選択
2. 記事の作成・編集
3. 「同期」ボタンで最新の変更を取得（必要に応じて）
4. 「コミット&プッシュ」ボタンで変更を保存

## ユーザーインターフェース

### 初回セットアップ画面
- Mac OS 9スタイルのクラシックなデザイン
- ステップバイステップのガイド
- リアルタイムプログレス表示

### プログレスバー
- ストライプ模様のMac OS 9スタイル
- 進行状況の詳細メッセージ表示
- アニメーション効果

### リポジトリ選択
- リポジトリ一覧の見やすい表示
- プライベート/パブリックの表示
- リポジトリ説明の表示
- クリックによる選択

## セキュリティ注意事項

- OAuth認証により、Personal Access Tokenよりも安全
- Client Secretは機密情報です。他人と共有しないでください
- リダイレクトURLは正確に設定してください
- アプリケーションの権限は必要最小限に設定されます

## トラブルシューティング

### OAuth認証エラー
- Client IDとClient Secretが正しいか確認
- リダイレクトURLが `http://localhost:3000/auth/callback` に設定されているか確認
- OAuth Appが有効化されているか確認

### リポジトリが表示されない
- GitHubアカウントでリポジトリへのアクセス権限があるか確認
- 権限が適切に設定されているか確認

### クローンエラー
- ローカルパスに書き込み権限があるか確認
- ディスク容量が十分あるか確認
- インターネット接続を確認

### プッシュエラー
- リポジトリへの書き込み権限があるか確認
- ブランチが保護されていないか確認
- コンフリクトが発生していないか確認

## 技術仕様

- **認証方式**: GitHub OAuth 2.0
- **対応スコープ**: `repo`, `user`
- **Git操作**: simple-gitライブラリを使用
- **対応ブランチ**: main（デフォルト）
- **対応OS**: macOS, Windows, Linux
- **ローカルサーバー**: ポート3000でコールバック受信

## セットアップのリセット

設定をリセットする場合：
1. ブラウザの開発者ツールを開く
2. Application/Storage > Local Storage
3. `githubConfig` キーを削除
4. アプリケーションを再起動

## OAuth App設定例

```
Application name: Morinolab CMS
Homepage URL: http://localhost
Authorization callback URL: http://localhost:3000/auth/callback
Description: Content Management System for Morinolab
```

## セキュリティ設計

- OAuth 2.0による安全な認証フロー
- State パラメータによるCSRF攻撃対策
- 5分間の認証タイムアウト
- HTTPS通信（GitHubとの通信）
- ローカルストレージでの設定保存 