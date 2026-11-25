# Step 5: Evaluate

## Goal
Mission課題→Action→PROMPT→Artifactの一貫性とDoDを評価する。Engine改善はStep 6へ送る。

## Read
Missionの01-analysis、02-action、03-prompt、04-output、BACKLOG。

## Evaluate
課題→Action / Action→PROMPT / PROMPT→Artifact / Artifact→Mission objective / DoD / 未達 / 次工程影響。
Step 2で約束した成果単位で判断し、成果の小片だけを保存した結果へDoDを後付けで縮めない。Actionの未達とCycle閉鎖は別判定とし、工程指定のない実行ではStep 6〜8まで続ける。
選定時に約束した前後の差、利用者・後続担当が使える成果、必要な検証と受渡しを実証拠で照合する。所要時間は合否ではなく、見積りと進め方の改善材料として記録する。待ち時間・作業時間の不明部分と成果の充足を分け、時間区分だけで作業量の過不足を決めない。途中値はStep 8の最終STATE保存前の計測と区別する。

## Fix policy
機械的軽微修正のみStep 5内。判断・調査・再設計はMission BACKLOGへ。Engine改善はStep 6。

## Save
<mission_path>/cycles/NNNN/05-evaluation.md、必要なMission BACKLOG更新。
Mission STATEをlast_completed_step=5 / next_step=6へ。

## Done
評価・BACKLOG・STATEの保存確認後。

## Quality contract
quality契約がある場合は固定bundleのruleごとに実成果物hash・引用・判断理由を評価へ保存する。coverage不足、pending/fail、旧versionの自己PASSではstageを完了しない。独立監査・実環境ゲートはdownstreamの未実施として保持する。

## 工程別評価
事前構築の成功条件とhandoffの充足を評価する。自己チェックと独立監査を区別する。後続工程へ移した未実施項目は未実施として保持し、チケット全体の受入条件達成と混同しない。
