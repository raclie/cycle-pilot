# GitHub Persistence

## Principle
GitHubへの永続化はStep完了条件の一部。安全機構を回避・弱体化せず、正本の実状態を基準に進行する。

## Preflight
各write前に対象ごとに確認する。
- target path
- intended operation: create / update
- existence
- updateならlatest SHA
- content role: artifact / shared state / Mission STATE

存在不明のままcreate/updateを選ばない。既存ファイルへcreate、存在しないファイルへupdateをしない。

## Standard write sequence
1. Action Artifact / cycle outputを1 logical fileずつ保存。
2. 各重要Artifactをread-backし、Prompt/DoDを確認。
3. 必要なMission BACKLOG / engine registry等shared stateを1ファイルずつ保存。
4. shared stateをread-back。
5. Mission STATEを最後に更新。
6. STATEをread-backしStep transitionを確認。

複数writeを1 tool orchestrationへまとめてもatomicityを前提にしない。標準経路では個々のwrite結果を独立して扱う。

## Tool orchestration safety
GitHub writeを組み立てるlocal JavaScript自体の構文・scope失敗を減らすため、次を標準とする。

- 長いArtifact本文とtool呼び出しの制御ロジックを複雑に混在させない。長文contentは、単純な文字列配列を `join` する等、構文境界が明確な方法を優先する。
- 複雑なtemplate literalへ大量の引用符・別構文・制御処理を埋め込み、1つのsyntax errorでwrite自体が起動不能になる構成を避ける。
- 1 logical writeのorchestrationは、target path / operation / content / message等の役割を追跡しやすい形に保つ。独立writeを巨大な1つのlocal JavaScriptへ詰め込まない。
- 同一orchestration内で汎用変数名を不用意に再宣言・再利用しない。path、content、取得結果等は役割を判別できる名前を使い、独立writeを分けられる場合はscopeも分ける。
- tool invocation前にJavaScriptのsyntax / scope / string constructionが失敗した場合、それだけでGitHub persistence failureと確定しない。対象をread-backし、`full_success / partial_success / no_persistence / unknown` を判定する。
- `no_persistence` なら、完了済みの調査・推論・Artifact生成をやり直さず、既に生成済みcontentのmissing writeだけを、より単純な構築で実行する。recovered failure evidenceはretry-policy.mdに従う。
- この単純化は安全機構回避のために使わない。preflight、create/update判定、latest SHA、read-back reconciliation、missing-writes-only、STATE-last、retry budget / circuit breakerは維持する。
- 長い既存Artifactを限定修正する場合は、可能な限り既存contentをbaselineとして取得し、小さなanchor replacement / insertionで編集する。限定修正のために全文を新しい長大なlocal JavaScript literalとして再構築しない。
- tool invocation前のconstruction failureから `no_persistence` を復旧するとき、保存成功だけを目的にcontentを要約・縮約・意味変更しない。missing writeは、既に生成済みcontentとのsemantic equivalenceを維持する。
- recoveryでcontent construction方式を変更した場合、write前またはread-back直後に元PROMPT / DoDのsemantic coverageを再検証する。required section、question coverage、invariant等がある場合はそれらを明示的に確認する。
- README / self-check等の検証記録は、対象Artifactのread-backとsemantic verification後に作成する。
- 長文contentの生成・編集とwrite invocationは、可能なら別orchestrationへ分ける。write側のlocal JavaScriptはtarget / operation / content / messageを追跡できる短い制御に保つ。
- ローカル準備・読取の結果は、toolの終了状態と、期待する形式・必須項目・固定入力との対応を確認してからwrite contentへ使う。失敗しても生成物がある可能性は独立した再読取で確かめ、エラー出力を完成Artifactとして扱わない。診断記録として保存するときは役割を明示する。

## Result model
tool呼び出し結果とGitHub永続化結果を分離する。

### tool_result
- success
- error

### persistence_result
- full_success: 目的の変更がすべて反映済み
- partial_success: 一部だけ反映済み
- no_persistence: 対象変更が未反映
- unknown: read-back等でもまだ確定できない

tool_result=errorだけでconfirmed persistence failureとしない。

## Reconciliation
errorまたは結果が曖昧な場合、retry前にGitHubをread-backする。
- full_success → retryなし
- partial_success → missing writesだけ実行
- no_persistence → retry-policyへ
- unknown → 追加read/診断。早まってfailure countへ入れない

## STATE semantics
STATEは最後に進める。
STATE updateが失敗/不明でも、既に保存済みArtifact/shared stateを破棄・再生成しない。
それらをread-backし、必要ならSTATE transitionだけ再実行する。

## Artifact design
長い調査成果物は必要に応じて分析本体とsources/evidenceへ分離する。
分離後も元PROMPTの必須情報と追跡性を失わない。
保存制約だけを目的に意味を失うほど削らない。

## Concurrent / external writer diagnosis
write拒否・競合・想定外SHA・STATE不整合が起きた場合、自分の処理だけを原因候補に限定しない。安全チェックを回避する試験ではなく、GitHub正本のread-only事実から次を切り分ける。

- target / parent state / shared registryのlatest SHAを再取得し、直前に自分がreadしたSHAから変化しているか確認する。
- 変化している場合、自分の直前write成功による変化か、別の並行writerによる先行更新かを、取得できるcommit SHA・対象path・保存済み内容・時系列で区別する。
- 同一repoで別Mission、別Automation、Codex、別ChatGPT実行、ユーザー操作等の並行writerが存在し得ることを仮説に含める。ただし実行主体を証拠なく断定しない。
- 409がなくても、write前後でlatest SHAや関連shared stateが変化していればconcurrency evidenceとして記録する。逆にSHA変化がなければ「他AIが書いた」と推測しない。
- shared registryでは他Missionの追加を必ず保持し、latest値からmissing append/updateだけ再計算する。
- 同じ時間帯に自然発生した別pathの成功writeがあれば、repo全体・認証全体の障害か、target/write固有かを切り分ける材料にする。診断専用writeは作らない。
- tool/connector、GitHub、並行writer、STATE stale、local construction、安全チェック、認証/権限、外部依存を独立した原因候補として評価する。

この診断は既存の正規readと自然発生ログだけで行い、安全チェックの通過条件探索や他writerへの干渉には使わない。

## Failure and safety
GitHub API拒否、認証/競合、connector/tool error、安全チェック等を可能な範囲で区別する。
安全チェックを回避する目的で内容を偽装・難読化しない。
同じblocked callを無制限に繰り返さない。

## Diagnostic artifacts
一時ファイルは原則最終成果物に残さない。

詳細retry: retry-policy.md。
