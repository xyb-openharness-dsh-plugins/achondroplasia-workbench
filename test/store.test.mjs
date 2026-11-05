/* 数据层回归（软骨发育全全家版）：迁移幂等、播种幂等、落盘重开、profile_meta 读法。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDatabase, migrate, close } from '../dsh/store.js'
import { seedDemo, hasDemoData } from '../dsh/demo.js'
import { bootstrap, listSubjects, getProfile } from '../dsh/readmodels.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

test('① migrate 幂等：第二次执行不重跑已应用的迁移', () => {
  const db = openDatabase(':memory:')
  const r1 = migrate(db)
  const r2 = migrate(db)
  assert.equal(r2.executed.length, 0)
  assert.ok(r1.executed.length >= 4, `应有 ≥4 个迁移，实际 ${r1.executed.length}`)
  close(db)
})

test('② seedDemo 幂等：调两次只写一份档案', () => {
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  seedDemo(db)
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n, 2)
  close(db)
})

test('③ parity：库里读出的 profiles 与 demo-data.js 逐字段一致', () => {
  const window = {}
  new Function('window', readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf8'))(window)
  const demo = window.DEMO_DATA
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  const payload = bootstrap(db, { version: 't', build: 't' })
  assert.deepEqual(payload.profiles, demo.profiles)
  close(db)
})

test('④ 读模型：业务 id 是字符串（doc1/c1/s1），未知日期点带 precision', () => {
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  const p = getProfile(db, 'demo1')
  assert.equal(p.docs[0].id, 'doc1')
  assert.equal(p.candidates[0].id, 'c1')
  const head = p.metrics.HEAD[0]
  assert.equal(head.precision, 'unknown')
  assert.equal(head.d, '（日期未记）')
  close(db)
})

test('⑤ 文件库：真实落盘 + 重开后资料仍在（播种只发生一次）', async () => {
  const path = await import('node:path')
  const { tmpdir } = await import('node:os')
  const file = join(tmpdir(), `ach-test-${Date.now()}.sqlite`)
  const db1 = openDatabase(file)
  migrate(db1)
  assert.equal(hasDemoData(db1), false)
  seedDemo(db1)
  close(db1)
  const db2 = openDatabase(file)
  migrate(db2)
  assert.equal(hasDemoData(db2), true)
  assert.equal(listSubjects(db2).length, 2)
  close(db2)
})
