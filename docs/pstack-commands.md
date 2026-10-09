# pstack のコマンドと使う場面

普段の作業は `/poteto-mode` に任せる。目標と、通ったか落ちたか分かる完了条件を書く。下のコマンドは、その手順より多くしたいとき、または少なくしたいときに直接打つ。

```text
/poteto-mode 発送一覧に拠点での絞り込みを足す。完了は、ブラウザで絞り込みが効き、他の画面の件数は変わらないこと。
```

この文面の元は [recipes.md](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-help/references/recipes.md) です。コマンドと場面の対応は [poteto-help](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-help/SKILL.md) にあります。

Enter で送ると、そのメッセージだけに付きます。Windows では Alt+Enter でモードになり、終わるまで毎ターン残ります。

## コードを理解するとき

- `/how` は、今のコードが何をするか、新しいコードをどこに置くかを知りたいときに使います。
- `/why` は、なぜその形なのか、数字がどこから来たのかを知りたいときに使います。
- `/teach` は、変更や仕組みを平易な言葉で説明してほしいときに使います。
- `/recall` は、自分の最近の作業を話題で拾うときに使います。
- `/blast-radius` は、小さな差分が自分の外で何を壊すかを見るときに使います。
- `/bro` は、直前の返事を平易な言葉でもう一度聞きたいときに使います。

## 設計するとき

- `/architect` は、関数をまたぐコードの前に、型とモジュールの形を決めて実装まで進めるときに使います。設計だけ先に見るなら、文面に `with checkpoint` と足します。
- `/arena` は、同じ依頼を複数出して、良い部分を一つにまとめたいときに使います。
- `/swarm` は、範囲を分割して並列に調べるとき、または競わせるときに使います。実行はクラウドエージェントです。

## 作って整えるとき

- `/tdd` は、安いローカルテストがあるバグを、テストから直すときに使います。
- `/typescript-best-practices` は、`.ts` と `.tsx` に TypeScript の規則を当てるときに使います。
- `/no-comments` は、レビューの前に、書いた人とは別の目でコメントを剥がすときに使います。
- `/unslop` は、文章から AI っぽさを取るときに使います。
- `/technical-writing` は、README、RFC、PR の説明、コミットメッセージを決まった水準で書くときに使います。
- `/figure-it-out` は、横断する大きな変更や、離席して後で見る作業の進め方を一本作るときに使います。
- `/show-me-your-work` は、作業中の判断を残し、終わったあとに見直すときに使います。
- `/benchmark-checklist` は、速度の数字を報告する前、またはその数字で次の作業に進む前に使います。

## 確認して出すとき

- `/interrogate` は、複数のモデルに差分をレビューさせ、壊しにいかせるときに使います。
- `/create-verification-skill` は、アプリを操作して動作を証明する手順を新しく作るときに使います。このリポジトリには `verify-yard` が既にあります。
- `/maintain-verification-skill` は、その手順を画面の変化に合わせ直すときに使います。

## 設定と、自分用に残すとき

- `/setup-pstack` は、役割ごとのモデルと予算を変えるときに使います。この環境では設定済みです。
- `/automate-me` は、自分の作業の癖を個人用のモードにするときに使います。
- `/reflect` は、終わった作業の教訓をスキルの修正案にするときに使います。
- `/correct` は、このリポジトリで同じミスを繰り返させないときに使います。
- `/make-bot-ui` は、ボタンが webhook で Grok Bot を起こすページを作るときに使います。
- `/poteto-help` は、どれを使うか迷ったときに使います。

## スラッシュコマンドではない言い方

`/poteto-mode` の中でタスクの言い方が手順を選びます。

- `babysit this pr` や `check on pr 123` は、PR をマージできる状態まで進めます。マージは、merge、land、ship と言ったときだけです。
- `land the stack` は、確認済みの連続した PR を下から取り込みます。
- `take over this branch` は、途中のブランチを引き継ぎます。
- `pause safely` は、再開できる形で作業を止めます。
- `full autopilot on this queue` は、独立した PR をそれぞれマージまで進めます。
- `stack them, don't ship` は、変更を積んだブランチとして渡し、取り込みは自分で行います。
- `run the eval playbook` は、スキルの変更を盲検します。
- フェーズや積む PR の計画を頼むと、計画だけを書いて実装はしません。

紛らわしい組は、役割が分かれています。`/how` は動きを説明します。`/why` は理由を説明します。`/teach` は、その結果を平易な言葉にします。`/arena` は同じ依頼の複数案です。`/swarm` は分割か競争です。`/interrogate` は差分そのものを見ます。`/blast-radius` は差分の外を見ます。`/recall` は最近の話題を集めます。特定のブランチの再開は `take over this branch` です。`/figure-it-out` は一本の作業の進め方です。何日も多くの PR にまたがる進行は、`/poteto-mode` の中の Orchestrate です。一つの完了条件まで走らせるのは Autonomous run です。

pstack の外にあるものもあります。`/deslop`、`control-cli`、`control-ui` は `cursor-team-kit` です。`/loop` と `/create-skill` は Cursor 本体です。`/orchestrate` というスキルは pstack にはありません。

原則は普段コマンドとして打ちません。`/poteto-mode` の文中で `apply prove it works` のように名前を書きます。一覧は [guide page 8](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/08-principles.md) です。
