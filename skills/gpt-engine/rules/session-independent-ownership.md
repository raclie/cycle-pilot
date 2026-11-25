# Missionを主体とするowner・実行元・書込み境界

## 目的と優先関係
ChatGPT等の**会話IDは実行経路の履歴**であり、永続的なwriterの本人認証でもMission所有者でもない。新しい会話・Automation実行先に移った**ことだけ**では通常の安全な作業を停止させない。SESSION_OWNER.json.ownerSessionId と会話IDの文字列一致は、実行可否の単独判定に使わない。

このルールはGitHub上の運用規則であり、GitHub権限・host認証・runnerの強制機構や実行中プロセスを直接変更しない。**会話IDの不一致だけでは停止しない。ただし、未認証や複数writerの同時書込みは許可しない。** 個別の利用者による停止指示、独立監査、Ticket/claim/write_scope、公開権限など厳しい条件は優先する。

## 論理ownerと実行元の区別
- 論理ownerは `repository + workspace + mission_path + 担当role`。専用Context・MISSIONの責務と承認済み実行経路を固定する。roleが同じでも異なるrepoへのwriter権限は発生しない。
- 実行元はChatGPT会話/Automationタスク、別のAI session、VM等の一時的な実行instance。ID、前回の会話URL、作成者IDは**監査用の観測値**であり認証済み資格ではない。他の会話が代わりに実行して返した応答だけで、元の会話として代理writerにならない。
- `SESSION_OWNER.json`は履歴として残すが、更新先が一意に検証されていない会話IDを推測補完しない。古い値の不一致だけで通常の読取・提案・許可済み事前構築を一律停止しない。**確認済みの現行排他的writerとの競合**は別であり停止する。
- 新規・移管先では必要に応じてMission識別・承認済みAutomation IDや実行環境・履歴を既存Context/台帳に記録する。会話の切替ごとにownerファイルを書き直す必要はない。

## 書込み直前の判定（全て必要）
1. **実行根拠**：利用者の明示指示、正規のタスク実行先または認証済みアプリ/host経路を確認する。単にURLやIDを提示・自己申告しただけでは本人確認にならない。判定できなければ他ownerのrepoへwriteせず、根拠と解除条件を記録する。
2. **対象**：ACTIVE_CONTEXT・固定Mission Context・MISSION・STATEでrepo/mission/stage/現行停止を照合し、操作対象pathが許可された`write_scope`に含まれることを確認。研究・監査・保管はそれだけでは実装・公開権限にならない。
3. **排他/競合**：同じMissionと論理pathについて現行writer/claim/作業中の別実行を確認する。排他の根拠がない多重writer、正式な停止、未解決配送・再送、意図しない分岐では書込みを保留。更新直前にlatest blob SHAを取り、GitHub Contentsの期待SHAでCAS更新し、結果をread-backする。SHA照合**だけでは複数ファイル間の原子的排他は保証しない**ため、複数path/本構築は既存Ticket、claim、専用branch/worktree/正規reviewを守る。
4. **工程と証拠**：現在Cycleの未完工程を再開し、1論理ファイルずつ保存・照合、共有BACKLOG等の後にSTATEを最後に保存。送信・本人ACK・採否・実装・独立確認・公開・効果を別状態にする。

## 変更時の扱い
- 会話IDだけ変化し、実行根拠・論理Mission・単一writer・scopeが一致するなら、旧IDを監査履歴へ保全して通常の許可済みActionを続けられる。セッション移行のためだけの空Cycle・承認要求・新Automationを作らない。
- 実行根拠/権限が不明、承認済みの排他的writerが別にいる、同一対象への同時書込みが疑われる場合は、**read-onlyで照合しwriteを保留**。旧会話を勝手に停止・無効化・削除しない。

## 代表的な受入・拒否例
- P1：同一Mission・正規の実行経路・単一writerで会話IDが変わった → 旧値を履歴に残し、Scope内の事前構築は継続候補。
- P2：ownerファイルがないが正規Mission・承認済み実行元・Scopeと停止の確認が取れる → **欠落だけでは**停止しない。
- N1：他Missionの定期実行を本会話で代わりに実行できた → そのタスクの元の会話として代理writeしない。
- N2：他writerが同じpathを扱っている／現行claimを持つ → 競合解消まで書かない。
- N3：期待blob SHAが変化 → 上書きせず再取得・rebaseし、他者の変更を保護。
- N4：Ticket/claim/write_scope未確認で本番改稿・公開を求められた → 拒否し、正式受渡しだけ可能な範囲で進める。
- N5：archive/完了済みMission・明示停止・保管専用 → 会話IDが変わっても運転開始しない。
- N6：実行元を自己申告しただけ／認証不明 → writeしない。

## 展開と戻し
共通元を正本とし、利用repoではAGENTS起動入口からこのローカルコピーを毎run参照する。既存のGlobal/Executor/Mission固有の実装と衝突する場合は上記の**権限・安全停止を優先**し、差分と保留先を記録する。コピーと入口の配置は採用済み文書の証拠にすぎず、実runner試験・旧writer停止・Automation実稼働・並行writer試験・作業時間短縮は別の証拠を要する。悪化時は追加した入口・規則差分だけを正規writerが巻戻し、GitHub履歴・他者の更新は保護する。
