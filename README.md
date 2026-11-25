# Cycle Pilot

AIとの作業を、分析・選定・指示・実行・評価・改善・観測・設計同期の8工程で進めるSkillセットです。成果物と現在位置をGitHubに保存し、途中から再開できます。AIの会話や再開機能（resume）には頼りません。再開機能のないAIや、途中で別のAIに替わった場合でも、保存された記録だけから作業を引き継げます。

**Cycle Pilot** is a manual, 8-step Skill set for working with an AI: analyze, select, prompt, execute, evaluate, improve, observe, and sync the design. Progress is saved to GitHub so work can resume from where it stopped. This is a preview (v0.1). The steps produce plans, drafts and hand-off documents; they do not implement or deploy anything. The documents are written in Japanese. MIT License. This project is not affiliated with, endorsed by, or sponsored by any AI provider or other company or organization; product names mentioned in the documents belong to their owners.

この版はプレビュー（v0.1）です。開発履歴や実業務データは含めません。**8工程が作るのは、設計・草案・引継ぎの文書までです。** 実装や実環境への反映は、この版の範囲に含みません。

> **中心の考え方**: 作業の続きを、AIの記憶や会話の再開機能（resume）に預けず、GitHub上の成果物と現在位置（STATE）に残します。これにより、再開機能を持つAIだけでなく、再開できないAIでも、会話が切れた後に入った別のAIでも、記録を読めば作業を引き継げます。8工程が「引継ぎの文書」を作るのは、このためです。実装や実行を別の担当へ渡すときも、同じ記録で引き継ぎます。
>
> **本来の設計との関係（必ずお読みください）**: Cycle Pilot は本来、AIをスケジュールで稼働させ、人が日々の作業に関わらずに自律して回し続けることを前提に設計されています。人の確認は、定期の報告で行う想定です。この版は、その部品（Skill、STATE、完了条件、観測の記録）を**手動で試せる形に絞ったプレビュー**で、自動で回す仕組み（定期実行、常駐の実行役）と運用履歴は含みません。以下の「自動運転ではありません」「8工程は文書まで」は、**この版の範囲の説明**であり、設計の前提ではありません。
>
> *Core idea: work continuity lives in saved artifacts and STATE on GitHub, not in an AI's memory or resume feature, so even an AI that cannot resume a session, or a different AI taking over mid-way, can continue from the records alone.*
>
> *Cycle Pilot is designed to run autonomously, with AI agents started on a schedule and people reviewing periodic reports rather than directing each cycle. This v0.1 preview is a reduced, manual-use cut of its parts (Skills, STATE, definition of done, observation records) and does not include the scheduling or runner machinery. Statements below such as "not autonomous" describe the scope of this preview, not the design premise.*

## 対象と前提

- **対象**: GitHubのrepositoryを読み書きできるAIエージェント（ChatGPT、Codex、Claudeなど）を、手動で使って仕事を進める人。
- **前提**: Node.js 22以上（初期化と自己検査のscriptを動かすためだけに使います）、自分の非公開repository、AIがそのrepositoryへ保存するための権限（自分の環境で用意します）。
- **この版は自動運転ではありません**: 人が「次をすすめて」と頼むたびに、AIが1周進めます。定期実行や常駐の仕組みは含みません。
- **役割の分け方**: 文書は、仕事を「事前構築」（設計・草案・引継ぎ。このSkillの担当）と「本構築」（実装・実行。別のAIまたは別の担当）に分ける運用を想定して書かれています。**この版が扱うのは事前構築までで、本構築の手順は含みません。** 文書中の「GPT」「Codex」は、多くの箇所で、それぞれ事前構築・本構築を担当するAIの意味で使われています。製品名として書かれていても、特定の製品に限りません。1つのAIで実装まで進める使い方は、この版では対応していません。8工程で引継ぎ文書まで作り、実装は、8工程の外の別の依頼として行ってください。

### 用語

