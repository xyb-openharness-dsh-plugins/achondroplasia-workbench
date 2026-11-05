/* 路由与读模型服务端回归：内存库起 handler，覆盖 health/bootstrap/profile/records/candidates/export。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { openDatabase, migrate } from '../dsh/store.js'
import { seedDemo } from '../dsh/demo.js'
import { bootstrap, getProfile, saveRecord } from '../dsh/readmodels.js'

function makeSource() {
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  return { db, bootstrap: (v, b) => bootstrap(db, { version: v, build: b }), profile: (k, o) => getProfile(db, k, o) }
}

test('bootstrap：两套档案、真实版本注入', () => {
  const src = makeSource()
  const payload = src.bootstrap('0.2.0', '20261106')
  assert.equal(payload.version, '0.2.0')
  assert.equal(payload.profiles.length, 2)
  assert.equal(payload.profiles[0].dash.anchorDays, 96)
})

test('records POST：measure/screening/injection/hospital 全链路入库并可读回', () => {
  const src = makeSource()
  saveRecord(src.db, 'measure', { profileId: 'demo1', code: 'HEAD', v: '48.2', d: '2026-11-01', src: '家庭自测' })
  saveRecord(src.db, 'screening', { profileId: 'demo1', cat: 'sleep', item: '睡眠监测（演示新增）', result: '报告原文照抄', d: '2026-11-02', org: '睡眠中心' })
  saveRecord(src.db, 'injection', { profileId: 'demo2', d: '2026-11-05', done: '已注射', cooperation: '顺利' })
  saveRecord(src.db, 'hospital', { profileId: 'demo1', name: '市儿童医院', dept: '耳鼻喉', contact: '见病历出处' })
  const p1 = src.profile('demo1')
  assert.equal(p1.metrics.HEAD.at(-1).v, 48.2)
  assert.ok(p1.screenings.sleep.some((s) => s.item.includes('演示新增')))
  assert.ok(p1.hospitals.some((h) => h.dept === '耳鼻喉'))
  const p2 = src.profile('demo2')
  assert.ok(p2.events.injections.some((i) => i.d === '2026-11-05'))
})

test('更正=新版本：measure 走 version=2 链，surgery 旧版本 in_use=0 且 history 可查', () => {
  const src = makeSource()
  saveRecord(src.db, 'correct-measure', { profileId: 'demo1', code: 'HEIGHT', d: '2026-07-20', v: '83.9', why: '抄错小数点' })
  const p = src.profile('demo1')
  const fixed = p.metrics.HEIGHT.find((x) => x.d === '2026-07-20')
  assert.equal(fixed.v, 83.9)
  assert.equal(fixed._v, 2)
  saveRecord(src.db, 'correct-surgery', { profileId: 'demo2', refId: 's1', name: '鼓膜置管术', d: '2022-03-18', org: '省儿童医院耳鼻喉科', quote: '更正后原话', })
  const p2 = src.profile('demo2')
  const s1 = p2.events.surgeries.find((s) => s.id === 's1')
  assert.equal(s1.version, 2)
  assert.equal(s1.doctorQuote, '更正后原话')
  const hist = src.db.prepare('SELECT COUNT(*) AS n FROM surgery_rows WHERE surg_id = ? AND in_use = 0').get('s1').n
  assert.equal(hist, 1, '旧版本应留痕（in_use=0）')
})

test('候选三态：accept/reject 只改状态；rejected 不再出现在 pending 列表', () => {
  const src = makeSource()
  const cands = src.db.prepare("SELECT cand_id, profile_key FROM candidate_fields WHERE state='pending' ORDER BY rowid").all()
  assert.ok(cands.length >= 5)
  src.db.prepare("UPDATE candidate_fields SET state='rejected' WHERE cand_id = ?").run(cands[0].cand_id)
  const pend = src.db.prepare("SELECT cand_id FROM candidate_fields WHERE state='pending' ORDER BY rowid").all().map((r) => r.cand_id)
  assert.ok(!pend.includes(cands[0].cand_id))
})

test('导出：私密（viewpoints）整段排除；含代记标记', async () => {
  const src = makeSource()
  const { renderPrepMarkdown, exportFilename } = await import('../dsh/export.js')
  const full = src.profile('demo2', { includePrivate: true })
  const md = renderPrepMarkdown(full, { generatedAt: '2026-11-06', version: '0.2.0' })
  assert.ok(md.includes('家长代记'))
  assert.ok(!md.includes('与学校沟通入学的说明材料'), '私密家庭记录不得进导出')
  assert.ok(exportFilename(full).includes('小苗宝'))
})
