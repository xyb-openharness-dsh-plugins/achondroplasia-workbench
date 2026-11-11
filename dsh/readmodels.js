/* 读模型（软骨发育不全）：把库里的行还原成**前端要的形状**。
 *
 * 契约：`GET /api/bootstrap` 的 profiles 数组必须与 prototypes/v0.2/demo-data.js 里的同名档案
 * 逐字段一致（test/demo-parity.test.mjs deepStrictEqual）。所以这里不做任何"顺手优化"：
 * 字段名、数组层级、null 与缺失的语义都跟着 demo-data.js 走。
 *
 * 易踩的五条：
 * 1. 未知日期点：库 d=NULL + d_precision='unknown' → 还原 d='（日期未记）' 且带 precision:'unknown'；
 *    其余点不带 precision 键（demo-data 只有未知日期点才有）。
 * 2. 排序：一律 ORDER BY rowid（插入序），复合唯一约束的表裸 SELECT 会按索引字母序。
 * 3. 派生值读时算：dash.lastHeight/lastHead 取「最后一个 ISO 日期可解析的点」；anchorDays 用
 *    profile_meta 里存的值（demo-data 是唯一源，不重算）。
 * 4. 分类不进趋势：metrics.cat 只是分组展示用；趋势图每序列独立归一化（前端职责）。
 * 5. 业务 id：documents.doc_id / candidate_fields.cand_id / surgery_rows.surg_id 都是档案内
 *    字符串 id（demo-data 记作 doc1/c1/s1），对外形状用它们，不用代理主键。
 */
import { AGENT_PANE } from '../lib/layout.js'

const jp = (s, fallback = null) => {
  if (s === null || s === undefined) return fallback
  try { return JSON.parse(s) } catch { return fallback }
}
const rows = (db, sql, ...args) => db.prepare(sql).all(...args).map((r) => ({ ...r }))
const ISO = /^\d{4}-\d{2}-\d{2}$/

function readDash(db, key, s, meta) {
  const lastOf = (code) => {
    const pts = rows(db, 'SELECT d, v, v_text FROM metric_points WHERE profile_key = ? AND code = ? ORDER BY rowid', key, code)
      .filter((p) => p.d && ISO.test(p.d))
    return pts.length ? { v: pts[pts.length - 1].v, d: pts[pts.length - 1].d } : { v: null, d: null }
  }
  return {
    stage: s.status_note ?? '',
    anchorLabel: s.anchor_label ?? '',
    anchorDays: Number(meta.get('anchor_days') ?? 0) || 0,
    anchorDate: s.anchor_date ?? null,
    nextVisit: s.next_visit ?? '',
    lastHeight: lastOf('HEIGHT'),
    lastHead: lastOf('HEAD'),
    modeNote: meta.get('mode_note') ?? '',
    sceneTitle: meta.get('scene_title') ?? '',
    doctorQuote: s.doctor_quote ?? '',
  }
}

function readMetrics(db, key) {
  const out = {}
  for (const m of rows(db, 'SELECT code FROM metrics WHERE profile_key = ? ORDER BY rowid', key)) {
    /* 更正=新版本：同一 (code, d) 保留 rowid 最大（最新）版本；旧版本经 /records/…/history 可查 */
    const seen = new Set()
    const all = rows(db, 'SELECT d, d_precision, v, v_text, src, org, note, version FROM metric_points WHERE profile_key = ? AND code = ? ORDER BY rowid', key, m.code)
    out[m.code] = all.slice().reverse().filter((p) => {
      const k = String(p.d ?? '')
      if (seen.has(k)) return false
      seen.add(k)
      return true
    }).reverse().map((p) => {
      const unknown = p.d_precision === 'unknown'
      const item = { d: unknown ? '（日期未记）' : p.d, v: p.v === null ? p.v_text : p.v, src: p.src ?? null, org: p.org ?? null }
      if (unknown) item.precision = 'unknown'
      if (p.note !== null) item.note = p.note
      if (p.version > 1) item._v = p.version
      return item
    })
  }
  return out
}

