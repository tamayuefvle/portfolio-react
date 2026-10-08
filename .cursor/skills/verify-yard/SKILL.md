---
name: verify-yard
description: Drive the 機材ヤード Next.js web app in a browser to prove login, dashboard, assets, and shipments. Use when a change touches routes, the session cookie, or user-visible yard behavior and needs a real browser pass.
---

# 機材ヤードをブラウザで確認する

ユーザーが触る面は Web UI です。開発サーバーは `npm run dev`（既定ポート 3000）で、台帳は `data/store.json` に保存します。Playwright も Cypress もありません。起動、診断、停止は同梱の `verify-yard.mjs` が行い、画面操作は Cursor のブラウザツールで行います。

`data/store.json` のパスは固定です。このチェックアウトで `next dev` を2つ動かすと、同じ台帳を書き換えます。検証ランが起動していないサーバーは操作しないでください。

## Launch

リポジトリのルートで実行します。

```bash
node .cursor/skills/verify-yard/verify-yard.mjs launch
```

これは `node node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3100` を、このリポジトリを cwd にして切り離して起動します。準備完了は `http://127.0.0.1:3100/login` の HTML に `機材ヤード` が含まれることです。成功すると pid、url、cwd を JSON で出します。記録は `.cursor/skills/verify-yard/run/instance.json`、ログは `.cursor/skills/verify-yard/run/server.log` です。

既にこの検証ランのサーバーが健全なら、2つ目は起動せずその JSON を返します。別の `next` がこのチェックアウトで動いているとき、または 3100 を他のプロセスが待受しているときは、何も起動せず終了コード 1 で止まります。

## Doctor

操作の前、様子がおかしいとき、最初にこれを実行します。

```bash
node .cursor/skills/verify-yard/verify-yard.mjs doctor
```

読むだけです。次がすべて真のときだけ JSON で `ok: true` を出します。

- `instance.json` があり、cwd がこのリポジトリである
- 記録した pid が生きている
- 3100 の TCP 待受が、その pid 自身かその子である
- `GET /login` の本文に `機材ヤード` がある

どれか欠けるときは終了コード 1 です。そのインスタンスは操作しないでください。

## Drive

`features/README.md` を読んでから、対象機能のファイルに従います。画面操作は Cursor のブラウザツールです。座標やタブ順ではなく、スナップショットのアクセシブル名を使います。

1. `browser_navigate` で doctor が返した `url` から始める。ログイン前の入口は `/login`。
2. `browser_lock` でロックしてから操作し、終わったら解除する。
3. `browser_snapshot` でボタンとリンクの名前を取り、`browser_click` と `browser_fill` で操作する。
4. 操作の直前と、結果の画面の両方を `browser_snapshot` で残す。`browser_take_screenshot` はリポジトリの外に保存するので、返されたファイルを `artifacts/<feature-id>/` へコピーする。

ログインの安定した名前は次のとおりです。

- 見出し `機材ヤード`
- デモ入場のボタン `このロールで入る`。4つある。押す前に、同じグループに目的のメールアドレスがあることをスナップショットで確認する
- メール欄のラベル `メールアドレス`、パスワード欄のラベル `パスワード`、送信ボタン `ログイン`
- 入場後の見出し `ダッシュボード`、ナビのリンク `資産` `発送` `拠点` `ユーザー` `設定`

Admin のデモアカウントは `admin@yard.example` / `yard-admin`、表示名は `青木 蓮` です。

## Evidence

成果物は `.cursor/skills/verify-yard/artifacts/<feature-id>/` に置きます。cleanup はこのディレクトリを消しません。

証明の基準:

- ユーザーが辿る画面で操作する。Server Action をテストから直接呼ばない。`npm test` のドメイン検証で画面確認の代わりにしない
- 操作前のスナップショットと、操作後の画面の両方を残す。最終画面だけを成功にしない
- ログインの副作用は、同じブラウザでもう一度 `/dashboard` を開き、ログイン画面に戻らず `青木 蓮` が見えることです
- 台帳を変える操作は、画面に加えて `data/store.json` の該当箇所を操作前後で成果物にコピーする。このアプリに外部サービスのモック境界はありません
- 使った feature ID と入口（デモのボタンか、メールフォームか）を成果物のメモに書く
- 到達できなかった入口は、実行したコマンドと満たせなかった前提を報告する。別の入口で通ったことを、その入口の成功として報告しない

## Cleanup

起動したプロセスツリーだけを止め、`run/` を削除します。

```bash
node .cursor/skills/verify-yard/verify-yard.mjs cleanup
```

内部では記録された pid に対して `taskkill /PID <pid> /T /F` を実行します。プロセス名では止めません。`artifacts/` と `data/store.json` は残します。失敗した試行のあとにも cleanup を実行し、3100 を放置しないでください。

## Helpers

```bash
node .cursor/skills/verify-yard/verify-yard.mjs launch
node .cursor/skills/verify-yard/verify-yard.mjs doctor
node .cursor/skills/verify-yard/verify-yard.mjs cleanup
```

実装は `.cursor/skills/verify-yard/verify-yard.mjs` です。
