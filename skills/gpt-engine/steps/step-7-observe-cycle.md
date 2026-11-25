# Step 7: Observe Cycle

## Goal
Engineのサイクル構造問題をMission横断で観測・蓄積する。直接変更しない。

## Context
Active Missionのcycle evidenceを読む。Engine共通registryは `cycle-observations/registry.md`。
Observationには発生したworkspace / mission / cycleを記録し、異なるMissionでの再発も同じ根本原因なら同一OBSへ集約する。

### 専用repoの記録先
専用repoは作成時に `cycle-observations/` を引き継がない。`cycle-observations/registry.md` が無いことを理由にStep 7を止めない。無ければ、そのrepo内に次の見出しだけで新規作成してから記録する。過去の行は移さず、件数も引き継がない。
```
# Cycle Observation Registry

| ID | Category | Target | Severity | Count | Threshold | Status | First cycle | Last cycle | Summary |
|---|---|---|---|---:|---:|---|---|---|---|
```
専用repoの記録は、その担当の観測として残す。複数のMissionやrepoに効く同根の観測は、出典repo/cycleを付けて、Global Skillの置き場へ渡す。registryへ書く権限を持つ担当は、同じOBSへ集約してよい。権限がない担当は、[skill-federation.md](../rules/skill-federation.md) の経路で渡す。

## Modes
Normal: Step 1〜6後。
Emergency: retry budget exhausted時。未実施Stepを完了扱いにしない。

## Categories
step_necessity / step_boundary / ordering / granularity / redundancy / state_management / persistence / feedback_loop / cost / latency / other

## Counting
同一Mission・同一cycle・同一根本原因は原則+1まで。
別Missionでも同根なら同一OBSへ加算可能。
thresholdはcycle-observation-policyに従う。

## Output
<mission_path>/cycles/NNNN/07-cycle-review.md。
Engine共通registryと必要なOBS詳細を更新。

## State
Mission STATEをlast_completed_step=7 / next_step=8へ。

## Done
Mission review、engine registry、Mission STATEを再取得確認できたとき。
