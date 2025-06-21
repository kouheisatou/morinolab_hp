# Morinolab CMS APIリファレンス

## 概要

このドキュメントは、Morinolab CMSのIPC APIとPreload APIの詳細な仕様を説明します。

## IPC API（メインプロセス）

### コンテンツ管理 API

#### `get-content-types`
コンテンツタイプの一覧を取得します。

**Parameters:** なし

**Returns:** `Promise<string[]>`
```typescript
// Example response
["company", "lecture", "member", "membertype", "news", "publication", "tags", "theme"]
```

#### `get-items`
指定されたコンテンツタイプのアイテム一覧を取得します。

**Parameters:**
- `type: string` - コンテンツタイプ

**Returns:** `Promise<Array<{ id: string; title: string }>>`
```typescript
// Example response
[
  { id: "1", title: "新規記事" },
  { id: "2", title: "サンプル記事" }
]
```

#### `create-item`
新しいアイテムを作成します。

**Parameters:**
- `type: string` - コンテンツタイプ

**Returns:** `Promise<{ id: string; title: string }>`
```typescript
// Example response
{ id: "3", title: "新規記事" }
```

#### `delete-item`
指定されたアイテムを削除します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID

**Returns:** `Promise<void>`

#### `load-content`
指定されたアイテムのコンテンツを読み込みます。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID

**Returns:** `Promise<string>`
```typescript
// Example response
"---\ntitle: サンプル記事\n---\n\n# 見出し\n\n本文"
```

#### `save-content`
指定されたアイテムのコンテンツを保存します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID
- `content: string` - 保存するコンテンツ

**Returns:** `void`

### 画像管理 API

#### `save-image`
画像ファイルを指定されたアイテムのメディアフォルダに保存します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID
- `sourcePath: string` - ソース画像のパス
- `fileName: string` - ファイル名

**Returns:** `Promise<string | null>`
```typescript
// Example response
"./media/image1.jpg"
```

#### `select-thumbnail`
サムネイル画像を選択してリサイズ・保存します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID

**Returns:** `Promise<string | null>`
```typescript
// Example response
"./1.jpg"
```

### メタデータ管理 API

#### `get-table-data`
指定されたコンテンツタイプのCSVテーブルデータを取得します。

**Parameters:**
- `type: string` - コンテンツタイプ

**Returns:** `Promise<{ header: string[]; rows: Record<string, string>[] }>`
```typescript
// Example response
{
  header: ["id", "title", "date"],
  rows: [
    { id: "1", title: "記事1", date: "2024-01-01" },
    { id: "2", title: "記事2", date: "2024-01-02" }
  ]
}
```

#### `update-cell`
CSVテーブルの特定のセルを更新します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `id: string` - アイテムID
- `column: string` - 列名
- `value: string` - 新しい値

**Returns:** `Promise<void>`

### ファイルシステム API

#### `resolve-path`
相対パスを絶対パスに解決します。

**Parameters:**
- `type: string` - コンテンツタイプ
- `rel: string` - 相対パス

**Returns:** `Promise<string>`
```typescript
// Example response
"file:///path/to/contents/news/1/media/image.jpg"
```

#### `get-font-url`
フォントファイルのURLを取得します。

**Parameters:** なし

**Returns:** `Promise<string | null>`
```typescript
// Example response
"file:///path/to/Sango-JA-CPAL.ttf"
```

#### `update-content-root`
コンテンツルートディレクトリを更新します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; contentRoot?: string; error?: string }>`
```typescript
// Example response
{ success: true, contentRoot: "/path/to/contents" }
```

### ディレクトリ選択 API

#### `select-directory`
ディレクトリ選択ダイアログを表示します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; path?: string; error?: string }>`
```typescript
// Example response
{ success: true, path: "/Users/user/Documents/morinolab" }
```

