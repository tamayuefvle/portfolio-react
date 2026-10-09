---
name: yard-jev-review
description: >-
  Scores a coherent 機材ヤード source change with the jev_review MCP tool, then
  explains weak metrics from the code. Use when poteto-mode finishes a src
  change, when the stop hook asks for a baseline, or when the user asks for
  jev_review. Do not use for questions, docs-only edits, or src/components/ui.
---

# 機材ヤードの jev_review

点数は `user-jev-review` の `jev_review` から取る。原因の文章は返らない。弱い指標は自分でコードを読んで日本語で説明する。定型の summary や issue を原因として書かない。点数は作らない。キー未設定ならその旨を書いて止まる。

プラグインの `jev-review` スキルが採点ループの一般形を持つ。このリポジトリでは、タイミングと入力と止まりどころはここが優先する。

## いつ呼ぶか

`/poteto-mode` の実装が `src` を変えたあと、完了を宣言する前に一度呼ぶ。`stop` フックがその差分に対して follow-up を出したときが、そのタイミングである。調査だけのターン、`docs` だけ、`src/components/ui` だけ、整形だけ、では呼ばない。

画面の証明は `verify-yard` が持つ。Jev はその代わりにならない。

## 入力

`task` には、ユーザーが書いた完了条件と、Phase 1 の画面・権限・「Supabase と本番認証は未接続でよい」を入れる。正本は `docs/portfolio-plan.md` と `docs/project-context.md` であり、計画全文は貼らない。

`diff` は `src` の現在の差分である。`package-lock.json`、`src/components/ui`、`data/store.json`、秘密情報は入れない。

`files` は、差分だけでは呼び出し側が見えないときだけ足す。`repositoryContext` には、走らせた `npm test` の結果と、README にあるローカル認証の制約だけを書く。

再採点のときだけ、直前のツール応答をそのまま `previousEvaluation` に渡す。別の作業の点数と比べない。

## 止まりどころ

ユーザーが修正しないと言っているときは、点数と信頼度と、コードを読んだ説明で終える。

そうでなければ、基準点のあと、正しさ、信頼性、セキュリティ、テスト品質のうち最も弱い一点だけを、根拠のある最小の修正で直す。`npm test` のあと、同じ task と対象で一度だけ再採点する。そこで終える。点を上げるための抽象化、無意味なテスト、コメント、ファイル分割はしない。

フックは同じ差分では二度起こさない。follow-up の中で再採点まで終えたら、追加の採点を待たない。
