# CMS (静的コンテンツ管理) 機能と運用パターン

以下では、本リポジトリに同梱されている簡易 CMS の概要と、代表的な運用パターンを示します。

> **ポイント**
> - 外部サービスやランタイム DB は使わず、**Excel / Word で完結**するワークフローです。
> - 生成物はすべて `public/generated_contents/` 以下に静的アセットとして出力され、Next.js アプリはビルド時・実行時ともに読み取り専用です。
> - 日本語 / 英語の 2 言語に対応しており、Excel では両言語分のカラムを管理します。

---
## パターン別運用フロー

### パターン 1: Excel ワークブックで「一覧系」データを更新

| 対象シート | 用途 | 備考 |
|-------------|------|------|
| `tags` | 研究キーワード | ID・日本語名・英語名 |
| `member` | 研究室メンバー | サムネ・所属情報など多数カラム |
| `company` | 協力企業 | 企業ロゴ画像付き |
| `theme` | 研究テーマ | 概要文付き |
| `lecture` | 講義情報 | 概要文付き |
| `news` | お知らせ | 日付・本文 |
| `publication` | 研究業績 | 著者・タグなど複合情報 |

1. `contents/contents_db.xlsx` を開き、該当シートの **行を追加または編集**します。ID 重複に注意してください。
2. サムネイルは以下 2 通りのいずれかで指定できます。
   - セルに**画像を直接貼り付け**る（推奨）
   - 画像ファイルのパスを文字列で入力する（`assets/img/...` など）
3. 保存後、生成スクリプトを実行します。

```bash
# 依存ライブラリ（初回のみ）
pip install -r scripts/requirements.txt  # openpyxl, pillow など

# CSV とサムネイル画像を生成
python scripts/gen_contents_db.py \
  --excel-path contents/contents_db.xlsx
```

生成結果:
- `public/generated_contents/<dataset>/<dataset>.csv`
- `public/generated_contents/<dataset>/<ハッシュ>.jpg`

### パターン 2: Word (.docx) で「記事本文」を追加

1. `contents/articles/<type>/` 配下 (`theme`, `news`, `member`, `publication`, `lecture`) に **`<ID>.docx`** を配置します。
2. 以下のシェルスクリプトで HTML に変換します。

```bash
bash scripts/gen_articles.sh  # pandoc を使用
```

変換結果:
- `public/generated_contents/<type>/<ID>/article.html`
- 画像は同ディレクトリに自動展開されます。

### パターン 3: データ整合性を CI / 手動で検証

```bash
python scripts/validate_contents_db.py
```
チェック内容:
- ID の重複や必須カラムの未入力
- Docx → HTML が生成されているか
- 外部キー（タグ ID / 著者 ID など）の存在確認

---
## 本番 / Preview ビルド時の動き

1. 上記スクリプトで `public/generated_contents/` が最新化されていることを前提に **`npm run build`** を実行。
2. Next.js は `src/app/data.tsx` 内で CSV を読み込み、`process.env.NEXT_PUBLIC_BASE_PREFIX` を用いてパスを解決します。
3. ページ遷移時の詳細表示（記事本文など）はクライアントサイドで HTML を fetch してレンダリングします（`<ArticleDetailClient />`）。

---
## よくある質問

### Q. 画像を差し替えたい
A. Excel に埋め込まれている場合は **貼り直すだけ**で OK。ファイルパス指定の場合は画像ファイルを置き換えてから再生成してください。

---
これで CMS 関連の運用方法は完了です。疑問点や改善案があれば Issue / PR を歓迎します。
