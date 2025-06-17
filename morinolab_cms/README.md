# Morinolab CMS (Electron)

デスクトップ CMS アプリです。`contents` フォルダ以下のファイルを直接操作し、データベースを使わずにコンテンツを管理できます。

## セットアップ

```bash
npm install
```

## 開発モード

```bash
npm run dev
```

## ビルド & 実行

```bash
# 既定 (GitHub から自動 clone されます)
npm run start

# contents ディレクトリを明示的に指定したい場合
npm run start -- --contents=/absolute/path/to/contents
```

上記の `--contents` オプション（または環境変数 `CONTENTS_DIR`）を使うと、アプリが読み書きする
`contents` ルートを任意の場所に変更できます。指定が無い場合は以下の挙動になります。

1. カレントディレクトリ直下に `morinolab_hp` というフォルダーが存在しない場合、
   `git clone https://github.com/morinolab/morinolab_hp.git` が自動で実行されます。
2. `morinolab_hp/morinolab_hp/public/contents` を CMS のデータルートとして利用します。

## 使い方
1. 左のサイドバーにコンテンツタイプ（`contents` 直下のフォルダー名）が表示されます。
2. 各タイプをクリックすると一覧表が表示され、`+ 追加` ボタンで新規記事を作成できます。
3. 行の「編集」ボタンで記事を開き、右側のエディタで Markdown を入力すると 0.5 秒ごとに自動保存されます。
4. 「削除」ボタンで記事フォルダーごと削除します。

## 構成
- `src/main.ts` : Electron メインプロセス。IPC を介してファイル読み書きを実装。
- `src/preload.ts` : `window.api` としてレンダラーに安全な API を公開。
- `src/renderer/index.html` : UI（バニラ JS + HTML/CSS）。 