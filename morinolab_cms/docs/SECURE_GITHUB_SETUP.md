# セキュアなGitHub認証設定ガイド

> **新機能**: セキュリティ強化されたGitHub認証システム  
> **最終更新**: 2024年12月

## 🔐 概要

このガイドでは、暗号化された設定ファイルを使用する新しいセキュアなGitHub認証システムの設定方法を説明します。

### 主な改善点

- ✅ **暗号化保存**: Client Secretが暗号化されて保存
- ✅ **多層セキュリティ**: 複数の設定方法をサポート
- ✅ **自動化**: セットアップスクリプトによる簡単設定
- ✅ **キャッシュバスト**: 古いUI表示問題を解決
- ✅ **プラットフォーム対応**: Windows/Mac/Linux対応

## 🚀 クイックスタート（推奨）

### 前提条件

- GitHub OAuth アプリケーションの作成
- Node.js環境のセットアップ

### ステップ1: GitHub OAuth アプリケーション作成

1. **GitHub設定にアクセス**
   ```
   https://github.com/settings/developers
   ```

2. **新しいOAuth Appを作成**
   - **OAuth Apps** → **New OAuth App**
   - 以下の設定を入力：

   | フィールド | 値 |
   |-----------|-----|
   | Application name | `Morinolab CMS` |
   | Homepage URL | `https://github.com/your-org/morinolab_hp` |
   | Authorization callback URL | `http://localhost:3000/auth/callback` |

3. **認証情報を取得**
   - **Register application** をクリック
   - **Client ID** をコピー
   - **Generate a new client secret** をクリックして **Client Secret** をコピー

### ステップ2: セキュア設定の実行

```bash
cd morinolab_cms

# 直接指定による設定
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### ステップ3: 設定確認とビルド

```bash
# ビルド実行（設定も含まれます）
npm run build

# アプリケーション起動
npm run start
```

## 🔧 詳細設定方法

### セットアップスクリプトの使用

#### 設定の実行
```bash
# 直接指定
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### 設定ファイルの確認

設定が正しく保存されたか確認：

```bash
# 設定ファイルの存在確認
ls -la morinolab_cms/config/

# 設定の検証
node -e "
const { SecureGitHubConfig } = require('./dist/config-manager');
const config = new SecureGitHubConfig();
config.isConfigured().then(configured => {
  console.log('設定済み:', configured);
});
"
```

## 🏗️ ビルドとパッケージング

### 開発ビルド

```bash
npm run build          # TypeScript + 設定ファイルコピー
npm run start          # 開発実行
npm run dev           # 開発モード（DevTools付き）
```

### パッケージング

```bash
npm run package       # プラットフォーム用パッケージ作成
npm run make          # 配布用バイナリ作成
```

### CI/CDでの使用

```yaml
# GitHub Actions例
- name: Setup GitHub OAuth
  env:
    GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
    GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
  run: |
    cd morinolab_cms
    npm run setup-github

- name: Build Application
  run: |
    cd morinolab_cms
    npm run build
    npm run package
```

## 🔐 セキュリティ機能

### 暗号化システム

新しいシステムでは以下のセキュリティ機能を実装：

- **AES-256-GCM暗号化**: 認証情報の安全な保存
- **PBKDF2キー導出**: 100,000回の反復によるキー強化
- **改ざん検出**: 認証タグによる完全性確認
- **プラットフォーム固有**: OS/アーキテクチャ依存の暗号化

詳細は [SECURITY_GUIDE.md](SECURITY_GUIDE.md) をご覧ください。

### 設定の優先順位

1. **ユーザー設定** - アプリ内で設定された認証情報
2. **ビルド時設定** - セットアップスクリプトで作成
3. **環境変数** - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
4. **フォールバック** - 開発用デフォルト値

### セキュリティベストプラクティス

```bash
# ✅ セキュア: 直接指定で設定
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET

# ⚠️ 注意: コマンド履歴に残る可能性があります
# 機密性の高い環境では実行後に履歴をクリア
```

## 🧪 アプリケーション内での設定

### 初回セットアップ

1. アプリケーション起動
2. 設定状態の自動確認
3. 必要に応じてセットアップガイド表示
4. OAuth認証の実行

### 設定管理UI

アプリケーション内で以下の操作が可能：

- 設定状態の確認
- 新しい認証情報の保存
- 設定のリセット
- セットアップガイドの表示

