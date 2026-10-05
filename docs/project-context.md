# プロジェクトコンテキスト

## 安定ゴール

- Next.js / TypeScript による業務Webアプリ・AI業務改善エンジニアとして副業案件を獲得する
- 競争軸は「React歴」ではなく「業務理解 + Web実装 + AI活用」
- 最初の成果物は「業務機器・貸出・発送管理 SaaS」ポートフォリオ（求人票への回答書）

## 制約

- 主市場は日本の副業・業務委託（海外は補助）
- LP / Figma再現のみ / デザイン再現だけの価格競争案件は狙わない
- AIは設計・判断・レビュー・テストを自分で担う前提で使う（丸投げ説明は不可）
- 初回は高単価より実務経験 0→1 を優先（安売りの恒常化はしない）
- **初回公開は Phase 1 のみ** — Stripe / AI / Phase 2 機能は含めない（2026-10-05）
- **UI品質を優先** — cool / polished / 視覚的に強い見た目を目指す（汎用的・味気ないUIは避ける）。詳細ビジュアルシステムは未定義（2026-10-05）

## 決定済み

- **リポジトリ（正本）**: https://github.com/tamayuefvle/portfolio-react — 2026-10-05
- 差別化方針: 業務システム × Next.js/React × TypeScript × API/DB × AI
- 技術スタック中核: Next.js, React, TypeScript, Tailwind, shadcn/ui, Supabase, TanStack Query, Zod, RHF, Vitest, Playwright, Vercel, GitHub Actions
- 第2段階追加: OpenAI/Claude API, Stripe, Resend（初回公開後）
- **初回公開スコープ: Phase 1 のみ**（Stripe / AI / Phase 2 は初回リリース対象外）— 2026-10-05
- **UI品質優先**: 見た目は cool / polished / 視覚的に強い方向（詳細デザインシステムは未定義）— 2026-10-05
- **「ドメイン詳細」の定義**: SaaS の資産／機器カテゴリと RBAC 粒度の設計を指す。実職場の在庫リストのダンプではない。実務知識はカテゴリ設計の参考にしてよい — 2026-10-05
- **ドメイン詳細 — 採用初期案**（ユーザー承認済み defaults・後から改定可）— 2026-10-05
  - カテゴリ（5）: `laptop` ノートPC / `meter` 計測器 / `tool` 工具 / `peripheral` 周辺機器 / `other` その他
  - ステータス（4）: `available` 利用可能 / `on_loan` 貸出中 / `in_shipment` 発送中 / `unavailable` 利用停止
  - RBAC（4）: `Admin`（全CRUD・ユーザー・設定）/ `Manager`（資産・貸出・発送 CRUD、ユーザー閲覧）/ `Warehouse`（貸出・発送の作成更新、資産閲覧・ステータス更新）/ `Viewer`（参照のみ）
- 90日ロードマップ: 学習実装（1–30）→ 案件相当拡張（31–60）→ 応募（61–90）
- 初期応募配分: 改修・保守・QA 40% / 管理画面 30% / Supabase 20% / AI 10%

## 未決（ドメイン外）

ドメイン詳細は決定済み。残りは応募・稼働まわり。

- 応募チャネル
- 週あたり稼働量と初回単価の下限
- 海外案件をいつから並行するか
