/* 疾病概要数据 v0.2（36 号：第②层解释，不生成第③层判断；契约对齐家族 primer.js）
   内容边界：四段固定顺序 definition→evidence→landscape→trend；来源逐条可点；
   未取得原件写「据二次来源」；趋势只写已发生事实并带日期；中国官方批准【待核】。 */
window.DISEASE_PRIMER = {
  brand: '小苗宝 GrowPal',
  name: '软骨发育不全',
  en: 'Achondroplasia',
  updated: '2026-11-06（夜间整理 · 0 患者访谈 · 0 临床审核 · 据二次来源）',
  sections: [
    {
      id: 'definition',
      title: '定义（这是什么）',
      intro: '软骨发育不全是一种先天骨骼发育异常：长骨生长板的软骨成形受阻，表现为四肢短缩型矮小、头围相对大、面中部稍平、手指短并呈三叉状。它是「短肢侏儒症」中最常见的一种。',
      points: [
        '原因：绝大多数由 FGFR3 基因特定变异（c.1138G>A 或 c.1138G>C）引起，属常染色体显性遗传。',
        '多数孩子是新生变异（父母没有），少数遗传自已患病的家长；具体比例数字本轮不引用（待核）。',
        '档案里「基因检测 FGFR3 c.1138G>A」就是针对这个变异的检测；报告原文以原件为准，本台只记录不解读。'
      ],
      sources: [
        { t: '卫健委《罕见病诊疗指南（2019 年版）》软骨发育不全篇（官方页）', u: 'http://www.nhc.gov.cn/yzygj/c100068/201902/073540e8f83b4a54a28684d23e2ae2f5.shtml', note: '据二次来源' },
        { t: '《86 个罕见病病种诊疗指南（2025 年版）》目录第 1 条（官方页）', u: 'http://www.nhc.gov.cn/yzygj/c100068/202507/5b3f41180a42465eb9eec34597bacaf2.shtml', note: '据二次来源' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      groups: [
        { label: '国内规范', points: ['《86 个罕见病病种诊疗指南（2025 年版）》目录第 1 条与 2019 年版罕见病诊疗指南均收录软骨发育不全；已纳入国家第一批罕见病目录。', '原件 PDF 已定位到卫健委官方域名，本轮未逐字核对——引用原文前需打开核对（据二次来源）。'] },
        { label: '国际共识与曲线', points: ['国际专家共识（2022，Nature Reviews Endocrinology）系统整理了健康监测建议：颅颈交界、睡眠呼吸、听力、脊柱与下肢等条目；本台筛查台账的类别名来自这些条目（名词级）。', '软骨发育不全专用生长曲线（Hoover-Fong 等 2022，多国 1374 例）与普通儿童曲线不同；本台展示口径说明，具体对照值【待核】。'] },
        { label: '本台怎么用规范', points: ['指南只划定「能整理什么名词」，不转成自测问题或治疗选择；所有频次、阈值、比例未核对原件前一律【待核】。'] }
      ],
      table: {
        head: ['资料', '现状（2026-11-05 夜间核实口径）', '原件'],
        rows: [
          ['国内指南 2019/2025', '已收录；官方 PDF 已定位（本轮未逐字核对，据二次来源）', { text: '官方入口页（原件需自行打开 PDF 核对）', url: 'https://www.nhc.gov.cn/yzygj/c100068/202507/5b3f41180a42465eb9eec34597bacaf2.shtml', kind: 'hub', note: '入口页不是原件；本轮未取得 PDF 原件' }],
          ['国际共识 2022', '监测条目与手术名词来源', { text: '全文页', url: 'https://www.nature.com/articles/s41574-021-00595-x', kind: 'fulltext' }],
          ['专用生长曲线', 'Hoover-Fong 等 2022（纠正：非 Horton）', { text: '全文页 · 对照值【待核】', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8697459', kind: 'fulltext' }],
          ['NMPA 批准状态', '伏索利肽——官网 412 不可达', { text: '官方入口（未核实【待核】）', url: 'https://www.nmpa.gov.cn/yaopin/ypjgdt/index.html', kind: 'hub', note: '药品公告列表入口页；本轮 412 不可达、未取得公告原件，需自行检索批准公告' }]
        ]
      },
      sources: [
        { t: '《86 个罕见病病种诊疗指南（2025 年版）》（官方页）', u: 'http://www.nhc.gov.cn/yzygj/c100068/202507/5b3f41180a42465eb9eec34597bacaf2.shtml', note: '据二次来源' },
        { t: '国际共识 2022（Nature Rev Endocrinol）', u: 'https://www.nature.com/articles/s41574-021-00595-x' },
        { t: 'Hoover-Fong 等 2022 生长曲线（Am J Med Genet A）', u: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8697459', note: '据二次来源' }
      ]
    },
    {
      id: 'landscape',
      title: '治疗全景（只列事实名词，不做选择建议）',
      groups: [
        { label: '随访监测', points: ['听力随访（婴儿期即开始，初始评估建议 6 月龄前完成——共识口径）；睡眠监测（多导睡眠监测 PSG）；颅颈交界影像评估；脊柱与下肢骨科随诊。每个孩子查什么、多久查，由随访医生安排。'] },
        { label: '手术（名词，是否需要由医生评估）', points: ['鼓膜置管、腺样体扁桃体切除、枕骨大孔减压、脑室-腹腔分流、脊柱后路融合、下肢截骨矫形等。'] },
        { label: '药物', points: ['伏索利肽（vosoritide）：每日皮下注射，适用于骨骺未闭合的儿童；中国批准状态与适应证细节【待核】（本轮 NMPA 官网 412 不可达，未核实到官方公告原文）。'] },
        { label: '康复与支持', points: ['早期干预、语言与发育监测、适龄体位与运动指导（共识建议性条目）；教育与社会支持由家庭与学校共同安排。'] }
      ],
      points: [],
      intro: '以上手段按受累器官与病情轻重排列（听力·中耳 / 睡眠·呼吸 / 颅颈·神经 / 脊柱 / 下肢）；这一页只整理「有哪些已存在的事实名词」，不代表任何一项适合你；具体选什么、做不做，需要问你的医生。',
      sources: [
        { t: '国际共识 2022（同上）', u: 'https://www.nature.com/articles/s41574-021-00595-x' },
        { t: 'ClinicalTrials.gov：condition=achondroplasia（2026-11-05 实测约 47 项登记）', u: 'https://clinicaltrials.gov/search?cond=achondroplasia', note: '官方注册库；状态未核实' },
        { t: '伏索利肽中国批准状态：待核（NMPA 官网本轮不可达）', u: '', note: '【待核】' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势（只写已发生事实与日期）',
      points: [
        '药物可及：2024–2025 年公开报道显示，中国大陆家庭经博鳌乐城先行区等渠道开始使用伏索利肽（每日皮下注射）；有「用药 3 个月身高增长 1.5 厘米」一类个案报道（2025-10），个案不代表群体效果。',
        '登记研究：截至 2026-11-05，ClinicalTrials.gov 上软骨发育不全相关登记约 47 项（含观察性与药物研究，状态各异）。',
        '家庭可及性：取药安排、报销范围因地而异（公开报道 2024-12：博鳌每次最多带 3 个月药量）；已发生事实的记录，不构成任何建议。',
        '本台不预测疗效与远期结局；趋势段只收录带日期的已发生事实。'
      ],
      sources: [
        { t: '罕见病网（2024-12-09，媒体转述公开叙述）', u: 'http://www.raredisease.cn/News/Info/23717?labelId=10317', note: '公开叙述，非访谈' },
        { t: '新华医院（2025-02-19）', u: 'https://www.xinhuamed.com.cn/med/detail-8514.html', note: '公开叙述' },
        { t: '人民日报健康客户端（2025-10-20）', u: 'http://www.jksb.com.cn/index.php?m=wap&a=show&catid=788&id=246847', note: '公开叙述' }
      ]
    }
  ]
};