function readProfile(db, key, opts = {}) {
  const s = db.prepare('SELECT * FROM subjects WHERE profile_key = ?').get(key)
  if (!s) return null
  const meta = new Map(rows(db, 'SELECT k, v FROM profile_meta WHERE profile_key = ?', key).map((r) => [r.k, r.v]))

  const profile = {
    id: s.profile_key,
    name: s.name,
    sex: s.sex ?? null,
    age: s.age_label ?? null,
    ageLabel: meta.get('age_label') || s.age_label || null,
    careRole: s.care_role ?? 'caregiver',
    headline: s.headline ?? '',
    dash: readDash(db, key, s, meta),
    dx: {
      timeline: rows(db, 'SELECT item, d, d_precision, src FROM dx_rows WHERE profile_key = ? ORDER BY rowid', key)
        .map((r) => ({ item: r.item, d: r.d ?? '', precision: r.d_precision ?? 'day', src: r.src ?? null })),
      genetics: s.genetics_note ?? null,
      notes: s.notes ?? null,
    },
    metrics: readMetrics(db, key),
    screenings: {},
    events: {
      surgeries: rows(db, 'SELECT surg_id, name, d, org, doctor_quote, version FROM surgery_rows WHERE profile_key = ? AND in_use = 1 ORDER BY rowid', key)
        .map((r) => ({ id: r.surg_id ?? String(r.rowid ?? ''), name: r.name, d: r.d, org: r.org, doctorQuote: r.doctor_quote, version: r.version })),
      meds: rows(db, 'SELECT drug, status_text, start_date, note FROM med_rows WHERE profile_key = ? ORDER BY rowid', key)
        .map((r) => ({ drug: r.drug, status: r.status_text, start: r.start_date, note: r.note })),
      injections: rows(db, 'SELECT d, done, cooperation, note FROM injection_rows WHERE profile_key = ? ORDER BY rowid', key)
        .map((r) => ({ d: r.d, done: r.done, cooperation: r.cooperation, note: r.note })),
    },
    docs: rows(db, 'SELECT doc_id, name, date, type, status, has_original FROM documents WHERE profile_key = ? ORDER BY rowid', key)
      .map((r) => ({ id: r.doc_id, name: r.name, date: r.date, type: r.type, status: r.status, hasOriginal: !!r.has_original })),
    candidates: rows(db, "SELECT cand_id, kind, title, fields_json, src FROM candidate_fields WHERE profile_key = ? AND state = 'pending' ORDER BY rowid", key)
      .map((r) => ({ id: r.cand_id ?? String(r.rowid ?? ''), kind: r.kind, title: r.title, fields: jp(r.fields_json, []), src: r.src ?? null })),
    questions: rows(db, 'SELECT q, asked FROM question_rows WHERE profile_key = ? ORDER BY ord, rowid', key)
      .map((r) => ({ q: r.q, asked: !!r.asked })),
    hospitals: rows(db, 'SELECT name, dept, contact, version FROM hospitals WHERE profile_key = ? AND in_use = 1 ORDER BY rowid', key)
      .map((r) => ({ name: r.name, dept: r.dept, contact: r.contact, version: r.version })),
    family: {
      /* notes 原样返回（私密过滤在前端三出口 sharedOnly 做；服务端导出侧另行整段排除） */
      visibility: 'private',
      notes: rows(db, 'SELECT d, item, visibility FROM viewpoints WHERE profile_key = ? ORDER BY rowid', key)
        .map((r) => ({ d: r.d, item: r.item, visibility: r.visibility })),
    },
  }
  for (const cat of ['hearing', 'sleep', 'craniocervical', 'spine', 'legs']) {
    profile.screenings[cat] = rows(db, 'SELECT d, item, result_text, org, doc_id FROM screening_rows WHERE profile_key = ? AND cat = ? ORDER BY rowid', key, cat)
      .map((r) => ({ d: r.d, item: r.item, result: r.result_text, org: r.org, docId: r.doc_id ?? null }))
  }
  return profile
}

export function listSubjects(db, { includeArchived = false } = {}) {
  const sql = includeArchived
    ? 'SELECT profile_key, name, in_use, archived_at FROM subjects ORDER BY rowid'
    : 'SELECT profile_key, name FROM subjects WHERE in_use = 1 ORDER BY rowid'
  return rows(db, sql)
}

