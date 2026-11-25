# Retry Policy

## Goal
失敗箇所だけを再試行し、完了済み作業の重複と同一Stepでの無限停止を防ぐ。

## State
失敗時は必要に応じ以下をSTATE.mdへ記録する。
- consecutive_failures
- total_failures
- retry_budget
- circuit_status: closed / open
- blocked_step
- blocked_reason
- failure_type

成功したらconsecutive_failuresを0へ戻す。total_failuresは履歴として維持してよい。

## Recovered failure evidence
失敗時にGitHubへSTATE/failure record自体を保存できなかった場合でも、その後のretryが成功した時点で、可能ならMission STATEまたはcycle成果物へ以下を記録する。
- recovered_failure: true
- failure_type
- failed_step
- occurrence_count_in_cycle
- recovered_at_step
- recovery: save_only_retry / other

同一cycle内の同一根本原因はObservation countを水増ししないが、発生回数自体はStep 7が判断できるよう保持する。
チャット履歴だけをfailure evidenceの正本にしない。

## Default retry budget
同一Step・同一根本原因の連続失敗は原則3回まで。
認証失敗など再試行しても改善しないことが明白な場合は、3回を待たずcircuitをopenにしてよい。
安全チェックで同じ呼び出しを繰り返すことをretry回数稼ぎに使わない。

## Result prerequisite
Retry判断の前に github-persistence.md のreconciliationを行い、tool_resultとpersistence_resultを分離する。
retry budgetへ加算するのは原則として同一Step/同一根本原因のconfirmed `no_persistence`。
`partial_success` はmissing workだけ継続し、`full_success` はretryしない。
`unknown` は追加read/診断で確定を試み、直ちにconfirmed failureへ数えない。

## Retry
### persistence only failed
execution_status=completed かつ artifact_status=generated/validated の場合、調査・推論・生成を再実行せず保存だけ再試行する。
保存形式変更後も03-prompt.mdのDoDと必須出力を維持し、保存後に再照合する。

### conflict / create-update mismatch
対象の存在と最新SHAを再取得する。
create/updateの操作種別が正しいか再判定し、既に反映済みの変更を重複実行せずmissing writeだけ実行する。

### safety_block
同じ呼び出しを無制限に繰り返さない。
まずread-backでfull / partial / no_persistence / unknownを確認する。
安全上の拒否を受けた内容は、分割・言い換え・難読化で再送しない。拒否された操作は止めて、利用者へ報告する。

### diagnostic artifacts
一時ファイルは原則最終成果物に残さない。残す場合は理由を記録する。

## Circuit breaker
consecutive_failures >= retry_budget、または再試行不能と判断した場合:
1. circuit_status=open。
2. 現Stepの通常処理を停止する。
3. 選定タスクがある場合はblockedとして記録し、blocked_reasonとblocked_until_change=trueを付ける。
4. failure recordを可能な範囲でGitHubへ保存する。
5. next_step=7、transition_reason=retry_budget_exhausted とし、Emergency Step 7へ遷移する。
6. Step 7は失敗事象をobservationへ記録し、その後Step 8へ進む。
7. Step 8完了後、cycleをcompletedとして次cycle Step 1へ進む。

Step 5/6を飛ばした場合は「未実施」として記録し、完了したかのように扱わない。

## Emergency evidence fallback / same-run closure
Emergency closureの完了条件は、特定の障害ファイル名がすべて存在することではなく、**再開と監査に必要な障害証跡がGitHub正本へ永続化されていること**とする。

- `failure-record.md` は障害証跡の第一候補だが、保存自体が同じ根本原因で `no_persistence` となった場合、同runで同じwriteを反復しない。
- その場合、保存可能な `07-cycle-review.md` または既存のCycle記録へ、少なくとも `failed_step / failure_type / persistence_result / retry回数またはbudget状態 / blocked Action / root causeまたはunknown / resume condition / failure-record自身の保存成否` を記録する。
- 上記の必須情報を含むCycle-local evidenceが1件以上read-backでき、必要なroot registry記録、Step 8、最終STATEがread-backできれば、`failure-record.md` 単体が未保存でもEmergency Cycleをcompletedにできる。
- 未保存artifactは `unpersisted` と明記し、存在した・保存成功したと扱わない。後続runでそのファイルだけをCycle閉鎖条件として機械的に再試行しない。
- root registry自体が同じ根本原因で保存不能な場合も、同runで無限retryしない。Cycle-local evidenceとSTATEにregistry未保存・再開条件を残し、shared stateのmissing updateとして後続で扱う。ただしregistryの未保存を隠してObservation登録済みとはしない。
- 409は従来どおりsafety_blockに数えず、latest SHAからmissing差分だけ再計算する。
- このfallbackは安全チェック、retry budget、未実施Stepの扱い、blocked_until_change、stage boundaryを弱めない。安全機構を通すための文言変更・難読化・別経路利用は禁止する。
- 目標はretry exhaustedを検出した**同じrun内で Emergency Step 7 → 8 → STATE-last まで閉じること**。保存可能な正本があるのに、特定の補助ファイル1件だけを理由に次回runへ持ち越さない。

## Cross-cycle block
blocked_until_change=true のタスクは、根本原因に意味のある変化が確認できるまでStep 2で再選択しない。
変化例:
- Skill/Rule/保存方式の変更
- 認証・権限・外部依存の復旧
- 入力条件の変更
- 別の実行経路が利用可能（安全上の拒否を受けた操作を、別の経路で通す場合を除く）

## Resume
「次すすめて」ではSTATEを確認する。
- circuit closedかつretry余地あり → 未完了箇所からretry
- circuit open → 同じStepへ戻らずnext_stepのEmergency Step 7へ進む

## 工程境界
本構築のローカル依存は事前構築の再試行対象ではなくhandoffの後続条件である。範囲内Actionが0件でblocked原因に変化がない場合は新Cycleを反復せず終了契約に従う。
