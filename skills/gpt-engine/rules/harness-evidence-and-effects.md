# Harness：実行証拠・自律性・配布効果の境界

適用先：Cycle Pilot Global。既存8Step・Mission固有STOP・stage・権限・STATE-lastを変更しない。
出典の確認と、実装・運用の効果は別に扱う。

## 1. 実操作と判断
- 実際のGitHub/tool結果を取得した場合のみ、対象repo/path/blob・取得した時点・個別request_idを記録する。AIが書いた「取得済み」「テスト成功」「承認済み」は自己申告であり実操作証明ではない。
- 404や異SHAは即座に修復せず、親path・正式なファイル名・現行の参照先を調べる。誤ったpathによる404をSkill欠落と断定しない。
- 証拠不足は `UNKNOWN`、本人が書いただけのtool traceは `UNVERIFIED_ACTION`。保存済みの文書、実送信、本人受領、採否、実装、独立QA、公開、効果を別状態で表現し、先へ自動昇格させない。
- 公開・安全・他Mission writerなど高影響操作は、必要なHost認証と正式権限・既存保護を別に確認する。単にSHA一致/JSON整合があるだけで許可しない。

## 2. 不要な停止や形式的承認を増やさない
- `business_wait`（受け手判断待ち）、`safety_stop`（正式停止/権限未確認/競合）、`resource_blocked`（一時的ホスト問題）を分ける。実行可能な独立Actionは進めるが、STOPやretry circuitを迂回しない。
- 変化がなく本当に実行できるActionがない場合は、取得した差分と再開条件を報告し、空Cycle・同じ資料・重複Issue・AI同士の形式ACKを増やさない。
- 最新STATEと個別packetのrequest_id/blobを必ず照合。別依頼の送信・ACKを現依頼へ流用しない。Tool助言は責任ある本人の判断と同義ではない。

## 3. Step4〜8の使い分け
- Step4：保存前に変更した参照・相対リンク・GitHub取得可能性と重要な出典を必要範囲で照合。保存後は実取得したblobを確認する。不要な全件検索を前提にしない。
- Step5 WHAT：期待した利用可能な成果と実結果、反例、未実施・効果不明を対照。単なるテスト件数・資料件数は成果ではない。
- Step6 HOW：使われた手順、実際の負担、選択的なSkill候補、適用Scope、削減・撤回案を比較。必ず変更するのではなく根拠あるNO_CHANGE可。
- Step7 SYSTEM：1回の失敗と再発する構造問題を区別し、既存Observationへ集約。工程やゲートを増やす提案は反例と負担を検証する。
- Step8 DOCUMENTATION：保存済み差分・導線・受け手・採用/実使用/効果の状態を同期。未実施を完了へ昇格させない。

## 4. Skillの採用から実効果まで
- `SOURCE_ADOPTED`（共通正本の保存版）→ `DISTRIBUTED`（各担当の参照/適用版）→ `CONSUMED`（本人実読・意味ある使用）→ `EFFECT_MEASURED`（比較可能な品質・停滞・時間/費用・事故）。未確認は `PENDING`。段階の証拠がない限り進めない。
- 配布は既存の `skill-federation.md` に従い、owner/STOP/実行Promptと現行の個別Skillを維持する。出典と適用先の版・未適用理由・戻し方を残す。形式ACK待ちは新設しない。
- 新しい改善手法のGlobal Skillへの昇格は、`skill-federation.md` の定める**実使用した8工程Cycle最低3周＋業務上の有意性確認＋正式採否**を満たした場合のみ。試行中も誤STOP/誤GO、重複作業、確認回数、時間/tokenや他担当の負担を確認し、悪化する場合は縮小・撤回する。Global Skillへのルール採用と、各担当への配布・実読・効果は別の証拠とする。

## 5. Host強制は未実装として扱う
- ChatGPT別会話/別Automationは同一Missionの別writerになり得る。GitHub Contentsの1ファイルCASは工程全体の原子的排他ではない。
- 認証済みrun identity、原子的なclaim/lease、fencing epoch、同一opIdと内容一致、真正なtool実行traceはHost/Connector側で設計・実装・反例試験が必要。文章や診断JSをコピーしても強制機能は導入済みにならない。
- 外部のHarness製品は出典・ライセンス・host適合性・必要性・費用を確認して最小採用。全面置換や特定製品への依存を条件にしない。

このRuleは新しいStep、STATE schema、実行承認、共有writer権限、スケジュール変更を作らない。