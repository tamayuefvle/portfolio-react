# ダッシュボード

ダッシュボードは、ログインしたユーザーの名前、ステータスごとの件数、貸出中と発送中の一覧を見せます。

## Sub-features

- `dashboard-counts` は利用可能、貸出中、発送中、利用停止の件数カードを見せる。
- `dashboard-loans` は返却前の貸出から資産詳細へ移る。
- `dashboard-shipments` は到着前の発送から発送一覧へ移る。

## How to get to it (user POV)

- Admin でログインしたあと、最初に開く画面。
- 左のナビで `ダッシュボード` を押す。
- ブラウザで `http://127.0.0.1:3100/dashboard` を開く。

## Driving it with verify-yard

Preconditions:

- doctor が `ok: true` を返す。
- `features/login.md` のデモ入口で Admin として入っている。見出しが `ダッシュボード` である。

- **件数を見る。** `browser_snapshot` で、組織名 `北浜機材`、見出し `ダッシュボード`、`青木 蓮 さん、今日の台帳です。` を確認する。カード `利用可能` `貸出中` `発送中` `利用停止` がそれぞれ1つずつある。
- **貸出から詳細へ。** カード `貸出中` のリンク `MacBook Pro 14` を `browser_click` する。URL が `/assets/` で始まり、見出しに `MacBook Pro 14` が出る。
- **発送一覧へ。** `browser_navigate` で `http://127.0.0.1:3100/dashboard` に戻り、カード `発送中` のリンク `騒音計 NL-42` を押す。見出しが `発送` になる。
- **証明。** ダッシュボードのスナップショットと、スクリーンショット `.cursor/skills/verify-yard/artifacts/dashboard/home.png` を残す。`機材ヤード` と4つの件数カードが見えること。入口はナビか直接 URL かを `.cursor/skills/verify-yard/artifacts/dashboard/entry.txt` に書く。

## Gotchas

- 未ログインの `/dashboard` は `/login` へ移る。ダッシュボードの証明にしない。
- 件数は `data/store.json` の資産ステータスから出る。シードと違う台帳ではカードの数字が変わる。数字がシードと違うときは、先に store の中身を読み、その値と画面が一致するかを見る。
- 貸出中が空のときは `貸出中の資産はありません。` と出る。その状態で `MacBook Pro 14` を探すのは、前提が欠けている。