| 用語 | 意味 |
|---|---|
| Mission | 1つの目的と成功条件を持つ仕事の単位。 |
| Workspace | 関連するMissionをまとめる単位（フォルダ）。 |
| Cycle / Action | Cycleは8工程で進める1周。Actionは、その周で選ぶ1まとまりの作業。 |
| STATE | Missionの現在位置（どの工程まで済んだか）を書く文書。再開の起点。 |
| BACKLOG | 次にやる作業の一覧。 |
| Context | 今回の作業先（workspace、mission、保存先）を固定する文書。根の `ACTIVE_CONTEXT.md` はリポジトリ全体の既定の作業先、各Missionの `CONTEXT.md` はそのMission用です。Missionが1つなら、同じ値を書きます。 |
| SESSION_OWNER.json | STATEなどを書き換えるAIセッションの記録。生成直後は未割当（`ownerSessionId: null`）で、触らなくてかまいません。 |
| DoD | Definition of Done。完了とみなす条件。 |
| 票（チケット） | 1つの依頼を追う記録。使わない運用でもかまいません。 |
| OBS（観測） | Cycleの中で気づいた、手順そのものの問題の記録。 |
| handoff | 事前構築から本構築へ、作業を渡すこと。 |
| 担当repo | 自分の作業を保存する、独立した非公開repository。 |
| Global Skill | 8工程そのものの手順書。この配布物の `skills/gpt-engine/`（フォルダ名の `gpt` は由来を示すだけで、特定のAIに限りません）。 |
| 共通元 | この配布物の元になった手順書の置き場。この版では「Global Skill」と読み替えてください。「共通配布元」「共有元」「共通原本」「共通正本」「共有正本」「本体」も、同じ意味です。 |
| 正本 | 判断のよりどころにする、保存済みの版。文脈によって、STATE、Prompt、設計文書などを指します。 |
| 通常writer | STATEなどを書き換えてよいAIセッション。1つに固定します。 |
| SKILLS.md | MissionでAIが使うSkillの一覧。必要になったら、自分のMissionに作ります。 |
| ADR | 設計判断の記録。必要になったら、自分のrepositoryの `docs/architecture/decisions/` に作ります。 |

この版に含まない物（調査用の別Skill、検査用のscript、実行主体ごとのSkill、`FORK_SOURCE.json`など）への言及が本文に残る場合は、「無ければ作らず、なしと書く」と読んでください。ひな形や規則にある「票のclose」「完了」「本構築」への言及は、票を使う運用の例です。この版の到達点は、引継ぎ文書の準備完了までと読んでください。工程ごとの記録ファイルの名前は、各 `steps/` に書かれた名前を使い、`templates/` は書式の例です。

## 始め方

1. 自分の作業用に、独立した非公開repositoryを用意します。複数のAIが同じSTATEを同時に書き換えないよう、書き込むAIは1つに絞ります（読むだけなら複数でかまいません）。
2. この配布物を、自分のrepositoryへコピーします。ZIPで取得するか、cloneして `.git` を除いてコピーし、自分のrepositoryで最初のcommitを作ります。ここで `npm test` を実行すると、コピーが壊れていないか確かめられます（`npm install` は不要です）。
3. 自分のrepositoryの根（ルートフォルダ）で、`node scripts/init-example.mjs --target workspaces/Example/missions/FirstMission` を実行します。未起動の合成Missionの5ファイル（`CONTEXT.md`、`MISSION.md`、`STATE.md`、`BACKLOG.md`、`SESSION_OWNER.json`）ができます。`CONTEXT.md` には、指定した場所が書かれます（`workspaces/<名前>/missions/<名前>` の形なら、workspaceとmissionの名前も入ります）。相対pathでも、まだ無いフォルダでも指定でき、既存フォルダへの上書きは拒否します。
4. `ACTIVE_CONTEXT.md` のひな形を自分のContextに合わせます。MISSIONの「Purpose」「成功条件」「許可範囲」に、目的・成果・受入条件・許可範囲を書きます。初期状態は未設定・未起動（STATEの `mission_status: awaiting_definition`）で、STATEの値は、AIが工程に合わせて更新します。目的と成功条件を書き終えたら、AIにSTATEの更新を頼んでください。例の成功条件を、自分の達成実績にしないでください。
5. AIに `AGENTS.md`、Context、Global Skill、MissionのMISSION/STATE/BACKLOGを読ませます。`skills/` の中身は、多くのAIツールでは自動では読み込まれないため、読むファイルは名前で指定します。たとえば、リポジトリを読み書きできるAIに、次のように頼みます。保存に必要なツールと権限を用意できなければ、保存済みとは扱いません。

   ```text
   AGENTS.md、ACTIVE_CONTEXT.md、skills/gpt-engine/SKILL.md と、
   workspaces/Example/missions/FirstMission の MISSION.md・STATE.md・BACKLOG.md を読んでください。
   読み終えたら、STATEの再開位置を要約して、私の確認を待ってください。
   ```
