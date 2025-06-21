# Morinolab CMS ユーザーガイド

## 概要

Morinolab CMSは、GitHubリポジトリと連携するElectronベースのデスクトップCMSアプリケーションです。直感的なUIでコンテンツを管理し、GitHubとの同期を簡単に行えます。

## システム要件

- **OS**: macOS 10.15+, Windows 10+, Ubuntu 18.04+
- **Node.js**: v18.x以上
- **Git**: v2.0以上
- **インターネット接続**: GitHub連携のため必要

## 初回セットアップ

アプリを初回起動すると、以下の3ステップでセットアップが完了します：

### ステップ1: ローカル保存先の設定
1. GitHubリポジトリを保存するディレクトリを選択
2. デフォルトは`Documents/morinolab`
3. 任意のディレクトリを選択可能

### ステップ2: GitHub認証
1. "GitHub でログイン" ボタンをクリック
2. ブラウザが開き、GitHubの認証ページが表示
3. Device Flow認証によるログイン
4. 認証コードを入力して認証完了

## 基本的な使い方

### コンテンツ管理

#### コンテンツタイプ
アプリケーションは以下のコンテンツタイプをサポートします：
- `company`: 企業情報
- `lecture`: 講義情報
- `member`: メンバー一覧
- `membertype`: メンバータイプタグ管理
- `news`: ニュース
- `publication`: 発表・論文
- `tags`: 研究テーマタグ管理
- `theme`: 研究テーマ

#### 記事の作成・編集
1. **記事の作成**
   - 左のサイドバーから対象のコンテンツタイプを選択
   - `+ 追加` ボタンをクリック
   - 新規記事が自動作成される

2. **記事の編集**
   - 一覧から「編集」ボタンをクリック
   - Markdownエディタで記事内容を編集
   - フロントマター（YAML形式）でメタデータを設定
   - 内容は0.5秒ごとに自動保存

3. **記事の削除**
   - 記事編集画面から「削除」ボタンをクリック
   - 確認ダイアログで削除を確定

#### ファイル構造
```
contents/
├── news/
│   ├── 1/
│   │   ├── article.md
│   │   └── media/
│   │       ├── image1.png
│   │       └── image2.jpg
│   ├── 2/
│   │   └── article.md
│   ├── news.csv
│   └── 1.jpg (サムネイル)
└── lecture/
    ├── 1/
    │   ├── article.md
    │   └── media/
    ├── lecture.csv
    └── 1.png (サムネイル)
```

### 画像管理

#### 画像の追加
1. **記事内画像**
   - エディタに画像ファイルをドラッグ&ドロップ
   - 自動的に`media/`フォルダに保存
   - Markdownの相対パスが自動挿入

2. **サムネイル設定**
   - テーブルビューで「サムネイル」列をクリック
   - 画像ファイルを選択
   - 自動的にリサイズ・圧縮

#### 画像処理
- **自動圧縮**: 品質60%で圧縮
- **自動リサイズ**: 最大幅1600px
- **形式変換**: PNGは自動的にJPEGに変換（小さな画像は除く）
- **サムネイル**: 最大幅800px、品質50%

### メタデータ管理

#### CSV形式でのデータ管理
各コンテンツタイプには対応するCSVファイルがあります：
- テーブル形式でメタデータを管理
- セル単位での編集が可能
- 新規記事作成時に自動的に行が追加

#### 主要なメタデータフィールド
- `id`: 記事のID（自動採番）
- `title`: 記事のタイトル
- その他のフィールドはコンテンツタイプによって異なる

## GitHub連携

### 基本的なGit操作

#### 同期（プル）
1. 「同期」ボタンをクリック
2. リモートリポジトリから最新の変更を取得
3. 自動的にマージが実行される

#### アップロード（プッシュ）
1. 「アップロード」ボタンをクリック
2. コミットメッセージを入力
3. ローカルの変更をGitHubにプッシュ

#### ログアウト
githubからログアウトし、初期設定画面に戻る

### コンフリクト解決

#### コンフリクトの発生
- 複数の場所で同じファイルが編集された場合
- プル時に自動マージできない場合

#### 解決手順
1. アプリが自動的にコンフリクトを検出
2. コンフリクト解決画面が表示
3. 各ファイルの内容を手動で編集
4. すべてのコンフリクト解決後、マージコミットを作成

