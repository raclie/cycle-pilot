# Cycle Observation Policy

## Principle
Step 7は自己改造工程ではなく、構造改善の観測・計測・昇格工程。

## Lifecycle
observing → promote → handed_off → resolved / rejected

## Threshold
| Severity | Threshold |
|---|---:|
| critical | 1 |
| high | 2 |
| normal | 3 |
| low | 5 |

## Promotion rules
- 閾値到達だけで自動修正しない。
- promote後、次cycle Step 1で通常課題と一緒に分析する。
- Step 2で他課題と比較して選定されて初めて構造変更タスクになり得る。

## Retry exhaustion
同一Stepのretry budget exhaustedはStep 7へのEmergency input。
同一cycle内の同一根本原因は複数失敗してもcount +1まで。
複数cycleで再発すれば通常どおりcountを増やす。
blocked taskは根本原因が変化するまで再選択しない。

## Shared registry concurrency
root `cycle-observations/registry.md` はMission横断のshared stateとして扱う。
- 過去のCycle成果物に記録された予定countを固定更新値として再利用しない。
- write直前にlatest SHA、対象OBSのcurrent count / last cycle、当該Cycle記録の有無をread-backする。
- 当該Mission/Cycle/rootが未記録なら、その時点のcurrent countへ+1だけ適用し、他Missionの並行更新を保持する。
- 409や保存失敗後の再開でもlatest値からmissing append/updateだけを再計算し、古いplanned countへ巻き戻さない。
## Anti-overfitting
単発の不便を即構造変更しない。
同じ根本原因を別IDで水増ししない。
severityを閾値短縮目的で過大評価しない。

## Step 1 handoff
Step 1はstatus=promoteとblocked taskを確認する。
promoteは構造改善候補として分析するが自動最優先にしない。
blocked taskは原因変化の有無を確認し、変化なしならStep 2で再選択させない。
