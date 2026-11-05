# research/achondroplasia · 临床试验快照四件套（M4，2026-11-06 00:38）

| 件 | 内容 |
| --- | --- |
| manifest.json | 采集口径、通道终态、计数、两份文件 sha256 |
| trials-2026.jsonl | 150 条去重登记（合并前 150；bySource：ictrp 140 / chinadrugtrials 9 / ctv 1） |
| achondroplasia_trials_2026.sqlite | trials 150 行 + source_statuses 30 行（5 查询 × 各通道终态） |
| README.md | 本文件 |

## 一致性断言（2026-11-06 实测）
- manifest.recordCount = jsonl 行数 = sqlite trials 行数 = **150** ✓
- jsonl 与 sqlite 的 sha256 与 manifest 记录一致 ✓
- 逐字段映射（record_id/source_id/title/status_note/snapshot_date）抽样一致 ✓

## 通道终态（如实记录，FAILED ≠ 查过）
- **ictrp**：SUCCESS（140 条）· chinadrugtrials：SUCCESS（9 条）· ctv：SUCCESS（1 条）
- **chictr_online：FAILED（6 次查询全失败）——未查过，本快照不含 ChiCTR 在线结果**
- xyb_chinadrugtrials_archive / chictr_pancreatic_archive：NO_RESULTS / NEEDS_SETUP（离线语料仅胰腺癌覆盖，无本病种语料）

## 口径
- 状态一律「登记状态，未核实」；登记 ≠ 有效 ≠ 安全 ≠ 可入组。
- 仅同一登记号合并来源；其余并排保留。
- 检索词：软骨发育不全 / achondroplasia / FGFR3 / 骨骼发育不良 / 软骨发育不良（去重靠登记号）。
- 快照会过期：再采集 = 重跑 `node scripts/fetch-achondroplasia-trials-2026.mjs`。
