# 環境設定ガイド - npm run start で環境設定が読み込まれない問題の解決

## 🚨 問題の確認

`npm run start` で環境設定が読み込まれない場合の解決方法を説明します。

## 🔍 現在の状況確認

まず、現在の設定状況を確認します：

```bash
# 環境変数確認
echo $GITHUB_CLIENT_SECRET

# 設定ファイル確認
cat src/github-config.ts
```

## 🛠️ 解決方法（3つのオプション）

### **オプション1: .envファイルを使用（推奨）**

#### 1. .envファイルを作成

```bash
# .env.exampleをコピーして.envファイルを作成
cp .env.example .env
```

#### 2. .envファイルを編集

```bash
# エディタで.envを開く
open .env
```

以下の内容を実際の値に変更：

```env
GITHUB_CLIENT_ID=Ov23ctlbBnAjnisOSCrm
GITHUB_CLIENT_SECRET=実際のClient Secretをここに入力
```

#### 3. .gitignoreに追加（重要）

```bash
echo ".env" >> .gitignore
```

### **オプション2: zshrcで環境変数を設定**

#### 1. ~/.zshrcを編集

```bash
nano ~/.zshrc
```

#### 2. 以下を追加

```bash
# GitHub OAuth設定
export GITHUB_CLIENT_ID="Ov23ctlbBnAjnisOSCrm"
export GITHUB_CLIENT_SECRET="実際のClient Secretをここに入力"
```

#### 3. 設定を反映

```bash
source ~/.zshrc
```

### **オプション3: github-config.tsで直接設定**

#### 1. 設定ファイルを編集

```bash
open src/github-config.ts
```

#### 2. `YOUR_GITHUB_CLIENT_SECRET` を実際の値に変更

```typescript
return {
  clientId: 'Ov23ctlbBnAjnisOSCrm',
  clientSecret: '実際のClient Secretをここに入力' // ← ここを変更
};
```

⚠️ **注意**: この方法はセキュリティ上推奨されません。

## 🧪 設定テスト

設定後、以下で動作確認：

```bash
# アプリをビルドしてテスト
npm run build

# アプリを起動
npm run start
```

## 🔧 トラブルシューティング

### エラー: "GitHub OAuth設定が正しくありません"

**原因と解決策**:

1. **Client Secretが設定されていない**
   ```bash
   # 環境変数確認
   echo $GITHUB_CLIENT_SECRET
   ```

2. **dotenvが読み込まれていない**
   ```bash
   # dotenvインストール確認
   npm list dotenv
   ```

3. **.envファイルが読み込まれていない**
   ```bash
   # .envファイル確認
   cat .env
   ```

### エラー: "Cannot read properties of undefined"

**解決策**:

```bash
# TypeScript定義を確認
npm install --save-dev @types/node
```

### エラー: "Module not found: dotenv"

**解決策**:

```bash
# dotenvを再インストール
npm install dotenv
```

## 📋 設定チェックリスト

### オプション1（.env）使用時:
- [ ] `.env`ファイル作成済み
- [ ] Client Secret設定済み
- [ ] `.gitignore`に`.env`追加済み
- [ ] `dotenv`インストール済み

### オプション2（環境変数）使用時:
- [ ] `~/.zshrc`に設定追加済み
- [ ] `source ~/.zshrc`実行済み
- [ ] 環境変数確認済み

### オプション3（直接設定）使用時:
- [ ] `github-config.ts`編集済み
- [ ] Client Secret設定済み

## 🔒 セキュリティ重要事項

1. **Client Secretの管理**
   - ❌ Gitにコミットしない
   - ✅ `.gitignore`に`.env`を追加
   - ✅ 環境変数または`.env`ファイルを使用

2. **推奨度**
   1. `.env`ファイル（最推奨）
   2. 環境変数設定
   3. 直接設定（非推奨）

## 📞 サポート

設定に問題がある場合：

1. このドキュメントの手順を順番に実行
2. ログファイルを確認
3. アプリを再起動

---

**関連ドキュメント**:
- `OAUTH_SETUP_GUIDE.md` - OAuth App作成方法
- `QUICK_START.md` - 5分で完了する設定方法 