#### `get-default-local-path`
デフォルトのローカルパスを取得します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; path?: string; error?: string }>`
```typescript
// Example response
{ success: true, path: "/Users/user/Documents/morinolab" }
```

## GitHub API

### 認証 API

#### `github-authenticate`
GitHubトークンで認証を行います。

**Parameters:**
- `token: string` - GitHubアクセストークン

**Returns:** `Promise<GitHubResponse>`
```typescript
interface GitHubResponse {
  success: boolean;
  error: string | null;
  hasConflicts?: boolean;
  conflicts?: string[];
}
```

#### `github-oauth-authenticate`
GitHub OAuth Device Flowで認証を行います。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; token?: string; error?: string }>`
```typescript
// Example response
{ success: true, token: "ghp_xxxxxxxxxxxx" }
```

#### `github-is-authenticated`
GitHub認証状態を確認します。

**Parameters:** なし

**Returns:** `Promise<boolean>`

### リポジトリ管理 API

#### `github-set-repository`
GitHubリポジトリの設定を行います。

**Parameters:**
- `owner: string` - リポジトリオーナー
- `repo: string` - リポジトリ名
- `localPath: string` - ローカルパス
- `token: string` - GitHubアクセストークン

**Returns:** `Promise<GitHubResponse>`

#### `github-get-user-repositories`
ユーザーのリポジトリ一覧を取得します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; data: GitHubRepository[]; error: string | null }>`
```typescript
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}
```

#### `github-is-configured`
GitHub設定状態を確認します。

**Parameters:** なし

**Returns:** `Promise<boolean>`

#### `github-get-config`
GitHub設定情報を取得します。

**Parameters:** なし

**Returns:** `Promise<GitHubConfig>`
```typescript
interface GitHubConfig {
  clientId?: string;
  clientSecret?: string;
  owner?: string;
  repo?: string;
  localPath?: string;
  token?: string;
}
```

### Git操作 API

#### `github-clone-repository`
リポジトリをクローンします。

**Parameters:** なし

**Returns:** `Promise<GitHubResponse>`

#### `github-clone-with-progress`
プログレス付きでリポジトリをクローンします。

**Parameters:** なし

**Returns:** `Promise<GitHubResponse>`

**Progress Events:** `github-clone-progress`
```typescript
// Progress event data
{ message: string; percent: number }
```

#### `github-pull-latest`
最新の変更をプルします。

**Parameters:** なし

**Returns:** `Promise<GitHubResponse>`

#### `github-commit-push`
変更をコミット・プッシュします。

**Parameters:**
- `message: string` - コミットメッセージ

**Returns:** `Promise<GitHubResponse>`

**Progress Events:** `github-commit-progress`
```typescript
// Progress event data
{ message: string; percent: number }
```

#### `github-get-status`
リポジトリのステータスを取得します。

**Parameters:** なし

**Returns:** `Promise<GitHubStatusResponse>`
```typescript
interface GitHubStatusResponse extends GitHubResponse {
  data: {
    ahead: number;
    behind: number;
    current: string;
    tracking: string;
    files: Array<{
      path: string;
      index: string;
      working_dir: string;
    }>;
  } | null;
}
```

#### `github-get-info`
リポジトリ情報を取得します。

**Parameters:** なし

**Returns:** `Promise<GitHubInfoResponse>`
```typescript
interface GitHubInfoResponse extends GitHubResponse {
  data: {
    owner: string;
    repo: string;
    localPath: string;
    isCloned: boolean;
    lastSync?: string;
  } | null;
}
```

#### `github-get-log`
コミットログを取得します。

**Parameters:**
- `limit: number = 20` - 取得する件数

**Returns:** `Promise<{ success: boolean; data: GitCommit[]; error?: string }>`
```typescript
type GitCommit = {
  hash: string;
  message: string;
  date: string;
  author: string;
};
```

### コンフリクト解決 API

#### `github-get-conflicts`
未解決のコンフリクトファイル一覧を取得します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; data: string[]; error?: string }>`
```typescript
// Example response
{ success: true, data: ["contents/news/1/article.md", "contents/news/news.csv"] }
```

