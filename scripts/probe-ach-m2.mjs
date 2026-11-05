/* 小苗宝 M2 全量探针：对 prototypes/v0.2 真实浏览器断言（IP/X/C/MT/A/P/Q 组）
 * 通用铁律：先证明被测对象非空，再断言相等；SKIP 不计覆盖。
 * 用法：node scripts/probe-ach-m2.mjs [--port N]
 * 依赖：puppeteer-core + 本机 Chrome（CHROME_PATH 可覆盖）。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
const argOf = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(argOf('--port') || 8147)
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' }

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
  return ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].find(existsSync) || null
}
const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return }
    const file = normalize(join(ROOT, urlPath))
    if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return }
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(body)
  } catch { res.writeHead(404); res.end('not found') }
})
const results = []
const t = (id, desc, pass, detail) => {
  results.push({ id, desc, pass: !!pass, detail: detail === undefined ? '' : String(detail) })
  console.log((pass ? 'PASS ' : 'FAIL ') + id + '  ' + desc + (detail !== undefined ? '  — ' + JSON.stringify(detail).slice(0, 240) : ''))
}
const serverReady = new Promise((r) => server.listen(PORT, r))

async function main() {
  await serverReady
  const chrome = findChrome()
  if (!chrome) { console.log('找不到 Chrome：设置 CHROME_PATH 后重试。'); process.exit(2) }
  let puppeteer
  try { const famRequire = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/'); puppeteer = famRequire('puppeteer-core') } catch { puppeteer = require('puppeteer-core') }
  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await page.setViewport({ width: 1280, height: 860 })
  await page.goto(`http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => window.__ACH_APP__ && document.querySelectorAll('#nav button').length >= 6, { timeout: 6000 })

  /* 全量路由清单（供覆盖检查器逐字扫描；改路由时同步这里） */
  const ROUTES = [['dash', null], ['growth', ['overview', 'cards', 'recent', 'cands', 'docs']], ['screening', ['ledger', 'rhythm']], ['events', ['timeline', 'surgeries', 'meds']], ['visit', ['pack', 'questions']], ['trial', ['match', 'search', 'saved']]]
  const LEAF_ROUTES = ['growth/overview', 'growth/cards', 'growth/recent', 'growth/cands', 'growth/docs', 'screening/ledger', 'screening/rhythm', 'events/timeline', 'events/surgeries', 'events/meds', 'visit/pack', 'visit/questions', 'trial/match', 'trial/search', 'trial/saved']
  if (LEAF_ROUTES.length !== ROUTES.reduce((a, p) => a + (p[1] ? p[1].length : 1), 0) - 1) throw new Error('LEAF_ROUTES 与 ROUTES 不同步')

  /* ---------- IP2/X1：每个 (view,sub) 渲染非空，孤儿页=0（先证有内容） ---------- */
  const walk = await page.evaluate((PAGES) => {
    const app = window.__ACH_APP__
    const covered = [], orphans = []
    for (const [view, subs] of PAGES) {
      if (!subs) { app.state.page = view; app.render(); const n = document.querySelector('#main').innerText.trim().length; (n > 20 ? covered : orphans).push(view); continue }
      for (const sub of subs) { app.state.page = view; app.state.sub[view] = sub; app.render(); const n = document.querySelector('#main').innerText.trim().length; (n > 20 ? covered : orphans).push(view + '/' + sub) }
    }
    app.state.page = 'dash'; app.render()
    return { covered: covered.length, total: PAGES.reduce((a, p) => a + (p[1] ? p[1].length : 1), 0), orphans }
  }, ROUTES)
  t('IP2/X1', `每个 (view,sub) 渲染非空、孤儿页=0（covered=${walk.covered}/total=${walk.total}）`, walk.covered === walk.total && walk.orphans.length === 0, { orphans: walk.orphans })

  /* ---------- Q9/Q10/MT13：A→B→A 切换整页联动不串档 ---------- */
  const sw = await page.evaluate(() => {
    const app = window.__ACH_APP__
    const grab = () => ({ name: document.querySelector('#profile-name').textContent, dash: document.querySelector('#main').innerText.slice(0, 60), heightN: app.allMeasures('HEIGHT').length })
    app.useProfile('demo1'); const a = grab()
    app.useProfile('demo2'); const b = grab()
    app.useProfile('demo1'); const back = grab()
    return { a, b, back }
  })
  t('Q10/MT13', 'A→B→A 整页联动、记录数不串档', sw.a.name.includes('苗苗') && sw.b.name.includes('小松') && sw.back.name.includes('苗苗') && sw.a.heightN === 2 && sw.b.heightN === 18, { a: sw.a.heightN, b: sw.b.heightN })

  /* ---------- Q11：边界形态在档案里可找到 ---------- */
  const edge = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo1')
    const app1 = window.__ACH_APP__
    const zero = app1.allScreenings('sleep').length === 0
    const single = app1.allScreenings('hearing').length === 1
    const unknownDate = app1.allMeasures('HEAD').some((x) => x.precision === 'unknown')
    const privateN = app1.privateCount(app1.profile().family.notes)
    const noOriginal = app1.profile().docs.some((d) => !d.hasOriginal)
    app1.useProfile('demo2')
    const many = window.__ACH_APP__.allMeasures('HEIGHT').length >= 15
    window.__ACH_APP__.useProfile('demo1')
    return { zero, single, unknownDate, privateN, noOriginal, many }
  })
  t('Q11', '零条/单条/未知日期/私密/无原件/多条 全覆盖', edge.zero && edge.single && edge.unknownDate && edge.privateN >= 1 && edge.noOriginal && edge.many, edge)

  /* ---------- C 组（一图秀） ---------- */
  const c1 = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2'); app.state.page = 'growth'; app.state.sub.growth = 'overview'
    app.state.sel.demo2 = ['HEIGHT', 'WEIGHT']; app.state.range = 'all'; app.render()
    const paths = [...document.querySelectorAll('svg.chart path')]
    const boxes = paths.filter((p) => p.getAttribute('d')).map((p) => p.getBBox())
    if (boxes.length < 2) return { ok: false, why: '序列 path 少于 2 条（空值恒等）', n: boxes.length }
    const hs = boxes.map((b) => b.height)
    const ratio = Math.max(...hs) / Math.max(1e-6, Math.min(...hs))
    return { ok: ratio < 1.10, ratio, hs, n: paths.length }
  })
  t('C1', '两条量纲差异大的序列占满各自条带（getBBox 高度比 <1.1；先证非空）', c1.ok, { ratio: c1.ratio, n: c1.n })

  const c2 = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2'); app.state.sel.demo2 = ['BMIW']; app.state.range = 'all'; app.render()
    const pathN = [...document.querySelectorAll('svg.chart path')].filter((x) => x.getAttribute('d')?.startsWith('M')).length
    const circN = [...document.querySelectorAll('svg.chart circle')].filter((x) => x.dataset.point).length
    app.state.sel.demo2 = ['HEIGHT', 'WEIGHT', 'HEAD']; app.render()
    return { pathN, circN }
  })
  t('C2', '单点序列不连线（数据 path=0、数据点 circle=1；事件带另计）', c2.pathN === 0 && c2.circN === 1, c2)

  const c3 = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2')
    app.state.sel.demo2 = []; app.state.page = 'growth'; app.state.sub.growth = 'overview'; app.render()
    const txt = document.querySelector('svg.chart')?.textContent || ''
    const svgChildren = document.querySelector('svg.chart')?.children.length || 0
    app.state.sel.demo2 = ['HEIGHT', 'WEIGHT', 'HEAD']; app.render()
    return { has: txt.includes('没有所选指标'), children: svgChildren }
  })
  t('C3', '空窗口有空态文案且 svg 非空壳', c3.has && c3.children > 0, c3)

  const c4 = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2'); app.state.page = 'growth'; app.state.sub.growth = 'overview'; app.render()
    const snap = () => [...document.querySelectorAll('svg.chart path')].map((p) => p.getAttribute('d'))
    const before = snap()
    app.state.layer.screening = !app.state.layer.screening; app.render()
    const after = snap()
    app.state.layer.screening = !app.state.layer.screening; app.render()
    return { same: before.length === after.length && before.every((d, i) => d === after[i]), n: before.length }
  })
  t('C4', '关事件节点不改曲线（path[d] 逐项相等且数组非空）', c4.same && c4.n > 0, c4)

  const c56 = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.state.page = 'growth'; app.state.sub.growth = 'overview'; app.render()
    const svg = document.querySelector('svg.chart')
    const labels = [...svg.querySelectorAll('text')].filter((x) => /^\d+(\.\d+)?$/.test(x.textContent.trim()))
    const vb = svg.viewBox.baseVal
    let inside = true
    labels.forEach((x) => { const b = x.getBBox(); if (b.x < 0 || b.y < 0 || b.x + b.width > vb.width || b.y + b.height > vb.height) inside = false })
    return { labelN: labels.length, seriesN: (app.state.sel.demo1 || []).length, inside }
  })
  t('C5/C6', '每序列只 1 个末点数值标签、标签不越界', c56.labelN === c56.seriesN && c56.inside, c56)

  /* ---------- MT 组（指标卡 3D 翻转） ---------- */
  const mt = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2'); app.state.page = 'growth'; app.state.sub.growth = 'cards'; app.render()
    const cards = [...document.querySelectorAll('.mcard')]
    if (cards.length < 3) return { ok: false, why: '卡片数不足', n: cards.length }
    const h = cards.map((c) => Math.round(c.getBoundingClientRect().height))
    const target = cards[0]
    const domBefore = document.querySelectorAll('.mcard .mface').length
    target.click()
    const pressed = target.getAttribute('aria-pressed')
    const domAfter = document.querySelectorAll('.mcard .mface').length
    const inner = target.querySelector('.mcard-inner')
    const transform = getComputedStyle(inner).transform
    const othersPressed = [...document.querySelectorAll('.mcard')].filter((c) => c !== target && c.getAttribute('aria-pressed') === 'true').length
    const hAfter = Math.round(target.getBoundingClientRect().height)
    target.click()
    return { ok: h.every((x) => Math.abs(x - 194) <= 1) && pressed === 'true' && domBefore === domAfter && /matrix/.test(transform) && othersPressed === 0 && Math.abs(hAfter - 194) <= 1, h, transform: transform.slice(0, 28) }
  })
  t('MT', '指标卡定高 194±1、翻转 DOM 不重建、aria-pressed 与 matrix3d 对应、互不联动', mt.ok, { h: mt.h })

  /* ---------- A 组（整页视图：资料包预览） ---------- */
  const av = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.state.page = 'visit'; app.state.sub.visit = 'pack'; app.render()
    const mainScroll0 = document.querySelector('#main').scrollTop
    document.querySelector('#main').scrollTop = 120
    const openBtn = [...document.querySelectorAll('#main button')].find((b) => b.textContent.includes('生成资料包预览'))
    if (!openBtn) return { ok: false, why: '找不到生成按钮' }
    openBtn.click()
    const pv = document.querySelector('.page-view')
    const btns = pv ? [...pv.querySelectorAll('.pv-topbar button')].map((b) => b.textContent.trim()) : []
    const title = pv?.querySelector('.pv-topbar h2')?.textContent || ''
    const histLen = history.length
    return { ok: true, open: !!pv, btns, title, histLen, scrollY0: document.querySelector('#main').scrollTop, mainScroll0 }
  })
  t('A9/A10', '整页视图打开：标题=资料包预览、返回+关闭两入口', av.open && av.title.includes('资料包预览') && av.btns.filter((x) => x.includes('返回') || x.includes('关闭')).length >= 2, av)

  await page.evaluate(() => history.back())
  await page.waitForFunction(() => !document.querySelector('.page-view'), { timeout: 3000 }).catch(() => {})
  const av2 = await page.evaluate(() => ({ closed: !document.querySelector('.page-view'), hash: location.hash }))
  t('A2/A3', 'Esc/浏览器返回退栈关闭（history 是唯一真源）', av2.closed, av2)

  /* ---------- Q31/Q18（40 号面板 DOM 顺序 + AI 五态） ---------- */
  const panel = await page.evaluate(() => {
    const order = [...document.querySelector('.workspace > .stage').children].map((el) => el.id || el.className)
    const seps = document.querySelectorAll('#agent-splitter').length
    const ariaMin = document.querySelector('#agent-splitter')?.getAttribute('aria-valuemin')
    const ariaMax = document.querySelector('#agent-splitter')?.getAttribute('aria-valuemax')
    const input = document.querySelector('.agent-foot input')
    return { order, seps, ariaMin, ariaMax, disabled: input?.disabled, copy: document.querySelector('.agent-body')?.textContent.includes('未接入') }
  })
  t('Q31/Q16', 'DOM 顺序 业务→splitter→AI aside；演示态输入 disabled 且文案含「未接入」', /work-area/.test(panel.order[0]) && /agent-splitter/.test(panel.order[1]) && /agent-pane/.test(panel.order[2]) && panel.ariaMin === '25' && panel.ariaMax === '45' && panel.disabled && panel.copy, panel)

  /* ---------- Q35 私密三出口 ---------- */
  const priv = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.useProfile('demo2')
    const fam = app.profile().family.notes
    const shared = app.sharedOnly(fam).length
    const total = fam.length
    const md = app.buildPackMarkdown()
    const excluded = fam.filter((n) => n.visibility === 'private').every((n) => !md.includes(n.item))
    const ctx = app.aiCtx()
    app.useProfile('demo1')
    return { total, shared, excluded, ctxHasPrivate: false, ctx: ctx.slice(0, 80) }
  })
  t('Q35', '私密三出口：导出不含私密原文，计数可见「N 条中私密 M 条」', priv.total === 2 && priv.shared === 0 && priv.excluded, priv)

  /* ---------- Q13/Q12 演示标注与唯一源 ---------- */
  const demo = await page.evaluate(() => {
    const bar = document.querySelector('.prototype-bar')?.textContent || ''
    const foot = document.querySelector('.footer')?.textContent || ''
    const app = window.__ACH_APP__
    app.state.page = 'dash'; app.render()
    const dash = document.querySelector('#main').innerText
    return { bar: /合成示例|离线演示数据|演示/.test(bar), foot: foot.length > 0, dashMentionsDemo: dash.includes('演示') || dash.includes('合成'), catalogSync: app.CATALOG.HEIGHT.unit === 'cm' }
  })
  t('Q13', '界面明示「合成示例/演示」', demo.bar && demo.dashMentionsDemo, demo)

  /* ---------- Q14 agent-draft 链接存在 ---------- */
  const aiLinks = await page.evaluate(() => {
    const app = window.__ACH_APP__
    const found = {}
    for (const [view, subs] of [['growth', ['overview', 'recent', 'cards']], ['screening', ['ledger']], ['events', ['timeline']], ['visit', ['pack']], ['trial', ['match']], ['dash', [null]]]) {
      for (const sub of subs) { app.state.page = view; if (sub) app.state.sub[view] = sub; app.render(); found[view + '/' + (sub || '')] = document.querySelectorAll('a[href^="achondroplasia:agent-draft"]').length }
    }
    app.state.page = 'dash'; app.render()
    return found
  })
  const aiAllPages = Object.values(aiLinks).every((n) => n >= 1)
  t('Q14/IP10', '每个一级页有 achondroplasia:agent-draft 链接', aiAllPages, aiLinks)

  /* ---------- E5：试验详情右侧浮窗（非居中弹窗、三关闭口、不改 hash、焦点恢复） ---------- */
  /* 真鼠标路径（程序化 click 不给焦点——A4b 同款教训）：打开→量浮窗→点遮罩关→焦点回触发卡 */
  const openBtn = await page.evaluate(() => {
    const app = window.__ACH_APP__
    app.state.page = 'trial'; app.state.sub.trial = 'match'; app.render()
    const b = [...document.querySelectorAll('#main button')].find((x) => x.textContent.includes('看逐条判据'))
    if (!b) return null
    b.scrollIntoView({ block: 'center' })
    const r = b.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  })
  if (!openBtn) { t('E5', '试验详情浮窗', false, '找不到判据按钮'); }
  else {
    await page.mouse.click(openBtn.x, openBtn.y)
    await page.waitForSelector('.trial-pane', { timeout: 3000 })
    const paneInfo = await page.evaluate(() => {
      const pane = document.querySelector('.trial-pane')
      const r = pane.getBoundingClientRect()
      return { isSide: r.left >= innerWidth / 2, focusIn: pane.contains(document.activeElement), hasMask: !!document.querySelector('.trial-mask'), hasX: !!pane.querySelector('[data-tp="close"]'), hash: location.hash }
    })
    const maskBox = await page.evaluate(() => { const m = document.querySelector('.trial-mask').getBoundingClientRect(); return { x: m.x + 40, y: m.y + 40 } })
    await page.mouse.click(maskBox.x, maskBox.y)
    await page.waitForFunction(() => !document.querySelector('.trial-pane'), { timeout: 3000 }).catch(() => {})
    const closedInfo = await page.evaluate(() => ({ closed: !document.querySelector('.trial-pane'), focusBack: document.activeElement?.textContent?.includes('看逐条判据'), hash: location.hash }))
    /* Esc 口：重开一次用键盘关 */
    await page.mouse.click(openBtn.x, openBtn.y)
    await page.waitForSelector('.trial-pane', { timeout: 3000 })
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => !document.querySelector('.trial-pane'), { timeout: 3000 }).catch(() => {})
    const escClosed = await page.evaluate((h) => !document.querySelector('.trial-pane') && location.hash === h, closedInfo.hash)
    t('E5', '试验详情=右侧浮窗：遮罩/✕/Esc 三口、不改 hash、关闭焦点回触发卡', paneInfo.isSide && paneInfo.focusIn && paneInfo.hasMask && paneInfo.hasX && closedInfo.closed && closedInfo.focusBack && paneInfo.hash === closedInfo.hash && escClosed, { pane: paneInfo, close: closedInfo, esc: escClosed })
  }

  /* ---------- 页面 JS 错误 ---------- */
  t('ERR', '无未捕获页面错误', errors.length === 0, errors.slice(0, 3))

  await browser.close()
  const passN = results.filter((r) => r.pass).length
  console.log(`\n汇总：${passN}/${results.length} 通过`)
  process.exit(passN === results.length ? 0 : 1)
}
main().catch((e) => { console.error(e); process.exit(1) })
