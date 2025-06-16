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
npm run start
```

## 使い方
1. 左のサイドバーにコンテンツタイプ（`contents` 直下のフォルダー名）が表示されます。
2. 各タイプをクリックすると一覧表が表示され、`+ 追加` ボタンで新規記事を作成できます。
3. 行の「編集」ボタンで記事を開き、右側のエディタで Markdown を入力すると 0.5 秒ごとに自動保存されます。
4. 「削除」ボタンで記事フォルダーごと削除します。

## 構成
- `src/main.ts` : Electron メインプロセス。IPC を介してファイル読み書きを実装。
- `src/preload.ts` : `window.api` としてレンダラーに安全な API を公開。
- `src/renderer/index.html` : UI（バニラ JS + HTML/CSS）。 