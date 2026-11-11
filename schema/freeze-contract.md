# 迁移冻结合同（小苗宝 GrowPal）

`schema/` 下的迁移一旦对外发布就不许再改：改历史迁移 = 两台机器的库结构不一样 = 数据不可复现。
本文件记每个迁移文件的 sha256，由 check 链里的 `scripts/check-schema.mjs` 逐条比对。

要改结构：**新增** `NNNN_name.sql`，并把新文件与哈希追加到下表的末尾。改旧文件会被检查拦下。

| 文件 | sha256 |
| --- | --- |
| `0001_initial.sql` | ec1d7ae844288eeb15c320e764f334e2ac770b0966b2262b617d7138b3e2e9f7 |
| `0002_profile_meta.sql` | 43ff1ae6f72d730598476c35b70ed4e39fd79e83e7c8f071cd9c57d443eff4bb |
| `0003_candidate_bus_id.sql` | 7c65b028ed1d841c09400b79008b54f691553a3a89425432d8553550ffa3e9cf |
| `0004_surgery_bus_id.sql` | c08973c0e73f0d35aa89cb611651e6df34cfc8e408a2bf378e3e2d97ebf9c3e8 |
| `0005_trials_region.sql` | 48deb902b80adfab7d3ea5731065aa67f7de8b7c631c5325b5207d56c227c9fb |
| `0006_subjects_manage.sql` | 0b533a8012540e429c0a442612117edfe816f430b4414fb307cca13e02b3051b |

## 0001 的内容边界（写在冻结之前，便于日后审）

23 张表，四组（0002 补 profile_meta；0003 补 candidate_fields.cand_id 业务 id；0004 补 surgery_rows.surg_id 业务 id——两者在档案内唯一，demo-data 记作 c1/s1）：

- **档案级 2 张**：`subjects`（档案标量：姓名/性别/年龄标签/代记视角/状态原文/医生原话/遗传说明——全部为记录性文本，无判定列）与 `section_titles`（`profile_key + key → title + ord`）。
- **指标 3 张**：`metrics` / `metric_points` / `growth_reference_rows`。
  - `metric_points`：`d` 允许 NULL（日期未记，配 `d_precision`）；`v` 允许 NULL 配 `v_text`（文本值）；`visibility` 私密三出口；`version/corrected_from/why` 更正=新版本。
  - `growth_reference_rows`：ACH 专用曲线参考（Hoover-Fong 2022 口径）只存引用与来源，`pending=1` 即【待核】；**不判定「达标/落后」**。
- **通用 8 张**：`events` / `rhythm_rows`（频次不入库）/ `viewpoints`（R3 默认 private）/ `trials`（登记快照结构化字段）/ `saved_trials`（E8 本机收藏）/ `documents` / `candidate_fields`（三态 pending/accepted/rejected）/ `hospitals`（F6 多家医院+版本）。
- **本病种专属 6 张**：`dx_rows`（评估/基因/临床结论原文，无「确诊」判定枚举）/ `screening_rows`（五类筛查，结果原文照抄，doc_id 可空=无原件）/ `surgery_rows`（名词+医生原话+版本）/ `med_rows`（用药状态原文）/ `injection_rows`（done ∈ 已注射/漏记 为记录态非依从评价）/ `question_rows`。
- **导入 3 张**：`import_jobs`（FAILED 如实）/ `mineru_consents`（本仓未接入，勾选与保存不联网）/ `demo_meta`。

## 判读列断言（G3 红线）

全表全列不得出现 `diagnosis` / `risk_level` / `activity_score` / `eligible` / `milestone_status` 等派生判定列；
`done`（已注射/漏记）与 `state`（在跟/准备问/已归档）是**记录态**枚举，不是对病情或资格的判定；
生长「达标/落后」、百分位对照值一律读时算或【待核】，不落库。

## 0001 发布前修正记录（2026-11-06 00:55，尚无发布产物/tag）

- 修正 2（同刻）：documents 改代理主键 `id INTEGER` + 业务列 `doc_id TEXT`（UNIQUE(profile_key, doc_id)）——演示数据文档 id 在档案内唯一而非全库唯一（demo1/demo2 都有 doc1），全库 TEXT PK 会撞 UNIQUE；`screening_rows.doc_id` INTEGER → TEXT：演示数据与导入链路的文档 id 一律是字符串（doc1/doc2/…/A-D1），INTEGER PK 收字符串会 `datatype mismatch`（test/demo-parity.test.mjs 抓到）。哈希已同步更新。此后按冻结纪律：只新增 000N。
