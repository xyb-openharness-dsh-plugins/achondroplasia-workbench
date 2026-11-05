# PROGRESS（唯一进度速览，详情见 docs/DEV-PLAN.md）

> 更新：2026-11-06 02:30（夜班无人值守收尾）

## 当前状态：**M0–M9 全部走完**；M7/M8 冻结草稿；V3 真机待人工（Desktop 未运行）

## 已完成（全部闸口为「自动签认（待晨审追认）」，见 docs/signoffs/）
- M0 骨架（b5a0d17）：领取 issue #60 + 建仓 + init 218 文件 + 文档九件 + 接线前置
- M1 调研与 SPEC（38194dc）：三路并行调研 + G1（重名率实测 14%）
- M2 原型（9647691 + a175e84）：四件套 + primer + probe-ach-m2 17/17 + P1-P9 10/10 + Q26 三档 + 截图 10 张 + 独立评审 6×P1 返工清零 → G2
- M3 数据模型（b74ea6d）：schema 0001–0004（23 表）+ freeze-contract + 判读列断言 → G3
- M4 临床库（d622a62）：fetch 实跑 150 条（ictrp140/中国药监9/ctv1；chictr_online FAILED 如实）+ 四件套一致性
- M5 开发版（4fd93bd）：dsh 12 模块 + parity 逐字段 + 记录/更正链 + 候选三态 + MinerU 六部件 + src→lib + 测试 28 项 + check 20 节点全绿 + audit 44/44 + 双形态实测 → V1
- M6 装机（c1de73f）：pack 0.2.0 + check-pack 四要素 + pnpm 装入 Desktop profile（bundles 62）→ V2 产物层签认；**V3 待人工**
- M7/M8：release-draft（tag v0.2.0 命令+sha256+notes）+ BACKLOG 状态行 patch/PR body 草稿（只备好，未发布未推送）
- M9 回流（starter 7ad5d64，1.10.0-rc.15）：host-contract 剥注释修复（可断言）+ LESSONS L61–L63 + check-starter 217 过 + tests 67/67
- 提交纪律备注：M7/M8/M9 文档曾误提交到 starter 仓（1b6c38f/a427fc5），已在该仓 dd03612/27beca2 两次 revert 恢复；正身在本仓。

## FAMILY-INSPECTOR 全量轮（2026-11-06 03:00–03:40，用户指令）
- 独立 Inspector §A–§I 全量（24 张逐屏截图 + 全 checker）：**P0=0**；4×P1（F3 api 态继续录入关窗 / F6 医院无修改 / D5 图内私密标注 / E2 检索地区）**全部修复**；P2 五项处理四项（C3 替换 Token 禁用态、A4 版本字面、B1 裁剪表、F2 家庭沟通记录卡），一项留晨审（M4 真实快照入库时点）；inspector 测试写入行已清理（metric_points 回到 40）。
- 防再犯：test/f3-keepopen.test.mjs（api 态不关窗真实链路探针）进 npm test。
- 报告与修复留痕：docs/inspector/2026-11-06-M6-对齐后全量.md；BACKFLOW 第三轮。
- 修复后回归：check 全绿（test 29/29）· probe 17/17 · audit 44/44。

## 下一步（晨间）
1. 追认 5 份自动签认；2. 重启 DSH Desktop → 新会话 → verify-desktop-load + 真机走查 → 真机截图 → V3；3. 追认后执行 M7 发布命令与 M8 PR。

## 阻塞
- V3 唯一阻塞：DSH Desktop 未运行（上次退出 2026-11-05 16:02）。
