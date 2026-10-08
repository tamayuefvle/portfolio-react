# 機材ヤードの確認マップ

このディレクトリが、ユーザーから見える挙動を確認するときの正本です。先にこの索引を読み、対象の機能ファイルに従って操作します。

## Baseline preconditions

- 検証サーバーは `node .cursor/skills/verify-yard/verify-yard.mjs launch` で `http://127.0.0.1:3100` に起動する。
- `node .cursor/skills/verify-yard/verify-yard.mjs doctor` が `ok: true` と、このリポジトリの cwd、待受 pid を返すこと。
- 台帳は `data/store.json` 固定である。別の `next dev` がこのチェックアウトで動いているときは起動せず、そのサーバーも操作しない。
- 初期データは `src/domain/seed.ts` のデモ台帳である。組織名は `北浜機材`。資産 `ThinkPad X1`（利用可能）と、発送中の `騒音計 NL-42` がある。
- Admin は `admin@yard.example` / `yard-admin`、表示名は `青木 蓮`。

## Driving conventions

- 各レシピは、そのファイルの Preconditions から始める。
- アクセシブル名を使う。座標やタブ順では押さない。
- コマンドとボタン名はファイルに書いた文字列のまま使う。
- 起動と診断は `verify-yard.mjs`、画面操作は Cursor のブラウザツールで行う。
- 台帳を変えたあとは、画面と `data/store.json` の両方を成果物に残す。cleanup で成果物を消さない。

## Proof and skip reporting

- 操作とその結果の状態を残す。最終画面だけでは証明にならない。
- UI の証明は、ARIA スナップショットと、`機材ヤード` が見えるスクリーンショットである。スクリーンショットはツールがリポジトリの外に書くので、機能ファイルが指名した `artifacts/` のパスへコピーする。
- 保存を伴う証明は、画面に加えて `data/store.json` の該当値を操作後にも読む。
- 機能 ID と、使った入口を成果物に書く。
- 到達できない入口は、試したコマンドと欠けていた前提を報告する。
- 別の入口で通ったことを、スキップした入口の成功として報告しない。

## Feature entry contract

各機能ファイルは H1 と、ユーザーから見える挙動を述べた段落で始まる。その後の H2 は次の4つだけ、この順である。

1. `Sub-features`
2. `How to get to it (user POV)`
3. `Driving it with verify-yard`
4. `Gotchas`

## Features

- [ログイン](./login.md) はデモのロールボタンとメールフォームから入り、ダッシュボードに名前が残ることを確認する。
- [ダッシュボード](./dashboard.md) は件数カードと、貸出中・発送中のリンクを確認する。
- [資産](./assets.md) は検索、絞り込み、詳細へのリンクを確認する。
- [発送](./shipments.md) は輸送の検索と、一覧に出る資産名を確認する。