#### `github-get-conflict-content`
指定されたファイルのコンフリクト内容を取得します。

**Parameters:**
- `filePath: string` - ファイルパス

**Returns:** `Promise<{ success: boolean; data: string | null; error?: string }>`
```typescript
// Example response
{
  success: true,
  data: "<<<<<<< HEAD\nContent A\n=======\nContent B\n>>>>>>> branch"
}
```

#### `github-resolve-conflict`
コンフリクトを解決します。

**Parameters:**
- `filePath: string` - ファイルパス
- `resolvedContent: string` - 解決後の内容

**Returns:** `Promise<GitHubResponse>`

#### `github-complete-merge`
すべてのコンフリクト解決後、マージを完了します。

**Parameters:**
- `message?: string` - マージコミットメッセージ

**Returns:** `Promise<GitHubResponse>`

#### `github-check-conflicts-resolved`
すべてのコンフリクトが解決されているかチェックします。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; data: boolean; error?: string }>`

### OAuth設定 API

#### `github-save-oauth-config`
OAuth設定を保存します。

**Parameters:**
- `clientId: string` - クライアントID
- `clientSecret: string` - クライアントシークレット

**Returns:** `Promise<GitHubResponse>`

#### `github-check-config-status`
GitHub設定状態をチェックします。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; configured: boolean; setupGuide?: string; error?: string }>`

#### `github-get-oauth-config`
OAuth設定を取得します。

**Parameters:** なし

**Returns:** `Promise<{ success: boolean; data: { clientId: string; hasClientSecret: boolean } | null; error?: string }>`

#### `github-restore-config`
GitHub設定を復元します。

**Parameters:**
- `configData: { owner: string; repo: string; localPath: string; token: string }`

**Returns:** `Promise<GitHubResponse>`

## Preload API

### Window API

```typescript
declare global {
  interface Window {
    api: {
      // コンテンツ管理
      getContentTypes(): Promise<string[]>;
      getItems(type: string): Promise<Array<{ id: string; title: string }>>;
      createItem(type: string): Promise<{ id: string; title: string }>;
      deleteItem(type: string, id: string): Promise<void>;
      loadContent(type: string, id: string): Promise<string>;
      saveContent(type: string, id: string, content: string): void;
      
      // 画像管理
      saveImage(type: string, id: string, sourcePath: string, fileName: string): Promise<string | null>;
      selectThumbnail(type: string, id: string): Promise<string | null>;
      
      // メタデータ管理
      getTableData(type: string): Promise<{ header: string[]; rows: Record<string, string>[] }>;
      updateCell(type: string, id: string, column: string, value: string): Promise<void>;
      
      // ファイルシステム
      resolvePath(type: string, rel: string): Promise<string>;
      getFontURL(): Promise<string | null>;
      updateContentRoot(): Promise<{ success: boolean; contentRoot?: string; error?: string }>;
      selectDirectory(): Promise<{ success: boolean; path?: string; error?: string }>;
      getDefaultLocalPath(): Promise<{ success: boolean; path?: string; error?: string }>;
      
      // GitHub認証
      githubAuthenticate(token: string): Promise<GitHubResponse>;
      githubOAuthAuthenticate(): Promise<{ success: boolean; token?: string; error?: string }>;
      githubIsAuthenticated(): Promise<boolean>;
      
      // GitHub リポジトリ管理
      githubSetRepository(owner: string, repo: string, localPath: string, token: string): Promise<GitHubResponse>;
      githubGetUserRepositories(): Promise<{ success: boolean; data: GitHubRepository[]; error: string | null }>;
      githubIsConfigured(): Promise<boolean>;
      githubGetConfig(): Promise<GitHubConfig>;
      
      // Git操作
      githubCloneRepository(): Promise<GitHubResponse>;
      githubCloneWithProgress(): Promise<GitHubResponse>;
      githubPullLatest(): Promise<GitHubResponse>;
      githubCommitPush(message: string): Promise<GitHubResponse>;
      githubGetStatus(): Promise<GitHubStatusResponse>;
      githubGetInfo(): Promise<GitHubInfoResponse>;
      githubGetLog(limit?: number): Promise<{ success: boolean; data: GitCommit[]; error?: string }>;
      
      // コンフリクト解決
      githubGetConflicts(): Promise<{ success: boolean; data: string[]; error?: string }>;
      githubGetConflictContent(filePath: string): Promise<{ success: boolean; data: string | null; error?: string }>;
      githubResolveConflict(filePath: string, resolvedContent: string): Promise<GitHubResponse>;
      githubCompleteMerge(message?: string): Promise<GitHubResponse>;
      githubCheckConflictsResolved(): Promise<{ success: boolean; data: boolean; error?: string }>;
      
      // OAuth設定
      githubSaveOAuthConfig(clientId: string, clientSecret: string): Promise<GitHubResponse>;
      githubCheckConfigStatus(): Promise<{ success: boolean; configured: boolean; setupGuide?: string; error?: string }>;
      githubGetOAuthConfig(): Promise<{ success: boolean; data: { clientId: string; hasClientSecret: boolean } | null; error?: string }>;
      githubRestoreConfig(configData: { owner: string; repo: string; localPath: string; token: string }): Promise<GitHubResponse>;
      
      // イベントリスナー
      onGitHubCloneProgress(callback: (data: { message: string; percent: number }) => void): () => void;
      onGitHubCommitProgress(callback: (data: { message: string; percent: number }) => void): () => void;
    };
  }
}
```

