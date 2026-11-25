# 事前構築と本構築の境界

## 担当とゴール

cycle-pilotはGitHubを正本とする `preconstruction` を担当する。
Actionは利用可能なオンライン経路で入力取得・成果物保存・自己チェックまで完結できる範囲にする。
設計・調査・草案・コード案・テスト案を作成できる。実行した検証は環境と結果を記録し、実行していない検証をPASSにしない。
変更範囲はMissionと許可されたEngine記録。対象システムの正規Ticket・claim・write_scope・worktree・実環境を要する適用は本構築へ渡す。

## 課題設定

起票済みTicketのID・目的・受入条件・許可範囲を入口にする。Mission内BACKLOGのIDを外部Ticket IDとして扱わない。
既存のTicket未紐付けMissionはbindingをunresolvedとして保持し、Codexが既存Ticketを照合して正規に紐付けるまで実装を始めない。
Ticket未紐付けの既存草案は引継ぎ準備を完了できるが、実装着手可能・受領済みとは宣言しない。

## 本構築・監査へ送るもの

引継ぎには目的、成果物のpathと版、根拠と確認日・証拠水準、未検証事項、実装範囲、最初の操作、検証計画、後続の受入条件を含める。
受領先、既存Ticketとのbinding状態、重複を識別するrequest_idを持つ。
handoffのreadyは引継ぎ情報の準備完了。担当への配送・受領・着手・チケット完了とは別の状態として記録する。
対象repositoryへの直接writeや正規作業経路の省略を、blockedの解消手段にしない。

## 完了とblocked

- 事前構築の成功条件と引継ぎの保存・read-backが完了したら、Missionの当該stageをcompleted、handoffをready、後続をpendingにする。
- 必須入力不足・オンライン権限不足・未解決の仕様矛盾で事前構築そのものが進められない場合はblocked。
- 本構築だけに必要なローカル操作はdownstream task。これだけを理由に事前構築をblockedにしない。
- 範囲内の未実施Actionがある間は完了しない。範囲外へ移した作業は未実施として明示し、resolved/PASSにしない。
- 事前構築完了後は「次すすめて」を止める。自動的に本構築や新Missionを開始しない。
- 同じblocked原因で変化がなく実行可能Actionが0件なら、観測集計だけの新Cycleを繰り返さない。

## 範囲変更

ユーザー指定の範囲変更はObservation閾値を待たず実施できる。旧MISSION/STATE/終了契約/結果を保存し、scope_revisionを増やす。
現在の成功条件で成果物を再評価する。旧結果をそのまま新契約へ流用せず、stageとscope_revisionを結果・STATE・handoff・runnerで一致させる。
過去Cycleの当時の失敗・未実施Stepは書き換えない。architecture_version変更は次Cycleから適用する。

## 後続工程にCycleを適用するための実装条件

この文書は既存のstage契約を変更せず、後続工程に対応した実装や自動運転を有効にしない。

後続工程の正規経路を実装する場合は、少なくとも次を固定し、設計・所有・許可を確認する。

- 実行主体とsession、Mission、対象repo、ticketや依頼、scope、stage、Cycle・Action、保存先のbinding。既存の完了済み履歴を新しい実行に流用しない。
- 入力と状態遷移の型、stage別の品質判定、CASとread-back、重複実行・結果不明時の照合。旧preconstructionの検証と拒否を維持する。
- handoff、実装、独立検証、反映、失敗回復、取消の順序と各owner。安全停止・quota・明示停止を優先する。
- 既存consumerと旧記録の移行・互換性、変更しない既存契約、正負例、競合・再開・復旧の試験と実consumerでの検証。

保存先や遷移が未確認の間は未対応として記録する。完了済みMissionの再開、架空のstage値、手動PASSやguard回避で代用しない。対応する作業が独立して許可されている場合、その正規経路と影響を別に判断し、記録できないことを実施済みCycleの証拠に変えない。


## Action ownership と先行準備

未達項目は「今のChatGPT経路で直接PASSにできるか」だけでblocked判定しない。Step 1/2と終了判定では、未達ごとに次のownershipを分類する。

- `gpt_preconstruction`: オンライン調査、設計、草案、根拠整理、自己チェック、実行仕様、検証計画、handoff更新など、cycle-pilotがGitHub正本へ先行保存できる作業。
- `codex_construction`: 正規Ticket/claim/write_scope/worktree、local repository、CLI/CI、実装、画像配置、正規review packet取得、機械check等、Codexの本構築環境で実行する作業。
- `external_condition`: ユーザー/第三者の入力、権限、外部承認、未提供credential、利用不能な外部サービス等、GPTにもCodexにも現在解消できない条件。

`codex_construction` の実作業そのものはGPT Actionへ選定しない。ただし、その作業についてCodexが追加設計なしで着手できる実行packet（目的、入力、正規経路、手順、期待成果物、検証、失敗時分岐、禁止代替、完了条件）を作成・更新できるなら、それは別の `gpt_preconstruction` Actionとして扱う。

quality ruleが本構築依存でFAIL/PENDINGでも、事前構築では無理にPASSへ変えない。代わりにowner、未実施理由、Codex実行packet、戻り証拠、再評価条件へ追跡できる状態を作る。

## blocked と handoff-ready の分離

`RUNNER_BLOCKED` は「GPTがそのruleを直接PASSにできない」ことを意味しない。

事前構築をblockedにできるのは、次をすべて確認した場合に限る。
1. 未達項目を上記3 ownershipへ分類済み。
2. 実行可能な `gpt_preconstruction` Actionが0件。
3. `codex_construction` 項目について、必要な実行packet/handoff準備も完了済み、またはその準備自体が外部条件で不能。
4. handoffをreadyへ進めるためにGPT側で作成・同期できる成果物が0件。
5. 残る停止理由が真の `external_condition` または既に完全packet化したdownstream実行待ちだけ。

Codex作業が未実施であること自体はblocked理由にしない。GPT側準備が完了した場合は、Mission契約が許せばpreconstruction completed / handoff readyとして終了し、Codex作業は未実施のdownstreamとして保持する。
