# GitHub CMS セットアップUI改善ドキュメント

## 概要

このドキュメントは、GitHub CMSのセットアップUIに行った改善について説明します。ユーザーからのフィードバックに基づいて、より分かりやすく使いやすいセットアップフローを実装しました。

## 実装した改善

### 1. 3ステップ構成への変更

**以前の問題:**
- リポジトリ選択画面で、ローカルクローン先とGitHubログインボタンが同時に表示されて分かりにくい
- 操作の順序が不明確

**改善内容:**
- セットアップを明確な3ステップに分離：
  1. ローカル保存先の設定
  2. GitHub認証
  3. リポジトリ選択

**実装詳細:**
```javascript
function showStep(step) {
  stepLocalPath.style.display = step === 'localPath' ? 'block' : 'none';
  stepAuth.style.display = step === 'auth' ? 'block' : 'none';
  stepRepoSelection.style.display = step === 'repoSelection' ? 'block' : 'none';
}
```

### 2. ディレクトリ選択機能の追加

**要求:**
- ローカルクローン先はユーザに選択させる
- この設定はアプリ側で保存

**実装内容:**
- ネイティブファイル選択ダイアログの統合
- LocalStorageでの設定永続化

**技術実装:**

**preload.ts:**
```typescript
selectDirectory: (): Promise<{ success: boolean; path?: string; error?: string }> =>
  ipcRenderer.invoke('select-directory'),
```

**main.ts:**
```typescript
ipcMain.handle('select-directory', async () => {
  try {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'GitHub リポジトリ保存先を選択',
      message: 'リポジトリをクローンするディレクトリを選択してください'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    } else {
      return { success: false, error: 'ディレクトリが選択されませんでした' };
    }
  } catch (error) {
    console.error('Directory selection error:', error);
    return { success: false, error: (error as Error).message };
  }
});
```

### 3. 階層構造でのクローン

**要求:**
- ディレクトリに直接リポジトリを配置するのではなく、ディレクトリの下の階層にリポジトリのルートディレクトリをcloneして欲しい

**実装内容:**
- ベースディレクトリとリポジトリ固有のパスを分離
- `localBasePath` と `localPath` の概念を導入

**実装詳細:**
```javascript
// リポジトリ選択時
selectedRepository = {
  ...repo,
  localBasePath: currentLocalPath,           // /Users/username/Documents/github-repos
  localPath: currentLocalPath + '/' + repo.name  // /Users/username/Documents/github-repos/my-repo
};
```

### 4. 設定の永続化

**実装内容:**
- ローカル設定をLocalStorageに保存
- アプリ再起動時の設定復元

**実装詳細:**
```javascript
function saveLocalSettings() {
  const settings = {
    localPath: currentLocalPath,
    timestamp: Date.now()
  };
  localStorage.setItem('cmsLocalSettings', JSON.stringify(settings));
}

function loadLocalSettings() {
  const saved = localStorage.getItem('cmsLocalSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      localPathInput.value = settings.localPath || '';
      currentLocalPath = settings.localPath || '';
      updateNextButton();
    } catch (error) {
      console.error('Failed to load local settings:', error);
    }
  }
}
```

### 5. クローン完了ダイアログの削除

**要求:**
- クローン完了のダイアログは表示しないで良い

**実装内容:**
- 成功ダイアログ（alert）を削除
- コンソールログのみに変更
- 待機時間を2秒から1秒に短縮

**変更内容:**
```javascript
// Before:
alert('GitHub連携のセットアップが完了しました！');

// After:
console.log('GitHub連携のセットアップが完了しました');
```

### 6. UIの視覚的改善

**CSS改善:**
- セットアップコンテナの幅を500pxから700pxに拡大
- ステップごとの視覚的分離を追加
- より分かりやすいボタンテキスト

**実装詳細:**
```css
.setup-container {
  max-width: 700px; /* 500px から変更 */
}

.setup-step {
  background: #f8f8f8;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}
```

## ユーザーエクスペリエンス改善

### ナビゲーション

- 各ステップに「戻る」ボタンを追加
- 現在のステップと保存先パスを常に表示
- 明確な進行状況の表示

### バリデーション

- ディレクトリパスが入力されるまで「次へ」ボタンを無効化
- リアルタイムでのフォーム検証

```javascript
function updateNextButton() {
  const hasPath = currentLocalPath.trim().length > 0;
  nextToAuthBtn.disabled = !hasPath;
}
```

### エラーハンドリング

- 各ステップでの適切なエラーメッセージ
- ユーザーフレンドリーなエラー表示

## テクニカルアーキテクチャ

### ファイル構造

```
src/
├── main.ts              # IPC ハンドラー、ディレクトリ選択
├── preload.ts           # API定義
└── renderer/
    └── index.html       # UI実装、ステップ管理
```

### データフロー

1. **ローカル設定管理**: LocalStorage ↔ フロントエンド
2. **ディレクトリ選択**: フロントエンド → IPC → Electronダイアログ
3. **GitHub認証**: フロントエンド → IPC → GitHub OAuth
4. **設定保存**: 統合設定をLocalStorageと暗号化ファイルに保存

## 今後の改善予定

### 追加機能

- [ ] 最近使用したディレクトリの履歴機能
- [ ] セットアップ進捗の詳細表示
- [ ] エラー復旧のためのステップスキップ機能

### UX改善

- [ ] アニメーション付きステップ遷移
- [ ] より詳細なプログレス表示
- [ ] オフライン状態での適切な案内

## テスト方法

### 手動テスト手順

1. **新規セットアップテスト**
   - アプリケーションの設定をクリア
   - 初回起動でのセットアップフロー確認

2. **設定保存テスト**
   - セットアップ完了後のアプリ再起動
   - 設定が正しく復元されることを確認

3. **エラーケーステスト**
   - 無効なディレクトリパスの入力
   - ネットワーク切断時のGitHub認証
   - アクセス権限のないリポジトリの選択

### 自動テスト

現在、UIのE2Eテストは未実装ですが、将来的にPlaywrightやSpectronを使用したテストの導入を検討しています。

## 互換性

- **Electron**: v25.x以上
- **Node.js**: v18.x以上
- **OS**: macOS 10.15+, Windows 10+, Ubuntu 18.04+

## セキュリティ考慮事項

- ディレクトリ選択はElectronの標準APIを使用
- パス検証による不正アクセス防止
- 設定データの暗号化保存 