## 型定義

### 基本型

```typescript
interface GitHubResponse {
  success: boolean;
  error: string | null;
  hasConflicts?: boolean;
  conflicts?: string[];
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

interface GitHubConfig {
  clientId?: string;
  clientSecret?: string;
  owner?: string;
  repo?: string;
  localPath?: string;
  token?: string;
}

type GitCommit = {
  hash: string;
  message: string;
  date: string;
  author: string;
};
```

### エラーハンドリング

APIのすべてのメソッドは適切なエラーハンドリングを提供します：

```typescript
// 成功時
{ success: true, data: result }

// エラー時
{ success: false, error: "Error message" }
```

### プログレスイベント

長時間の操作（クローン、プッシュ）には進捗イベントが提供されます：

```typescript
// リスナー登録
const removeListener = window.api.onGitHubCloneProgress((data) => {
  console.log(`${data.message} - ${data.percent}%`);
});

// リスナー削除
removeListener();
```

## 使用例

### 基本的なコンテンツ操作

```typescript
// コンテンツタイプ一覧取得
const types = await window.api.getContentTypes();

// 新規記事作成
const item = await window.api.createItem('news');

// 記事内容読み込み
const content = await window.api.loadContent('news', item.id);

// 記事内容保存
window.api.saveContent('news', item.id, '---\ntitle: 新しい記事\n---\n\n# 内容');
```

### GitHub連携

```typescript
// OAuth認証
const authResult = await window.api.githubOAuthAuthenticate();
if (authResult.success) {
  console.log('認証成功');
}

// リポジトリ一覧取得
const reposResult = await window.api.githubGetUserRepositories();
if (reposResult.success) {
  console.log('リポジトリ:', reposResult.data);
}

// リポジトリ設定とクローン
await window.api.githubSetRepository('owner', 'repo', '/local/path', 'token');
const cloneResult = await window.api.githubCloneWithProgress();
```

### 画像操作

```typescript
// 画像保存
const imagePath = await window.api.saveImage('news', '1', '/path/to/image.jpg', 'image.jpg');

// サムネイル設定
const thumbnailPath = await window.api.selectThumbnail('news', '1');
```

このAPIリファレンスにより、Morinolab CMSの全機能にプログラムからアクセスできます。 