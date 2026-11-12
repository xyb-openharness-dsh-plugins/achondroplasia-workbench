## 0.2.3 — 2026-11-13

三缺口批量补齐（A 型：临床线与新建患者早已就绪，只缺资料目录入口）：

- **资料目录真入口**：面板顶栏新增「配置目录」→ `uiWorkspace.pickDirectory()` → 口径硬拒（主目录本身/桌面/下载根/tmp，客户端 + 服务端双判）→ `POST /api/esophageal/api/root` 落盘回显。
- 用 starter 的 `templates/fix-data-dir.mjs` 一次生成（按 `onClick: onAgentClick` 回溯定位按钮，不依赖缩进）。
- `cordis.patch.yml` 补 `config.root: !!js dshHomePath(…)`。
- 校验：三闸门全绿；`npm run check` 全绿。

## 0.2.3 — 2026-11-13

三缺口批量补齐（A 型：临床线与新建患者早已就绪，只缺资料目录入口）：

- **资料目录真入口**：面板顶栏新增「配置目录」→ `uiWorkspace.pickDirectory()` → 口径硬拒（主目录本身/桌面/下载根/tmp，客户端 + 服务端双判）→ `POST /api/achondroplasia/api/root` 落盘回显。
- 用 starter 的 `templates/fix-data-dir.mjs` 一次生成（按 `onClick: onAgentClick` 回溯定位按钮，不依赖缩进）。
- 本仓原型是**冻结快照**：版本字面量随包前移后必须同步 `FROZEN_PROTOTYPE` 并保持 public 与 prototypes 逐字节一致（已重冻结，渲染内容未变）。
- 校验：三闸门全绿；`npm run check` 全绿。

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
## 0.2.2（2026-11-12，装机三问题修复：AI 对话入口 / 资料目录 / 新建档案）

- **首页 AI 对话**：顶栏按钮在嵌入式（DSK Desktop 壳层）改为向宿主帧 postMessage `achondroplasia:agent-open`（携带当前页默认提示词+档案上下文，只填不发），由宿主机拉起原生对话面板并填入草稿；独立打开仍是演示面板。**同时修复宿主帧监听的消息类型写成 `cervi:agent-draft`（业务页发 `achondroplasia:agent-draft`，桥一直全哑）**。
- **资料目录**：装机态新增 `GET /settings/workspace`（真实路径/数据库文件/体积/可写/表数/迁移账本）并替换原「原型演示」弹窗；「复制路径」；位置变更说明归宿主侧。演示态保留如实标注。
- **新建档案与管理**：`0006_subjects_manage.sql`（subjects.in_use/archived_at）+ `POST /profiles`（create/rename/archive/restore，无裸删除）+ `GET /profiles`（在用/已归档）；切换器改为「＋ 新建档案」+ 管理当前档案（重命名/归档）+ 归档区恢复；新建档案从空状态开始（空态 CTA 齐备），装机态写入本机库，演示态仅内存并如实提示。
- 验证：check 全链、audit、探针；dev-server 实测 create→bootstrap→空档案看板；装机态模拟（/ui/ 子路径）模板不 404。