/* ---------------- 档案管理（新建/重命名/归档/恢复；无裸删除） ---------------- */
const METRIC_DEFAULTS = [
  ['HEIGHT', '身长/身高', 'cm', '体格生长', '#2f6b40', 1, '测量方式（卧式身长/立式身高）不同时不跨组连线、不做差（口径见页内说明）。'],
  ['WEIGHT', '体重', 'kg', '体格生长', '#b06a28', 1, '衣物差异会让家庭自测与门诊值不可比；并列展示不合并。'],
  ['HEAD', '头围', 'cm', '体格生长', '#2f7d6b', 1, '软骨发育不全专用头围曲线与普通曲线不同；本台只并列记录，不判读。'],
  ['BMIW', '身高别体重', null, '其他测量', '#7c6aae', 1, '参考口径【待核】；记录项不判定体型。'],
]
const SECTION_TITLES = [['体格生长', '体格生长（身长/体重/头围）'], ['其他测量', '其他测量'], ['hearing', '听力与中耳'], ['sleep', '睡眠与呼吸'], ['craniocervical', '颅颈与神经'], ['spine', '脊柱'], ['legs', '下肢对线'], ['events', '手术与用药事件'], ['hospitals', '就诊医院']]

/** 新建档案（真实写入本机库；幂等 key 生成 p<timestamp>）。返回 { profileKey, name }。 */
export function createProfile(db, input = {}) {
  const name = String(input.name ?? '').trim()
  if (!name) throw Object.assign(new Error('档案称呼必填'), { status: 400 })
  const today = new Date().toISOString().slice(0, 10)
  const key = `p${Date.now()}`
  const careRole = input.careRole === 'patient' ? 'patient' : 'caregiver'
  const ageLabel = String(input.ageLabel ?? '').trim() || null
  db.exec('BEGIN')
  try {
    db.prepare(`INSERT INTO subjects
      (profile_key, name, sex, age_label, age_months, care_role, headline, status_note, anchor_label, anchor_date, next_visit, doctor_quote, genetics_note, notes, created_at, in_use)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`).run(
      key, name, input.sex || null, ageLabel, null, careRole,
      input.headline || '新建档案 · 待记录', '新建档案 · 待记录', '距建档', today,
      '下次随访待约（以预约为准）', null, null, null, today,
    )
    const insMetric = db.prepare('INSERT INTO metrics (profile_key, code, name, unit, cat, color, dec, note, in_use) VALUES (?,?,?,?,?,?,?,?,1)')
    for (const m of METRIC_DEFAULTS) insMetric.run(key, ...m)
    const insTitle = db.prepare('INSERT INTO section_titles (profile_key, key, title, ord) VALUES (?,?,?,?)')
    SECTION_TITLES.forEach(([k, t], i) => insTitle.run(key, k, t, i))
    const insMeta = db.prepare('INSERT INTO profile_meta (profile_key, k, v) VALUES (?,?,?)')
    insMeta.run(key, 'anchor_days', '0')
    insMeta.run(key, 'age_label', ageLabel ?? '')
    insMeta.run(key, 'mode_note', '新建档案：先记录，随访节奏问医生。')
    insMeta.run(key, 'scene_title', '现在到哪一步了')
    db.exec('COMMIT')
  } catch (e) {
    try { db.exec('ROLLBACK') } catch { /* 保留原错误 */ }
    throw e
  }
  return { profileKey: key, name }
}

export function renameProfile(db, key, name) {
  const next = String(name ?? '').trim()
  if (!next) throw Object.assign(new Error('档案称呼必填'), { status: 400 })
  const r = db.prepare('UPDATE subjects SET name = ? WHERE profile_key = ? AND in_use = 1').run(next, key)
  if (!r.changes) throw Object.assign(new Error('档案不存在或已归档'), { status: 404 })
  return { profileKey: key, name: next }
}

export function archiveProfile(db, key) {
  const r = db.prepare("UPDATE subjects SET in_use = 0, archived_at = ? WHERE profile_key = ? AND in_use = 1").run(new Date().toISOString(), key)
  if (!r.changes) throw Object.assign(new Error('档案不存在或已归档'), { status: 404 })
  return { profileKey: key, archived: true }
}

export function restoreProfile(db, key) {
  const r = db.prepare('UPDATE subjects SET in_use = 1, archived_at = NULL WHERE profile_key = ?').run(key)
  if (!r.changes) throw Object.assign(new Error('档案不存在'), { status: 404 })
  return { profileKey: key, restored: true }
}

/** 切换列表：在用档案 + 归档数（管理界面用）。 */
export function profileDirectory(db) {
  return {
    active: rows(db, 'SELECT profile_key AS profileKey, name, care_role AS careRole FROM subjects WHERE in_use = 1 ORDER BY rowid'),
    archived: rows(db, 'SELECT profile_key AS profileKey, name, archived_at AS archivedAt FROM subjects WHERE in_use = 0 ORDER BY rowid'),
  }
}