6. 「次をすすめて」と頼むと、STATEの再開位置から、現在の1周をStep 8と最終STATEの保存確認まで進めます。工程や停止位置を指定した依頼は、その指定を優先します。

1周はまとまった成果単位で選び、20〜40分を作業量の目安にします。時間稼ぎ、検証の打切り、完了済み工程のやり直しはしません。1周完了後に、無断で次の周を始めません。

## 安全のための注意

- **無保証です。** MIT Licenseのとおり、利用は自己責任です。AIの利用料金は、各サービスの契約に従って発生します。
- **AIは確認なしに保存します。** 手順では、AIが自分の権限でrepositoryへ書き込み、1周を進めます。対象repositoryだけに限定した、最小権限のtoken（GitHubのfine-grained tokenなど）を使い、非公開repositoryで運用してください。
- **repositoryの内容は、使うAIサービスへ送られます。** 各サービスのデータの扱い（学習への利用の設定など）を、利用前に確認してください。
- **公開・削除・購入・送金・外部システムへの反映は、人が確認します。** 手順の許可範囲に書かない限り、AIに任せないでください。
- **安全上の拒否が出たときは、止めて報告します。** AIサービスが操作を拒否した場合、分割や言い換えで通す手順は含みません。各サービスの規約と安全の仕組みに従ってください。
- **秘密情報を書かないでください。** 認証情報、個人情報、実際の業務データを、Missionの文書やIssueに書かないでください。
- cloneしたフォルダをAIツールで開くと、`AGENTS.md` が自動で読まれることがあります。
- `skills/gpt-engine/rules/` の規則は、作者の運用から作った例です。自分の方針に合わせて置き換えてかまいません。
- 文書とコードの一部は、AIの支援で作成し、作者が確認・編集しています（Parts of the documents and code were drafted with AI assistance and reviewed by the author）。

## 含むもの

- [Global Skill](skills/gpt-engine/SKILL.md): 8工程、再開、保存、評価、改善。
- [担当repoの分離](skills/session-repository/SKILL.md): 通常writerを1セッションへ固定する手順。
- templates、合成Missionの生成補助、配布物の自己検査。

ブラウザ自動操作、常駐runner、モデルの自動選択、外部システムへの本番反映、既存の業務Missionはこの版には含めません。

## 確認

8工程で何を作るかは [1周の合成例](examples/manual-cycle.md) で確認できます。実行済みの成果や実測ではありません。

```text
npm test
```

cloneした状態でも通ります（根の `.git` と、`npm install` が作る `package-lock.json` は無視します）。配布物そのものを厳密に検査するときは、`.git` の無い写しで `node scripts/verify-release.mjs --strict` を実行してください。

この検査は、**配布物をコピーしたままの状態**を確かめるものです。手順3以降で `workspaces/` を置いたり、`ACTIVE_CONTEXT.md` などを書き換えたりした後は、失敗するのが正常です。自分のrepositoryでは、この検査を運用の合否に使わないでください。目録（`RELEASE-INVENTORY.json`）のhashは、破損や混入を見つけるためのもので、悪意のある改ざんを防ぐものではありません。

実アカウントへの書込み、モデルの利用可否、調査内容の正しさは、静的検査とは別に確認してください。認証情報・実原稿・会話IDを配布元へ送る機能は含めません。

## 貢献と問い合わせ

このrepositoryは、開発元から生成した配布物です。**Pull Requestは取り込めません。** 修正や改善の提案は、Issueで受け付けます。採用する場合は、開発元で取り込み、次の版として再生成します。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。脆弱性や、認証情報の混入を見つけた場合は、公開のIssueではなく、[SECURITY.md](SECURITY.md) の方法で報告してください。

## ライセンス

本体は MIT License（[LICENSE](LICENSE)）、著作権者は RACLIE です。同梱する第三者資産はありません（[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。公開の状態は [PUBLICATION.json](PUBLICATION.json) にあります。

ChatGPT、Codex、Claude、GitHub、Node.js、Mermaid などの名称は、各社・各団体の商標または登録商標である場合があります。本プロジェクトは、これらの提供者と提携しておらず、承認も後援も受けていません。
