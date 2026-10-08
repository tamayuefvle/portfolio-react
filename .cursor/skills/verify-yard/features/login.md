# ログイン

ログインすると、選んだデモのロールでダッシュボードが開き、別の画面へ移っても同じユーザーのままです。

## Sub-features

- `login-demo` は Admin のデモボタンから入る。
- `login-form` はメールアドレスとパスワードを送って入る。
- `login-session` は入場後にもう一度ダッシュボードを開き、ログイン画面に戻らない。

## How to get to it (user POV)

- 未ログインで `http://127.0.0.1:3100/login` を開く。
- 見出し `機材ヤード` のカード `デモのロールで入る` から、Admin の `このロールで入る` を押す。
- カード `メールで入る` に `admin@yard.example` と `yard-admin` を入れて `ログイン` を押す。

## Driving it with verify-yard

Preconditions:

- `node .cursor/skills/verify-yard/verify-yard.mjs doctor` が `ok: true` と `url` `http://127.0.0.1:3100` を返す。
- ブラウザに `yard_session` が残っていない。残っているときは、この検証サーバーで `ログアウト` を押してから始める。

- **デモで入る。** `browser_navigate` で `http://127.0.0.1:3100/login` を開く。`browser_snapshot` で、`admin@yard.example` と同じグループにあるボタン `このロールで入る` を特定して `browser_click` する。見出しが `ダッシュボード` になり、本文に `青木 蓮` が出る。
- **セッションが残る。** もう一度 `browser_navigate` で `http://127.0.0.1:3100/dashboard` を開く。`browser_snapshot` の見出しは `ダッシュボード` のままで、`ログイン` ボタンは出ない。
- **メールで入る。** `ログアウト` を押し、`/login` に戻る。テキストボックス `メールアドレス` に `admin@yard.example`、テキストボックス `パスワード` に `yard-admin` を `browser_fill` し、ボタン `ログイン` を押す。再び `ダッシュボード` と `青木 蓮` が見える。
- **証明。** デモ入場の直後と、再 visit の直後に `browser_snapshot` を残す。`browser_take_screenshot` はリポジトリの外に保存するので、そのファイルを `.cursor/skills/verify-yard/artifacts/login/dashboard.png` へコピーする。画面内に `機材ヤード` と `青木 蓮` が見えること。メモ `.cursor/skills/verify-yard/artifacts/login/entry.txt` に使った入口（`login-demo` または `login-form`）を書く。

## Gotchas

- `このロールで入る` は4つある。メールアドレスを見ずに最初のボタンを押すと、意図しないロールになる。
- 既に `yard_session` があると `/login` は `/dashboard` へ移る。ログイン操作の証明にならない。
- ポート 3000 の開発サーバーは、この検証ランが起動したものではない。doctor が指す 3100 だけを操作する。
- ログインは `data/store.json` を書き換えない。ダッシュボードに名前が出ることと、再 visit でログイン画面に戻らないことが副作用の確認である。
