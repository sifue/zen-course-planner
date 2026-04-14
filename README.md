# ZEN大学履修計画プランナー by sifue

ZEN大学の4年間の履修計画を立てるためのWebアプリケーションです。
科目の絞り込み・ドラッグ&ドロップでの配置・卒業要件チェックなどの機能を提供します。

## 機能

- 科目一覧のワントグル絞り込み（履修想定年次・分類・タグ）
- 1〜4年次（最大8年次まで拡張可）の1〜4Qへのドラッグ&ドロップ配置
- 前提科目チェックと警告表示
- 卒業要件・進級要件のリアルタイムチェック
- 経済・マーケット/データサイエンス/情報のカリキュラムツリーから自動履修計画生成
- マークダウン形式でのエクスポート・インポート
- Web Storageへの履修計画保存・読み込み（別名保存対応）
- Slackbot AIへのおすすめ科目相談プロンプト生成
- PC・スマートフォン両対応（タッチ操作対応）

## 開発環境のセットアップ

### 必要なもの

- Node.js 20以上
- npm 10以上

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/sifue/zen-course-planner.git
cd zen-course-planner

# 依存関係のインストール
npm install

# シラバスデータのビルド（初回・シラバス更新時に実行）
npm run build:data

# 開発サーバーの起動
npm run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` を開いてください。

### 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルドを生成（データ抽出→TypeScriptコンパイル→Viteビルド） |
| `npm run build:data` | シラバスMarkdownからcourses.jsonを生成 |
| `npm run preview` | ビルド済み成果物をローカルでプレビュー |
| `npm run typecheck` | TypeScriptの型チェックのみ実行 |

## Cloudflare Pagesへのデプロイ

### Wranglerのインストール

```bash
npm install -g wrangler
```

### Cloudflareへのログイン

```bash
wrangler login
```

### ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# Cloudflare Pagesへデプロイ
wrangler pages deploy dist --project-name zen-course-planner
```

### Cloudflare Pagesのダッシュボードからの自動デプロイ設定

Cloudflare PagesのダッシュボードでGitHubリポジトリと連携することで、mainブランチへのプッシュ時に自動でデプロイされます。

ビルド設定:
- **ビルドコマンド**: `npm run build`
- **ビルド出力ディレクトリ**: `dist`
- **Node.jsバージョン**: 20

## シラバスデータについて

シラバスデータは `docs/syllabus/markdown/` に格納されています。
`npm run build:data` を実行すると、これらのMarkdownファイルから `src/data/courses.json` が生成されます。

シラバスデータの取得元: [ZEN大学シラバスサイト](https://syllabus.zen.ac.jp)（2026年4月14日時点）

## 不具合報告・フィードバック

- [GitHub Issues](https://github.com/sifue/zen-course-planner/issues)
- [ZEN大学Slack #times_sifue](https://zen-student.slack.com/archives/C08GD3UR1EG)

## 免責事項

このアプリケーションは個人が作成した非公式ツールです。
履修計画の最終確認は必ずZEN大学の公式情報や指導教員に確認してください。
このアプリケーションの利用による不利益について、作者は一切の責任を負いません。

## ライセンス

MIT License
