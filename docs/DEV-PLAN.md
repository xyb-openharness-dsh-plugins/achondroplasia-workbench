# DEV-PLAN · 小苗宝 GrowPal（软骨发育不全）开发计划

版本：v0.1.0（M0 骨架）· 更新：2026-11-05 23:45（夜班无人值守）
模式：无人值守夜间（不提问、不停等；默认值落 DEV-REQUIREMENTS §五，晨审追认）
时间盒：2026-11-05 23:00 → 2026-11-06 08:00；到期停开新里程碑，完成当前原子步骤即收尾。

## 一、领取（§4 自动领取，2026-11-05 23:35–23:45 完成）

- BACKLOG 核对：xyb-openharness-dsh-plugins/.github BACKLOG.md（更新 2026-10-26，58KB 实读）。
- 候选筛选：全池 ⬜ 未启动项中 T0/T1 逐项与远端仓、issue 列表交叉核验。排除：白塞病 T1（远端仓 behcet-workbench 在途提交）、大动脉炎 T1（takayasu-workbench v0.3.x，另一夜班 2026-11-05 收尾）、成人斯蒂尔病 T1（issue #51/#52 已认领，aosd-workbench v0.5.9）。
- **选定：软骨发育不全（Achondroplasia，罕见病目录 #1，R3 儿童/遗传型，T0 R3 样板，🔥 优先招募）**。
- 选择理由：① 全池唯一未认领的 T0 样板，优先级最高；② 随访天然结构化（生长测量逐次记录、年度并发症筛查、手术与用药事件），满足「随访天然结构化」优先条件；③ R3 形态（家长代记双视角、生长指标年龄性别分层、隐私默认更严）家族内无样板，与 38 个已开工仓差异化最强；④ BACKLOG 标注 R3 需 1 个样板 + 31 个配置化单元，本仓是 31 项的地基。
- 认领记录：issue [#60](https://github.com/xyb-openharness-dsh-plugins/.github/issues/60)（含分级判定卡六项 + 差异化矩阵 4 条）+ 评论 /claim（issue 模板 404，事实记录；按既有 #51 格式拟文）。
- 建仓：gh repo create xyb-openharness-dsh-plugins/achondroplasia-workbench --private；clone 后 `dsh-wb-cli 1.10.0-rc.12 init`（218 文件，business-first）。
- 接线前置：cordis.patch.yml 补 `config.root: !!js dshHomePath('achondroplasia')`（对照 takayasu 等已装机仓）；package.json dsh 块（bundle.patch/client.inject=dsh-desktop-workbenches）与 repository url 已核对。

## 二、参考基准（§3 第 2 步）

| 用途 | 基准 | 拿什么 | 不拿什么 |
| --- | --- | --- | --- |
| 移植样板（客户端链路底本） | cervical-workbench | src→build→lib 链路、lib/client.js 宿主接线、check 链组织 | 宫颈癌病种语义、HPV 筛查口径 |
| 成熟对比基准 | breast-cancer-workbench/prototypes/v0.4 | 首页 hero、五 Tab、分类眉题、最近值/差值/次数/来源卡、最近报告表、折叠卡 | 肿瘤分期、治疗线序、疗效应答、标志物口径 |
| 结构基准 | aml-workbench/prototypes/v0.2 #mind/mind-burden | 导航分组、心智负担与生活影响线、时间线事件泳道、空态 | 血液肿瘤阶段语义、危险度分层 |
| 夜间同族参照 | takayasu-workbench v0.3.0 Inspector 返工后的设置三 Tab/一图秀 rail/试验四段 | 结构写法对照（只看结构，非病种语义） | 大动脉炎语义 |

R3 形态适配（BACKLOG 2.3）：同一账号内「本人/代记」双视角；生长发育指标年龄性别分层；隐私与分享默认更严。**本台是 R3 样板，上述三条是差异化的硬要求。**

## 三、里程碑推进表（夜间实排）

| 里程碑 | 夜间时间盒 | 闸口 | 说明 |
| --- | --- | --- | --- |
| M0 骨架 | 23:35–00:00 | — | 文档九件 + 基线 check（已过 staticPass=true） |
| M1 调研与 SPEC | 00:00–01:15 | G1 | 医学约束 10 主题 / 用户研究 / 家族对比；DIFF-MATRIX 重名率实测 |
| M2 原型 | 01:15–03:15 | G2 | prototypes/v0.2 四件套 + 两套合成档案 + 检查点清单 |
| M3 数据模型 | 03:15–03:45 | G3 | schema/0001_initial.sql + freeze-contract |
| M4 临床库 | 03:45–04:30 | — | fetch 脚本 + research 四件套（在线通道失败如实记 FAILED） |
| M5 开发版 | 04:30–06:30 | V1 | 七步移植 + test 五套 + check 全绿 |
| M6 装机 | 06:30–07:15 | V2/V3 | pack → profile 装机 → 真机走查（Desktop 不可用则如实记未验证） |
| M7 发布 | 07:15–07:35 | — | 冻结模式：tag/release 草稿存 docs/release-draft/ |
| M8 回填 | 07:35–07:45 | — | BACKLOG 状态行 PR 草稿（夜间不推送 main） |
| M9 收敛 | 07:45–08:00 | — | 经验回流 + MORNING-REVIEW.md |

额度/鉴权/套餐类错误同一处最多重试 2 次，仍失败停跑写报告。

## 四、风险预案

- 在线通道（ClinicalTrials.gov 等）夜间不可用 → M4 如实记 FAILED，不写零结果。
- DSH Desktop 未运行/无法重启 → V2/V3 记未验证，继续 M7/M8/M9。
- 患者原话缺失 → 全部场景句标注「设计假设，0 访谈」，不冒充引语。
- 指南原件夜间取不到 → CLINICAL-DATA 标「未取得原件，据二次来源」。

## 五、进度台账

PROGRESS.md 在每里程碑后更新；各闸口签认见 docs/signoffs/。
