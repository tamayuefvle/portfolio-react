# 機材ヤード

業務機器の貸出と発送を管理する Phase 1 のアプリです。ログインして、資産、発送、拠点、ユーザー、設定を操作できます。

## 起動する

Node.js 22 で、リポジトリのルートから実行します。

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。未ログインなら `/login` に移ります。

デモのロールは次のとおりです。

| ロール | メール | パスワード |
|---|---|---|
| Admin | admin@yard.example | yard-admin |
| Manager | manager@yard.example | yard-manager |
| Warehouse | warehouse@yard.example | yard-warehouse |
| Viewer | viewer@yard.example | yard-viewer |

ログイン画面のボタンからも、同じアカウントで入れます。

## 構成

画面は `src/app` にあります。権限と資産の状態遷移は `src/domain/model.ts` にまとめてあります。Server Actions は `src/server/actions.ts` で、操作の前にロールを確認し、そのあとドメインのコマンドを適用します。

React を始めた人向けの通し解説は [`docs/repository-guide.md`](docs/repository-guide.md) にあります。短いメモは [`docs/first-slice-thinking.md`](docs/first-slice-thinking.md) です。会話の全文は `docs/chats/` に残ります。

保存先は `data/store.json` です。ファイルが無い最初の起動で、`src/domain/seed.ts` のデモデータが作られます。このファイルは git に含めません。

## 決めたこと

Phase 1 のカテゴリ、ステータス、ロールは `docs/portfolio-plan.md` の初期案に合わせています。貸出の独立画面は作っていません。貸出と返却は資産の詳細で行い、発送の到着は `/shipments` で記録します。

Manager は資産と発送を変更できます。拠点の追加と削除、設定の変更、ロールの変更は Admin だけです。Warehouse は資産の状態、貸出、発送を更新できます。Viewer は参照だけです。

Supabase と Vercel にはまだ接続していません。リポジトリに認証情報がないためです。セッションは `yard_session` クッキーにユーザー id を置くローカルの代替です。本番の認証には使いません。

## テスト

```bash
npm test
npm run lint
npm run build
```

`npm test` は権限と状態遷移を検証します。画面操作の確認は、開発サーバーを起動してブラウザで各ルートを開きます。

## デプロイ

GitHub Actions は `.github/workflows/ci.yml` でテスト、lint、ビルドを実行します。Vercel への公開は、Supabase の接続と一緒に後続で行います。Stripe と AI 機能は Phase 1 に入れていません。
