# Step 6: Improve Engine

## Goal
HOWをレビューし、改善を適切なSkill Scopeへ反映する。Step 6自身も対象。段数・順序・責務境界はStep 7へ。

## Review evidence
- Active Missionの現cycle Step 1〜5
- Active Missionの前cycle Step 6〜8
- Global Engine Skill/Rules/Templates
- Active Executor Skill（該当実行主体に存在する場合）
- Active Workspace Skill
- Active Mission Skill
- 必要に応じ他Missionのengine-wide evidence

## Mandatory Coverage / Consistency
全Stepと次を照合する。
- ACTIVE_CONTEXT
- Global → Executor → Workspace → Mission Skill resolution（Executorは実行主体ごとのoptional層）
- routing / cycle transition
- Mission state-output responsibility
- 1セッション内の周回完遂、Actionの成果単位、不必要な細分化や早期終了（rules/cycle-delivery.md）
- 選定した成果が未達をどこまで解消し、利用者・後続担当が使える状態になったか。短いから作業追加、長いから分割とは決めず、必要な根拠・検証・受渡しの不足や重複を具体的に特定する。次の成果候補と進め方を改善し、実測時間はその実行可能性を見積もる補助にする。
- architecture docs
- Workspace→Mission→Cycle→Action→Artifact

## Skill Scope Classification
改善候補ごとに必ずscopeを判定する。

### Global
MissionやWorkspaceに依存せず広く成立する実行・安全・状態・cycleルール。
例: retry、persistence DoD、circuit breaker。

### Executor
ChatGPT / Codex等の実行主体固有で、複数Workspace/Missionに使う入出力・報告・schedule運用・復旧手順。複数実行主体でも成立する場合だけGlobalへの昇格候補にする。存在しないExecutor Skillを作ることを起動条件にしない。

### Workspace
同Workspaceの複数Missionで再利用したい品質基準・業務手順。
例: 製品比較の品質基準、推薦・根拠方針。

### Mission
そのMissionのドメインにのみ繰り返し必要なルール。
例: 個別記事で扱う利用条件と比較観点。

### Action
今回だけの具体指示。Skillへ昇格させず03-promptに置く。

## Promotion / demotion
- 根拠が弱い改善は狭いScopeへ置く。
- 複数Missionで同じMission Skillが有効ならWorkspace昇格候補。
- 複数Workspaceで同じWorkspace Skillが有効ならGlobal昇格候補。
- 過度に一般化されたRuleは下位Scopeへ降格/分離候補。
- Executor固有のRuleはExecutorへ保持し、実行主体を跨いで成立する根拠がある場合だけGlobalへ昇格する。
- Skillのコピー増殖ではなく共通上位Scopeへの昇格を優先する。

## 担当別repositoryからの還元
専用repoで改善したSkillは、出典commit、変更path、解消した問題、検証、適用条件と未確認事項を既存06記録へ残す。横断担当は [skill-federation.md](../rules/skill-federation.md) に従って比較・採否・正本保存・配布を行う。各担当は自分の安全な作業区切りで採否を記録し、他担当のrepoや共有元を並行編集しない。会話で返信できない場合もGitHubの記録から追跡できるようにする。

## 業務ノウハウの還元
HOWの見直しに加え、その周で詰まったこと・誤ったこと・初めて分かった手順を [know-how-return.md](../rules/know-how-return.md) に従い、`06-engine-review.md` の「## 還元」節へ残す。項目か「なし: 理由」のどちらかを必ず書く。この工程も省かない。置き先は上の Scope 判定を使う。

## Classification
Mission content → Mission BACKLOG
skill/rule/template/state → Step 6 + scope判定
cycle architecture → Step 7
no change → NO_CHANGE

## Output
<mission_path>/cycles/NNNN/06-engine-review.md。
Coverage/Consistency、改善候補ごとのScope、変更ファイル、回帰確認を記録。

## State
Mission STATEをlast_completed_step=6 / next_step=7へ。

## Done
review、変更ファイル、Mission STATEを再取得確認。
