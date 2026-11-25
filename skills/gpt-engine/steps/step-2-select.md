# Step 2: Select Action

## Goal
Active Missionの課題達成に必要なActionを整理し、今回のCycleで実行する1件を選ぶ。

## Read
Mission STATE、現cycle 01-analysis、Mission BACKLOG、必要な前成果物。

## Selection
効果、緊急度、依存関係、実行可能性、リスク、重複作業で比較する。

## Blocked Action
blocked_until_change=trueのActionは原因に意味ある変化があるまで再選択禁止。unblock時は変化を02-action.mdへ記録する。

## Action size
主目的1つ・限定範囲・受け渡せる成果と明確なDoD。[cycle-delivery.md](../rules/cycle-delivery.md)の成果単位で、同じ目的に必要な調査・修正・整合・検証を一緒に選ぶ。ファイル数やモデル名だけで細分化しない。
候補間で同じ入力・同じ受入条件を使う関連未達を比較し、まとめる範囲と除外する範囲を決める。実際の権限・依存・実行上限で分割する場合は、その根拠と各片の単独での受入条件を記す。小さくても未達を解消する修正は、水増しせず選んでよい。
通常は「20〜40分程度のまとまった作業で、どの未達を何が使える状態まで進められるか」を考え、成果から作業を組み立てる。候補ごとに、利用者・後続担当、現在と達成後の差、その成果に必要な調査・修正・整合・検証・受渡し、依存・権限・DoDを対応付ける。直近の実測は実行可能性の補助に使い、時間不足を理由に必須工程を落とさない。時間に合わせた追加・分割・打切りはせず、必要な成果が短く成立すれば終了してよい。

## Save
<mission_path>/cycles/NNNN/02-action.md に候補、選定理由、誰が何を使えるようになるか、前後の差、必要な一連の作業、Scope、Out of scope、成果物、DoD、制約、関連作業をまとめた/分けた理由。
Mission STATEをlast_completed_step=2 / next_step=3へ。

## Done
保存後に再取得できたとき。

## Quality contract
選定ActionへstandardsFingerprint / requiredRuleIds / requiredEvidence / DoDを記録する。基準の不足を実際の修正Actionへ変換し、評価だけの反復を避ける。

## 実行能力と範囲
事前構築内でオンライン実行・保存・自己チェックできるActionを選ぶ。本構築・独立監査はhandoffへ送り、選定しない。これらの環境不足だけを理由にGPTのblockedとしない。必須入力が範囲内の成果物を阻害する場合は具体的な解除条件を残す。


## Downstream preparation
`codex_construction` の実作業は選定しないが、未実施Codex作業を追加設計なしで着手可能にする実行packet/handoff作成は `gpt_preconstruction` Actionとして選定できる。実行可能Action=0判定の前に、未達downstream項目ごとにpacketの完全性とhandoff同期余地を確認する。
