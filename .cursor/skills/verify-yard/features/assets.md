# 資産

資産画面は、名前かシリアルで台帳を絞り、行から資産の詳細を開きます。

## Sub-features

- `assets-search` は検索欄に入れた文字列で行を絞る。
- `assets-empty` は一致がないとき、空の案内を出す。
- `assets-open` は行の名前から詳細を開く。

## How to get to it (user POV)

- 左のナビで `資産` を押す。
- ブラウザで `http://127.0.0.1:3100/assets` を開く。
- ダッシュボードの件数カードから `/assets?status=available` のように開く。

## Driving it with verify-yard

Preconditions:

- doctor が `ok: true` を返す。
- Admin でログインしている。
- 台帳に `ThinkPad X1` がある。シード直後のシリアルは `TP-1001` である。

- **名前で絞る。** `browser_navigate` で `http://127.0.0.1:3100/assets` を開く。テキストボックス `検索` に `ThinkPad` を `browser_fill` する。`browser_snapshot` にリンク `ThinkPad X1` があり、`MacBook Pro 14` は無い。
- **一致なし。** 同じ欄を `zzz-no-such-asset` に変える。見出し `該当する資産がありません` が出て、資産名のリンクは無い。
- **詳細を開く。** 欄を空に戻し、リンク `ThinkPad X1` を押す。URL が `/assets/ast_01` で、見出しが `ThinkPad X1` である。
- **証明。** 絞り込み後のスナップショットと、スクリーンショット `.cursor/skills/verify-yard/artifacts/assets/search.png` を残す。画面に `機材ヤード` と `ThinkPad X1` が見えること。使った入口を `.cursor/skills/verify-yard/artifacts/assets/entry.txt` に書く。

## Gotchas

- 検索は入力のたびに URL の `search` を更新する。空の結果を見たあとは、欄を空に戻さないと詳細リンクが出ない。
- `資産を登録` は台帳を書き換える。このマップの確認手順では押さない。登録を証明するときは、操作前後の `data/store.json` を成果物にコピーし、この検証サーバー以外の `next dev` が動いていないことを doctor で確認する。
- Viewer でも一覧は見える。登録ボタンの有無はロールで変わる。検索の証明は Admin で行う。
