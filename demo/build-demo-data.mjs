/* 演示数据构建（软骨发育不全）。
 * 唯一源：prototypes/v0.2/demo-data.js（手写维护，Q12）。
 * 本脚本把它读出来：
 *   ① 导出 buildDemoProfiles()（dsh/demo.js seedDemo 与 parity 测试共用同一份纯数据）；
 *   ② 直接 `node demo/build-demo-data.mjs` 时，把 demo/demo-data.sqlite 建出来（dev-server / 测试用）。
 * 在这里不新增、不改写任何数值——演示数据一旦多出一条，原型与开发版就会各说一套。
 */
import { readFileSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SRC = join(ROOT, 'prototypes/v0.2/demo-data.js')

export function buildDemoProfiles() {
  const window = {}
  new Function('window', readFileSync(SRC, 'utf8'))(window)
  return window.DEMO_DATA
}

/* 指标目录（与 prototypes/v0.2/app.js CATALOG 同源；改口径两处同改） */
const CATALOG_DEFAULT = {
  HEIGHT: { name: '身长/身高', unit: 'cm', cat: '体格生长', color: '#2f6b40', dec: 1, note: '测量方式（卧式身长/立式身高）不同时不跨组连线、不做差（口径见页内说明）。' },
  WEIGHT: { name: '体重', unit: 'kg', cat: '体格生长', color: '#b06a28', dec: 1, note: '衣物差异会让家庭自测与门诊值不可比；并列展示不合并。' },
  HEAD: { name: '头围', unit: 'cm', cat: '体格生长', color: '#2f7d6b', dec: 1, note: '软骨发育不全专用头围曲线与普通曲线不同；本台只并列记录，不判读。' },
  BMIW: { name: '身高别体重', unit: null, cat: '其他测量', color: '#7c6aae', dec: 1, note: '参考口径【待核】；记录项不判定体型。' },
}

/* ---------- 把 buildDemoProfiles() 写进一个库（demo 库或测试内存库共用） ---------- */
export function seedInto(db, data = buildDemoProfiles()) {
  const j = (v) => (v === undefined || v === null ? null : JSON.stringify(v))
  db.exec('BEGIN')
  try {
    const insSubject = db.prepare(`INSERT INTO subjects
      (profile_key, name, sex, age_label, age_months, care_role, headline, status_note, anchor_label, anchor_date, next_visit, doctor_quote, genetics_note, notes, created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    const insMeta = db.prepare('INSERT INTO profile_meta (profile_key, k, v) VALUES (?,?,?)')
    const insTitle = db.prepare('INSERT INTO section_titles (profile_key, key, title, ord) VALUES (?,?,?,?)')
    const TITLES = [
      ['体格生长', '体格生长（身长/体重/头围）'], ['其他测量', '其他测量'],
      ['hearing', '听力与中耳'], ['sleep', '睡眠与呼吸'], ['craniocervical', '颅颈与神经'],
      ['spine', '脊柱'], ['legs', '下肢对线'], ['events', '手术与用药事件'], ['hospitals', '就诊医院'],
    ]
    const insMetric = db.prepare('INSERT INTO metrics (profile_key, code, name, unit, cat, color, dec, note, in_use) VALUES (?,?,?,?,?,?,?,?,1)')
    const insPoint = db.prepare('INSERT INTO metric_points (profile_key, code, d, d_precision, v, v_text, src, org, note, visibility, version) VALUES (?,?,?,?,?,?,?,?,?,?,1)')
    const insDx = db.prepare('INSERT INTO dx_rows (profile_key, kind, item, d, d_precision, src, in_use) VALUES (?,?,?,?,?,?,1)')
    const insScreen = db.prepare('INSERT INTO screening_rows (profile_key, cat, item, result_text, d, org, doc_id, visibility, version) VALUES (?,?,?,?,?,?,?,?,1)')
    const insSurgery = db.prepare('INSERT INTO surgery_rows (profile_key, surg_id, name, d, org, doctor_quote, version, in_use) VALUES (?,?,?,?,?,?,?,1)')
    const insMed = db.prepare('INSERT INTO med_rows (profile_key, drug, status_text, start_date, note, in_use) VALUES (?,?,?,?,?,1)')
    const insInj = db.prepare('INSERT INTO injection_rows (profile_key, d, done, cooperation, note, visibility, version) VALUES (?,?,?,?,?,?,1)')
    const insDoc = db.prepare('INSERT INTO documents (profile_key, doc_id, name, date, type, status, has_original, in_use) VALUES (?,?,?,?,?,?,?,1)')
    const insCand = db.prepare('INSERT INTO candidate_fields (profile_key, cand_id, kind, title, fields_json, src, state, created_at) VALUES (?,?,?,?,?,?,?,?)')
    const insQ = db.prepare('INSERT INTO question_rows (profile_key, q, asked, ord, in_use) VALUES (?,?,?,?,1)')
    const insHosp = db.prepare('INSERT INTO hospitals (profile_key, name, dept, contact, version, in_use) VALUES (?,?,?,?,?,1)')
    const insView = db.prepare('INSERT INTO viewpoints (profile_key, d, item, visibility, in_use) VALUES (?,?,?,?,1)')
    const insTrial = db.prepare(`INSERT INTO trials
      (key, title, nct_like, phase, status, sponsor, region, sites, age_min, age_max, needs_open_epiphysis, requires_condition, ambulatory, snapshot_date, in_use)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`)
    const insDemoMeta = db.prepare('INSERT INTO demo_meta (profile_key, data_start, today, disclaimers_json) VALUES (?,?,?,?)')

    for (const p of data.profiles) {
      const key = p.id
      const dx = p.dx ?? {}
      insSubject.run(key, p.name, p.sex ?? null, p.age ?? null, null, p.careRole ?? 'caregiver', p.headline ?? null,
        p.dash?.stage ?? null, p.dash?.anchorLabel ?? null, p.dash?.anchorDate ?? null, p.dash?.nextVisit ?? null,
        p.dash?.doctorQuote ?? null, dx.genetics ?? null, dx.notes ?? null, data.meta.today)
      TITLES.forEach(([k2, t2], i) => insTitle.run(key, k2, t2, i))
      insMeta.run(key, 'anchor_days', String(p.dash?.anchorDays ?? ''))
      insMeta.run(key, 'mode_note', p.dash?.modeNote ?? '')
      insMeta.run(key, 'scene_title', p.dash?.sceneTitle ?? '')
      insMeta.run(key, 'age_label', p.ageLabel ?? '')
      insMeta.run(key, 'age_months', String(p.ageMonths ?? ''))
      for (const [code, m] of Object.entries(CATALOG_DEFAULT)) {
        insMetric.run(key, code, m.name, m.unit ?? null, m.cat, m.color, m.dec, m.note ?? null)
      }
      for (const [code, pts] of Object.entries(p.metrics ?? {})) {
        for (const pt of pts) {
          const unknown = pt.precision === 'unknown'
          insPoint.run(key, code, unknown ? null : pt.d ?? null, unknown ? 'unknown' : (pt.precision ?? (pt.d ? 'day' : null)),
            typeof pt.v === 'number' ? pt.v : null, typeof pt.v === 'string' ? pt.v : null,
            pt.src ?? null, pt.org ?? null, pt.note ?? null, pt.visibility ?? 'shared')
        }
      }
      ;(dx.timeline ?? []).forEach((t) => insDx.run(key, '评估与结论原文', t.item, t.d ?? null, t.precision ?? 'day', t.src ?? null))
      for (const [cat, items] of Object.entries(p.screenings ?? {})) {
        for (const s of items) insScreen.run(key, cat, s.item, s.result, s.d ?? null, s.org ?? null, s.docId ?? null, 'shared')
      }
      for (const sg of p.events?.surgeries ?? []) insSurgery.run(key, sg.id, sg.name, sg.d, sg.org ?? null, sg.doctorQuote ?? null, sg.version ?? 1)
      for (const md of p.events?.meds ?? []) insMed.run(key, md.drug, md.status, md.start ?? null, md.note ?? null)
      for (const ij of p.events?.injections ?? []) insInj.run(key, ij.d, ij.done, ij.cooperation ?? null, ij.note ?? null, 'shared')
      for (const d of p.docs ?? []) insDoc.run(key, d.id, d.name, d.date ?? null, d.type ?? null, d.status ?? '待核对', d.hasOriginal ? 1 : 0)
      for (const c of p.candidates ?? []) insCand.run(key, c.id, c.kind, c.title, j(c.fields), c.src ?? null, 'pending', data.meta.today)
      ;(p.questions ?? []).forEach((q, i) => insQ.run(key, q.q, q.asked ? 1 : 0, i))
      for (const h of p.hospitals ?? []) insHosp.run(key, h.name, h.dept ?? null, h.contact ?? null, h.version ?? 1)
      for (const v of p.family?.notes ?? []) insView.run(key, v.d ?? null, v.item, v.visibility ?? 'private')
      insDemoMeta.run(key, data.meta.dataStart ?? null, data.meta.today ?? null, j({
        disclaimer: data.meta.disclaimer, growthNote: data.meta.growthNote, metricNote: data.meta.metricNote,
        trialNote: data.meta.trialNote, screenNote: data.meta.screenNote, privateNote: data.meta.privateNote,
        snapshot: data.snapshot ?? null,
      }))
    }
    for (const t of data.trials ?? []) {
      insTrial.run(t.key, t.title, t.nctLike ?? null, t.phase ?? null, t.status ?? null, t.sponsor ?? null, t.region ?? null,
        t.sites ?? null, t.ageMin ?? null, t.ageMax ?? null, t.needsOpenEpiphysis ? 1 : 0, t.requiresDiagnosis ?? null, t.ambulatory ? 1 : 0, data.snapshot?.date ?? null)
    }
    db.exec('COMMIT')
    return true
  } catch (e) {
    try { db.exec('ROLLBACK') } catch { /* 保留原错误 */ }
    throw e
  }
}

export function main() {
  const dbPath = join(ROOT, 'demo', 'demo-data.sqlite')
  if (existsSync(dbPath)) rmSync(dbPath)
  const db = new DatabaseSync(dbPath)
  const files = readdirSync(join(ROOT, 'schema')).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort((a, b) => Number(a.slice(0, 4)) - Number(b.slice(0, 4)))
  for (const f of files) db.exec(readFileSync(join(ROOT, 'schema', f), 'utf8'))
  seedInto(db)
  const n = db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n
  const pts = db.prepare('SELECT COUNT(*) AS n FROM metric_points').get().n
  const tr = db.prepare('SELECT COUNT(*) AS n FROM trials').get().n
  db.close()
  console.log(`demo/demo-data.sqlite 建成：subjects=${n} metric_points=${pts} trials=${tr}`)
}

/* 直接运行时建 demo 库；被 import 时只导出函数 */
if (process.argv[1] && process.argv[1].endsWith('build-demo-data.mjs')) main()
