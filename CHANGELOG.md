## 0.2.1（2026-11-11，AI 对话面板激活修复）

- 会话判定改用宿主归属 `ownedSession()`（`ownsSession(currentSession())`），不再用 `Boolean(conversation)`（customFrame 下没会话也会传隐藏容器，判断恒为真 → 点了没反应）。
- 创建路径改为 `service.newSession(workspaceId)`，工作区取 `service.defaultWorkspace?.()?.workspaceId`；不传可用工作区时由宿主提示选目录；不再调用 `ensureSession({})`。
- 取消目录选择不留空会话并提示可重试；创建失败在工作台内显示原因；订阅会话变化触发重渲染；草稿仍只填不发。
- 装机与实机验证待人工
- 验证：`check-agent-pane-contract` 通过；生成物与页面版本同步 0.2.1；**界面加载与真机点击待人工**（需重开 DSH Desktop）。

# CHANGELOG · 小苗宝 GrowPal

## 0.2.0（2026-11-06 夜班）
- 包版本 0.2.0（M5 开发版）：dsh 引擎 12 模块（routes/store/readmodels/demo/export/import/mineru/settings/server/layout/workbench/index）
- 真客户端链路：src→build→lib（customFrame 字面量折叠）；public 与原型逐字节同步
- schema 0001–0004（23 表）；freeze-contract；bootstrap 与 demo-data 逐字段 parity（test 3/3）
- 记录写路径 /records/:kind（7 类 + 2 类更正=新版本）；候选三态；试验快照由 M4 四件套供库
- 测试 28 项全过；npm run check 全绿（20 节点）；版本十处同源（VERSION/package/lib/README/CHANGELOG/原型快照 0.2.0/截图 v0.2.0）
- M0–M4 与 G1/G2/G3 自动签认见 docs/signoffs/（待晨审追认）

## 0.1.0（2026-11-05 夜班）
- 包版本 0.1.0（脚手架 init 218 文件）：DSH 注册、health 接口、版本展示、标准/大字切换；无业务数据库
