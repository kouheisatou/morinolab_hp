# Morinolab CMS 技術仕様書

## アーキテクチャ概要

Morinolab CMSは、クリーンアーキテクチャの原則に基づいて設計されたElectronアプリケーションです。

### レイヤー構成

```
┌─────────────────────────┐
│    Presentation Layer   │  ← Electron Renderer Process
├─────────────────────────┤
│    Application Layer    │  ← Use Cases & Business Logic
├─────────────────────────┤
│     Domain Layer        │  ← Entities & Interfaces
├─────────────────────────┤
│  Infrastructure Layer   │  ← External Adapters
└─────────────────────────┘
```

## プロジェクト構造

```
morinolab_cms/
├── src/
│   ├── main.ts                     # Electronメインプロセス
│   ├── preload.ts                  # レンダラープロセスAPI
│   ├── github-service.ts           # GitHub API サービス
│   ├── domain/                     # ドメイン層
│   │   ├── models/                 # エンティティ
│   │   │   ├── Article.ts
│   │   │   ├── ContentType.ts
│   │   │   └── RepositoryInfo.ts
│   │   └── ports/                  # インターフェース
│   │       ├── IContentRepository.ts
│   │       └── IGitRepository.ts
│   ├── application/                # アプリケーション層
│   │   └── usecases/               # ユースケース
│   │       ├── CloneRepository.ts
│   │       ├── CommitAndPush.ts
│   │       └── PullLatest.ts
│   ├── infrastructure/             # インフラストラクチャ層
│   │   ├── GitRepository.ts        # Git操作実装
│   │   └── local/
│   │       └── ContentRepository.ts # ローカルファイル操作
│   └── renderer/                   # プレゼンテーション層
│       └── index.html              # UI
├── tests/                          # テストファイル
├── build.js                        # ビルドスクリプト
├── copy-deps.js                    # 依存関係コピー
├── forge.config.js                 # Electron Forge設定
├── package.json                    # プロジェクト設定
└── tsconfig.json                   # TypeScript設定
```

## ドメイン層

### エンティティ

#### Article
```typescript
export interface Article {
  id: string;
  title: string;
  type: string; // e.g., 'news', 'lecture', etc.
  content: string;
}
```

#### ContentType
```typescript
export type ContentType =
  | 'company'
  | 'lecture'
  | 'member'
  | 'membertype'
  | 'news'
  | 'publication'
  | 'tags'
  | 'theme';
```

#### RepositoryInfo
```typescript
export interface RepositoryInfo {
  owner: string;
  name: string;
  localPath: string;
}
```

### ポートインターフェース

#### IContentRepository
```typescript
export interface IContentRepository {
  listContentTypes(): Promise<string[]>;
  listItems(type: string): Promise<Array<{ id: string; title: string }>>;
  loadContent(type: string, id: string): Promise<string>;
  saveContent(type: string, id: string, content: string): Promise<void>;
}
```

#### IGitRepository
```typescript
export interface IGitRepository {
  authenticate(token: string): Promise<boolean>;
  setRepository(info: RepositoryInfo, token: string): void;
  clone(progress?: (p: CloneProgress) => void): Promise<boolean>;
  pull(): Promise<{ success: boolean; error?: string }>;
  commitAndPush(
    message: string,
    progress?: (p: CloneProgress) => void,
  ): Promise<{ success: boolean; error?: string }>;
  getInfo(): Promise<RepositoryInfo | null>;
}
```

## アプリケーション層

### ユースケース

#### CloneRepositoryUseCase
```typescript
export class CloneRepositoryUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute(onProgress?: ProgressHandler): Promise<{ success: boolean; error?: string }> {
    const ok = await this.gitRepo.clone((p) => onProgress?.(p.message, p.percent));
    return ok ? { success: true } : { success: false, error: 'Clone failed' };
  }
}
```

#### CommitAndPushUseCase
```typescript
export class CommitAndPushUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute(message: string, onProgress?: (msg: string, percent: number) => void) {
    return this.gitRepo.commitAndPush(message, (p) => onProgress?.(p.message, p.percent));
  }
}
```

#### PullLatestUseCase
```typescript
export class PullLatestUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute() {
    return this.gitRepo.pull();
  }
}
```

## インフラストラクチャ層

### ContentRepository

ローカルファイルシステムを使用したコンテンツ管理の実装：

- **ファイル構造**: `contents/{type}/{id}/article.md`
- **メタデータ**: `contents/{type}/{type}.csv`
- **メディア**: `contents/{type}/{id}/media/`
- **サムネイル**: `contents/{type}/{id}.{ext}`

主要メソッド：
- `listContentTypes()`: ディレクトリ一覧から取得
- `listItems()`: gray-matterでMarkdownのフロントマターを解析
- `loadContent()`: ファイル読み込み
- `saveContent()`: ファイル書き込み（自動ディレクトリ作成）

