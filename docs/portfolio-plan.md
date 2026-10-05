# ポートフォリオ計画 — React / Next.js 副業案件獲得

出典: `react-nextjs_sidejob_strategy_2026-10-04_5e08.md`（2026-10-04）  
決定更新: 2026-10-05

## ゴール

- **最終ポジション**: Next.js / TypeScript を使った業務Webアプリ・AI業務改善エンジニア
- React歴で戦わず、**業務理解 × Web実装 × AI活用**で差別化する
- 90日でポートフォリオ公開 → 小規模案件応募 → 実務実績 0→1 を達成する

## 対象・制約

| 項目 | 内容 |
|---|---|
| 対象者 | たまさん（業務システム・要件・DB・運用・Python・AI活用の経験あり） |
| 主市場 | 日本の副業・業務委託 |
| 補助市場 | 海外フリーランス |
| 制約 | React実務年数では競わない／LP・Figma再現のみの価格競争は避ける |
| AI利用 | 「全部AI任せ」ではなく、設計・判断・レビュー・テストを自分で担ったと説明できること |
| 初回公開範囲 | **Phase 1 のみ**（Stripe / AI / Phase 2 機能は初回リリースに含めない）— 決定済み 2026-10-05 |
| UI品質 | 見た目は cool / polished / 視覚的に強いものを優先（汎用的・味気ないUIは避ける）。詳細なビジュアルシステムは未定義 — 優先度のみ記録 2026-10-05 |

## スコープ（最初のポートフォリオ）

**題材**: 業務機器・貸出・発送管理 SaaS（求人票への回答書として作る）

**初回公開（決定済み）**: Phase 1 のみ。Stripe・AI・その他 Phase 2 機能は初回に載せない。

**技術スタック（必須）**

- Next.js / React / TypeScript / Tailwind CSS / shadcn/ui
- Supabase（PostgreSQL / Auth / RLS）
- TanStack Query / Zod / React Hook Form
- Vitest / Playwright
- Vercel / GitHub Actions

**第2段階で追加**（初回公開後）: OpenAI / Claude API、Stripe、Resend

**必須画面**: `/login` `/dashboard` `/assets` `/assets/[id]` `/shipments` `/locations` `/users` `/settings`

**必須機能**: Auth・RBAC・CRUD・検索/フィルタ/ソート/ページング・バリデーション・Server Actions・レスポンシブ・Loading/Error/Empty・E2E・CI・本番デプロイ

### 「ドメイン詳細」の意味（明確化）

ここでいう「ドメイン詳細」は、**ポートフォリオ用 SaaS の資産／機器カテゴリ定義**と **RBAC（権限）の粒度設計**を指す。

- 実際の職場の在庫リストをそのままダンプすることではない
- 実務知識はカテゴリ設計の参考にしてよい（一般化した架空ドメインとして定義する）

## 狙う案件（優先順）

1. 既存業務システム改修 / 社内システム React 化
2. 管理画面・CRUD / API 連携
3. React QA・テスト（実績獲得用）
4. （中期）Next.js + Supabase SaaS / AI 搭載業務アプリ

**避ける**: Figma→React のみ、LP中心、デザイン再現だけの低単価競争

## フェーズ（90日）

### Day 1–30 — 実装しながら学ぶ
TypeScript → React → Next.js をポートフォリオ内で習得（Component / Hooks / Form / API / Server・Client / routing / Git）。

### Day 31–60 — 案件相当の構成へ拡張
Supabase・Auth・RLS・Admin・TanStack Query・Zod・RHF・Vitest・Playwright を追加。プロフィールを「勉強中」→「業務Webアプリを設計・公開」に更新。

### Day 61–90 — 応募開始
配分目安: 改修・保守・QA 40% / 管理画面・業務Web 30% / Next.js+Supabase 20% / AI×Next.js 10%。

**基本ループ**: 案件観察 → 要求抽出 → ポートフォリオに1つ実装 → 理解・テスト → READMEに設計判断 → 公開 → 小案件応募 → フィードバック反映

## 初回受注方針

- 目的は高単価ではなく **React実務 0→1**
- 初期ターゲット: 小規模改修・バグ修正・管理画面追加・API接続・テスト追加・運用保守
- 価格: 初回1–2件は経験優先（安売りの恒常化はしない）→ 10–30万円 → 週2–3業務委託へ段階上げ

## ドメイン詳細 — 採用初期案（決定済み・2026-10-05）

ユーザー承認済みの sensible defaults。Phase 1 デモ向けの実務的な初期案であり、後から改定してよい。

### 機器／資産カテゴリ（5種）

| ID | 表示名 | 説明 |
|---|---|---|
| `laptop` | ノートPC | 貸出の中心となる端末 |
| `meter` | 計測器 | 現場・検査向け計測機器 |
| `tool` | 工具 | 手工具・電動工具など |
| `peripheral` | 周辺機器 | モニタ・ドック・キーボード等 |
| `other` | その他 | 上記以外の備品 |

### 資産ステータス（貸出・発送フロー用・最小4種）

| ID | 表示名 | 用途 |
|---|---|---|
| `available` | 利用可能 | 貸出・発送の起点 |
| `on_loan` | 貸出中 | 利用者に渡している状態 |
| `in_shipment` | 発送中 | 拠点間・宛先への輸送中 |
| `unavailable` | 利用停止 | 点検・故障・廃棄など一時／恒久の利用不可 |

Phase 1 ではこれ以上のステータス（予約・返却待ちの独立状態など）は持たない。必要なら後続で追加する。

### RBAC（4ロール）

| ロール | Phase 1 でできること |
|---|---|
| `Admin` | ユーザー管理・設定・全エンティティの CRUD。ロール付与を含む。 |
| `Manager` | 資産・貸出・発送の CRUD。ユーザー一覧の閲覧。設定の変更は不可。 |
| `Warehouse` | 貸出・発送の作成・更新、資産の閲覧とステータス更新（出庫／返却／発送反映）。ユーザー・設定は不可。 |
| `Viewer` | 資産・貸出・発送・拠点などの参照のみ。作成・更新・削除不可。 |

画面単位の細かい権限制御は Phase 1 ではロール×操作（CRUD／閲覧）のマトリクスで十分とする。

## 次のアクション

1. Next.js + TypeScript + Tailwind + shadcn/ui でプロジェクトを初期化し、Vercel までつなぐ
2. `/login` と `/dashboard` から実装し、上記 RBAC の骨格を先に固める
3. README 雛形（Architecture / Decisions / AI Workflow / Testing / Deploy / Trade-offs）を用意する
4. UIは polished / 視覚的に強い方向で設計する（ビジュアルシステムの詳細定義は別途）

## 未決事項・要確認

ドメイン詳細（カテゴリ・ステータス・RBAC）は **採用初期案として決定済み**。残りはドメイン外。

- 応募チャネル（どのプラットフォームを主戦場にするか）
- 副業で使える週あたり稼働量と初回単価の下限
- 海外案件をいつから並行するか