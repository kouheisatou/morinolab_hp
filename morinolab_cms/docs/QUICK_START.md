# GitHub OAuth 設定 - クイックスタート

> **🔥 新機能**: セキュアな設定システム対応  
> **所要時間**: 約3分

## 🚀 今すぐ始める（セキュア版）

### 1. GitHub OAuth App作成（2分）

1. **GitHub設定画面へ移動**
   ```
   https://github.com/settings/developers
   ```

2. **新しいOAuth Appを作成**
   - **OAuth Apps** → **New OAuth App**をクリック
   - 以下をコピー＆ペースト：

   ```
   Application name: Morinolab CMS
   Homepage URL: https://github.com/your-org/morinolab_hp
   Authorization callback URL: http://localhost:3000/auth/callback
   ```

3. **Client Secretを取得**
   - **Register application**をクリック
   - **Generate a new client secret**をクリック
   - 表示されたClient IDとSecretをコピー（⚠️Secretは一度しか表示されません）

### 2. セキュア設定の実行（1分）

```bash
cd morinolab_cms

# セットアップスクリプト使用（直接指定）
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

**✅ 成功メッセージ例:**
```
✅ GitHub OAuth設定が暗号化されて保存されました
📁 設定ファイル: /path/to/config/github-oauth.enc
🔒 Client Secretは暗号化されています
✅ 設定の検証が完了しました
```

### 3. アプリを起動（30秒）

```bash
npm run build
npm run start
```

### 4. セットアップ完了

✅ 初回セットアップ画面が表示されます  
✅ 「GitHubでログイン」ボタンをクリック  
✅ リポジトリを選択してクローン  

## 🔧 設定に問題がある場合

### ❌ エラー: "GitHub OAuth設定が正しくありません"

**解決方法**: セットアップスクリプトを再実行
```bash
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### ❌ エラー: "設定ファイルが見つかりません"

**解決方法**: configディレクトリを作成してセットアップ
```bash
mkdir -p config
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

### ❌ ブラウザが開かない

**解決方法**: ポート3000が使用されていないか確認
```bash
lsof -i :3000
```

### ❌ OAuth認証が失敗

**解決方法**: Callback URLが正確か確認
```
http://localhost:3000/auth/callback
```

## 📋 設定チェックリスト

- [ ] GitHub OAuth App作成済み
- [ ] Client IDとClient Secret取得済み
- [ ] セットアップスクリプト実行済み
- [ ] `✅ 設定の検証が完了しました` メッセージ確認
- [ ] Callback URL設定済み
- [ ] アプリケーション起動済み

## 🔐 セキュリティ改善点

### 🆕 新システムの利点

- **暗号化保存**: Client Secretが暗号化されて保存
- **自動設定**: セットアップスクリプトで簡単設定
- **安全な管理**: ソースコードに認証情報が含まれない
- **多層対応**: 環境変数、設定ファイル両対応

### 従来との違い

| 項目 | 従来 | 🆕 新システム |
|------|------|-------------|
| 設定方法 | ファイル編集 | セットアップスクリプト |
| セキュリティ | 平文保存 | 暗号化保存 |
| パッケージング | 手動設定 | 自動埋め込み |
| 設定確認 | 目視 | 自動検証 |

## 💡 ヒント

- **セキュリティ**: 設定ファイルは自動的に`.gitignore`されます
- **権限**: repoとuser権限が必要です
- **ポート**: 3000番ポートが使用可能であることを確認
- **ブラウザ**: デフォルトブラウザが設定されていることを確認
- **環境変数**: CI/CDでは環境変数での設定を推奨

## 🔄 旧設定からの移行

既存の `github-config.ts` 手動設定から移行する場合：

```bash
# 1. 現在の設定値を確認
grep -n "clientSecret" src/github-config.ts

# 2. セットアップスクリプトで新設定作成
npm run setup-github YOUR_CLIENT_ID YOUR_CLIENT_SECRET

# 3. ビルドして確認
npm run build
npm run start
```

## 📚 詳細ドキュメント

- **詳細な設定方法**: [SECURE_GITHUB_SETUP.md](SECURE_GITHUB_SETUP.md) 📖
- **従来の設定方法**: [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) 
- **GitHub統合機能**: [GITHUB_INTEGRATION.md](GITHUB_INTEGRATION.md)
- **環境設定**: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)

---

🔒 **セキュリティ第一**: 新しいシステムでは認証情報が安全に管理されます！ 