## トラブルシューティング

### よくある問題

#### GitHub認証に失敗する
- インターネット接続を確認
- GitHubの認証ページで正しいコードを入力
- ブラウザの設定でポップアップをブロックしていないか確認

#### クローンに失敗する
- githubアカウント`MorinoLab-SIT`でログインしているか確認
- ディスクの空き容量を確認
- リポジトリのアクセス権限を確認
- ネットワーク接続を確認

#### 画像が表示されない
- ファイルパスが正しいか確認
- 画像ファイルが`media/`フォルダ内にあるか確認
- ファイル名に特殊文字が含まれていないか確認

#### 自動保存が動作しない
- ファイルの書き込み権限を確認
- ディスクの空き容量を確認

### ログの確認
- 開発モードでは自動的にDevToolsが開く
- コンソールでエラーメッセージを確認
- メインプロセスのログは端末に出力

### 設定のリセット
1. アプリケーションを終了
2. ユーザーデータディレクトリを削除
   - macOS: `~/Library/Application Support/morinolab-cms`
   - Windows: `%APPDATA%/morinolab-cms`
   - Linux: `~/.config/morinolab-cms`
3. アプリケーションを再起動
4. 初回セットアップを再実行

## API リファレンス

### メインプロセス API
詳細な実装は`src/main.ts`を参照

#### コンテンツ管理
- `get-content-types`: コンテンツタイプ一覧取得
- `get-items`: アイテム一覧取得
- `create-item`: 新規アイテム作成
- `load-content`: コンテンツ読み込み
- `save-content`: コンテンツ保存

#### GitHub操作
- `github-authenticate`: GitHub認証
- `github-clone-repository`: リポジトリクローン
- `github-commit-push`: コミット・プッシュ
- `github-pull-latest`: 最新取得
- `github-get-status`: ステータス取得

### プリロード API
詳細な型定義は`src/preload.ts`を参照

## 開発者向け情報

### フォント設定
- アプリケーションは`Sango-JA-CPAL.ttf`フォントを使用
- 日本語表示に最適化

### ディレクトリ構成
```
morinolab_cms/
├── src/
│   ├── main.ts              # メインプロセス
│   ├── preload.ts           # プリロードスクリプト
│   ├── github-service.ts    # GitHub API サービス
│   ├── domain/              # ドメインモデル
│   ├── application/         # ユースケース
│   ├── infrastructure/      # インフラストラクチャ
│   └── renderer/
│       └── index.html       # UI
├── tests/                   # テストファイル
├── images/                  # アプリアイコン
└── dist/                    # ビルド出力
```

### クリーンアーキテクチャ
- **Domain**: ビジネスロジックとエンティティ
- **Application**: ユースケースとアプリケーションロジック
- **Infrastructure**: 外部システムとの接続
- **Presentation**: UI層（Electron Renderer）

### 主要なコンポーネント

#### Domain Layer
- `Article`: 記事エンティティ
- `ContentType`: コンテンツタイプ定義
- `RepositoryInfo`: リポジトリ情報
- `IContentRepository`: コンテンツ操作インターフェース
- `IGitRepository`: Git操作インターフェース

#### Application Layer
- `CloneRepositoryUseCase`: リポジトリクローン
- `CommitAndPushUseCase`: コミット・プッシュ
- `PullLatestUseCase`: 最新取得

#### Infrastructure Layer
- `ContentRepository`: ローカルファイルシステム操作
- `GitRepository`: Git操作実装
- `GitHubService`: GitHub API連携

### 開発環境セットアップ
```bash
npm install
npm run dev
```

### テスト実行
```bash
npm test
```

### ビルド・パッケージ
```bash
npm run build
npm run package
npm run make
```

### 技術スタック
- **Electron**: デスクトップアプリフレームワーク
- **TypeScript**: 型安全な開発
- **GitHub API**: リポジトリ操作
- **isomorphic-git**: Gitクライアント
- **gray-matter**: Markdownフロントマター処理
- **papaparse**: CSV処理
- **Jest**: テストフレームワーク

## ライセンス

MIT License

## サポート

問題や質問がある場合は、GitHubリポジトリのIssueを作成してください。 