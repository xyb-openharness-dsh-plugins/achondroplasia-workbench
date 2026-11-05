/* public/ 与 prototypes/v0.2/ 逐字节一致（33 号 ui-parity）：
   同一份渲染代码，只换数据来源——两份一分叉，parity 就没人守得住了。 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

test('public/ 与 prototypes/v0.2/ 逐字节一致', () => {
  const files = readdirSync(join(ROOT, 'prototypes/v0.2')).filter((f) => /\.(js|html|css)$/.test(f))
  assert.ok(files.length >= 7, `原型文件数异常：${files.length}`)
  for (const f of files) {
    const a = readFileSync(join(ROOT, 'prototypes/v0.2', f))
    const b = readFileSync(join(ROOT, 'public', f))
    assert.ok(a.equals(b), `public/${f} 与原型不一致（先改原型，再同步 public）`)
  }
})