### GitRepository

isomorphic-gitライブラリを使用したGit操作の実装：

```typescript
export class GitRepository implements IGitRepository {
  constructor(private readonly service: GitHubService) {}
  
  async clone(onProgress?: (p: CloneProgress) => void): Promise<boolean> {
    return this.service.cloneRepositoryWithProgress((msg, percent) =>
      onProgress?.({ message: msg, percent }),
    );
  }
  
  // その他の実装...
}
```

### GitHubService

GitHub API連携の核となるサービス：

#### 主要機能
- **認証**: GitHub OAuth Device Flow
- **リポジトリ操作**: clone, pull, push
- **コンフリクト解決**: merge conflict detection and resolution
- **ファイル操作**: status matrix, commit log

#### 認証フロー
```typescript
async authenticate(token: string): Promise<boolean> {
  try {
    this.octokit = new Octokit({ auth: token });
    const { data } = await this.octokit.rest.users.getAuthenticated();
    this.authUser = {
      login: data.login,
      name: data.name,
      email: data.email ?? null,
    };
    return true;
  } catch (err) {
    console.error('GitHub authentication failed:', err);
    return false;
  }
}
```

#### Device Flow認証
```typescript
async authenticateWithDeviceFlow(
  clientId: string,
  scope: string = 'repo,user',
): Promise<{ success: boolean; token?: string; error?: string }> {
  // Device Flowによる認証実装
  // ブラウザを開いてユーザー認証
  // ポーリングでトークン取得を待機
}
```

## Electronアーキテクチャ

### メインプロセス (main.ts)

#### 主要機能
- ウィンドウ管理
- IPC通信ハンドラー
- ファイルシステム操作
- 画像処理
- GitHub設定管理

#### IPC API

**コンテンツ管理**
```typescript
ipcMain.handle('get-content-types', async () => contentRepo.listContentTypes());
ipcMain.handle('get-items', (_e, type: string) => contentRepo.listItems(type));
ipcMain.handle('create-item', (_e, type: string) => contentRepo.createItem(type));
```

**GitHub操作**
```typescript
ipcMain.handle('github-authenticate', async (_, token: string) => {
  const success = await githubService.authenticate(token);
  return { success, error: success ? null : 'Authentication failed' };
});
```

**画像処理**
```typescript
async function processImage(
  inputPath: string,
  outputPath: string,
  maxWidth: number = 1600,
  quality: number = 0.8,
) {
  // Canvas APIを使用した画像リサイズ・圧縮
  // レンダラープロセスでの実行
}
```

### プリロードスクリプト (preload.ts)

セキュアなAPI公開：

```typescript
contextBridge.exposeInMainWorld('api', {
  // コンテンツ管理API
  getContentTypes: (): Promise<string[]> => 
    ipcRenderer.invoke('get-content-types'),
  
  // GitHub API
  githubAuthenticate: (token: string): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-authenticate', token),
  
  // 型安全なインターフェース定義
});
```

### レンダラープロセス (index.html)

#### UI構成
- **サイドバー**: コンテンツタイプナビゲーション
- **メインエリア**: 記事一覧・エディタ
- **テーブルビュー**: CSV形式のメタデータ編集
- **GitHub連携UI**: 認証・同期ボタン

#### スタイリング
- Win95風のレトロデザイン
- CSS3による3Dボタン効果
- WebKit scrollbar カスタマイズ

## データフロー

### コンテンツ作成フロー
```
1. User clicks "+ 追加" button
2. Renderer → Main: ipcRenderer.invoke('create-item', type)
3. Main → ContentRepository: createItem(type)
4. ContentRepository: Create directory & files
5. ContentRepository: Update CSV metadata
6. Main → Renderer: Return new item info
7. Renderer: Update UI & open editor
```

### GitHub同期フロー
```
1. User clicks "アップロード" button
2. Renderer → Main: githubCommitPush(message)
3. Main → GitRepository → GitHubService
4. GitHubService: Pull latest changes
5. GitHubService: Merge if needed
6. GitHubService: Stage all changes
7. GitHubService: Commit with message
8. GitHubService: Push to remote
9. Main → Renderer: Progress updates via IPC
```

## ビルドプロセス

### ビルドスクリプト (build.js)

```javascript
async function build() {
  // 1. distディレクトリをクリーン
  removeDir(distDir);
  
  // 2. TypeScriptコンパイル (tsc)
  // 3. rendererファイルをコピー
  copyDir(srcRenderer, destRenderer);
  
  // 4. キャッシュバスティング
  // HTMLにタイムスタンプを追加
  
  // 5. 設定ファイルをコピー
  if (fs.existsSync(configSrc)) {
    copyDir(configSrc, configDest);
  }
}
```

