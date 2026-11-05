# Release v0.2.0 · 小苗宝 GrowPal（软骨发育不全患儿家庭工作台）

- tag: v0.2.0 · target: main（commit 4fd93bd 之后的 M6 提交）
- 附件: xyb-community-achondroplasia-workbench-0.2.0.tgz
- sha256: 00e7f50e0510ca47b5c3ad90778e5d1dc248752026c71f887367c84f5f0b7889

## 发布内容
- M0–M6 全链：领取（issue #60）→ 文档九件 → 双基准对齐原型（G2）→ 23 表 schema（G3）→ M4 试验快照 150 条（manifest=jsonl=sqlite=150，chictr_online FAILED 如实）→ 开发版（V1：check 20 节点全绿、audit 44/44、测试 28 项、双形态实测）→ 装机产物层（V2：pnpm 装入 Desktop harness profile、bundles 第 62 项）。
- 状态声明：0 患者访谈、0 临床审核；MinerU 未接入（勾选与保存不联网）；V3 真机走查待人工（Desktop 未运行）。

## 发布命令（晨审追认后执行）
git tag v0.2.0 && git push origin v0.2.0
gh release create v0.2.0 release/xyb-community-achondroplasia-workbench-0.2.0.tgz --title "v0.2.0 小苗宝 GrowPal" --notes-file docs/release-draft/release-notes.md
