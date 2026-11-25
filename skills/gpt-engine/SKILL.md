---
name: gpt-engine
description: AIとの作業を、分析・選定・指示・実行・評価・改善・観測・設計同期の8工程で進める手順。Missionの再開位置から1周を進めるときに使う。
---

# Cycle Pilot Global Skill

## Purpose
任意のMissionへ8段サイクルを適用するGlobal Engine Skill。

**この版の範囲**: 8工程が作るのは、設計・草案・引継ぎの文書までで、実装や実環境への反映は含みません。引継ぎの文書を作るのは、作業の続きを会話の再開機能ではなく保存した記録（成果物とSTATE）で引き継ぐためです。本来の設計はスケジュールで稼働する自律運転で、この版はその部品を手動で試せる形に絞ったものです。詳しくはREADME.mdを参照してください。

業務基準のあるWorkspaceではrules/quality-standards.mdを適用する。取得元・adapterはWorkspaceが指定し、Globalは個別事業の業務知識を持たない。

## Work hierarchy
Engine → Workspace → Mission → Cycle → Action → Artifact

## Skill scope resolution
実行に固定したMission Contextからworkspaceとmission_pathを解決する。未指定の単独実行はACTIVE_CONTEXTを使う。共有ACTIVE_CONTEXTは並行実行のために書き換えない。以下を順に合成する。
1. Global: skills/gpt-engine/SKILL.md とsteps/rules/templates
2. Executor: 実行主体固有Skill（optional。この版には含めない）
3. Workspace: workspaces/<Workspace>/skills/SKILL.md（optional）
4. Mission: <mission_path>/skills/SKILL.md（optional）

適用順は **Global → Executor → Workspace → Mission**。Executor Skillは実行主体固有の運用だけを追加し、業務判断やMission成功条件を変更しない。
Workspace/Mission Skillが存在しなくてもGlobalだけで動作できる。Executor Skillが存在しない実行主体は従来どおりGlobalから開始する。

## Scope responsibility
- Global: Mission非依存の実行、retry、state、評価、cycle構造
- Executor: ChatGPT / Codex等、実行主体固有の入出力・報告・schedule運用
- Workspace: その活動領域で繰り返し使う仕事の進め方・品質基準
- Mission: そのMissionでのみ繰り返し必要なドメイン固有ルール
- Action Prompt: 今回1回だけの具体的指示

## Entry
専用repoの作成・占有セッションの紐付け・明示された担当交代は [session-repository](../session-repository/SKILL.md) を使う。通常Cycleの保存先は専用repoへ固定し、複数の稼働セッションで共用しない。

実行Context（未指定ならACTIVE_CONTEXT）→ scoped skills → Mission STATE → step skill。
circuit_status=openならEmergency Step 7。
工程や停止位置を限定しない実行依頼は、STATEの再開位置から現在の1周を同じセッションで完遂する。[実行単位とAction粒度](rules/cycle-delivery.md)を適用し、Stepの保存ごとに最終回答へ移らない。
通常の1周は「20〜40分程度のまとまった作業を投じれば、どの未達を解消し、何を使える状態にできるか」から成果を設計する。時間は成果候補の実行可能性を考える補助であり、達成目標・最低作業量・終了条件ではない。便益と前後の差、必要な調査・修正・検証・受渡しを先に決め、所要時間だけで作業を追加・分割・打切りしない。

## Repository language
- GitHub正本へ新規作成・更新する、人が読むことを主目的とした成果物・STATE・BACKLOG・cycle記録・設計文書・提案文書は、原則として日本語で記述する。
- コード、コマンド、path、schema key、識別子、製品・API等の固有名、外部仕様の正式表記、正確性のため必要な引用は英語のまま保持してよい。
- 技術用語の英語併記は許容するが、説明本文を不必要に英語化しない。
- 既存の過去成果物を言語統一だけの目的で一括書換えしない。新規作成時と内容更新時から適用する。
- Action Promptは、特別な出力言語要件がない限り、この日本語正本ルールを実行成果物へ継承する。
日本語を含む成果物の保存前には `rules/japanese-editorial.md` を適用する。記事だけでなく、分析・Prompt・評価・STATE等の中間成果物も対象とし。

