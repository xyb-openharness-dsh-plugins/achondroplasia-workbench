/* parity：GET /bootstrap 的 profiles 必须与 prototypes/v0.2/demo-data.js 逐字段一致（deepStrictEqual）。
 * 这是「演示数据唯一源」的执行点：读模型少还一个字段、多造一个键，这里都红。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDatabase, migrate } from '../dsh/store.js'
import { seedDemo } from '../dsh/demo.js'
import { bootstrap } from '../dsh/readmodels.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

test('bootstrap.profiles 与 demo-data.js 逐字段一致（A/B 两套）', () => {
  const window = {}
  new Function('window', readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf8'))(window)
  const demo = window.DEMO_DATA
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  const payload = bootstrap(db, { version: 'test', build: 'test' })
  assert.equal(payload.profiles.length, demo.profiles.length)
  for (const [i, want] of demo.profiles.entries()) {
    assert.deepEqual(payload.profiles[i], want, `档案 ${i}（${want.id}）形状不一致`)
  }
})

test('bootstrap.meta / trials / snapshot 与 demo-data 一致', () => {
  const window = {}
  new Function('window', readFileSync(join(ROOT, 'prototypes/v0.2/demo-data.js'), 'utf8'))(window)
  const demo = window.DEMO_DATA
  const db = openDatabase(':memory:')
  migrate(db)
  seedDemo(db)
  const payload = bootstrap(db, { version: 'test', build: 'test' })
  for (const k of ['disclaimer', 'growthNote', 'metricNote', 'trialNote', 'screenNote', 'privateNote', 'dataStart', 'today']) {
    assert.equal(payload.meta[k], demo.meta[k], `meta.${k} 不一致`)
  }
  assert.deepEqual(payload.trials, demo.trials)
  assert.deepEqual(payload.snapshot, demo.snapshot)
})

test('demo/demo-data.sqlite 与内存播种结果一致（build 产物不漂移）', () => {
  const mem = openDatabase(':memory:')
  migrate(mem)
  seedDemo(mem)
  const file = new DatabaseSync(join(ROOT, 'demo', 'demo-data.sqlite'))
  for (const t of ['subjects', 'metric_points', 'screening_rows', 'surgery_rows', 'documents', 'trials']) {
    const a = mem.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n
    const b = file.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n
    assert.equal(a, b, `${t} 行数不一致：内存 ${a} vs demo 库 ${b}`)
  }
})
