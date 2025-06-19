# セキュリティガイド - GitHub認証情報の安全な管理

> **重要**: このドキュメントは認証情報の安全な管理方法について説明します

## 🔐 セキュリティの重要性

GitHub OAuth認証情報（特にClient Secret）は機密情報であり、適切に管理する必要があります。

### リスク

- **情報漏洩**: Client Secretが公開されると第三者がアプリケーションを偽装可能
- **不正アクセス**: 認証情報を悪用してユーザーのリポジトリにアクセス
- **信頼失墜**: セキュリティ事故によるユーザーの信頼低下

## 🛡️ セキュアな設定システム

### 暗号化機能

新しいシステムでは以下のセキュリティ機能を実装：

```
🔒 暗号化仕様:
├── アルゴリズム: AES-256-GCM
├── キー導出: PBKDF2 (100,000回)
├── 改ざん検出: 認証タグ付き
└── プラットフォーム固有: OS/アーキテクチャ依存
```

### 設定の階層

セキュリティレベル順（高→低）：

1. **ユーザー設定** - アプリ内で暗号化保存
2. **ビルド時設定** - パッケージに暗号化埋め込み
3. **環境変数** - OS環境変数
4. **フォールバック** - 開発用（空の設定）

## 🚫 避けるべき行為

### ❌ 危険な行為

```bash
# ❌ コマンド履歴に残る
npm run setup-github your_id your_secret

# ❌ ソースコードにハードコード
clientSecret: 'ghs_xxxxxxxxxxxxxxxxxxxx'

# ❌ 平文ファイルに保存
echo "secret=ghs_xxx" > config.txt

# ❌ Gitにコミット
git add src/github-config.ts  # Client Secretが含まれる場合
```

### ⚠️ 注意が必要な行為

```bash
# ⚠️ ログに出力される可能性
console.log('Config:', config)

# ⚠️ 同じネットワーク上で傍受される可能性
export GITHUB_CLIENT_SECRET="secret"

# ⚠️ 暗号化されていても共有は慎重に
cp config/github-oauth.enc ~/shared/
```

## ✅ 推奨される方法

### 開発環境

```bash
# ✅ セットアップスクリプト使用（直接指定）
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### CI/CD環境

```yaml
# ✅ GitHub Secrets使用
env:
  GITHUB_CLIENT_ID: ${{ secrets.GITHUB_CLIENT_ID }}
  GITHUB_CLIENT_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
run: npm run setup-github
```

### 本番環境

```bash
# ✅ パッケージに暗号化埋め込み
npm run setup-github
npm run build
npm run package
```

## 🔍 セキュリティ監査

### 設定確認コマンド

```bash
# 設定状態の確認
node -e "
const { SecureGitHubConfig } = require('./dist/config-manager');
const config = new SecureGitHubConfig();
config.isConfigured().then(configured => {
  console.log('設定済み:', configured);
});
"

# 設定ファイルの存在確認
ls -la config/github-oauth.enc
ls -la dist/config/github-oauth.enc

# 権限確認
stat -c '%A %n' config/github-oauth.enc
```

### Git確認

```bash
# .gitignoreの確認
grep -n "config/github-oauth.enc" .gitignore

# 履歴にコミットされていないか確認
git log --oneline --grep="secret\|password\|token"
git log -p --all -- "*secret*" "*token*" "*password*"
```

## 🔧 セキュリティ設定

### ファイル権限

```bash
# 設定ファイルの権限を制限
chmod 600 config/github-oauth.enc  # 所有者のみ読み書き可能

# ディレクトリ権限の制限
chmod 700 config/  # 所有者のみアクセス可能
```

### 環境分離

```bash
# 開発環境用
GITHUB_CLIENT_ID="Ov23ctlbBnAjnisOSCrm_dev"

# 本番環境用
GITHUB_CLIENT_ID="Ov23ctlbBnAjnisOSCrm_prod"

# テスト環境用
GITHUB_CLIENT_ID="Ov23ctlbBnAjnisOSCrm_test"
```

## 🚨 セキュリティインシデント対応

### Client Secret漏洩時の対応

1. **即座に無効化**
   ```
   https://github.com/settings/developers
   → OAuth Apps → アプリ選択 → Revoke all user tokens
   ```

2. **新しいSecretを生成**
   ```
   Generate a new client secret
   ```

3. **設定を更新**
   ```bash
   npm run setup-github NEW_CLIENT_ID NEW_CLIENT_SECRET
   npm run build
   ```

4. **影響範囲の調査**
   - アクセスログの確認
   - 不正な操作の有無
   - 影響を受けたユーザーの特定

### 設定ファイル破損時の対応

```bash
# バックアップから復元
cp config/github-oauth.enc.backup config/github-oauth.enc

# 設定を再作成
rm -f config/github-oauth.enc
npm run setup-github

# 設定確認
npm run build
npm run start
```

## 📊 セキュリティベストプラクティス

### 定期的なメンテナンス

```bash
# 月次
# 1. Client Secretのローテーション
npm run setup-github NEW_CLIENT_ID NEW_CLIENT_SECRET

# 2. 設定のバックアップ
cp config/github-oauth.enc config/github-oauth.enc.$(date +%Y%m%d)

# 3. 古いバックアップの削除
find config/ -name "*.enc.*" -mtime +90 -delete
```

### 監査ログ

```bash
# アプリケーションログの確認
grep -i "github\|oauth\|auth" logs/app.log

# システムログの確認
grep -i "github\|oauth" /var/log/system.log
```

### アクセス制御

```bash
# 開発メンバーのみアクセス可能にする
chown :developers config/
chmod 750 config/

# 本番環境では更に制限
chmod 700 config/
```

## 🔒 暗号化の詳細

### キー導出プロセス

```typescript
// アプリケーション固有の情報からキーを生成
const appInfo = [
  app.getName(),        // アプリ名
  app.getVersion(),     // バージョン
  process.platform,     // OS
  process.arch,         // アーキテクチャ
  'secret-key-v1'       // 固定文字列
].join('|');

// PBKDF2でキーを導出
const key = crypto.pbkdf2Sync(appInfo, 'salt', 100000, 32, 'sha256');
```

### 暗号化プロセス

```typescript
// AES-256-GCM で暗号化
const cipher = crypto.createCipher('aes-256-gcm', key);
const encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
const authTag = cipher.getAuthTag();  // 改ざん検出用
```

## 📚 関連リソース

### 内部ドキュメント

- **[SECURE_GITHUB_SETUP.md](SECURE_GITHUB_SETUP.md)** - セットアップガイド
- **[QUICK_START.md](QUICK_START.md)** - クイックスタート
- **[ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)** - 環境設定

### 外部リソース

- **[GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)**
- **[OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)**
- **[Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)**

## 🎯 チェックリスト

### セットアップ時

- [ ] セキュアな設定方法を選択
- [ ] 環境変数または暗号化ファイルを使用
- [ ] ソースコードにClient Secretを含めない
- [ ] .gitignoreに設定ファイルを追加

### 運用時

- [ ] 定期的なClient Secretローテーション
- [ ] 設定ファイルのバックアップ
- [ ] アクセスログの監視
- [ ] セキュリティアップデートの適用

### インシデント対応

- [ ] インシデント対応手順の策定
- [ ] 緊急連絡先の整備
- [ ] 復旧手順の文書化
- [ ] 定期的な訓練の実施

---

**緊急時連絡先**: [GitHub Issues](https://github.com/your-org/morinolab_hp/issues) でセキュリティラベル付きで報告 