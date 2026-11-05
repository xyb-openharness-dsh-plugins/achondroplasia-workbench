/* 小苗宝 GrowPal 演示数据 v0.2 —— 全部为合成示例（虚构患儿、数值与医生原话），不指向任何真实患者。
   唯一源：页面不写死数字；图表、卡片、导出、AI 上下文都读这里（Q12）。
   两套档案（Q9）：A=刚确诊记录少多处未知；B=多年随访记录多。切换整页联动（Q10）。
   边界形态覆盖（Q11）：零条、单条、多条、缺字段、未知日期、私密项、无原件。 */
window.DEMO_DATA = {
  meta: {
    dataStart: '2021-06-01',
    today: '2026-11-05',
    disclaimer: '演示数据（合成示例）：患儿、数值、医生原话与登记条目均为虚构，不指向任何真实患者；本台未连接宿主。',
    growthNote: '生长值只并列官方软骨发育不全专用生长曲线（Hoover-Fong 等 2022，据二次来源）的参考口径；本台不判定「达标/落后」，对照口径【待核】，以随访医生安排为准。',
    metricNote: '不同测量方式/机构的数据不合并、不做跨来源连线；同日多次测量按记录顺序并列。',
    trialNote: '登记条目为虚构示例，不是真实研究，不含可用登记号；登记状态一律「未核实」。线索不是推荐。',
    screenNote: '筛查项目与频次以随访医生安排为准；本台清单不构成检查建议。',
    privateNote: '私密记录不进看板摘要预览、导出与 AI 上下文（三出口同一过滤）。'
  },
  profiles: [
    {
      id: 'demo1',
      name: '苗苗（演示）',
      sex: '女',
      age: '2 岁 3 月',
      ageLabel: '27 月龄',
      careRole: 'caregiver',
      headline: '刚确诊 · 生长与筛查起步期（合成示例）',
      dash: {
        stage: '确诊 3 个月 · 建档起步',
        anchorLabel: '距确诊日',
        anchorDays: 96,
        nextVisit: '下次随访待约（内分泌门诊 · 以预约为准）',
        lastHeight: { v: 84.2, d: '2026-10-18' },
        lastHead: { v: null, d: null },
        modeNote: '刚确诊阶段：先建档，随访节奏问医生。',
        sceneTitle: '现在到哪一步了',
        doctorQuote: '医生原话（2026-08-01 门诊）：「先把生长记录记起来，三个月后复查听力，睡眠有没有打鼾告诉我。」'
      },
      dx: {
        timeline: [
          { item: '儿保门诊发现身长低于同龄参考（家长记录）', d: '2026-07', precision: 'month', src: '家长记录' },
          { item: '转诊儿科内分泌门诊', d: '2026-07-20', precision: 'day', src: '门诊记录' },
          { item: '基因检测：FGFR3 基因 c.1138G>A（p.Gly380Arg）杂合变异（报告原文引用，演示）', d: '2026-08-01', precision: 'day', src: '基因检测报告' },
          { item: '临床诊断：软骨发育不全（医生结论原文，本台只记录不判定）', d: '2026-08-01', precision: 'day', src: '门诊病历' }
        ],
        genetics: '常染色体显性遗传；本例父母外周血未见该变异，符合新生突变（医生记录原文，演示）。遗传咨询问题见「就诊准备」。',
        notes: '家长补充：孩子会走较晚（18 月龄独走），目前会说短句。'
      },
      metrics: {
        HEIGHT: [
          { d: '2026-07-20', v: 83.6, src: '儿保门诊', org: '市儿童医院儿保科' },
          { d: '2026-10-18', v: 84.2, src: '家庭自测', org: null }
        ],
        WEIGHT: [
          { d: '2026-07-20', v: 10.4, src: '儿保门诊', org: '市儿童医院儿保科' },
          { d: '2026-10-18', v: 10.9, src: '家庭自测', org: null }
        ],
        HEAD: [
          { d: '（日期未记，约 2026 年 7 月）', v: 47.8, src: '家长回忆', org: null, precision: 'unknown' }
        ],
        BMIW: []
      },
      screenings: {
        hearing: [
          { d: '2026-08-15', item: '听性脑干反应（ABR）+ 声导抗', result: '双耳通过（报告原文引用，演示）', org: '市儿童医院耳鼻喉科', docId: 'doc2' }
        ],
        sleep: [],
        craniocervical: [],
        spine: [
          { d: null, item: '脊柱检查（触诊观察）', result: '医生说「后凸不明显，继续观察」（原话照抄，演示）', org: '市儿童医院儿科骨科', docId: null }
        ],
        legs: []
      },
      events: {
        surgeries: [],
        meds: [
          { drug: '伏索利肽（演示条目）', status: '医生提及「以后可以了解」，尚未开始', start: null, note: '是否用药、何时开始，由内分泌医生评估；本台只记录不推荐。' }
        ],
        injections: []
      },
      docs: [
        { id: 'doc1', name: '基因检测报告（2026-08-01）', date: '2026-08-01', type: '基因检测', status: '已入库', hasOriginal: true },
        { id: 'doc2', name: '听力检查单（2026-08-15）', date: '2026-08-15', type: '听力', status: '待核对', hasOriginal: false }
      ],
      candidates: [
        { id: 'c1', kind: 'measure', title: '生长测量候选：头围 48.0cm（家庭测量，2026-10-18）', fields: [['日期', '2026-10-18'], ['头围', '48.0 cm'], ['来源', '家庭自测']], src: '照片识别（演示）' },
        { id: 'c2', kind: 'screening', title: '筛查候选：耳声发射（OAE）双耳通过（2026-08-15，与已登记听力检查同日）', fields: [['日期', '2026-08-15'], ['项目', '耳声发射（OAE）'], ['结果', '双耳通过']], src: '听力检查单识别（演示）' }
      ],
      questions: [
        { q: '下次听力随访大概什么时候？', asked: false },
        { q: '需要做睡眠监测吗？孩子偶尔打鼾。', asked: false },
        { q: '遗传咨询与再生育风险，需要哪个科室？', asked: false }
      ],
      hospitals: [
        { name: '市儿童医院', dept: '儿科内分泌', contact: '见病历出处', version: 1 }
      ],
      family: {
        visibility: 'private',
        notes: [
          { d: '2026-09-02', item: '和长辈沟通基因检测结果的记录（家庭沟通，默认私密）', visibility: 'private' }
        ]
      }
    },
    {
      id: 'demo2',
      name: '小松（演示）',
      sex: '男',
      age: '6 岁 8 月',
      ageLabel: '80 月龄',
      careRole: 'caregiver',
      headline: '长期随访 5 年 · 筛查与用药记录多（合成示例）',
      dash: {
        stage: '每日注射第 8 个月 · 随访节律稳定',
        anchorLabel: '距上次复诊',
        anchorDays: 41,
        nextVisit: '2026-11-20（内分泌 + 耳鼻喉听力复查，以预约为准）',
        lastHeight: { v: 112.8, d: '2026-10-25' },
        lastHead: { v: 54.6, d: '2026-09-12' },
        modeNote: '常规随访期：按医生安排的节奏记录与复查。',
        sceneTitle: '现在到哪一步了',
        doctorQuote: '医生原话（2026-10-10 复诊）：「身高记录得很清楚，继续保持；听力半年一次，睡眠监测明年暑假再约一次。」'
      },
      dx: {
        timeline: [
          { item: '新生儿期因头大转诊（家长记录）', d: '2020-05', precision: 'month', src: '家长记录' },
          { item: '基因检测确诊：FGFR3 c.1138G>A 杂合变异（报告原文引用，演示）', d: '2020-06-18', precision: 'day', src: '基因检测报告' },
          { item: '腺样体扁桃体切除术（打鼾加重后，医生安排）', d: '2023-04-12', precision: 'day', src: '住院记录' },
          { item: '开始每日皮下注射伏索利肽（演示条目；用药决定归医生）', d: '2026-03-05', precision: 'day', src: '门诊记录' }
        ],
        genetics: '父亲同为软骨发育不全（家族性，医生记录原文，演示）。再生育遗传咨询 2021 年已完成。',
        notes: '家长补充：目前小学一年级在读，体育课正常参加。'
      },
      metrics: {
        HEIGHT: [
          { d: '2021-06-10', v: 73.2, src: '儿保门诊', org: '省儿童医院' },
          { d: '2021-12-08', v: 76.5, src: '儿保门诊', org: '省儿童医院' },
          { d: '2022-06-14', v: 80.1, src: '儿保门诊', org: '省儿童医院' },
          { d: '2022-12-12', v: 83.4, src: '儿保门诊', org: '省儿童医院' },
          { d: '2023-06-11', v: 86.9, src: '儿保门诊', org: '省儿童医院' },
          { d: '2023-12-10', v: 89.8, src: '儿保门诊', org: '省儿童医院' },
          { d: '2024-06-09', v: 93.2, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2024-09-15', v: 95.0, src: '家庭自测', org: null },
          { d: '2024-12-14', v: 97.1, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-03-05', v: 99.0, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-06-08', v: 101.2, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-09-14', v: 103.5, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-12-13', v: 105.6, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-03-04', v: 107.1, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-06-10', v: 109.4, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-07-12', v: 110.3, src: '家庭自测', org: null },
          { d: '2026-09-12', v: 111.9, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-10-25', v: 112.8, src: '家庭自测', org: null }
        ],
        WEIGHT: [
          { d: '2021-06-10', v: 9.8, src: '儿保门诊', org: '省儿童医院' },
          { d: '2022-06-14', v: 11.6, src: '儿保门诊', org: '省儿童医院' },
          { d: '2023-06-11', v: 13.2, src: '儿保门诊', org: '省儿童医院' },
          { d: '2024-06-09', v: 15.1, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2024-12-14', v: 16.3, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-06-08', v: 17.6, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-12-13', v: 18.9, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-06-10', v: 19.8, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-09-12', v: 20.5, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-10-25', v: 20.7, src: '家庭自测', org: null }
        ],
        HEAD: [
          { d: '2021-06-10', v: 50.2, src: '儿保门诊', org: '省儿童医院' },
          { d: '2022-06-14', v: 51.8, src: '儿保门诊', org: '省儿童医院' },
          { d: '2023-06-11', v: 52.9, src: '儿保门诊', org: '省儿童医院' },
          { d: '2024-06-09', v: 53.8, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2025-06-08', v: 54.3, src: '内分泌门诊', org: '省儿童医院内分泌科' },
          { d: '2026-09-12', v: 54.6, src: '内分泌门诊', org: '省儿童医院内分泌科' }
        ],
        BMIW: [
          { d: '2026-09-12', v: 16.4, src: '内分泌门诊', org: '省儿童医院内分泌科', note: '身高别体重（曲线口径【待核】）' }
        ]
      },
      screenings: {
        hearing: [
          { d: '2021-09-03', item: '耳声发射（OAE）', result: '左耳未通过，建议复查（报告原文，演示）', org: '省儿童医院耳鼻喉科', docId: 'doc3' },
          { d: '2021-09-20', item: '声导抗 + 短纯音 ABR', result: '双耳传导性问题，中耳积液（报告原文，演示）', org: '省儿童医院耳鼻喉科', docId: 'doc3' },
          { d: '2022-03-15', item: '声导抗复查', result: '积液好转（报告原文，演示）', org: '省儿童医院耳鼻喉科', docId: null },
          { d: '2023-04-28', item: '术后听力评估', result: '双耳气骨导差缩小（报告原文，演示）', org: '省儿童医院耳鼻喉科', docId: 'doc4' },
          { d: '2024-11-02', item: '纯音测听', result: '双耳轻度传导性听力下降（报告原文，演示）', org: '省儿童医院耳鼻喉科', docId: 'doc5' },
          { d: '2026-05-16', item: '纯音测听 + 声导抗', result: '与 2024 相当，老师反馈课堂反应可（家长补充）', org: '省儿童医院耳鼻喉科', docId: 'doc5' }
        ],
        sleep: [
          { d: '2022-10-08', item: '多导睡眠监测（PSG）', result: '阻塞性睡眠呼吸暂停，AHI 报告原文见原件（演示；数值本台不解读）', org: '省儿童医院睡眠中心', docId: 'doc6' },
          { d: '2023-04-12', item: '腺样体扁桃体切除术（与手术事件同源）', result: '术后打鼾明显减轻（家长记录）', org: '省儿童医院耳鼻喉科', docId: 'doc4' },
          { d: '2025-08-02', item: '多导睡眠监测（PSG）复查', result: '报告原件未取得，据家长口述「医生说比术前好」（二次来源）', org: '省儿童医院睡眠中心', docId: null }
        ],
        craniocervical: [
          { d: '2020-07-01', item: '颅颈交界 MRI（确诊评估）', result: '枕骨大孔形态医生原文见影像报告（演示；本台不解读影像）', org: '省儿童医院神经外科', docId: 'doc7' },
          { d: '2024-07-20', item: '颅颈交界 MRI 随访', result: '「结构稳定，继续观察」（医生原话照抄，演示）', org: '省儿童医院神经外科', docId: 'doc7' }
        ],
        spine: [
          { d: '2021-12-08', item: '脊柱触诊（儿保）', result: '轻度胸腰段后凸，建议避免过早久坐（医生原话照抄，演示）', org: '省儿童医院儿保科', docId: null },
          { d: '2023-06-11', item: '脊柱 X 线站立位', result: '后凸较前改善（报告原文，演示）', org: '省儿童医院儿科骨科', docId: 'doc8' },
          { d: '2025-06-08', item: '脊柱查体', result: '「后凸基本矫正了」（医生原话照抄，演示）', org: '省儿童医院儿科骨科', docId: null },
          { d: '2026-09-12', item: '脊柱查体 + 下肢对线', result: '双下肢轻度膝内翻，随诊观察（医生原话照抄，演示）', org: '省儿童医院儿科骨科', docId: null }
        ],
        legs: [
          { d: '2024-06-09', item: '下肢全长 X 线', result: '轻度膝内翻（报告原文，演示）', org: '省儿童医院儿科骨科', docId: 'doc8' },
          { d: '2026-09-12', item: '步态观察（随诊）', result: '「跑步稍向外甩腿，不影响活动」（医生原话照抄，演示）', org: '省儿童医院儿科骨科', docId: null }
        ]
      },
      events: {
        surgeries: [
          { id: 's1', name: '鼓膜置管术', d: '2022-03-18', org: '省儿童医院耳鼻喉科', doctorQuote: '「中耳积液反复，置管观察半年」（术前谈话记录原文，演示）', version: 1 },
          { id: 's2', name: '腺样体扁桃体切除术', d: '2023-04-12', org: '省儿童医院耳鼻喉科', doctorQuote: '「打鼾伴呼吸暂停，手术指征由耳鼻喉评估」（术前谈话记录原文，演示）', version: 1 }
        ],
        meds: [
          { drug: '伏索利肽（演示条目）', status: '每日皮下注射（2026-03-05 起）', start: '2026-03-05', note: '剂量与方案以医嘱为准，本台只记录执行与感受，不指导用药。取药：每 3 个月一次（家长安排，演示）。' }
        ],
        injections: [
          { d: '2026-09-02', done: '已注射', cooperation: '顺利', note: '' },
          { d: '2026-09-03', done: '已注射', cooperation: '哭闹后完成', note: '换成晚饭后时段好一些' },
          { d: '2026-09-10', done: '已注射', cooperation: '顺利', note: '' },
          { d: '2026-09-20', done: '已注射', cooperation: '抗拒，深呼吸引导后完成', note: '' },
          { d: '2026-10-01', done: '已注射', cooperation: '顺利', note: '在学校秋游当天照常' },
          { d: '2026-10-08', done: '漏记', cooperation: null, note: '外出忘带，次日已补记（补记不回填当天）' },
          { d: '2026-10-09', done: '已注射', cooperation: '顺利', note: '' },
          { d: '2026-10-20', done: '已注射', cooperation: '自己选了贴纸奖励', note: '' },
          { d: '2026-11-01', done: '已注射', cooperation: '顺利', note: '' },
          { d: '2026-11-04', done: '已注射', cooperation: '顺利', note: '' }
        ]
      },
      docs: [
        { id: 'doc1', name: '基因检测报告（2020-06-18）', date: '2020-06-18', type: '基因检测', status: '已入库', hasOriginal: true },
        { id: 'doc3', name: '听力检查单（2021-09）', date: '2021-09-20', type: '听力', status: '已入库', hasOriginal: true },
        { id: 'doc4', name: '手术记录与出院小结（2023-04）', date: '2023-04-14', type: '手术', status: '已入库', hasOriginal: true },
        { id: 'doc5', name: '纯音测听报告（2024-11 / 2026-05）', date: '2026-05-16', type: '听力', status: '已入库', hasOriginal: true },
        { id: 'doc6', name: '睡眠监测报告（2022-10）', date: '2022-10-08', type: '睡眠', status: '已入库', hasOriginal: true },
        { id: 'doc7', name: '颅颈 MRI 报告（2020 / 2024）', date: '2024-07-20', type: '影像', status: '已入库', hasOriginal: true },
        { id: 'doc8', name: '下肢与脊柱 X 线报告（2023 / 2024）', date: '2024-06-09', type: '影像', status: '已入库', hasOriginal: true },
        { id: 'doc9', name: '生长门诊病历（2025 各次）', date: '2025-12-13', type: '门诊', status: '已解析', hasOriginal: false }
      ],
      candidates: [
        { id: 'c1', kind: 'measure', title: '生长测量候选：身高 113.2cm（家庭测量，2026-11-02）', fields: [['日期', '2026-11-02'], ['身高', '113.2 cm'], ['来源', '家庭自测']], src: '照片识别（演示）' },
        { id: 'c2', kind: 'injection', title: '注射记录候选：2026-11-02 已注射（家人代记）', fields: [['日期', '2026-11-02'], ['执行', '已注射'], ['记录人', '奶奶（家长代记）']], src: '家人口述（演示）' },
        { id: 'c3', kind: 'screening', title: '筛查候选：2026-08-20 儿保视力筛查「正常」（与软骨发育不全随访无直接关联，仍可入库）', fields: [['日期', '2026-08-20'], ['项目', '视力筛查'], ['结果', '正常']], src: '儿保小结识别（演示）' }
      ],
      questions: [
        { q: '身高增速最近半年变慢，曲线口径要换参考吗？', asked: true },
        { q: '听力半年一次的节奏要不要改成一年一次？', asked: false },
        { q: '膝内翻什么情况下需要骨科干预？（只问观察指征，不要求建议）', asked: false },
        { q: '下一次取药时间与备药量。', asked: false },
        { q: '学校体育课注意事项要不要医生写一句给老师？', asked: false }
      ],
      hospitals: [
        { name: '省儿童医院', dept: '内分泌科', contact: '见病历出处', version: 1 },
        { name: '省儿童医院', dept: '耳鼻喉科', contact: '复查预约电话见就诊卡', version: 1 },
        { name: '省儿童医院', dept: '儿科骨科', contact: '随诊约号 App', version: 1 }
      ],
      family: {
        visibility: 'private',
        notes: [
          { d: '2021-08-10', item: '与学校沟通入学的说明材料记录（默认私密）', visibility: 'private' },
          { d: '2026-03-10', item: '亲戚问「打针能不能长到正常身高」的沟通记录（默认私密）', visibility: 'private' }
        ]
      }
    }
  ],
  /* 临床试验（虚构示例：不是真实研究，不含可用登记号；E2/E7 红线） */
  trials: [
    { key: 'T-DEMO-01', title: '一项在软骨发育不全儿童中评价每日皮下注射药物生长效应的研究（虚构示例）', nctLike: 'NCT-示例-001（虚构）', phase: 'III 期', status: '招募中', sponsor: '某研究所（虚构）', sites: 12, ageMin: 2, ageMax: 10, needsOpenEpiphysis: true, requiresDiagnosis: '临床/基因确诊软骨发育不全', ambulatory: false },
    { key: 'T-DEMO-02', title: '软骨发育不全婴儿（0–3 岁）给药安全性研究（虚构示例）', nctLike: 'NCT-示例-002（虚构）', phase: 'II 期', status: '招募中', sponsor: '某医院（虚构）', sites: 5, ageMin: 0, ageMax: 3, needsOpenEpiphysis: true, requiresDiagnosis: '基因确诊', ambulatory: false },
    { key: 'T-DEMO-03', title: '软骨发育不全青少年开放骨骺期研究（虚构示例）', nctLike: 'NCT-示例-003（虚构）', phase: 'II 期', status: '进行中·不再招募', sponsor: '某大学（虚构）', sites: 8, ageMin: 10, ageMax: 16, needsOpenEpiphysis: true, requiresDiagnosis: '临床确诊', ambulatory: true },
    { key: 'T-DEMO-04', title: '软骨发育不全成人腰椎管狭窄自然史登记（虚构示例）', nctLike: 'NCT-示例-004（虚构）', phase: '观察性', status: '招募中', sponsor: '某中心（虚构）', sites: 20, ageMin: 18, ageMax: 65, needsOpenEpiphysis: false, requiresDiagnosis: '临床/基因确诊', ambulatory: false }
  ],
  snapshot: { source: '虚构示例快照（原型）', date: '2026-11-05', note: '快照只存登记的结构化字段；入排标准原文请到官方登记页核对；快照会过期。' }
};
