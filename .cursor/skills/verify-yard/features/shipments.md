# 発送

発送画面は、拠点間の輸送を資産名かシリアルで探し、一覧に状態を出します。

## Sub-features

- `shipments-list` は輸送の一覧を見せる。
- `shipments-search` は資産名で行を絞る。
- `shipments-empty` は一致がないとき、空の案内を出す。

## How to get to it (user POV)

- 左のナビで `発送` を押す。
- ブラウザで `http://127.0.0.1:3100/shipments` を開く。
- ダッシュボードの `発送中` にある資産名を押す。

## Driving it with verify-yard

Preconditions:

- doctor が `ok: true` を返す。
- Admin でログインしている。
- 台帳に、大阪倉庫から仙台拠点への輸送中の `騒音計 NL-42` がある。

- **一覧を見る。** `browser_navigate` で `http://127.0.0.1:3100/shipments` を開く。`browser_snapshot` の見出しは `発送` で、`騒音計 NL-42` が見える。
- **名前で絞る。** プレースホルダ `資産名またはシリアル` の欄に `騒音計` を入れ、ボタン `検索` を押す。一覧に `騒音計 NL-42` が残り、`ドッキングステーション` は無い。
- **一致なし。** 同じ欄を `zzz-no-such-shipment` にして `検索` を押す。見出し `該当する発送がありません` が出る。
- **証明。** 絞り込み後のスナップショットと、スクリーンショット `.cursor/skills/verify-yard/artifacts/shipments/search.png` を残す。画面に `機材ヤード` と `騒音計 NL-42` が見えること。使った入口を `.cursor/skills/verify-yard/artifacts/shipments/entry.txt` に書く。

## Gotchas

- 検索はフォーム送信で URL の `q` が変わる。入力しただけでは一覧は絞られない。
- `到着` は輸送を届け済みに変え、資産の状態も台帳に書く。このマップの確認手順では押さない。
- ダッシュボード経由の入口は `/shipments` へ移るだけである。検索欄を使った証明の代わりにしない。