export function getProfile(db, key, opts = {}) {
  return readProfile(db, key, opts)
}

/** `/api/bootstrap` 的 payload。version/build 由调用方注入（唯一来源 lib/version.js）。 */
export function bootstrap(db, { version, build } = {}) {
  const profiles = listSubjects(db).map((s) => readProfile(db, s.profile_key))
  const trials = rows(db, 'SELECT key, title, nct_like, phase, status, sponsor, region, sites, age_min, age_max, needs_open_epiphysis, requires_condition, ambulatory FROM trials ORDER BY rowid')
    .map((r) => ({ key: r.key, title: r.title, nctLike: r.nct_like, phase: r.phase, status: r.status, sponsor: r.sponsor, region: r.region ?? '国际多中心', sites: r.sites, ageMin: r.age_min, ageMax: r.age_max, needsOpenEpiphysis: !!r.needs_open_epiphysis, requiresDiagnosis: r.requires_condition, ambulatory: !!r.ambulatory }))
  let meta = {}
  const dm = rows(db, 'SELECT disclaimers_json FROM demo_meta ORDER BY rowid')
  if (dm.length) meta = jp(dm[0].disclaimers_json, {}) ?? {}
  const snapshot = meta.snapshot ?? null
  const metaOut = { ...meta }
  delete metaOut.snapshot
  metaOut.dataStart = rows(db, 'SELECT data_start FROM demo_meta ORDER BY rowid')[0]?.data_start ?? null
  metaOut.today = rows(db, 'SELECT today FROM demo_meta ORDER BY rowid')[0]?.today ?? null
  return {
    version: version ?? null,
    build: build ?? null,
    meta: metaOut,
    profiles,
    trials,
    snapshot,
    agent: { available: true, mode: 'dev-mount' },
    layout: { agentPane: AGENT_PANE },
  }
}

/* ---------- 记录写入（kind 白名单 → 列白名单；统一从 apiSaveRecord 进来） ---------- */
const CORRECT_KINDS = {
  'correct-surgery': (db, p) => {
    const old = db.prepare('SELECT * FROM surgery_rows WHERE surg_id = ? AND profile_key = ? AND in_use = 1').get(p.refId, p.profileId)
    if (!old) throw Object.assign(new Error('找不到要更正的手术记录'), { status: 404 })
    db.prepare('UPDATE surgery_rows SET in_use = 0 WHERE id = ?').run(old.id)
    db.prepare('INSERT INTO surgery_rows (profile_key, surg_id, name, d, org, doctor_quote, version, in_use) VALUES (?,?,?,?,?,?,?,1)')
      .run(p.profileId, old.surg_id, String(p.name ?? old.name), String(p.d ?? old.d), p.org || old.org, p.quote ?? old.doctor_quote, old.version + 1)
    return { ok: true, kind: 'correct-surgery', version: old.version + 1 }
  },
  'correct-hospital': (db, p) => {
    const old = db.prepare('SELECT * FROM hospitals WHERE profile_key = ? AND name = ? AND dept = ? AND in_use = 1 ORDER BY rowid DESC LIMIT 1').get(p.profileId, p.name, p.dept || null)
    if (!old) throw Object.assign(new Error('找不到要更正的医院记录'), { status: 404 })
    db.prepare('UPDATE hospitals SET in_use = 0 WHERE id = ?').run(old.id)
    db.prepare('INSERT INTO hospitals (profile_key, name, dept, contact, version, in_use) VALUES (?,?,?,?,?,1)')
      .run(p.profileId, String(p.name ?? old.name), p.dept || old.dept, p.contact ?? old.contact, old.version + 1)
    return { ok: true, kind: 'correct-hospital', version: old.version + 1 }
  },
  'correct-measure': (db, p) => {
    /* 测量更正：新增 version=2 行（corrected_from + why），读模型按 (code,d) 取最新版本 */
    const base = db.prepare('SELECT id FROM metric_points WHERE profile_key = ? AND code = ? AND d = ? ORDER BY rowid DESC LIMIT 1').get(p.profileId, p.code, p.d)
    if (!base) throw Object.assign(new Error('找不到要更正的测量记录'), { status: 404 })
    if (p.v === undefined || p.v === '' || isNaN(Number(p.v))) throw Object.assign(new Error('更正后数值要填数字'), { status: 400 })
    db.prepare('INSERT INTO metric_points (profile_key, code, d, d_precision, v, src, org, visibility, version, corrected_from, why) VALUES (?,?,?,?,?,?,?,?,2,?,?)')
      .run(p.profileId, p.code, p.d, 'day', Number(p.v), null, null, 'shared', base.id, p.why || null)
    return { ok: true, kind: 'correct-measure' }
  },
}

