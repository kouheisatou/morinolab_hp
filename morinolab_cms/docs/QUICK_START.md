# GitHub OAuth 設定 - クイックスタート

**所要時間**: 約5分

## 🚀 今すぐ始める

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
   Homepage URL: http://localhost
   Authorization callback URL: http://localhost:3000/auth/callback
   ```

3. **Client Secretを取得**
   - **Register application**をクリック
   - **Generate a new client secret**をクリック
   - 表示されたSecretをコピー（⚠️一度しか表示されません）

### 2. アプリに設定（1分）

1. **設定ファイルを開く**
   ```bash
   open morinolab_cms/src/github-config.ts
   ```

2. **Client Secretを貼り付け**
   ```typescript
   return {
     clientId: 'Ov23liUjpAYO8cq7oF3O',
     clientSecret: 'YOUR_GITHUB_CLIENT_SECRET' // ← ここに貼り付け
   };
   ```

### 3. アプリを起動（1分）

```bash
cd morinolab_cms
npm run start
```

### 4. セットアップ完了

✅ 初回セットアップ画面が表示されます  
✅ 「GitHubでログイン」ボタンをクリック  
✅ リポジトリを選択してクローン  

## 🔧 設定に問題がある場合

### ❌ エラー: "GitHub OAuth設定が正しくありません"

**解決方法**: `github-config.ts`のClient Secretを確認

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
- [ ] Client Secret取得済み
- [ ] `github-config.ts`に設定済み
- [ ] Callback URL設定済み
- [ ] アプリケーション起動済み

## 💡 ヒント

- **セキュリティ**: Client SecretをGitにコミットしないでください
- **権限**: repoとuser権限が必要です
- **ポート**: 3000番ポートが使用可能であることを確認
- **ブラウザ**: デフォルトブラウザが設定されていることを確認

---

**詳細な設定方法**: `OAUTH_SETUP_GUIDE.md` を参照してください。 