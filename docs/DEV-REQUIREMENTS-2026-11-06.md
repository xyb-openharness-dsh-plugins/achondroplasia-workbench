# DEV-REQUIREMENTS 硬约束（2026-11-06，可验证清单）

| # | 硬约束 | 验证方式 |
| --- | --- | --- |
| 1 | 无判读列（diagnosis/risk_level/eligible 等不入库） | `npm test`（test/schema.test.mjs 判读列断言） |
| 2 | private 三出口过滤（看板摘要/导出/AI 上下文） | `node scripts/probe-ach-m2.mjs`（Q35） |
| 3 | public/ 与原型逐字节一致 | `npm test`（test/ui-parity.test.mjs） |
| 4 | bootstrap 与 demo-data 逐字段一致 | `npm test`（test/demo-parity.test.mjs） |
| 5 | 版本十处同源（VERSION/package/README/截图/CHANGELOG…） | `node scripts/check-version.mjs` |
| 6 | 迁移冻结（改历史迁移必红） | `node scripts/check-schema.mjs .` |
| 7 | AI 一键发送走 achondroplasia:agent-draft 且演示态不发送 | `node scripts/probe-ach-m2.mjs`（Q14/Q31） |
| 8 | 装机只向本机 DSH Desktop（io.dsh.desktop）profile；排除被 DSH_HOME 继承的 CLI profile | M6 装机记录 + scripts/check-install.mjs |
| 9 | MinerU 未接入时「勾选与保存不联网」 | 界面标注（设置 · 文档解析）+ test/import-export.test.mjs |
| 10 | 指标选择 ≤4，超限先取消 | `node scripts/probe-ach-m2.mjs`（rail 逻辑）+ check-choice-limit |
