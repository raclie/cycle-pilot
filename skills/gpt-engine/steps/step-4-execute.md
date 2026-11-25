# Step 4: Execute

## Goal
Active Missionの保存済みPROMPTを正本としてActionを実行しArtifactを永続化する。

## Mandatory start
ACTIVE_CONTEXTとMission STATEを再取得し、<mission_path>/cycles/NNNN/03-prompt.mdを読む。

## Execute
PROMPT範囲内だけを実行し、DoDで検証する。

## 保存前の反証と実証拠
Step3で定めたDoDに照らし、偽の証拠・別requestの結果・旧SHA・無関係な生成変更がPASSに見える反例を少なくとも適用可能な範囲で確認する。実行していないテストや本人性・Host認証を結果欄にPASSと書かない。
新規/変更した相対リンク・関連するGitHub pathは必要な範囲で保存前に参照先を取得して確認する。404では親directory/正式pathを確かめ、存在しない短縮名だけから資産欠落を断定しない。無関係な全ファイルの再取得を定例化しない。
重要な元資料はrepo/path/blob、取得操作の有無、引用範囲と時点、使用したrequest_idを照合する。本人が作成した検証JSONはTool呼出し自体の証明ではなく、未確認は `UNKNOWN` / `UNVERIFIED_ACTION` と記録する。GitHub保存後にread-backし、入力→成果→依存ファイルの差を検査する。
細部は [Harness境界](../rules/harness-evidence-and-effects.md)。Hostが未実装のclaim/fencing/実行traceを、Step4の文書チェックだけで代替しない。

## Persistence
<mission_path>/cycles/NNNN/04-output/へArtifactとREADMEを保存し再取得する。
github-persistence / retry-policyに従う。

## Partial failure
実行済みで保存だけ失敗した場合、Actionを再実行せず保存だけretryする。

## State
成功後のみMission STATEをlast_completed_step=4 / next_step=5へ。

## Done
ArtifactとREADMEを再取得できたとき。

## 責務境界
オンライン成果物・コード案と引継ぎを保存する。対象repositoryの正規ローカル実装はCodexへ渡す。実行していないビルド・独立監査・公開ゲートをPASSにしない。