export const RECORD_KINDS = {
  'correct-surgery': { custom: 'correct-surgery' },
  'correct-measure': { custom: 'correct-measure' },
  measure: {
    table: 'metric_points',
    cols: (p) => ({
      profile_key: p.profileId, code: String(p.code ?? 'HEIGHT'),
      d: p.d && ISO.test(p.d) ? p.d : null, d_precision: p.d && ISO.test(p.d) ? 'day' : 'unknown',
      v: p.v === '' || p.v === undefined || isNaN(Number(p.v)) ? null : Number(p.v),
      v_text: typeof p.v === 'string' && isNaN(Number(p.v)) ? p.v : null,
      src: p.src ?? null, org: p.org || null, note: p.note || null, visibility: p.visibility === 'private' ? 'private' : 'shared', version: 1,
    }),
  },
  family: {
    table: 'viewpoints',
    cols: (p) => ({ profile_key: p.profileId, d: p.d && ISO.test(p.d) ? p.d : null, item: String(p.item ?? ''), visibility: 'private' }),
  },
  'correct-hospital': { custom: 'correct-hospital' },
  screening: {
    table: 'screening_rows',
    cols: (p) => ({ profile_key: p.profileId, cat: String(p.cat ?? 'hearing'), item: String(p.item ?? ''), result_text: String(p.result ?? ''), d: p.d && ISO.test(p.d) ? p.d : null, org: p.org || null, visibility: 'shared', version: 1 }),
  },
  surgery: {
    table: 'surgery_rows',
    cols: (p) => ({ profile_key: p.profileId, surg_id: `s${Date.now()}`, name: String(p.name ?? ''), d: String(p.d ?? ''), org: p.org || null, doctor_quote: p.quote ?? null, version: 1 }),
  },
  injection: {
    table: 'injection_rows',
    cols: (p) => ({ profile_key: p.profileId, d: String(p.d ?? ''), done: String(p.done ?? '已注射'), cooperation: p.cooperation || null, note: p.note || null, visibility: 'shared', version: 1 }),
  },
  question: {
    table: 'question_rows',
    cols: (p) => ({ profile_key: p.profileId, q: String(p.q ?? ''), asked: 0, ord: 99 }),
  },
  doc: {
    table: 'documents',
    cols: (p) => ({ profile_key: p.profileId, doc_id: p.id ?? `doc${Date.now()}`, name: String(p.name ?? ''), date: p.d && ISO.test(p.d) ? p.d : null, type: p.type ?? null, status: '待核对', has_original: p.hasOriginal === 'yes' || p.hasOriginal === true ? 1 : 0 }),
  },
  hospital: {
    table: 'hospitals',
    cols: (p) => ({ profile_key: p.profileId, name: String(p.name ?? ''), dept: p.dept || null, contact: p.contact || null, version: 1 }),
  },
}

export function saveRecord(db, kind, payload = {}) {
  const def = RECORD_KINDS[kind]
  if (!def) throw Object.assign(new Error(`未知记录类型：${kind}`), { status: 400 })
  if (def.custom) return CORRECT_KINDS[def.custom](db, payload)
  const cols = def.cols(payload)
  const keys = Object.keys(cols)
  if (!cols.profile_key) throw Object.assign(new Error('缺少 profileId'), { status: 400 })
  const need = { measure: ['code'], screening: ['item', 'result_text'], surgery: ['name', 'd'], injection: ['d'], question: ['q'], doc: ['name'], hospital: ['name'], family: ['item'] }[kind] ?? []
  for (const k of need) if (cols[k] === null || cols[k] === '' || cols[k] === undefined) throw Object.assign(new Error('必填字段缺失'), { status: 400 })
  db.prepare(`INSERT INTO ${def.table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`).run(...keys.map((k) => cols[k]))
  return { ok: true, kind }
}
