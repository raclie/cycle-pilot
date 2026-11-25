# Cycle Transition

## Normal
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 次cycleの1。

## Normal responsibilities
- Step 5: WHAT。完了後next_step=6。
- Step 6: HOW。完了後next_step=7。
- Step 7: SYSTEM。完了後next_step=8。
- Step 8: DOCUMENTATION。完了後cycle_status=completed / next_step=1。

## Exceptional escape
同一Stepでretry budgetを使い切った、または再試行不能な場合:
current Step → Emergency Step 7 → Step 8 → next cycle Step 1

Emergency遷移では未実施の中間Stepをcompleted扱いにしない。
STATEにblocked_step、blocked_reason、transition_reason=retry_budget_exhaustedを残す。
選定タスクはblocked_until_change=trueとして次cycleへ持ち越す。

Emergency closureでは `failure-record.md` 等の特定ファイル名を一律必須にしない。retry-policyのEmergency evidence fallbackに従い、必要な障害情報を含むCycle-local evidenceが少なくとも1件GitHubへ保存・read-backされ、必要なregistry処理、Step 8、STATE-lastが整合すれば同runでcycleをcompletedにできる。保存不能な補助artifactは `unpersisted` と明示し、未保存の事実を07/08/STATEへ残す。

Emergency中にあるwriteが同じ根本原因でno_persistenceになっても、別の正規な必須writeが実行可能なら同run内で7→8→STATE-lastを続行する。特定ファイル1件の保存失敗だけを理由にEmergency closure全体を次runへ分割しない。

## Next command
工程指定のない「次をすすめて」はSTATE.mdのnext_stepから現在のCycleのStep 8・最終STATE再取得まで続行する。単一Step指定はその工程だけ。[cycle-delivery.md](cycle-delivery.md)に従い、現在のCycleを閉じた後に次Cycleを自動開始しない。
- circuit_statusがclosedなら通常のnext_step。
- circuit_statusがopenなら失敗Stepを再実行せずEmergency Step 7へ進む。
これにより同一Stepでの無限ループを防ぐ。

## Stage終了の優先
事前構築成功条件と引継ぎが揃ったら終了契約を優先し、通常の次Cycleへ進まない。実行可能Actionが0件で同じblocked原因に変化がなければ観測だけのCycleを繰り返さない。
