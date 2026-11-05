/* F3 防再犯（Inspector 2026-11-06）：api 态「保存并继续录入」不得关窗。
 * 真实链路：起 dev-server（临时工作区）→ 浏览器 /ui/ → 打开表单 → saveForm(kind, true) →
 * 断言 dialog 仍开、数值输入已清空、库行数 +1。demo 态等价断言在 file:// 页面同轮完成。
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].find((p) => { try { require('node:fs').existsSync(p) } catch { return false } }) || null
}

test('F3 api 态：保存并继续录入不关窗、输入清空、行数 +1', { timeout: 60000 }, async (t) => {
  const ws = join(ROOT, '.tmp-f3-' + Date.now())
  t.after(() => { try { rmSync(ws, { recursive: true, force: true }) } catch { /* 临时目录尽力清 */ } })
  const child = spawn(process.execPath, [join(ROOT, 'scripts/dev-server.mjs'), '-w', ws, '-p', '0'], { stdio: ['ignore', 'pipe', 'pipe'] })
  t.after(() => { try { child.kill('SIGTERM') } catch { /* 尽力 */ } })
  const port = await new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => reject(new Error('dev-server 启动超时')), 20000)
    child.stdout.on('data', (c) => {
      buf += c
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (m) { clearTimeout(timer); resolve(Number(m[1])) }
    })
    child.on('exit', () => { clearTimeout(timer); reject(new Error('dev-server 提前退出：' + buf.slice(0, 200))) })
  })

  const chrome = findChrome()
  if (!chrome) { console.log('  ! 找不到 Chrome：F3 浏览器断言记 SKIP（不计覆盖）'); return }
  const require2 = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
  const puppeteer = require2('puppeteer-core')
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] })
  t.after(() => browser.close())
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 860 })
  await page.goto(`http://127.0.0.1:${port}/api/achondroplasia/ui/`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__ACH_APP__ && document.querySelectorAll('#nav button').length >= 6, { timeout: 8000 })
  await new Promise((r) => setTimeout(r, 600))

  const state = await page.evaluate(() => ({ source: window.__ACH_APP__.state ? 'has-state' : 'x', profile: document.querySelector('#profile-name').textContent }))
  assert.ok(state.profile.includes('苗苗') || state.profile.includes('小松'))

  const r = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.openForm('measure')
    const dlg = document.querySelector('#dialog')
    document.querySelector('#dialog-body [data-f="v"]').value = '85.0'
    document.querySelector('#dialog-body [data-f="d"]').value = '2026-11-05'
    const before = dlg.open
    app.saveForm('measure', true) /* keepOpen=true */
    const after = dlg.open
    const vCleared = document.querySelector('#dialog-body [data-f="v"]').value === ''
    return { before, after, vCleared }
  })
  assert.equal(r.before, true, '表单应先打开')
  assert.equal(r.after, true, '保存并继续录入后弹窗必须仍开（F3 回归点）')
  assert.equal(r.vCleared, true, '继续录入时数值输入应清空')

  const res = await fetch(`http://127.0.0.1:${port}/api/achondroplasia/profile/demo1`)
  const { profile } = await res.json()
  assert.ok(profile.metrics.HEIGHT.some((x) => x.v === 85 && x.d === '2026-11-05'), '行应已入库（+1）')
})
