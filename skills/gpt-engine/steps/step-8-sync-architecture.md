# Step 8: Sync Architecture

## Goal
Engine実装・設計書・ADRと、Workspace/Mission階層の説明を同期する。

## Architecture diagram
`docs/architecture/diagrams.md` を設計同期対象に必ず含める。Work hierarchy、Skill Scope、promotion/demotion、retry escapeのいずれかが変わった場合は図の更新要否を確認する。

## Read
ACTIVE_CONTEXT、Active Mission STATE、Engine skills/rules/templates、cycle-observations、docs/architecture、ADR、現cycle 06/07。

## Compare
1. Engine implementation
2. Architecture documentation
3. Decision history
4. Work hierarchy: Workspace → Mission → Cycle → Action → Artifact

## Decision
NO_CHANGE / UPDATE_DOCS / ADD_ADR / CORRECT_DOCS。
Step 8はEngine実装を設計書に合わせて変更しない。

## Output
<mission_path>/cycles/NNNN/08-architecture-sync.md。
Skillを正本へ還元・横展開した場合は、[横断Skill改善](../rules/skill-federation.md) に従い、出典・採用した固定版・配布先・GitHubで確認した反映と未観測の対象を区別する。送信済みを適用済みにせず、担当固有のContext・終了契約を共通元へ巻き戻さない。

## State
最終STATE保存を始める直前に時刻を取得し、算定できる作業時間と不明部分を計測時点付きで08記録へ保存する。選定した成果、実際に使えるようになったこと、未達・根拠・検証・受渡しの不足と次の改善を対応付ける。時間は見積りの補助であり、長短による合否や作業追加・削減の条件にはしない。その後に最終STATEを保存・再取得し、STATE-lastを保つ。保存・再取得の追加時間と最終回答時の終了時刻は別記し、時刻更新だけのために保存を繰り返さない。
完了後Active Mission STATEをlast_completed_step=8 / next_step=1 / cycle_status=completedへ。

## Done
sync記録、更新docs/ADR、Mission STATEを再取得確認できたとき。
時間合わせのために完了済み工程や次Cycleをやり直さない。