### 依存関係管理 (copy-deps.js)

パッケージ版で必要な依存関係を自動コピー：

```javascript
const requiredDeps = [
  'gray-matter', 
  'papaparse', 
  'electron-squirrel-startup', 
  'dotenv',
  '@octokit/rest',
  'pica',
  'simple-git'
];

// 再帰的な依存関係解決
function findDependencies(packageJsonPath, rootNodeModules, visited = new Set()) {
  // package.jsonを解析して依存関係を抽出
  // サブ依存関係も含めて完全なリストを作成
}
```

### Electron Forge設定

```javascript
module.exports = {
  packagerConfig: {
    asar: false,  // ファイルアクセスのため
    extraResource: ['./Sango-JA-CPAL.ttf'],
    icon: 'images/icon',
  },
  makers: [
    // プラットフォーム別インストーラー設定
    '@electron-forge/maker-squirrel', // Windows
    '@electron-forge/maker-zip',      // macOS
    '@electron-forge/maker-deb',      // Linux (Debian)
    '@electron-forge/maker-dmg',      // macOS (DMG)
  ],
};
```

## テスト戦略

### 単体テスト

Jest + TypeScriptによるテスト：

```typescript
describe('CloneRepositoryUseCase', () => {
  it('returns success true when repository clone succeeds', async () => {
    const mockRepo: IGitRepository = {
      clone: jest.fn().mockResolvedValue(true),
      // その他のメソッドをモック
    } as unknown as IGitRepository;

    const uc = new CloneRepositoryUseCase(mockRepo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
  });
});
```

### テスト範囲
- ユースケース層の単体テスト
- ドメインモデルの検証
- インフラストラクチャ層のモックテスト

## セキュリティ考慮事項

### Electron セキュリティ

```typescript
// webPreferences設定
{
  nodeIntegration: false,        // Node.js APIを無効化
  contextIsolation: true,        // コンテキスト分離を有効化
  preload: path.join(__dirname, 'preload.js'),
  webSecurity: true,             // Webセキュリティを有効化
}
```

### GitHub認証

- **Device Flow**: クライアントシークレット不要
- **Token保存**: OS のキーチェーンに暗号化保存
- **スコープ制限**: 必要最小限の権限のみ

### ファイルアクセス

- **サンドボックス**: Electronのサンドボックス機能
- **パス検証**: ディレクトリトラバーサル攻撃の防止
- **権限チェック**: ファイル読み書き権限の確認

## パフォーマンス最適化

### 画像処理

```typescript
// レンダラープロセスでの並列処理
const result = await mainWindow.webContents.executeJavaScript(`
  (async () => {
    // Canvas APIによる効率的な画像処理
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // プログレッシブリサイズ
    // 品質を保ちながら高速処理
  })()
`);
```

### メモリ管理

- **キャッシュクリア**: セッションキャッシュの定期クリア
- **画像最適化**: 自動圧縮による容量削減
- **ガベージコレクション**: 適切なオブジェクト解放

### 非同期処理

- **IPC通信**: Promiseベースの非同期API
- **プログレス更新**: リアルタイムステータス表示
- **バックグラウンド処理**: UI ブロックの回避

## デプロイメント

### 開発環境
```bash
npm install
npm run dev
```

### プロダクションビルド
```bash
npm run build      # TypeScriptコンパイル
npm run package    # Electronパッケージ
npm run make       # インストーラー作成
```

### 配布形式
- **Windows**: Squirrel installer (.exe)
- **macOS**: DMG image (.dmg) / ZIP archive
- **Linux**: DEB package (.deb) / RPM package (.rpm)

## 今後の拡張計画

### 機能拡張
- リアルタイム同期
- 複数リポジトリ対応
- プラグインシステム
- 多言語対応

### 技術改善
- WebAssembly統合
- より高速な画像処理
- オフライン対応
- 自動更新機能

## 依存関係

### 主要ライブラリ
- **Electron**: `29.4.6` - デスクトップアプリフレームワーク
- **TypeScript**: `5.4.5` - 型安全な開発
- **@octokit/rest**: `^20.0.2` - GitHub API クライアント
- **isomorphic-git**: `^1.31.0` - Pure JavaScript Git実装
- **gray-matter**: `^4.0.3` - Markdownフロントマター解析
- **papaparse**: `^5.5.3` - CSV処理
- **pica**: `^9.0.1` - 高品質画像リサイズ

### 開発用ツール
- **@electron-forge/cli**: `^7.8.1` - Electronビルドツール
- **Jest**: `^29.7.0` - テストフレームワーク
- **ESLint**: `^8.57.0` - コード品質チェック
- **Prettier**: `^3.2.5` - コードフォーマッター

このアーキテクチャにより、保守性、拡張性、テスタビリティを備えた堅牢なデスクトップCMSアプリケーションを実現しています。 