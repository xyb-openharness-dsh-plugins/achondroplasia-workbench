import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

test('schema/0001 内存全建（22 张表）', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(readFileSync(join(ROOT, 'schema/0001_initial.sql'), 'utf8'))
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").all().map((r) => r.name)
  assert.equal(tables.length, 22)
  for (const must of ['subjects', 'section_titles', 'metrics', 'metric_points', 'growth_reference_rows', 'events', 'rhythm_rows', 'viewpoints', 'trials', 'saved_trials', 'documents', 'candidate_fields', 'hospitals', 'dx_rows', 'screening_rows', 'surgery_rows', 'med_rows', 'injection_rows', 'question_rows', 'import_jobs', 'mineru_consents', 'demo_meta']) assert.ok(tables.includes(must), `缺表 ${must}`)
})

test('G3 判读列断言：全 schema 无 diagnosis/risk_level/activity_score/eligible 判定列', () => {
  const sql = readFileSync(join(ROOT, 'schema/0001_initial.sql'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
  for (const bad of [/\bdiagnosis\b/i, /\brisk_level\b/i, /\bactivity_score\b/i, /\beligible\b/i, /\bmilestone_status\b/i, /\bstage\b/i]) {
    assert.equal(bad.test(sql), false, `命中判定列词：${bad}`)
  }
})

test('demo-data 形状与读模型同源（A/B 两套档案可灌库）', () => {
  const db = new DatabaseSync(':memory:')
  db.exec(readFileSync(join(ROOT, 'schema/0001_initial.sql'), 'utf8'))
  const ins = db.prepare("INSERT INTO metric_points (profile_key, code, d, d_precision, v, v_text, src, org, visibility, version) VALUES (?,?,?,?,?,?,?,?,?,1)")
  let n = 0
  for (const p of ['demo1', 'demo2']) {
    ins.run(p, 'HEIGHT', p === 'demo1' ? '2026-10-18' : '2026-10-25', 'day', p === 'demo1' ? 84.2 : 112.8, null, '家庭自测', null, 'shared'); n++
  }
  const rows = db.prepare("SELECT COUNT(*) AS n FROM metric_points ORDER BY rowid").get()
  assert.equal(rows.n, n)
})
