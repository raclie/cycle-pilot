# Step 1: Analyze

## Goal
Active Missionの最新状態を把握し、課題をMission正本へ反映する。

## Read / Step1内部の順序
最初に実行Context（未指定時はACTIVE_CONTEXT）→ scoped skills → Mission MISSION.md/最新STATEと安全・権限・STOP・stage/scope・現行の一次事実を確認する。安全上必要な既存STATEや障害はFresh前でも読む。
ただし**前Cycleの改善結論・推奨Actionを最初の候補として採用しない**。BACKLOG、MIGRATIONS.md（存在する場合）、前Cycleの05〜08、必要な前成果物、Engine共通registryは下記1-Bまでに読み、過去の制約や完了事実を必ず保持する。
すでに会話の文脈で旧判断を知っている場合は完全なblind分析ではないことを記録する。

## Architecture version
新cycleはMission STATEの `architecture_version` を継承する。
01-analysis.mdに使用Architecture versionを記録する。
過去cycleが旧versionでも再実行・一括補正しない。compatibility ruleで読む。

## Do：1-A Fresh → 1-B Contrast → 1-C Synthesize
**1-A Fresh**：安全・権限と最新の一次事実から、Missionの未達を解消し得る実行可能な選択肢を**最大3件**、前回の推奨手段を前提にせず挙げる。各候補は事実根拠、使える成果、リスクを短く示し、無理に3件を作らない。
**1-B Contrast**：前CycleのStep5 WHAT/6 HOW/7 SYSTEM/8 DOCUMENTATION、BACKLOGと構造観測を照合する。旧判断ごとに `confirm / revise / reject / hold` と理由を記録し、既に達成したもの・blocked_until_change・Mission STOPを尊重する。
**1-C Synthesize**：継続・変更・簡素化/削除を比較し、Step2のAction候補と具体的な未確認事項を示す。旧結論を機械的に採用せず、逆に反証のためだけの新Actionも作らない。
新cycleはMission STATEから正規採番し、目的との差・リスク・実行可能なowner範囲を整理。promote observationとblocked原因変化を確認。完了済み成果物を理由なく再設計しない。
3区分は既存 `01-analysis.md` の内部記述で完結させ、Step数・追加承認/書類・STATE schemaは増やさない。詳しい証拠・自律性は [Harness境界](../rules/harness-evidence-and-effects.md) に従う。

## Save
<mission_path>/cycles/NNNN/01-analysis.md。
必要ならMission BACKLOGとengine registryを更新。
Mission STATEをlast_completed_step=1 / next_step=2へ。

## Done
保存後に再取得できたとき。

## Quality contract
quality契約のあるMissionはCycle開始に最新source fingerprintを確認し、固定bundleと基準差分・要再評価ruleを01-analysisへ記録する。取得失敗は古い版で進めず保留する。

## Stage boundary
最初にMissionのexecution_stageとscope_revisionを読み、事前構築成功条件と後続Ticket受入条件を分ける。後続工程だけのローカル依存はhandoffへ分類する。成功条件達成済みなら終了契約を優先する。


## Action ownership
未達quality/backlogを `gpt_preconstruction / codex_construction / external_condition` に分類する。Codex実作業が未実施でも、その実行packet・handoff・検証仕様をGPT側で先行作成できるなら `gpt_preconstruction` 候補として分析する。直接PASS不能だけを理由に実行可能Action=0としない。
