# Step 3: Prompt

quality契約のあるMissionは選定ActionのstandardsFingerprint / requiredRuleIds / requiredEvidence / DoDをPromptへ継承する。全文基準を毎回複写せず、対象ruleと根拠pathを必要量だけ読む。

requiredRule本文に特定の実行手順・command・取得件数・探索順・禁止代替が明記されている場合、rule IDだけでなく、そのActionのPASS判定に必要な具体手順をPromptの手順/検証へ明示的に継承する。一般化した要約で具体要件を弱めない。現在の実行環境でその手順を実行できない場合は、代替を勝手にPASS相当へ置換せず、実行不能条件とstatus維持方針をPromptに書く。

## Goal
Step 2で選んだ1 Actionを高品質に実行できるPROMPTを作る。

## Read
Mission STATE、01-analysis.md、02-action.md、必要な資料。

## Requirements
目的、背景、必須入力、手順、調査範囲、禁止事項、成果物パス、DoD、検証方法を含める。
Step 2で選んだ成果と関連作業の範囲を保ち、選定時のDoDを満たさない準備や保存だけで終えない。成果物、根拠、整合、検証が揃う受入単位をPromptへ継承する。
Web調査は情報源の役割と停止条件を明示。事実と推論を分ける。
未知の分野・原典不足の調査を選んだ場合は [調査Skillの選択](../rules/research.md) を読み、調査手順の要否、担当Mission内の保存先、残り時間内の予算、根拠の受渡しを明示する。単純な事実確認まで深掘りへ広げない。
Step 4が会話履歴なしで実行できる自己完結性を持たせる。

## Save
<mission_path>/cycles/NNNN/03-prompt.md。
Mission STATEをlast_completed_step=3 / next_step=4へ。

## Done
再取得確認できたとき。