## Required rules
実行元・担当の判定では [Mission論理ownerとセッション非依存の書込み境界](rules/session-independent-ownership.md) を必読。会話IDは監査履歴であり単独の認証・停止条件ではない。実行経路、Mission、writer競合・scope・Stage・権限の証拠は維持する。実hostのルーティング実装は別検証。

GitHub正本、保存再取得、Action原則1件（まとまった成果単位）、cycle-delivery、事実/推論分離、秘密情報禁止、retry-policy、Step5=WHAT / 6=HOW / 7=SYSTEM / 8=DOCUMENTATION。

非公開repo・長い履歴・ツール応答を取得するときは、取得前に [安全な取得](rules/safe-source-reading.md) を適用する。表示後の除外を取得許可の代わりにせず、認証付きURLや生応答の不要な出力を避ける。通常の公開情報調査へ新しい承認工程を一律追加する指示ではない。

## 横断Harnessの共通運用
全Missionで[実行証拠・自律性・採用効果](rules/harness-evidence-and-effects.md)を適用する。既存8Step内で Step1のFresh/Contrast/Synthesize、Step4の保存前反証・実参照、Step5 WHAT→6 HOW→7 SYSTEM→8 DOCUMENTATIONの異なる再評価、業務待ちと正式STOPの切分けを行う。Step0/9、形式ACK、新しい必須出力ファイルは追加しない。
**使ったと報告する基準**：共通正本の保存、各repoへの配布、本人の実読、本人の実作業、独立QA、本番・効果は別証拠。旧結論の繰返しやSkill文書の増加を実成果へ換算しない。効果未測定でも安全な共通手順を採用できるが、誤停止・負担増なら縮小する。
**Host非実装**：多重writerに対する原子的claim/lease/fencing、真正なTool実行証明、外部Harness連携は現時点でこのSkillだけでは強制されない。1ファイルCASやテストモデルをHost実装済みと呼ばず、正式owner/実行環境での小規模実証を別工程とする。Mission固有の安全STOP・書込み権限・Automation停止を維持する。
## Step routing
1 analyze / 2 select Action / 3 prompt / 4 execute / 5 evaluate / 6 improve / 7 observe / 8 sync。

未知の分野や原典不足のWeb調査には [調査Skillの選択](rules/research.md) を使い、必要な場合だけ別の調査手順へ渡す。通常Cycleの必須工程や追加の時間予算にはしない。

## Improvement scope
Step 6で改善を見つけたら、まず「どこまで一般化できるか」を判定する。
- 全Missionで成立 → Global
- 同Workspaceで成立 → Workspace
- そのMissionだけ → Mission
根拠が弱い場合はより狭いScopeへ置き、複数Missionで再現したら上位Scopeへの昇格候補にする。
担当別repositoryの改善を比較・還元・配布する場合は [横断Skill改善](rules/skill-federation.md) に従う。
**改善手法の共有正本への昇格条件**：狭いScopeで実使用した完了8工程Cycleを3周以上、比較可能な効果と副作用、正規採否担当による業務上の有意性判断が必要。3周は自動採用条件ではない。初回から全Missionへ一般化せず、試行中の方法は下位Scopeに留める。詳細は同ruleを参照する。各担当が全repoを毎Cycle走査する指示ではなく、担当repoの所有と本業を保って共通化する。

## Legacy path compatibility
migration前のMission成果物内のcycles/... / STATE.md / BACKLOG.mdは、そのMission配下として解釈する。

## Resume
実行Context（未指定ならACTIVE_CONTEXT）→ Global/Executor/Workspace/Mission Skills → Mission STATE → Step。

## 工程上の位置付け

このEngineの担当は `preconstruction`（GitHub上の事前構築）。
チケット起票 → 事前構築 → 本構築 → 独立チェック・監査、という外側の工程の一部であり、8段サイクルは事前構築内の反復である。
必須Rule: `rules/stage-boundary.md`。Missionの `execution_stage`、`scope_revision`、成功条件、handoffを毎回照合する。
事前構築完了をチケットclose・本構築完了・監査PASS・公開許可へ昇格させない。