## 🐛 トラブルシューティング

### 設定関連のエラー

#### "GitHub OAuth設定が正しくありません"

**原因と解決策**:
```bash
# 設定をリセットして再実行
rm -rf config/github-oauth.enc
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

#### "設定ファイルが見つかりません"

**解決策**:
```bash
# 設定ディレクトリを作成してセットアップを実行
mkdir -p config
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### ビルド関連のエラー

#### "config/github-oauth.enc not found"

**解決策**:
```bash
# ビルド前にセットアップを実行
npm run setup-github
npm run build
```

#### "Build-time GitHub config loaded successfully" が表示されない

**解決策**:
```bash
# 設定ファイルの確認
ls -la config/
ls -la dist/config/

# 設定を再作成
npm run setup-github
npm run build
```

### 認証関連のエラー

#### OAuth認証が失敗する

**チェック項目**:
1. Client IDとClient Secretの正確性
2. Callback URL: `http://localhost:3000/auth/callback`
3. OAuth Appの有効性
4. ネットワーク接続

```bash
# 設定の検証
node -e "
const config = require('./dist/github-config');
config.getGitHubOAuthConfig().then(c => {
  console.log('Client ID:', c?.clientId?.substring(0, 8) + '...');
  console.log('Has Secret:', Boolean(c?.clientSecret));
});
"
```

## 📁 ファイル構成

```
morinolab_cms/
├── config/
│   └── github-oauth.enc          # 暗号化された設定（除外対象）
├── src/
│   ├── config-manager.ts         # 暗号化設定管理
│   ├── github-config.ts          # 設定読み込み
│   ├── github-service.ts         # GitHub API
│   └── main.ts                   # メインプロセス
├── dist/
│   └── config/
│       └── github-oauth.enc      # ビルド済み設定
├── setup-github-config.js        # セットアップスクリプト
└── docs/
    └── SECURE_GITHUB_SETUP.md    # このファイル
```

## 🔄 設定の移行

### 旧設定からの移行

既存の `github-config.ts` ハードコード設定から移行：

```bash
# 1. 現在の設定を確認
grep -n "clientSecret" src/github-config.ts

# 2. セットアップスクリプトで新設定作成
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET

# 3. ビルドして確認
npm run build
npm run start
```

### 設定のバックアップ

```bash
# 設定のバックアップ
cp config/github-oauth.enc config/github-oauth.enc.backup

# 設定の復元
cp config/github-oauth.enc.backup config/github-oauth.enc
npm run build
```

## 🚀 GitHub Actionsでの自動化

### ワークフロー設定例

```yaml
name: Build with Secure Config

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup GitHub OAuth
      env:
        GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
        GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
      run: |
        cd morinolab_cms
        npm run setup-github
    
    - name: Build application
      run: |
        cd morinolab_cms
        npm run build
        npm run package
```

### シークレット設定

GitHub リポジトリで以下のシークレットを設定：

- `GITHUB_CLIENT_ID`: OAuth アプリのClient ID
- `GITHUB_CLIENT_SECRET`: OAuth アプリのClient Secret

## 📚 関連ドキュメント

- **[OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md)** - 基本的なOAuth設定
- **[GITHUB_INTEGRATION.md](GITHUB_INTEGRATION.md)** - GitHub統合機能
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - 開発環境設定
- **[QUICK_START.md](QUICK_START.md)** - クイックスタート

## 💡 よくある質問

### Q: 設定ファイルをGitにコミットしても大丈夫？

A: **いいえ**。`config/github-oauth.enc` は暗号化されていますが、`.gitignore` で除外しています。セキュリティのため、認証情報は常に個別に設定してください。

### Q: 複数の環境で同じ設定を使い回せますか？

A: **はい**。暗号化ファイルは環境間で共有可能ですが、セキュリティの観点から環境ごとに異なるOAuth Appの使用を推奨します。

### Q: Client Secretを紛失した場合は？

A: GitHub OAuth App設定で新しいClient Secretを生成し、セットアップスクリプトを再実行してください。

### Q: パフォーマンスへの影響は？

A: 設定の復号化は初回読み込み時のみ実行され、その後はメモリにキャッシュされるため、パフォーマンスへの影響は最小限です。

---

**トラブルが解決しない場合は、[GitHub Issues](https://github.com/your-org/morinolab_hp/issues) で報告してください。** 