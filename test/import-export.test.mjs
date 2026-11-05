/* 导入链路诚实性：无 token → NO_TOKEN（不假装解析）；抽提字典为生长指标。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ImportService, LAB_DICT } from '../dsh/import.js'

test('无 MinerU 客户端 → parse 抛 NO_TOKEN（如实失败，不算查过）', async () => {
  const { openDatabase, migrate } = await import('../dsh/store.js')
  const db = openDatabase(':memory:')
  migrate(db)
  const svc = new ImportService(db, { client: null })
  await assert.rejects(() => svc.parse(Buffer.from('x'), { filename: 'a.pdf' }), (e) => e.code === 'NO_TOKEN')
})

test('生长指标字典只含身高/体重/头围族（无肿瘤标志物）', () => {
  const keys = LAB_DICT.map((d) => d.key)
  assert.deepEqual(keys, ['HEIGHT', 'WEIGHT', 'HEAD'])
})

test('MinerU 六部件存在（18 号 v2：consent/settings/client/parse/record/route）', async () => {
  const mineru = await import('../dsh/mineru.js')
  const settings = await import('../dsh/settings.js')
  assert.equal(typeof settings.mineruSettingsStatus, 'function')
  assert.equal(typeof settings.saveMineruToken, 'function')
  assert.equal(typeof settings.clearMineruToken, 'function')
  assert.ok(mineru, 'mineru.js 应可加载')
})
