/* 演示数据播种（软骨发育不全）。
 * 唯一数据源是 `demo/build-demo-data.mjs` 的 `buildDemoProfiles()`（读 prototypes/v0.2/demo-data.js）。
 * 这里只把同一份纯数据写进用户资料目录里那个库，不新增、不改写任何数值
 * （这是 test/demo-parity.test.mjs deepStrictEqual 断言存在的原因）。
 * 幂等：库里已有 subjects 就整批跳过；整批一个事务。
 */
import { buildDemoProfiles, seedInto } from '../demo/build-demo-data.mjs'

export function seedDemo(db, input) {
  if (!db || typeof db.prepare !== 'function') throw new TypeError('seedDemo 需要一个已打开的数据库')
  const data = input || buildDemoProfiles()
  const already = db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n
  if (already > 0) return { skipped: true }
  seedInto(db, data)
  return { skipped: false, subjects: data.profiles.length, trials: (data.trials ?? []).length }
}

export function hasDemoData(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM subjects').get().n > 0
}
