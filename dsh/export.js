/* 导出：把患儿档案整理成一份「复诊准备」markdown（给家长带去门诊，不是病历）。
 *
 * 三条硬约束：
 * 1. **私密记录不进导出**：viewpoints（家庭沟通）默认 private，导出侧一律跳过；
 *    即便调用方传了 includePrivate 也只影响页面，不进导出（三出口之一）。
 * 2. **代记标记**：导出件头部写明「家长代记」（R3 隐私要求）。
 * 3. **只抄不解释**：测量值、筛查原文、医生原话照抄；不写"建议/可能/需要注意"这类判读词
 *    （check-wording 会拦）；生长对照值只写口径说明与【待核】。
 */

const LINE = '\n'

function table(headers, rows) {
  if (!rows.length) return ''
  const out = [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')}`]
  for (const r of rows) out.push(`| ${r.map((c) => (c === null || c === undefined || c === '' ? '—' : String(c))).join(' | ')} |`)
  return out.join(LINE)
}

function section(title, body) {
  if (!body || !body.trim()) return ''
  return `## ${title}${LINE}${LINE}${body.trim()}${LINE}`
}

export function renderPrepMarkdown(profile, { generatedAt = null, version = null, excludedPrivate = false } = {}) {
  if (!profile) throw new Error('renderPrepMarkdown 需要一份档案')
  const out = []
  out.push(`# ${profile.name} 复诊资料包（家长代记 · 合成演示）`)
  out.push('')
  out.push(`- 孩子年龄：${profile.age ?? '未记录'}（${profile.careRole === 'patient' ? '本人查看' : '家长代记'}）`)
  if (generatedAt) out.push(`- 生成时间：${generatedAt}`)
  if (version) out.push(`- 工作台版本：v${version}`)
  out.push('- 口径：仅回顾不解读；不同方法/机构不合并；判读归医生。')
  if (excludedPrivate) out.push('- 家庭沟通记录为私密，不包含在本导出内。')
  out.push('')

  const dash = profile.dash ?? {}
  out.push(section('当前状态（原文）', [
    dash.stage ? `- 状态：${dash.stage}` : null,
    dash.anchorLabel ? `- ${dash.anchorLabel}：${dash.anchorDays} 天` : null,
    dash.nextVisit ? `- 下次：${dash.nextVisit}` : null,
    dash.doctorQuote ? `- 医生原话：${dash.doctorQuote}` : null,
  ].filter(Boolean).join(LINE)))

  const METRIC_NAMES = { HEIGHT: '身长/身高', WEIGHT: '体重', HEAD: '头围', BMIW: '身高别体重' }
  const UNIT = { HEIGHT: 'cm', WEIGHT: 'kg', HEAD: 'cm' }
  const metricRows = []
  for (const [code, pts] of Object.entries(profile.metrics ?? {})) {
    for (const p of pts) metricRows.push([p.d ?? '（日期未记）', METRIC_NAMES[code] ?? code, p.v !== null && p.v !== undefined ? `${p.v}${UNIT[code] ?? ''}` : String(p.v ?? '—'), p.src ?? '来源未记录', p.org ?? '—'])
  }
  out.push(section('最近生长（原始值，全部列出）', table(['日期', '指标', '数值', '来源', '机构'], metricRows)))

  const SCREEN_CATS = { hearing: '听力与中耳', sleep: '睡眠与呼吸', craniocervical: '颅颈与神经', spine: '脊柱', legs: '下肢对线' }
  const screenRows = []
  for (const [cat, items] of Object.entries(profile.screenings ?? {})) {
    for (const s of items) screenRows.push([s.d ?? '（日期未记）', SCREEN_CATS[cat] ?? cat, s.item, s.result, s.org ?? '—'])
  }
  out.push(section('筛查台账（结果原文）', table(['日期', '类别', '项目', '结果（原文/原话）', '机构'], screenRows)))

  const surgRows = (profile.events?.surgeries ?? []).map((s) => [s.d, s.name, s.org ?? '—', s.doctorQuote ?? '—'])
  out.push(section('手术（医生原话照抄）', table(['日期', '名称', '机构', '医生原话'], surgRows)))

  const medLines = (profile.events?.meds ?? []).map((m) => `- ${m.drug}：${m.status}${m.note ? `（${m.note}）` : ''}`)
  const injCount = (profile.events?.injections ?? []).filter((i) => i.done === '已注射').length
  if (injCount) medLines.push(`- 近期注射记录：已注射 ${injCount} 次（明细见工作台；漏记如实标注）`)
  out.push(section('用药与注射', medLines.join(LINE)))

  const qLines = (profile.questions ?? []).map((q) => `- [${q.asked ? 'x' : ' '}] ${q.q}`)
  out.push(section('待问清单', qLines.join(LINE)))

  const hospLines = (profile.hospitals ?? []).map((h) => `- ${h.name}${h.dept ? ` · ${h.dept}` : ''}（联系：${h.contact ?? '见病历出处'}）`)
  out.push(section('就诊医院', hospLines.join(LINE)))

  /* 「最近几次的变化」段（check-pack 断言在；只列已发生事实，不写判读） */
  const deltaLines = []
  for (const [code, pts] of Object.entries(profile.metrics ?? {})) {
    const dated = pts.filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.d ?? ''))
    if (dated.length >= 2) {
      const a = dated[dated.length - 2], b = dated[dated.length - 1]
      deltaLines.push(`- ${METRIC_NAMES[code] ?? code}：${b.d} ${b.v}${UNIT[code] ?? ''}（较上次 ${a.d} ${a.v}${UNIT[code] ?? ''}）`)
    }
  }
  const recentEvents = [
    ...(profile.events?.surgeries ?? []).slice(-2).map((s) => `- 手术：${s.d} ${s.name}`),
    ...(profile.events?.meds ?? []).filter((m) => m.start).map((m) => `- 用药开始：${m.start} ${m.drug}`),
  ]
  out.push(section('最近几次的变化', [...deltaLines, ...recentEvents].join(LINE) || '- 暂无带日期的记录变化（如实留白）'))
  out.push(section('口径说明', [
    '生长值只并列官方软骨发育不全专用生长曲线（Hoover-Fong 等 2022，据二次来源）的参考口径；本台不判定「达标/落后」，对照口径【待核】，以随访医生安排为准。',
    '筛查项目与频次以随访医生安排为准；本台清单不构成检查建议。',
  ].join(LINE)))
  return out.join(LINE)
}

export function exportFilename(profile, date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `小苗宝-资料包-${String(profile.name ?? '档案').replace(/（.*）/, '')}-${y}${m}${d}.md`
}
