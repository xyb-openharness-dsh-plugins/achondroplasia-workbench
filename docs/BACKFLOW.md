# M9 经验收敛 · 回流清单（2026-11-06 夜班，软骨发育不全）

## 已执行（回流 commit 清单）

| # | 去向 | 内容 | 类型 | 受益方 |
| --- | --- | --- | --- | --- |
| 1 | starter templates/check-host-contract.mjs | customFrame 断言先剥注释行（本轮实测：build 头注释让断言读出「true · 业务 left 0.65」假红） | **可断言**（check-starter 过） | 下一轮所有新仓 |
| 2 | starter docs/LESSONS.md L61 | 演示数据业务 id 档案内唯一 → 代理 PK + doc_id/cand_id/surg_id（本轮两修 schema） | 文档+parity 测试范式 | 新仓 schema 设计 |
| 3 | starter docs/LESSONS.md L62 | `const DATA` 让 api 态静默退演示态（catch 吞 TypeError）→ let + warn | 文档（附带双形态实测闸口建议） | M5 移植 |
| 4 | starter docs/LESSONS.md L63 | 「从源码抠值」断言先剥注释（通用规则） | 文档 | 全部检查器 |
| 5 | starter CHANGELOG 1.10.0-rc.15 | 记来源仓与内容；版本升 prerelease | 簿记 | — |
| 6 | starter 自检 | check-starter pass（217 files）+ tests 67/67 | 证据 | — |

## 第二轮回流（2026-11-06 看板/一图秀对齐轮）

| # | 去向 | 内容 | 类型 |
| --- | --- | --- | --- |
| 7 | starter LESSONS L64 + 1.10.0-rc.16 | `.mcard-inner` 加 overflow:hidden 拍平 preserve-3d → 180° 镜像前脸（重摄截图时肉眼发现；computed style 全对、探针字符串断言不红） | 可断言方向已登记（翻转卡像素采样/分组属性断言待实施） |
| 8 | 本仓实现 | 看板对齐小粉宝结构：hero+双 tile、竖条状态卡（第 N 天特大数字+锚点小字+卡内按钮组）、数据行动带（指标差异句）、快捷卡圆底图标+↗+进度、「最近的变化」mini 折线卡+统计行、「接下来的安排」待办列表 | UI parity |
| 9 | 本仓实现 | 一图秀改 16 号单区画布：各线按自身全期 min/max 归一化重叠 + 横向网格 + 锚点虚线（确诊日）+ 顶部事件带（手术菱形/筛查彩点/注射月条）+ 图例行带全期范围 + 主卡标题行 pills + 末点标签三向避让 + 事件图例 | UI parity |
| 10 | 本仓实现 | 指标卡背面=最近几次迷你折线 sparkline + 首末日期（小粉宝同款；单点卡显「只有 1 次记录，暂不连线」） | UI parity |
| 11 | 本仓探针 | C2 断言收窄到数据点层（`[data-point]` 圆），事件带另计——画布引入事件层后原断言会误数 | 探针适配 |

## 第三轮回流（2026-11-06 FAMILY-INSPECTOR 全量轮，M6 对齐后）

| # | 去向 | 内容 | 类型 |
| --- | --- | --- | --- |
| 12 | 本仓 test/f3-keepopen.test.mjs | 「api 态保存并继续录入不关窗」真实链路探针（dev-server 临时工作区 + 浏览器断言 dialog stillOpen + 输入清空 + 行数 +1）——Inspector 抓到的 F3 回归从此有闸口 | **可断言** |
| 13 | 本仓 app.js | apiSaveRecord keepOpen 贯通（F3）、医院修改=新版本+历史接口（F6）、一图秀私密 N 条不含+measure 可见性开关+图表过滤（D5）、检索地区维度（E2，0005 迁移）、家庭沟通记录卡+表单（F2）、MinerU 替换 Token 禁用态（C3）、声明条版本字面（A4）、菜单裁剪表（B1） | 修复 |
| 14 | starter 候选（未回流） | 「分组属性拍平 3D」探针加固：断言 .mcard-inner 无 overflow/clip-path/filter/mask（L64 的可断言化） | 待实施 |

## 第四轮回流（2026-11-06 用户点名追查轮：AI/设置/首页/一图秀）

| # | 去向 | 内容 | 类型 |
| --- | --- | --- | --- |
| 15 | 本仓 app.js | AI 每页单一入口（三页重复实测 2 个→1 个，统一「和 AI 讨论」IP11 文案） | 修复 |
| 16 | 本仓 app.js | 设置三 Tab 状态保持：openSettings 默认参数 null（弹窗默认参数重置状态的通用坑→starter L65） | 修复+可复用教训 |
| 17 | 本仓 index.html | AI 面板 demo 内容中性化（去硬编码档案名假对话） | 修复 |

## 检查器待实施清单（追加；谁能断言谁写）

1. probe-one-chart 本仓已覆盖 C1–C6/C4 路径断言（probe-ach-m2），家族级 `templates/probe-one-chart.mjs` 仍待抽象（对照小粉宝口径：getBBox 高度比、翻转 rect 四值、matrix3d 前缀）。
2. probe-panel（40 号 7–14）：本仓断言了 DOM 顺序与 25–45 键盘步进（Q31/Q18），container 759px 折叠行为待补。
3. documents/candidates/surgeries 业务 id 作用域断言：schema 检查器可加「业务 id 列必须 UNIQUE(profile_key, id) 且代理主键存在」（可直接写成 check，下一轮实现）。
4. apiBase 双形态探针：把本次浏览器双态实测（api 横幅 vs 离线横幅）固化成 templates/probe-dual-mode.mjs。

## 项目内沉淀

- DEV-REQUIREMENTS-2026-11-06.md（10 条硬约束全部带验证命令）；docs/inspector/2026-11-06-M2.md（独立评审轮）。
