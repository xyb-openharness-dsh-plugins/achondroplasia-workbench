/* 小苗宝 GrowPal 软骨发育不全工作台原型 v0.2 · 2026-11-06 夜班
   家族基线：结构抄小橙宝（应用外壳/内滚/AI 面板），元素抄小粉宝（导航选中态/卡片/表格）。
   病种语义全部为软骨发育不全（R3 儿童遗传形态）：无分期、无线序、无疗效与预后表达。
   契约：
   - 数据唯一源 demo-data.js（Q12）；两套档案切换整页联动（Q10）。
   - 指标目录单一来源 CATALOG（23 号）；图表与指标卡读同一份（MT03）。
   - private 三出口（看板摘要/导出/AI 上下文）共用 sharedOnly（K6/Q35）。
   - AI 一键发送 34 号：achondroplasia:agent-draft · send:true（嵌入式直发；独立打开演示面板不发送，Q16/Q17）。
   - 一图秀 16 号：每条序列独立等高条带、按该指标全期 min/max 归一化并写明「不可比」（C1/C4/C5）；
     smoothPath 单调三次 Hermite（Fritsch–Carlson）。
   - 指标卡真 3D 翻转定高 194px（MT 组）；折叠卡 details.phase-fold；整页视图 32 号 history 栈（A 组）；
     疾病概要 36 号（P 组，primer.js）；临床试验 35 号四段链路（无判读列，禁「匹配指数/入选概率」文案）。
   - 非肿瘤红线：无「达标/落后」判定、无风险评分；阈值与频次一律【待核】或医生原话。 */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const APP_INFO = { name: '小苗宝 GrowPal', version: '0.2.0', build: '2026-11-06' };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dOf = (d) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + 'T00:00:00') : null);
const fmtD = (d) => (d && d.length >= 10 ? d.slice(0, 10) : String(d ?? ''));
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
const num = (v, dec = 1) => (typeof v === 'number' && isFinite(v) ? v.toFixed(dec).replace(/\.0$/, dec ? '' : '') : String(v ?? '—'));

/* ---------------- 导航（一级 6 项 + 设置在顶栏；重名率实测 14%） ---------------- */
const ICONS = {
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M3.5 10h17M9 10v9.5"/></svg>',
  growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 19c3-1 4.5-3 5-6M9.5 13c2 .2 3.6-.6 4.5-2.5M14 10.5C15 8 17 6.5 20 6c-.4 3.4-2.2 5.4-6 5.8"/><path d="M4 19.5h16"/></svg>',
  screening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4M8.5 11h5M11 8.5v5"/></svg>',
  events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 4v3M6.5 7h11a1.5 1.5 0 0 1 1.5 1.5V19H5V8.5A1.5 1.5 0 0 1 6.5 7z"/><path d="M9 12h6M9 15.5h6"/></svg>',
  visit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 3.5h10a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M9.5 8h5M9.5 12h5M9.5 16h3"/></svg>',
  trial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M9 3.5h6M10 3.5v5.5L5.8 17A2.5 2.5 0 0 0 8 20.5h8a2.5 2.5 0 0 0 2.2-3.5L14 9V3.5"/><path d="M7.5 13.5h9"/></svg>'
};
const PAGES = [
  { id: 'dash', label: '看板' },
  { id: 'growth', label: '生长记录' },
  { id: 'screening', label: '筛查台账' },
  { id: 'events', label: '事件档案' },
  { id: 'visit', label: '就诊准备' },
  { id: 'trial', label: '临床试验' }
];
const SUBPAGES = {
  growth: [['overview', '一图秀'], ['cards', '分类指标'], ['recent', '最近测量'], ['cands', '待核对'], ['docs', '报告档案']],
  screening: [['ledger', '筛查台账'], ['rhythm', '随访节律清单']],
  events: [['timeline', '时间线'], ['surgeries', '手术档案'], ['meds', '注射与用药']],
  visit: [['pack', '资料包'], ['questions', '待问清单']],
  trial: [['match', '匹配'], ['search', '检索'], ['saved', '收藏与跟踪']]
};
const GROWTH_TAB_DESC = {
  overview: '生长轨迹一图：每条线按该指标全部记录范围缩放（min–max），不同指标不可比；事件带在上方分层。',
  cards: '指标卡：最近值、较上次、来源与次数；翻卡看口径说明。',
  recent: '最近测量记录（原始值逐条）。',
  cands: 'AI/导入候选：逐项核对后入库，拒收零副作用。',
  docs: '报告与原件档案（缺失如实标注）。'
};
/* 指标目录（唯一来源：一图秀/指标卡/最近测量表同读这里，MT03） */
const CATALOG = {
  HEIGHT: { name: '身长/身高', unit: 'cm', cat: '体格生长', color: '#2f6b40', dec: 1, note: '测量方式（卧式身长/立式身高）不同时不跨组连线、不做差（口径见页内说明）。' },
  WEIGHT: { name: '体重', unit: 'kg', cat: '体格生长', color: '#b06a28', dec: 1, note: '衣物差异会让家庭自测与门诊值不可比；并列展示不合并。' },
  HEAD: { name: '头围', unit: 'cm', cat: '体格生长', color: '#2f7d6b', dec: 1, note: '软骨发育不全专用头围曲线与普通曲线不同；本台只并列记录，不判读。' },
  BMIW: { name: '身高别体重', unit: '', cat: '其他测量', color: '#7c6aae', dec: 1, note: '参考口径【待核】；记录项不判定体型。' }
};
const CAT_ORDER = ['体格生长', '其他测量'];
const SCREEN_CATS = [
  { id: 'hearing', label: '听力与中耳', color: '#2f7d6b' },
  { id: 'sleep', label: '睡眠与呼吸', color: '#7c6aae' },
  { id: 'craniocervical', label: '颅颈与神经', color: '#b06a28' },
  { id: 'spine', label: '脊柱', color: '#2f6b40' },
  { id: 'legs', label: '下肢对线', color: '#a2372a' }
];
/* AI 协助示例（IP5/IP10；预写提示词，不自动发送；独立打开时进演示面板） */
const AI_DEMOS = {
  dash: { prompt: '把孩子的年龄、最近一次身高体重和下次复诊排成一段话，复诊时照着说。', cand: { title: '复诊开场摘要（演示候选）', fields: [['孩子', '见当前档案'], ['最近身高', '读「生长记录 · 最近测量」'], ['下次复诊', '以预约为准']], src: '看板（演示）' } },
  growth: { prompt: '帮我把身高这几次的记录排成时间顺序，标注来源与机构，不做任何判断。', cand: { title: '身高整理候选（演示）', fields: [['排序', '按测量日期'], ['每行', '日期 · 数值 · 来源/机构'], ['口径', '不判定达标/落后']], src: '生长记录（演示）' } },
  screening: { prompt: '把听力这几年的结果按时间列出来，原文照抄不解读。', cand: { title: '听力结果整理候选（演示）', fields: [['每行', '日期 · 项目 · 结果原文'], ['口径', '报告原文照抄']], src: '筛查台账（演示）' } },
  events: { prompt: '把手术与开始用药这两件事整理成一张给家人看的说明卡，只写日期与医生原话。', cand: { title: '事件说明卡候选（演示）', fields: [['手术', '名称 · 日期 · 医生原话'], ['用药', '开始日期 · 方案以医嘱为准']], src: '事件档案（演示）' } },
  visit: { prompt: '根据生长、筛查、事件记录，帮我起草下次复诊要问的问题清单（不代医生回答）。', cand: { title: '待问清单候选（演示）', fields: [['问题 1', '听力随访节奏（问医生）'], ['问题 2', '下次睡眠监测安排（问医生）']], src: '就诊准备（演示）' } },
  trial: { prompt: '把试验登记里「待确认」的条件整理成问研究护士的问题清单，只整理不改写。', cand: { title: '试验问题候选（演示）', fields: [['口径', '线索不是推荐'], ['登记状态', '未核实']], src: '临床试验（演示）' } }
};

/* ---------------- state（A/B 档案隔离：MT13） ---------------- */
const state = {
  page: 'dash', sub: {}, profileId: 'demo1',
  range: 'all', sel: { demo1: ['HEIGHT', 'WEIGHT', 'HEAD'], demo2: ['HEIGHT', 'WEIGHT', 'HEAD'] },
  layer: { screening: true, surgery: true, injection: true },
  pin: null,
  pv: null,
  mem: {
    demo1: { measures: [], screenings: [], surgeries: [], injections: [], corrections: [], savedTrials: [], acceptedCands: [], questions: null, hospitals: [] },
    demo2: { measures: [], screenings: [], surgeries: [], injections: [], corrections: [], savedTrials: [], acceptedCands: [], questions: null, hospitals: [] }
  },
  trialFilter: { q: '', status: 'all', phase: 'all', sort: 'status' },
  agent: { open: false },
  toastTimer: 0
};
let DATA = typeof DEMO_DATA !== 'undefined' ? DEMO_DATA : { meta: {}, profiles: [], trials: [] };
const TODAY = DATA.meta?.today || '2026-11-05';
/* ---------------- 数据层（原型 / 开发版同一份渲染代码） ----------------
   ① file:// 双击原型：直接读 demo-data.js（演示态，顶部条明说）；
   ② dev-server / DSH 宿主从 /ui/ 提供：先向 /api/achondroplasia/bootstrap 要本机库真数据，
      拿不到（或库为空）才回退演示数据——三态 api/demo/empty，不拿演示档案把空工作区填满。
   （34 号桥、私密三出口、渲染代码与数据源解耦；public/ 与本文件逐字符一致。） */
let DATA_SOURCE = 'demo';
const profile = () => DATA.profiles.find((p) => p.id === state.profileId) || DATA.profiles[0];
function apiBase() {
  if (location.protocol === 'file:') return null;
  const m = location.pathname.match(/^(.*)\/ui(?:\/|$)/);
  if (!m) return null; /* 非 /ui/ 路径（静态打开原型）＝没有服务，直接演示态，不发探底请求 */
  return m[1].replace(/\/$/, '');
}
async function loadBootstrap() {
  const base = apiBase();
  if (base === null) return 'demo';
  try {
    const res = await fetch(base + '/bootstrap', { headers: { accept: 'application/json' }, credentials: 'same-origin' });
    if (!res.ok) return 'demo';
    const data = await res.json();
    if (!Array.isArray(data?.profiles) || !data.profiles.length) {
      DATA = { profiles: [], meta: data?.meta ?? null, trials: [], snapshot: data?.snapshot ?? null };
      return 'empty';
    }
    DATA = data;
    if (!state.profileId || !DATA.profiles.some((p) => p.id === state.profileId)) state.profileId = DATA.profiles[0].id;
    return 'api';
  } catch { return 'demo'; }
}
function applySourceBanner() {
  const bar = document.querySelector('.prototype-bar');
  if (!bar) return;
  if (DATA_SOURCE === 'api') bar.innerHTML = '<span><b>本机数据 v' + esc(APP_INFO.version) + '</b> · 数据只存在你选的资料目录</span><span>只整理不判定 · 判读归医疗团队</span>';
  else if (DATA_SOURCE === 'empty') bar.innerHTML = '<span><b>本机资料目录为空</b> · 上传报告建档后这里就是你的资料</span><span>只整理不判定 · 判读归医疗团队</span>';
  else bar.innerHTML = '<span><b>交互原型 v' + esc(APP_INFO.version) + ' · 离线演示数据</b> · 未连上本机服务，以下内容不是你的资料</span><span>仅本页演示 · 刷新重置 · 未接入 AI</span>';
}
async function apiPostJson(path, payload) {
  const res = await fetch(apiBase() + path, { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) });
  if (!res.ok) { let m = ''; try { m = (await res.json()).message || ''; } catch { /* 保留 HTTP 码 */ } throw new Error(m || ('HTTP ' + res.status)); }
  return res.json();
}
async function apiRefetch() { DATA_SOURCE = await loadBootstrap(); applySourceBanner(); render(); }
function apiSaveRecord(kind, payload, okMsg, keepOpen = false) {
  if (!keepOpen) closeModal();
  void apiPostJson('/records/' + kind, { profileId: state.profileId, ...payload })
    .then(() => {
      if (keepOpen) {
        /* 保存并继续录入：清空数值/文本输入，保留类别类选择；弹窗不关（F3 三态） */
        document.querySelectorAll('#dialog-body [data-f]').forEach((el) => {
          if (el.tagName === 'SELECT') return
          if (el.type === 'date') return
          el.value = ''
        })
        toast(okMsg || '已保存，可继续录下一条', { long: true })
      } else {
        toast(okMsg || '已保存', { long: true })
      }
      return apiRefetch()
    })
    .catch((e) => { if (!keepOpen) closeModal(); toast('未保存：' + e.message, { long: true }) })
  return true
}
const mem = () => state.mem[state.profileId];
/* private 三出口共用（Q35/H1）：看板摘要预览、导出、AI 上下文全部走 sharedOnly */
const sharedOnly = (list) => (list || []).filter((v) => v.visibility !== 'private');
const privateCount = (list) => (list || []).filter((v) => v.visibility === 'private').length;
const CARE_LABEL = { caregiver: '家长代记', patient: '本人查看' };

/* ---------------- 读模型（派生值读时算，不落库，Q37/Q38） ---------------- */
function allMeasures(code) {
  const base = (profile().metrics || {})[code] || [];
  const added = mem().measures.filter((m) => m.code === code).map((m) => ({ d: m.d, v: m.v, src: m.src, org: m.org, _added: true, _id: m._id, _v: m._v || 1, visibility: m.visibility || 'shared' }));
  return [...base, ...added];
}
/* D5：私密测量不进一图秀与看板 mini 图（三出口同口径）；最近测量表仍可见并带 pill */
function sharedMeasures(code) { return allMeasures(code).filter((x) => x.visibility !== 'private') }
function privateMeasureCount() {
  return CAT_KEYS().reduce((n, c) => n + allMeasures(c).filter((x) => x.visibility === 'private').length, 0)
}
const lastOf = (arr) => { const withDate = (arr || []).filter((x) => dOf(x.d)); return withDate.length ? withDate[withDate.length - 1] : null; };
const prevOf = (arr) => { const withDate = (arr || []).filter((x) => dOf(x.d)); return withDate.length > 1 ? withDate[withDate.length - 2] : null; };
const ageAt = (d) => { const a = dOf(d), b = dOf(profile().birth) || null; return null; };
function allScreenings(cat) {
  const base = (profile().screenings || {})[cat] || [];
  return [...base, ...mem().screenings.filter((s) => s.cat === cat)];
}
function allSurgeries() { return [...(profile().events?.surgeries || []), ...mem().surgeries]; }
function allInjections() { return [...(profile().events?.injections || []), ...mem().injections]; }
function allQuestions() {
  if (mem().questions) return mem().questions;
  mem().questions = (profile().questions || []).map((q) => ({ ...q }));
  return mem().questions;
}
function aiCtx() {
  const p = profile();
  const fam = p.family?.notes || [];
  const shared = sharedOnly(fam);
  const h = lastOf(allMeasures('HEIGHT'));
  return `${p.name}·${p.age}·${p.headline}·最近身高 ${h ? h.v + 'cm（' + h.d + '）' : '未记录'}·私密记录 ${privateCount(fam)} 条默认不带（共享 ${shared.length} 条）`;
}
const aiPromptWithCtx = (key) => `${AI_DEMOS[key]?.prompt || '帮我整理这一页的信息。'}\n（已确认的档案上下文：${aiCtx()}）`;

/* ---------------- 通用 UI ---------------- */
const btn = (text, action, cls = '', attr = '') => `<button class="${cls}" data-action="${action}" ${attr}>${text}</button>`;
const go = (text, page, sub = '', cls = '', attr = '') => btn(text, 'go', cls, `data-page="${page}" data-sub="${esc(sub)}"${attr ? ' ' + attr : ''}`);
const pill = (text, cls = '') => `<span class="pill ${cls}">${esc(text)}</span>`;
const aiBtn = (key, label = '和 AI 讨论') => `<a class="chip ai-link" href="achondroplasia:agent-draft?prompt=${encodeURIComponent(aiPromptWithCtx(key))}" data-ai="${key}" title="把预写提示词与当前档案上下文发送给 AI，开启互动（回复是候选，核对后采纳）">${esc(label)} ↗</a>`;
function toast(t, opts = {}) {
  clearTimeout(state.toastTimer);
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  state.toastTimer = setTimeout(() => { el.classList.remove('show'); if (opts.back) history.back(); }, opts.long ? 6000 : 2600);
}
function openModal(title, body, foot = '', eyebrowLabel = '小苗宝 · 交互演示') {
  $('#dialog-title').textContent = title; $('#dialog-eyebrow').textContent = eyebrowLabel;
  $('#dialog-body').innerHTML = body; $('#dialog-foot').innerHTML = foot || '<button data-action="close">关闭</button>';
  const dlg = $('#dialog'); if (!dlg.open) dlg.showModal();
}
function closeModal() { const dlg = $('#dialog'); if (dlg.open) dlg.close(); }
const head = (title, desc, action = '') => `<div class="head"><h1>${esc(title)}</h1><p>${desc}</p>${action ? `<div class="actions">${action}</div>` : ''}</div>`;
const section = (title, sub = '', extra = '', eyebrow = '') => `<div class="section-title"><div>${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}<h2>${esc(title)}</h2>${sub ? `<p>${sub}</p>` : ''}</div>${extra}</div>`;
const emptyBox = (title, desc, cta = '') => `<div class="empty"><h3>${esc(title)}</h3><p>${desc}</p>${cta || go('回到看板', 'dash')}</div>`;
const pageId = () => (SUBPAGES[state.page] ? `${state.page}/${state.sub[state.page] || SUBPAGES[state.page][0][0]}` : state.page);
const careTag = () => `<span class="author-tag caregiver">${esc(CARE_LABEL[profile().careRole] || '家长代记')}</span>`;

/* ---------------- 路由（hash 是导航真源；A7 刷新保持） ---------------- */
function applyHash() {
  const h = (location.hash || '#dash').replace(/^#\/?/, '');
  if (h.startsWith('pv-')) { state.pv = h; state.page = state.pvPage || 'visit'; return; }
  state.pv = null;
  const [page, sub] = h.split('/');
  if (PAGES.some((p) => p.id === page)) { state.page = page; if (sub && SUBPAGES[page]?.some(([id]) => id === sub)) state.sub[page] = sub; }
  else state.page = 'dash';
}
function goHash(page, sub) {
  const target = '#' + (sub ? `${page}/${sub}` : page);
  if (location.hash !== target) location.hash = target; else render();
}

/* ---------------- 看板（dash）：hero + 竖条状态卡 + 数据行动带 + 快捷卡 + 最近变化/待办（小粉宝结构，R3 语义） ---------------- */
function miniTrendCard(code) {
  const m = CATALOG[code]
  const dated = sharedMeasures(code).filter((x) => dOf(x.d))
  if (!dated.length) return ''
  const pts = dated.slice(-8)
  const w = 560, h = 120, padX = 16, padT = 14, padB = 26
  const vals = pts.map((x) => x.v)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || Math.max(Math.abs(hi) * .08, 1)
  const coords = pts.map((x, i) => ({ x: padX + i * (w - padX * 2) / Math.max(pts.length - 1, 1), y: h - padB - ((x.v - lo) / span) * (h - padT - padB), d: x.d, v: x.v }))
  const last = coords[coords.length - 1]
  const t0 = pts[0].d, t1 = pts[pts.length - 1].d
  return `<div class="card mini-card">
    <div class="mini-head"><div><b>${esc(m.name)}</b><p class="small-note">${esc(m.cat)} · ${dated.length} 次记录 · ${esc(t0.slice(5))} 起</p></div>${pill('原始值并列 · 不判定', 'grey')}</div>
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(m.name)}最近 ${pts.length} 次记录折线（原始值末点标注）">
      <line x1="${padX}" x2="${w - padX}" y1="${h - padB}" y2="${h - padB}" stroke="#e2e8de"/>
      ${coords.length > 1 ? `<path d="${smoothPath(coords)}" fill="none" stroke="${m.color}" stroke-width="2.4" stroke-linecap="round"/>` : ''}
      ${coords.map((c, i) => `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === coords.length - 1 ? 4 : 2.8}" fill="${m.color}" stroke="#fff" stroke-width="1.2"/>`).join('')}
      <text x="${Math.min(last.x, w - 30).toFixed(1)}" y="${(last.y - 9).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="${m.color}">${esc(num(last.v))}</text>
      <text x="${padX}" y="${h - 8}" font-size="10" fill="#7c877b">${esc(t0)}</text>
      <text x="${w - padX}" y="${h - 8}" font-size="10" fill="#7c877b" text-anchor="end">${esc(t1)}</text>
    </svg>
    <div class="mini-stats"><span><b>${esc(num(last.v))}${m.unit ? ' ' + esc(m.unit) : ''}</b> 最新值</span><span><b>${dated.length}</b> 次测量</span><span><b>${allQuestions().filter((q) => !q.asked).length}</b> 个待问问题</span></div>
  </div>`
}
function todoList() {
  const p = profile()
  const items = []
  if (p.dash?.nextVisit && !/待约/.test(p.dash.nextVisit)) items.push({ d: (p.dash.nextVisit.match(/\d{4}-\d{2}-\d{2}/) || [''])[0] || '待约', t: p.dash.nextVisit, src: '档案 · 下次安排' })
  allQuestions().filter((q) => !q.asked).slice(0, 2).forEach((q) => items.push({ d: '待问', t: q.q, src: '待问清单' }))
  const pend = (profile().candidates || []).length
  if (pend) items.push({ d: '待核对', t: `${pend} 条候选待核对入库`, src: '生长记录 · 待核对' })
  if (!items.length) return emptyBox('暂无待办', '记录候选核对、待问清单和下次安排会出现在这里。', `${btn('去记一次测量', 'form-measure', 'primary')}${go('回到看板', 'dash', '', 'soft')}`)
  return `<div class="card todo-card"><p class="small-note" style="margin-bottom:8px">${items.length} 项待办</p>
    ${items.map((it) => `<div class="todo-row"><span class="todo-dot" aria-hidden="true"></span><div><span class="nowrap-num todo-d">${esc(it.d)}</span><b>${esc(it.t)}</b><span class="small-note">${esc(it.src)}</span></div></div>`).join('')}</div>`
}
function pageDash() {
  const p = profile()
  const fam = p.family?.notes || []
  const h = lastOf(allMeasures('HEIGHT'))
  const prev = prevOf(allMeasures('HEIGHT'))
  const dh = h && prev && dOf(prev.d) ? (h.v - prev.v) : null
  const w = lastOf(allMeasures('WEIGHT'))
  const scrCount = SCREEN_CATS.reduce((n, c) => n + allScreenings(c.id).length, 0)
  const injOk = allInjections().filter((i) => i.done === '已注射').length
  const privN = privateCount(fam)
  const pendN = (p.candidates || []).length
  const checkedN = p.docs.filter((d) => d.status === '已入库').length
  const stage = p.dash.stage
  const deltaSentence = h ? `最近身高 <b class="nowrap-num">${esc(num(h.v))} cm</b>${dh === null ? '' : `，较上次 <b class="nowrap-num">${dh > 0 ? '+' : ''}${esc(num(dh))} cm</b>`}` : '还没有身高记录'
  const quick = [
    { icon: '📈', t: '记一次测量', d: '身高/体重/头围，含测量来源', page: 'growth', sub: 'recent' },
    { icon: '🩺', t: '登记筛查结果', d: '听力/睡眠/影像等报告原文', page: 'screening', sub: 'ledger' },
    { icon: '🧳', t: pendN ? '生成资料包' : '生成资料包', d: pendN ? `${pendN} 条候选待核对 · 复诊前一键汇总` : '复诊前一键汇总与导出', page: 'visit', sub: 'pack' }
  ]
  return `
  <div class="hero">
    <div class="hero-left">
      <span class="eyebrow2">GROWPAL / GROW WITH CARE</span>
      <h1>今天，先记录眼前的一件事。</h1>
      <p>把生长、筛查与就诊整理清楚，让每次随访都有据可讲。</p>
    </div>
    <div class="tiles">
      <div class="tile"><span>记录整理进度</span><b>${checkedN}<small> / ${p.docs.length}</small></b><span class="tile-sub">份报告已入库</span></div>
      <div class="tile"><span>当前阶段</span><b>${esc(stage.split('·')[0].trim())}</b><span class="tile-sub">${esc((stage.split('·')[1] || '').trim() || '只改话题，不做判断')}</span></div>
    </div>
  </div>
  <div class="status-card">
    <span class="eyebrow3">${esc(p.dash.anchorLabel)} · 状态卡 · 合成示例</span>
    <div class="huge-line"><span class="huge">第 <b class="nowrap-num">${p.dash.anchorDays}</b> 天</span><span class="anchor-note">锚 ${esc(p.dash.anchorDate || '—')}（${p.id === 'demo1' ? '确诊日' : '上次复诊'} = 第 0 天）· 由档案日期算出，不手填</span></div>
    <div class="sc-row">${pill(stage, 'green')}<span class="muted">下次：${esc(p.dash.nextVisit)}</span></div>
    <div class="actions" style="margin-top:12px">${go('看生长轨迹 →', 'growth', 'overview', 'primary')}<button data-action="primer-open-proxy" class="soft">疾病概要：软骨发育不全是什么？</button></div>
  </div>
  <div class="action-band">
    <div class="ab-text"><span class="ab-sentence">${deltaSentence}${w ? ` · 体重 <b class="nowrap-num">${esc(num(w.v))} kg</b>` : ''}</span><span class="ab-sub">${h ? `${esc(h.d)} ${esc(h.src || '')} 测量 · 已同步到一图秀；是否需要处理请与医疗团队讨论，工作台不做判断。` : '记录后会在这里显示最近变化。'}</span></div>
    <div class="actions">${go('看生长趋势 →', 'growth', 'overview', 'primary')}${go('带去复诊的问题', 'visit', 'questions', 'soft')}</div>
  </div>
  <div class="quick-cards">
    ${quick.map((q) => `<button class="quick-card" data-action="go" data-page="${q.page}" data-sub="${q.sub}"><span class="qc-icon" aria-hidden="true">${q.icon}</span><div><b>${esc(q.t)}</b><span>${esc(q.d)}</span></div><span class="qc-arrow" aria-hidden="true">↗</span></button>`).join('')}
  </div>
  <div class="two-col-dash">
    <div>
      <div class="sec-head"><div><h2>最近的变化</h2><p class="small-note">同一份记录，同时出现在一图秀、指标卡和就诊准备里。</p></div>${go('打开一图秀 ↗', 'growth', 'overview', 'text-button')}</div>
      ${miniTrendCard('HEIGHT') || emptyBox('还没有身高记录', '从「记一次测量」开始，最近的变化会画在这里。', btn('＋ 记一次测量', 'form-measure', 'primary'))}
    </div>
    <div>
      <div class="sec-head"><div><h2>接下来的安排</h2></div>${go('＋ 添加待问', 'visit', 'questions', 'text-button')}</div>
      ${todoList()}
    </div>
  </div>
  <div class="grid two" style="margin-top:14px">
    <div class="card"><h3>记录概况（当前档案）</h3>
      <dl class="kv" style="margin-top:8px">
        <dt>生长测量</dt><dd class="nowrap-num">${allMeasures('HEIGHT').length + allMeasures('WEIGHT').length + allMeasures('HEAD').length + allMeasures('BMIW').length} 条</dd>
        <dt>筛查结果</dt><dd class="nowrap-num">${scrCount} 条</dd>
        <dt>手术 / 注射</dt><dd class="nowrap-num">${allSurgeries().length} 台手术 · ${injOk} 次已注射记录</dd>
        <dt>报告</dt><dd class="nowrap-num">${p.docs.length} 份（无原件 ${(p.docs.filter((d) => !d.hasOriginal)).length} 份）</dd>
        <dt>家庭记录</dt><dd class="nowrap-num">${fam.length} 条中私密 ${privN} 条（私密不进摘要预览/导出/AI）</dd>
      </dl>
      <p class="small-note" style="margin-top:8px">${esc(DATA.meta.privateNote)}</p>
      ${aiBtn('dash')}
    </div>
    <div class="card"><h3>口径说明（常驻）</h3>
      <p class="small-note" style="margin-top:6px">${esc(DATA.meta.growthNote)}</p>
      <p class="small-note" style="margin-top:6px">${esc(DATA.meta.metricNote)}</p>
      <p class="small-note" style="margin-top:6px">${esc(DATA.meta.screenNote)}</p>
    </div>
  </div>`
}

/* ---------------- 一图秀（16 号合同；C 组） ---------------- */
const CW = 980, CH = 470, CX0 = 56, CX1 = 946;
const LANE_H = 86, LANE_GAP = 12;
function domain() {
  const p = profile();
  const dates = [Date.parse(DATA.meta.dataStart || '2021-06-01')];
  CAT_KEYS().forEach((code) => allMeasures(code).forEach((x) => dOf(x.d) && dates.push(Date.parse(x.d))));
  const end = Math.max(...dates, Date.parse(TODAY));
  const months = { '3m': 3, '6m': 6, '12m': 12 }[state.range];
  const start = months ? new Date(end - months * 30.44 * 86400000) : new Date(Math.min(...dates));
  return [start.getTime(), end];
}
const CAT_KEYS = () => Object.keys(CATALOG);
const inDomain = (d, t0, t1) => { const t = Date.parse(d); return t >= t0 && t <= t1; };
const xOf = (t, t0, t1) => CX0 + (t - t0) / Math.max(1, t1 - t0) * (CX1 - CX0);
function smoothPath(coords) { /* 单调三次 Hermite（Fritsch–Carlson）：过点、防过冲、不均匀采样安全 */
  if (!coords.length) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  const n = coords.length, dx = [], sl = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) { dx[i] = coords[i + 1].x - coords[i].x; sl[i] = dx[i] === 0 ? 0 : (coords[i + 1].y - coords[i].y) / dx[i]; }
  m[0] = sl[0]; m[n - 1] = sl[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (sl[i - 1] * sl[i] <= 0) { m[i] = 0; continue; }
    const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
    m[i] = (w1 + w2) / (w1 / sl[i - 1] + w2 / sl[i]);
  }
  for (let i = 0; i < n - 1; i++) {
    if (sl[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / sl[i], b = m[i + 1] / sl[i], q = a * a + b * b;
    if (q > 9) { const t = 3 / Math.sqrt(q); m[i] = t * a * sl[i]; m[i + 1] = t * b * sl[i]; }
  }
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C ${(coords[i].x + h).toFixed(1)} ${(coords[i].y + m[i] * h).toFixed(1)}, ${(coords[i + 1].x - h).toFixed(1)} ${(coords[i + 1].y - m[i + 1] * h).toFixed(1)}, ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  return d;
}
function seriesFor(code, t0, t1) {
  const m = CATALOG[code];
  const all = sharedMeasures(code).filter((x) => dOf(x.d));
  if (!all.length || !m) return { code, m, lo: 0, hi: 1, pts: [], all: [] };
  const vals = all.map((x) => x.v);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const span = (hi - lo) || Math.max(Math.abs(hi) * 0.08, 1);
  return { code, m, lo, hi, span, pts: all.filter((x) => inDomain(x.d, t0, t1)), all };
}
function eventNodes(t0, t1) {
  const out = [];
  if (state.layer.screening) SCREEN_CATS.forEach((c) => allScreenings(c.id).forEach((s) => { if (dOf(s.d) && inDomain(s.d, t0, t1)) out.push({ d: s.d, kind: '筛查', label: c.label, color: c.color }); }));
  if (state.layer.surgery) allSurgeries().forEach((s) => { if (dOf(s.d) && inDomain(s.d, t0, t1)) out.push({ d: s.d, kind: '手术', label: s.name, color: '#a2372a' }); });
  if (state.layer.injection) { const byM = new Map(); allInjections().forEach((i) => { if (!dOf(i.d) || !inDomain(i.d, t0, t1)) return; const k = i.d.slice(0, 7); byM.set(k, (byM.get(k) || 0) + (i.done === '已注射' ? 1 : 0)); }); byM.forEach((n, k) => out.push({ d: k + '-15', kind: '注射', label: `${k} 共 ${n} 次`, color: '#b06a28' })); }
  return out.sort((a, b) => Date.parse(a.d) - Date.parse(b.d));
}
function renderChart() {
  const [t0, t1] = domain()
  const sel = (state.sel[state.profileId] || []).filter((c) => CATALOG[c])
  const series = sel.map((c) => seriesFor(c, t0, t1))
  const evs = eventNodes(t0, t1)
  const drawn = series.filter((x) => x.pts.length)
  const W = CW, bandTop = 12, bandH = 66, plotTop = bandTop + bandH + 14, plotBottom = CH - 42
  const CH2 = CH
  let out = ''
  /* --- 顶部事件期带（治疗条与数据点分层：带在上，线在下） --- */
  out += `<text x="${CX0}" y="${bandTop + 2}" font-size="10" fill="#7c877b">事件</text>`
  const rowY = { 手术: bandTop + 12, 筛查: bandTop + 30, 注射: bandTop + 48 }
  out += `<line x1="${CX0}" x2="${CX1}" y1="${rowY.手术 - 6}" y2="${rowY.手术 - 6}" stroke="#e2e8de" stroke-dasharray="2 3"/>`
  evs.forEach((e) => {
    const x = xOf(Date.parse(e.d), t0, t1)
    if (e.kind === '手术') {
      out += `<rect class="hit" data-ev="${esc(e.kind)}|${esc(e.d)}|${esc(e.label)}" x="${(x - 4).toFixed(1)}" y="${(rowY.手术 - 4).toFixed(1)}" width="8" height="8" fill="#a2372a" transform="rotate(45 ${x.toFixed(1)} ${rowY.手术})" role="img" aria-label="手术：${esc(e.label)}（${esc(e.d)}）"/><text x="${(x + 8).toFixed(1)}" y="${(rowY.手术 + 3).toFixed(1)}" font-size="9.5" fill="#a2372a">${esc(e.label)} ${esc(e.d.slice(5))}</text>`
    } else if (e.kind === '注射') {
      out += `<rect class="hit" data-ev="${esc(e.kind)}|${esc(e.d)}|${esc(e.label)}" x="${(x - 3).toFixed(1)}" y="${rowY.注射 - 5}" width="6" height="10" rx="2" fill="#b06a2822" stroke="#b06a2866" role="img" aria-label="${esc(e.label)}"/>`
    } else {
      out += `<circle class="hit" data-ev="${esc(e.kind)}|${esc(e.d)}|${esc(e.label)}" cx="${x.toFixed(1)}" cy="${rowY.筛查}" r="3.2" fill="${e.color}" role="img" aria-label="${esc(e.kind)}：${esc(e.label)}（${esc(e.d)}）"/>`
    }
  })
  /* --- 锚点垂直虚线（确诊/建档锚点，小粉宝手术日同款） --- */
  const anchorD = profile().dash?.anchorDate
  if (anchorD && dOf(anchorD) && inDomain(anchorD, t0, t1)) {
    const ax = xOf(Date.parse(anchorD), t0, t1)
    out += `<line x1="${ax.toFixed(1)}" x2="${ax.toFixed(1)}" y1="${plotTop - 6}" y2="${plotBottom}" stroke="#c2ccbe" stroke-dasharray="3 4"/><text x="${Math.min(ax + 4, CX1 - 74).toFixed(1)}" y="${plotTop + 2}" font-size="9.5" fill="#7c877b">确诊 ${esc(anchorD.slice(5))}</text>`
  }
  /* --- 横向网格 --- */
  for (let i = 1; i <= 3; i++) {
    const gy = plotTop + (plotBottom - plotTop) * i / 4
    out += `<line x1="${CX0}" x2="${CX1}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="#eef2ea"/>`
  }
  /* --- 单区曲线：每条按自身全期 min/max 归一化（16 号合同） --- */
  const endLabels = []
  drawn.forEach((sx) => {
    const coords = sx.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: plotBottom - ((p.v - sx.lo) / sx.span) * (plotBottom - plotTop), d: p.d, v: p.v, src: p.src, org: p.org, note: p.note }))
    if (coords.length > 1) out += `<path d="${smoothPath(coords)}" fill="none" stroke="${sx.m.color}" stroke-width="2.4" stroke-linecap="round"/>`
    coords.forEach((c) => {
      out += `<circle class="hit" data-point="${esc(sx.code)}|${esc(c.d)}" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4.2" fill="${sx.m.color}" stroke="#fff" stroke-width="1.5" role="img" aria-label="${esc(sx.m.name)} ${esc(num(c.v))}（${esc(c.d)}）"/>`
    })
    if (coords.length) {
      const lastC = coords[coords.length - 1]
      endLabels.push({ x: lastC.x, y: lastC.y - 7, text: num(lastC.v), color: sx.m.color })
    }
  })
  /* 末点标签三向避让：按 y 排序，最小间距 14px，上下推开并夹回绘图区 */
  endLabels.sort((a, b) => a.y - b.y)
  for (let i = 1; i < endLabels.length; i++) if (endLabels[i].y - endLabels[i - 1].y < 14) endLabels[i].y = endLabels[i - 1].y + 14
  const yMin = 70, yMax = CH - 44
  endLabels.forEach((l) => { l.y = Math.min(yMax, Math.max(yMin, l.y)) })
  endLabels.forEach((l) => {
    out += `<text x="${(Math.min(l.x + 7, CX1 - 38)).toFixed(1)}" y="${l.y.toFixed(1)}" font-size="12" font-weight="600" fill="${l.color}">${esc(l.text)}</text>`
  })
  if (!drawn.length) out = `<text x="${CW / 2 - 78}" y="${CH2 / 2}" font-size="14" fill="#7c877b">没有所选指标（切换左栏勾选）</text>`
  const ticks = monthTicks(t0, t1)
  ticks.forEach((tk) => { const x = xOf(tk.t, t0, t1); out += `<text x="${x.toFixed(1)}" y="${CH2 - 14}" font-size="10.5" fill="#7c877b" text-anchor="middle">${esc(tk.label)}</text>` })
  const svg = `<svg class="chart" viewBox="0 0 ${W} ${CH2}" role="img" aria-label="生长时间轴：${esc(drawn.map((x) => x.m.name).join('、') || '无所选指标')}">${out}</svg>`
  return { svg, drawn, series, evs }
}
function monthTicks(t0, t1) {
  const out = []; const d = new Date(t0);
  let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  if (cur.getTime() < t0) cur.setMonth(cur.getMonth() + 1);
  const step = (t1 - t0) / 86400000 > 1200 ? 6 : 3;
  let k = 0;
  while (cur.getTime() <= t1) { if (k % step === 0) out.push({ t: cur.getTime(), label: `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}` }); cur.setMonth(cur.getMonth() + 1); k++; }
  return out;
}
function chartPointDialog(code, d) {
  const s = seriesFor(code, -Infinity, Infinity);
  const pt = s.all.find((x) => x.d === d);
  if (!pt) return;
  const cat = s.m.cat;
  const corr = mem().corrections.filter((c) => c.refKey === `m:${code}:${d}`);
  openModal(`${s.m.name} · ${fmtD(d)}`,
    `<div class="card" style="margin-bottom:10px"><dl class="kv">
      <dt>数值</dt><dd><b class="nowrap-num">${esc(num(pt.v))}${s.m.unit ? ' ' + esc(s.m.unit) : ''}</b>${pt.note ? `<span class="small-note">（${esc(pt.note)}）</span>` : ''}</dd>
      <dt>来源</dt><dd>${esc(pt.src || '未记录')}</dd>
      <dt>机构</dt><dd>${esc(pt.org || '未记录')}</dd>
      <dt>测量日期</dt><dd class="nowrap-num">${esc(pt.d)}</dd>
      <dt>口径</dt><dd>${esc(s.m.note)}</dd>
      ${corr.length ? `<dt>更正历史</dt><dd>本条有 ${corr.length} 次更正（更正=新版本）</dd>` : ''}
    </dl></div>
    <p class="small-note">点击数据点回看原始来源；不同方法/机构不合并（${esc(DATA.meta.metricNote).slice(0, 40)}…）。</p>`,
    `${btn('更正这条记录', 'correct-measure', 'soft', `data-code="${esc(code)}" data-d="${esc(d)}"`)}<button data-action="close">关闭</button>`);
}
function railHtml() {
  const sel = state.sel[state.profileId] || []
  const rangeBtn = (id, label) => `<button data-action="range" data-range="${id}" aria-pressed="${state.range === id}">${label}</button>`
  const groups = CAT_ORDER.map((cat) => {
    const keys = Object.keys(CATALOG).filter((k) => CATALOG[k].cat === cat)
    const items = keys.map((k) => {
      const on = sel.includes(k)
      const last = lastOf(allMeasures(k))
      return `<button class="metric-check" data-action="sel-metric" data-code="${k}" aria-pressed="${on}"><span class="box" aria-hidden="true"></span><span class="dot" style="background:${CATALOG[k].color}"></span>${esc(CATALOG[k].name)}<span class="last">${last ? esc(num(last.v)) : '—'}</span></button>`
    }).join('')
    return `<div><h3>${esc(cat)}</h3>${items}</div>`
  }).join('')
  const layerBtn = (id, label) => `<button data-action="layer" data-layer="${id}" aria-pressed="${state.layer[id]}">${label}</button>`
  return `<aside class="rail" aria-label="一图秀控制栏">
    <div><h3>时间范围</h3><div class="chip-row">${rangeBtn('all', '全部')}${rangeBtn('3m', '近 3 月')}${rangeBtn('6m', '近 6 月')}${rangeBtn('12m', '近 12 月')}</div></div>
    <div><h3>选择指标 <span class="rail-hint">最多 4 个 · 已选 ${sel.length}</span></h3>${groups}<p class="chart-note">共 ${Object.keys(CATALOG).length} 项 · 点选后图表立即更新。</p></div>
    <div><h3>显示内容</h3><div class="chip-row">${layerBtn('screening', '筛查节点')}${layerBtn('surgery', '手术')}${layerBtn('injection', '注射（按月）')}</div></div>
    <p class="chart-note">${esc(DATA.meta.growthNote)}</p>
  </aside>`
}
function pageGrowthOverview() {
  const { svg, drawn, evs } = renderChart()
  const [t0, t1] = domain()
  const fmt = (t) => { const d = new Date(t); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}` }
  const privN = privateMeasureCount()
  const legend = drawn.map((sx) => `<span class="lg"><span class="dot" style="background:${sx.m.color}"></span>${esc(sx.m.name)} <b>${esc(num(sx.pts.at(-1).v))}</b>${sx.m.unit ? ' ' + esc(sx.m.unit) : ''} <span class="muted">全期 ${esc(num(sx.lo))}–${esc(num(sx.hi))}</span></span>`).join('') + (privN ? ` <span class="pill yellow">私密 ${privN} 条不含</span>` : '')
  const evLegend = ['手术', '筛查', '注射']
  const evOn = evLegend.filter((k) => state.layer[{ 手术: 'surgery', 筛查: 'screening', 注射: 'injection' }[k]])
  const pills = `<span class="pill green">${drawn.length} 个指标</span><span class="pill grey">仅已入库记录</span>`
  return `<div class="chart-layout">${railHtml()}
    <div class="chart-card">
      <div class="chart-head"><div><h2 class="chart-title">生长时间轴</h2><p class="chart-sub">${esc(fmt(t0))} — ${esc(fmt(t1))} · 全部已入库的演示记录（合成示例）</p></div><div class="chart-pills">${pills}</div></div>
      <div class="legend-line">${legend || '<span class="muted">未选指标</span>'}</div>
      ${svg}
      <p class="chart-note">↑ 每条线按该指标全部记录范围缩放（min–max），不代表不同指标数值可比；点曲线上的记录点，可查看数值、日期与来源。</p>
      <div class="ev-legend">${evOn.map((k) => `<span class="lg"><span class="sq ${k === '手术' ? 'sq-rose' : k === '筛查' ? 'sq-teal' : 'sq-amber'}"></span>${k}</span>`).join('') || '<span class="muted">事件层全部关闭</span>'} <span class="muted">· 共 ${evs.length} 个事件在带内</span></div>
      <div class="actions" style="margin-top:10px">${aiBtn('growth')}</div>
    </div>
  </div>`
}

/* ---------------- 指标卡（MT 组：真 3D 翻转，定高 194px；背面=最近几次迷你折线，小粉宝同款） ---------------- */
function sparkline(pts, color, dec) {
  const w = 220, h = 62, pad = 7
  const vals = pts.map((x) => x.v)
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || Math.max(Math.abs(hi) * .08, 1)
  const coords = pts.map((x, i) => ({ x: pad + i * (w - pad * 2) / Math.max(pts.length - 1, 1), y: h - 12 - (x.v - lo) / span * (h - 24) }))
  const path = pts.length > 1 ? smoothPath(coords) : ''
  const last = coords[coords.length - 1]
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="最近 ${pts.length} 次记录折线">
    <line class="base" x1="${pad}" x2="${w - pad}" y1="${h - 12}" y2="${h - 12}"/>
    ${path ? `<path class="sp-line" d="${path}" stroke="${color}" pathLength="1" fill="none"/>` : ''}
    ${coords.map((c, i) => `<circle class="sp-dot" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${i === coords.length - 1 ? 3.6 : 2.6}" fill="${color}"/>`).join('')}
    <text x="${Math.min(last.x, w - 24).toFixed(1)}" y="${Math.max(last.y - 8, 10).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${color}" font-weight="600">${esc(num(pts[pts.length - 1].v, dec))}</text>
  </svg>`
}
function mcard(code) {
  const m = CATALOG[code];
  const arr = allMeasures(code);
  const last = lastOf(arr), prev = prevOf(arr);
  const delta = last && prev && dOf(last.d) && dOf(prev.d) ? (last.v - prev.v) : null;
  const nCount = arr.length;
  const front = `<div class="mface">
    <div class="m-top"><span class="m-cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>${pill(m.unit ? m.unit : '口径待核', 'grey')}</div>
    <div class="m-name">${esc(m.name)}</div>
    <div class="m-value">${last ? esc(num(last.v, m.dec)) + (m.unit ? `<small>${esc(m.unit)}</small>` : '') : '<span style="font-size:15px;color:var(--muted);font-weight:500">暂无测量</span>'}</div>
    <div class="m-delta">${last ? (delta === null ? '首次记录，无「较上次」' : `较上次 ${delta > 0 ? '+' : ''}${esc(num(delta, m.dec))}${m.unit ? ' ' + esc(m.unit) : ''}（${esc(prev.d)} → ${esc(last.d)}）`) : '记录后会在这里显示'}</div>
    <div class="m-src"><span>${last ? `${esc(last.d)} · ${esc(last.src || '来源未记录')} · 共 ${nCount} 条` : '来源与机构在记录时填写'}</span><span class="hint">翻转 ↗</span></div>
  </div>`;
  const dated = arr.filter((x) => dOf(x.d))
  const back = dated.length > 1
    ? `<div class="mface back">
    <div class="m-top"><span class="m-cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>${pill('仅回顾 · 不解读', 'grey')}</div>
    <div class="m-name">${esc(m.name)} · 最近 ${dated.length} 次</div>
    ${sparkline(dated, m.color, m.dec)}
    <div class="spark-labels"><span>${esc(dated[0].d)}</span><span>${esc(dated[dated.length - 1].d)}</span></div>
    <div class="m-src">仅回顾已入库记录 · 再点一次翻回正面。</div>
  </div>`
    : `<div class="mface back">
    <div class="m-top"><span class="m-cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>${pill('仅回顾 · 不解读', 'grey')}</div>
    <div class="m-name">${esc(m.name)}</div>
    <p class="m-note" style="margin-top:8px">${dated.length === 1 ? '只有 1 次带日期的记录，暂不连线。再记录一次后显示趋势。' : '还没有带日期的记录，暂不连线。'}</p>
    <p class="m-note" style="margin-top:6px">${esc(m.note)}</p>
    <div class="m-src">再点一次翻回正面。</div>
  </div>`;
  return `<button class="mcard" data-action="flip" data-code="${code}" aria-pressed="false" aria-label="${esc(m.name)}指标卡，翻面看口径">
    <span class="mcard-inner">${front}${back}</span>
  </button>`;
}
function pageGrowthCards() {
  const cats = CAT_ORDER.map((cat) => {
    const keys = Object.keys(CATALOG).filter((k) => CATALOG[k].cat === cat);
    return section(cat, '最近值 · 较上次 · 来源（翻卡看口径；差值不写任何结论）', '', '指标卡') +
      `<div class="mcard-grid">${keys.map(mcard).join('')}</div>`;
  }).join('');
  return cats + `<div class="notice plain" style="margin-top:14px">「较上次」只并列两次测量的差值；<b>不暗示好坏</b>。不同方法/机构不合并（Q37 口径）。${aiBtn('growth', '和 AI 讨论')}</div>`;
}
function pageGrowthRecent() {
  const rows = CAT_KEYS().flatMap((code) => allMeasures(code).map((x) => ({ code, ...x })))
    .sort((a, b) => (b.d || '').localeCompare(a.d || ''));
  const ver = (x) => x._v && x._v > 1 ? ` <span class="pill yellow">v${x._v}（更正版）</span>` : (x._added ? pill('本次会话新增', 'green') : '');
  return head('最近测量', '原始值逐条并列；缺来源/机构如实显示「未记录」。', `${btn('＋ 记一次测量', 'form-measure', 'primary')}${aiBtn('growth')}`) +
    (rows.length ? `<div class="table-wrap"><table>
      <thead><tr><th>日期</th><th>指标</th><th class="num">数值</th><th>来源</th><th>机构</th><th></th></tr></thead>
      <tbody>${rows.map((r) => `<tr>
        <td class="nowrap-num">${esc(r.d)}${r.precision === 'unknown' ? ' ' + pill('日期未记', 'yellow') : ''}</td>
        <td>${esc(CATALOG[r.code].name)}</td>
        <td class="num">${esc(num(r.v, CATALOG[r.code].dec))}${CATALOG[r.code].unit ? ' ' + esc(CATALOG[r.code].unit) : ''}</td>
        <td>${esc(r.src || '未记录')}</td>
        <td>${esc(r.org || '未记录')}${r.visibility === 'private' ? ' ' + pill('私密', 'yellow') : ''}${r.org === null && r.src === '家庭自测' ? ' ' + pill('家庭自测', 'grey') : ''}</td>
        <td>${ver(r)}${dOf(r.d) ? btn('详情', 'point', 'text-button', `data-code="${esc(r.code)}" data-d="${esc(r.d)}"`) : ''}</td>
      </tr>`).join('')}</tbody></table><div class="scroll-hint">← 表格可横向滚动 →</div></div>`
      : emptyBox('还没有测量记录', '从「记一次测量」开始；家用软尺与门诊测量值并列保存，不合并。'))
    + `<p class="small-note" style="margin-top:10px">${esc(DATA.meta.metricNote)}</p>`;
}
function candRow(c) {
  const accepted = mem().acceptedCands.includes(c.id);
  return `<div class="cand-row"><div class="cand-main"><b style="font-size:13.5px">${esc(c.title)}</b>
    <dl class="kv" style="margin-top:6px">${c.fields.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <p class="small-note" style="margin-top:5px">来源：${esc(c.src)}</p></div>
    <div class="actions">${accepted ? pill('已核对入库', 'green') : btn('核对入库', 'accept-cand', 'primary', `data-cand="${esc(c.id)}"`)}</div>
    ${accepted ? '' : `<div class="actions">${btn('拒收', 'reject-cand', 'soft', `data-cand="${esc(c.id)}"`)}</div>`}
  </div>`;
}
function pageGrowthCands() {
  const cands = profile().candidates || [];
  return head('待核对', 'AI 与导入产出的候选逐项核对后入档；拒收零副作用，不写任何事实。', aiBtn('growth')) +
    (cands.length ? cands.map(candRow).join('<div style="height:10px"></div>') : emptyBox('暂无候选', '上传报告或使用 AI 协助后，候选会出现在这里。')) +
    `<div class="notice plain" style="margin-top:12px">核对后数据进入「最近测量」与一图秀；候选<b>不自动入库</b>。拒收不改变任何状态（IP5）。</div>`;
}
function pageGrowthDocs() {
  const docs = profile().docs || [];
  return head('报告档案', '报告原件与整理状态；无原件的条目如实标注「无原件」。', `${btn('＋ 登记报告', 'form-doc', 'primary')}${aiBtn('growth')}`) +
    `<div class="table-wrap"><table>
      <thead><tr><th>材料</th><th>日期</th><th>类型</th><th>整理状态</th><th>原件</th></tr></thead>
      <tbody>${docs.map((d) => `<tr><td>${esc(d.name)}</td><td class="nowrap-num">${esc(d.date)}</td><td>${esc(d.type)}</td><td>${d.status === '已入库' ? pill('已入库', 'green') : d.status === '已解析' ? pill('已解析', 'yellow') : pill('待核对', 'grey')}</td><td>${d.hasOriginal ? pill('有原件', 'green') : pill('无原件（据二次来源）', 'yellow')}</td></tr>`).join('')}</tbody>
    </table><div class="scroll-hint">← 表格可横向滚动 →</div></div>
    <p class="small-note" style="margin-top:10px">「无原件」的条目依据家长口述或照片二次来源整理；取得原件后可在设置 · 文档解析重新导入。</p>`;
}
function pageGrowth() {
  const sub = state.sub.growth || 'overview';
  const subnav = `<div class="subnav" role="tablist" aria-label="生长记录页内页签">${SUBPAGES.growth.map(([id, label]) => `<button role="tab" aria-current="${sub === id}" data-action="go" data-page="growth" data-sub="${id}">${label}</button>`).join('')}</div>`;
  const body = { overview: pageGrowthOverview, cards: pageGrowthCards, recent: pageGrowthRecent, cands: pageGrowthCands, docs: pageGrowthDocs }[sub]();
  return head('生长记录', GROWTH_TAB_DESC[sub], '') + subnav + body;
}

/* ---------------- 筛查台账 ---------------- */
function scrCard(cat) {
  const items = allScreenings(cat.id);
  return section(cat.label, '结果原文照抄；频次与项目以医生安排为准（不写建议）', `<span class="pill" style="background:${cat.color}1a;color:${cat.color}">共 ${items.length} 条</span>`, '筛查台账') +
    (items.length ? `<div class="table-wrap"><table>
      <thead><tr><th>日期</th><th>项目</th><th>结果（原文/原话照抄）</th><th>机构</th><th></th></tr></thead>
      <tbody>${items.map((s) => `<tr><td class="nowrap-num">${s.d ? esc(s.d) : pill('日期未记', 'yellow')}</td><td>${esc(s.item)}</td><td>${esc(s.result)}${s.docId ? ` ${btn('原件', 'doc', 'text-button', `data-doc="${esc(s.docId)}"`)}` : pill('无原件', 'grey')}</td><td>${esc(s.org || '未记录')}</td><td>${btn('详情', 'screening-detail', 'text-button', `data-cat="${esc(cat.id)}" data-d="${esc(s.d || '')}"`)}</td></tr>`).join('')}</tbody>
    </table><div class="scroll-hint">← 表格可横向滚动 →</div></div>`
      : emptyBox(`暂无「${cat.label}」记录`, '登记过筛查后这里会出现结果原文；该查什么、多久查一次，问随访医生。', `${btn('＋ 登记筛查结果', 'form-screening', 'primary', `data-cat="${esc(cat.id)}"`)}${go('回到看板', 'dash', '', 'soft')}`));
}
function pageScreeningLedger() {
  return head('筛查台账', '按类别分区的筛查结果；只并列原文，不做风险评分或转诊建议。', `${btn('＋ 登记筛查结果', 'form-screening', 'primary')}${aiBtn('screening')}`) + SCREEN_CATS.map(scrCard).join('');
}
function pageScreeningRhythm() {
  const p = profile();
  const rows = SCREEN_CATS.map((c) => {
    const items = allScreenings(c.id);
    const last = items.filter((x) => x.d).sort((a, b) => b.d.localeCompare(a.d))[0];
    return `<tr><td>${esc(c.label)}</td><td>${last ? esc(last.d) : '—'}</td><td>${last ? esc(last.org || '未记录') : '—'}</td><td>${items.length ? '下次安排问医生（原话见台账）' : '尚未查过 · 可问医生是否需要'}</td></tr>`;
  }).join('');
  return head('随访节律清单', '把每类筛查的最近一次与机构并列；频次类信息一律以医生安排为准，本台不写间隔数字。', aiBtn('screening')) +
    `<div class="notice">清单只回答「上次查了什么、在哪查的」；「下次该查什么」<b>请以随访医生的安排为准</b>（${esc(DATA.meta.screenNote)}）。</div>
    <div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>类别</th><th>最近一次</th><th>机构</th><th>下次</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="actions" style="margin-top:12px">${btn('把想问的加进待问清单', 'rhythm-to-questions', 'primary')}${go('去筛查台账', 'screening', 'ledger', 'soft')}</div>`;
}
function pageScreening() {
  const sub = state.sub.screening || 'ledger';
  const subnav = `<div class="subnav">${SUBPAGES.screening.map(([id, label]) => `<button aria-current="${sub === id}" data-action="go" data-page="screening" data-sub="${id}">${label}</button>`).join('')}</div>`;
  return subnav + (sub === 'ledger' ? pageScreeningLedger() : pageScreeningRhythm());
}

/* ---------------- 事件档案（时间线泳道 + 折叠卡） ---------------- */
function pageEventsTimeline() {
  const p = profile();
  const rows = [
    ...(p.dx?.timeline || []).map((t) => ({ d: t.d, kind: '诊断/评估', color: '#2f6b40', label: t.item, src: t.src })),
    ...allScreenings('hearing').map((s) => ({ d: s.d, kind: '筛查·听力', color: '#2f7d6b', label: `${s.item}：${s.result}` })),
    ...allScreenings('sleep').map((s) => ({ d: s.d, kind: '筛查·睡眠', color: '#7c6aae', label: `${s.item}：${s.result}` })),
    ...allScreenings('craniocervical').map((s) => ({ d: s.d, kind: '筛查·颅颈', color: '#b06a28', label: `${s.item}` })),
    ...allSurgeries().map((s) => ({ d: s.d, kind: '手术', color: '#a2372a', label: s.name, src: '医生原话见手术档案' })),
    ...(p.events?.meds || []).filter((m) => m.start).map((m) => ({ d: m.start, kind: '用药开始', color: '#b06a28', label: `${m.drug}：${m.status}` }))
  ].filter((r) => dOf(r.d)).sort((a, b) => a.d.localeCompare(b.d));
  return head('时间线', '按日期并列发生过的评估、筛查、手术与用药开始；缺日期的记录不入时间线（如实留白）。', `${aiBtn('events')}`) +
    (rows.length ? `<div class="table-wrap"><table><thead><tr><th>日期</th><th>类型</th><th>内容</th><th>来源</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td class="nowrap-num">${esc(r.d)}</td><td><span class="pill" style="background:${r.color}1a;color:${r.color}">${esc(r.kind)}</span></td><td>${esc(r.label)}</td><td>${esc(r.src || '—')}</td></tr>`).join('')}
    </tbody></table><div class="scroll-hint">← 表格可横向滚动 →</div></div>` : emptyBox('暂无带日期的事件', '录入手术或用药开始后自动出现在时间线。')) +
    `<p class="small-note" style="margin-top:10px">时间线只列已发生事实；「未来安排」在随访节律清单里，且以医生安排为准。</p>`;
}
function pageEventsSurgeries() {
  const list = allSurgeries();
  return head('手术档案', '一次手术一张折叠卡；医生原话照抄；更正=新增版本，不覆盖历史。', `${btn('＋ 登记手术', 'form-surgery', 'primary')}${aiBtn('events')}`) +
    (list.length ? list.map((s) => `
      <details class="phase-fold" ${state.pin === 's-' + s.id ? 'open' : ''}><summary>${esc(s.name)} · <span class="nowrap-num">${esc(s.d)}</span>${s.version > 1 ? ` ${pill('v' + s.version, 'yellow')}` : ''}</summary>
        <div class="fold-body"><dl class="kv">
          <dt>日期</dt><dd class="nowrap-num">${esc(s.d)}</dd>
          <dt>机构</dt><dd>${esc(s.org || '未记录')}</dd>
          <dt>医生原话</dt><dd>${esc(s.doctorQuote || '未记录')}</dd>
        </dl>
        <div class="actions" style="margin-top:10px">${btn('更正（新增版本）', 'correct-surgery', 'soft', `data-id="${esc(s.id)}" data-name="${esc(s.name)}" data-d="${esc(s.d)}" data-org="${esc(s.org || '')}" data-quote="${esc(s.doctorQuote || '')}" data-v="${s.version || 1}"`)}${btn('查看历史版本', 'surgery-history', 'text-button', `data-id="${esc(s.id)}"`)}</div>
        </div></details>`).join('')
      : emptyBox('没有手术记录', '档案 A（刚确诊）还没有手术事件；做过手术后在这里登记。', `${btn('＋ 登记手术', 'form-surgery', 'primary')}${go('回到看板', 'dash', '', 'soft')}`)) +
    `<p class="small-note" style="margin-top:10px">本台只登记名词与日期，不写手术指征与建议；${esc(DATA.meta.screenNote)}</p>`;
}
function pageEventsMeds() {
  const p = profile();
  const med = (p.events?.meds || [])[0];
  const inj = allInjections();
  const doneN = inj.filter((i) => i.done === '已注射').length;
  return head('注射与用药', '每日注射按日记录「执行情况与孩子配合度」；本台不指导用药，方案以医嘱为准。', `${btn('＋ 记注射', 'form-injection', 'primary')}${aiBtn('events')}`) +
    (med ? `<div class="card"><h3>${esc(med.drug)}</h3><p class="small-note" style="margin-top:4px">${esc(med.status)} · ${esc(med.note)}</p>
      <p class="small-note" style="margin-top:4px">近 10 次记录：已注射 <b class="nowrap-num">${doneN}</b> / ${inj.length}（漏记不回填，如实并列）</p></div>` : `<div class="card"><h3>用药状态</h3><p class="small-note" style="margin-top:4px">${esc((p.events?.meds || [])[0]?.status || '未开始用药；是否用药由医生评估（本台不推荐）。')}</p></div>`) +
    `<div class="notice" style="margin-top:12px">「配合度」只是家长的日常记录，不构成依从性评价。</div>` +
    (inj.length ? `<div class="table-wrap" style="margin-top:12px"><table><thead><tr><th>日期</th><th>执行</th><th>配合度（家长原话）</th><th>备注</th></tr></thead><tbody>
      ${inj.slice().sort((a, b) => b.d.localeCompare(a.d)).map((i) => `<tr><td class="nowrap-num">${esc(i.d)}</td><td>${i.done === '已注射' ? pill('已注射', 'green') : pill('漏记', 'yellow')}</td><td>${esc(i.cooperation || '未记录')}</td><td>${esc(i.note || '—')}</td></tr>`).join('')}
    </tbody></table></div>` : emptyBox('还没有注射记录', '开始用药后按日记录；漏记如实标「漏记」，不回填。')) ;
}
function pageEvents() {
  const sub = state.sub.events || 'timeline';
  const subnav = `<div class="subnav">${SUBPAGES.events.map(([id, label]) => `<button aria-current="${sub === id}" data-action="go" data-page="events" data-sub="${id}">${label}</button>`).join('')}</div>`;
  const body = { timeline: pageEventsTimeline, surgeries: pageEventsSurgeries, meds: pageEventsMeds }[sub]();
  return subnav + body;
}

/* ---------------- 就诊准备（资料包 A 组整页视图 + 待问清单） ---------------- */
function buildPackMarkdown() {
  const p = profile();
  const fam = p.family?.notes || [];
  const privN = privateCount(fam);
  const L = [];
  L.push(`# ${p.name} 复诊资料包（家长代记 · 合成演示）`);
  L.push('');
  L.push(`- 孩子年龄：${p.age}（${CARE_LABEL[p.careRole]}）`);
  L.push(`- 生成时间：${TODAY}`);
  L.push('- 口径：仅回顾不解读；不同方法/机构不合并；判读归医生。');
  L.push('');
  L.push('## 最近生长（原始值）');
  CAT_KEYS().forEach((code) => {
    const arr = allMeasures(code);
    if (!arr.length) return;
    L.push(`- ${CATALOG[code].name}：${arr.filter((x) => x.d).slice(-3).map((x) => `${x.d} ${num(x.v)}${CATALOG[code].unit || ''}（${x.src || '来源未记录'}）`).join('；')}`);
  });
  L.push('');
  L.push('## 筛查台账（结果原文）');
  SCREEN_CATS.forEach((c) => {
    const items = allScreenings(c.id);
    if (!items.length) return;
    L.push(`### ${c.label}`);
    items.forEach((s) => L.push(`- ${s.d || '（日期未记）'} ${s.item}：${s.result}（${s.org || '机构未记录'}）`));
  });
  L.push('');
  L.push('## 手术与用药');
  allSurgeries().forEach((s) => L.push(`- ${s.d} ${s.name}（${s.org || ''}）医生原话：${s.doctorQuote || '未记录'}`));
  const med = (p.events?.meds || [])[0];
  if (med) L.push(`- ${med.drug}：${med.status}`);
  const injN = allInjections().filter((i) => i.done === '已注射').length;
  if (injN) L.push(`- 近期注射记录 ${injN} 次已注射（明细见工作台）`);
  L.push('');
  L.push('## 待问清单');
  allQuestions().forEach((q) => L.push(`- [${q.asked ? 'x' : ' '}] ${q.q}`));
  L.push('');
  L.push(`家庭沟通记录 ${fam.length} 条中私密 ${privN} 条，不包含在本导出内（三出口同一过滤）。`);
  return L.join('\n');
}
function openPackPreview() { /* 整页视图（A 组） */
  const md = buildPackMarkdown();
  openPageView('pv-pack', '就诊准备 · 资料包预览', `
    <div class="notice plain">导出前预览。私密记录已按三出口规则排除；文件含<b>家长代记</b>标记（R3 隐私要求）。</div>
    <pre style="white-space:pre-wrap;font:12.5px/1.7 ui-monospace,Menlo,monospace;background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin-top:12px">${esc(md)}</pre>
    <div class="actions" style="margin-top:14px">${btn('⬇ 下载 .md', 'export-pack', 'primary')}${aiBtn('visit', 'AI 协助生成口头版')}</div>`);
}
function pageVisitPack() {
  const p = profile();
  const scrCount = SCREEN_CATS.reduce((n, c) => n + allScreenings(c.id).length, 0);
  return head('资料包', '把生长、筛查、手术用药、待问清单汇总成一页：屏幕预览、可导出、可带回诊室。', `${btn('生成资料包预览', 'pack-preview', 'primary')}${aiBtn('visit')}`) +
    `<div class="grid two">
      <div class="card"><h3>包里有什么</h3><dl class="kv" style="margin-top:8px">
        <dt>生长测量</dt><dd class="nowrap-num">${allMeasures('HEIGHT').length + allMeasures('WEIGHT').length + allMeasures('HEAD').length + allMeasures('BMIW').length} 条（最近 3 次入包）</dd>
        <dt>筛查结果</dt><dd class="nowrap-num">${scrCount} 条（全部入包）</dd>
        <dt>手术/用药</dt><dd class="nowrap-num">${allSurgeries().length} 台 + 当前用药 1 条</dd>
        <dt>待问清单</dt><dd class="nowrap-num">${allQuestions().length} 条（${allQuestions().filter((q) => q.asked).length} 已问）</dd>
        <dt>私密</dt><dd class="nowrap-num">家庭记录 ${(p.family?.notes || []).length} 条中私密 ${privateCount(p.family?.notes || [])} 条 · 不入包</dd>
      </dl></div>
      <div class="card"><h3>怎么用</h3><p class="small-note" style="margin-top:6px">1. 复诊前点「生成资料包预览」整页检查；2. 需要时下载 .md 或截图；3. 报告原件另带。口头版可用「AI 协助」起草（候选需核对）。</p>
      <p class="small-note" style="margin-top:6px">${esc(DATA.meta.privateNote)}</p></div>
    </div>` + hospitalsBlock();
}
function hospitalsBlock() {
  const base = profile().hospitals || [];
  const list = [...base, ...(mem().hospitals || [])];
  return `<div class="section-title"><div><span class="eyebrow">就医信息</span><h2>就诊医院（支持多家）</h2><p>逐条卡片；联系方式可填电话或「见病历出处」；更正=新增版本，旧版本可查。</p></div>${btn('＋ 登记医院', 'form-hospital', 'primary')}</div>
    ${list.length ? `<div class="grid two">${list.map((h, i) => `<div class="card"><h3>${esc(h.name)}</h3><dl class="kv" style="margin-top:6px"><dt>科室</dt><dd>${esc(h.dept || '未记录')}</dd><dt>联系</dt><dd>${esc(h.contact || '见病历出处')}</dd><dt>版本</dt><dd>v${h.version || 1}${h.version > 1 ? '（更正=新版本）' : ''}</dd></dl>
      <div class="actions" style="margin-top:8px">${btn('修改（新增版本）', 'correct-hospital', 'soft', `data-i="${i}" data-name="${esc(h.name)}" data-dept="${esc(h.dept || '')}" data-contact="${esc(h.contact || '')}"`)}${btn('查看历史', 'hospital-history', 'text-button', `data-name="${esc(h.name)}" data-dept="${esc(h.dept || '')}"`)}</div></div>`).join('')}</div>` : emptyBox('还没有登记医院', '把常去的医院与科室记下来，复诊安排不乱。', btn('＋ 登记医院', 'form-hospital', 'primary'))}`;
}
function pageVisitQuestions() {
  const qs = allQuestions();
  const fam = profile().family?.notes || []
  return head('待问清单', '复诊想问的问题逐条勾选；问过的保留记录不删除。', `${btn('＋ 加一条', 'form-question', 'primary')}${aiBtn('visit')}`) +
    (qs.length ? `<div class="table-wrap"><table><thead><tr><th>问题</th><th>状态</th><th></th></tr></thead><tbody>
      ${qs.map((q, i) => `<tr><td>${esc(q.q)}</td><td>${q.asked ? pill('已问', 'green') : pill('未问', 'grey')}</td><td>${btn(q.asked ? '标回未问' : '标为已问', 'toggle-question', 'text-button', `data-i="${i}"`)}</td></tr>`).join('')}
    </tbody></table></div>` : emptyBox('还没有想问的', '把复查前想到的问题记下来；AI 可以帮你起草（候选需核对）。', `${btn('＋ 加一条', 'form-question', 'primary')}`)) +
    `<div class="section-title"><div><span class="eyebrow">家庭记录</span><h2>家庭沟通记录</h2><p>默认私密：不进看板摘要预览、导出与 AI 上下文（三出口同一过滤）。</p></div>${btn('＋ 记一条家庭沟通', 'form-family', 'primary')}</div>` +
    (fam.length ? `<div class="grid two">${fam.map((n) => `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><b style="font-size:13.5px">${esc(n.item)}</b>${pill('私密', 'yellow')}</div><p class="small-note" style="margin-top:4px">${n.d ? esc(n.d) : '日期未记'}</p></div>`).join('')}</div>` : emptyBox('还没有家庭沟通记录', '和学校、长辈、亲戚的沟通经过都可以记在这里；默认仅本机可见。', btn('＋ 记一条家庭沟通', 'form-family', 'primary')));
}
function pageVisit() {
  const sub = state.sub.visit || 'pack';
  const subnav = `<div class="subnav">${SUBPAGES.visit.map(([id, label]) => `<button aria-current="${sub === id}" data-action="go" data-page="visit" data-sub="${id}">${label}</button>`).join('')}</div>`;
  const body = sub === 'pack' ? pageVisitPack() : pageVisitQuestions();
  return body + subnav;
}

/* ---------------- 临床试验（35 号四段链路；E 组红线） ---------------- */
function ageMonthsOf(p) { /* 从档案 ageLabel 解析（27 月龄 / 80 月龄），防数据改动后判据失真 */
  const m = String(p.ageLabel || '').match(/(\d+)\s*月龄/);
  return m ? Number(m[1]) : null;
}
function trialCriteria(t) {
  const p = profile();
  const ageMonths = ageMonthsOf(p);
  const ageYears = ageMonths === null ? NaN : ageMonths / 12;
  const rows = [];
  rows.push({ cat: '诊断', hard: true, ok: true, mine: '确诊档案：FGFR3 c.1138G>A（基因报告 2026-08-01，演示）', req: t.requiresDiagnosis });
  const ageOk = ageYears >= t.ageMin && ageYears <= t.ageMax;
  rows.push({ cat: '年龄段', hard: true, ok: ageOk, mine: `当前 ${p.age}（${ageMonths} 月龄）`, req: `${t.ageMin}–${t.ageMax} 岁` });
  if (t.needsOpenEpiphysis) rows.push({ cat: '骨骺状态', hard: true, ok: null, mine: '档案未记录骨骺闭合状态', req: '骨骺未闭合（以检查为准）' });
  if (t.ambulatory) rows.push({ cat: '活动能力', hard: false, ok: null, mine: '档案未记录步态评估', req: '可独立行走' });
  return rows;
}
function pageTrialMatch() {
  const trials = DATA.trials || [];
  const cards = trials.map((t) => {
    const rows = trialCriteria(t);
    const definite = rows.filter((r) => r.ok !== null);
    const okN = definite.filter((r) => r.ok).length;
    const pendN = rows.filter((r) => r.ok === null).length;
    const m = definite.length;
    const hasEnough = m >= 2; /* E7③：可对照项不足 2 条不给百分数 */
    const pct = hasEnough ? Math.round((okN / m) * 100) : null;
    const bad = rows.filter((r) => r.ok === false).concat(rows.filter((r) => r.ok === null));
    const rest = rows.filter((r) => r.ok === true);
    const evRow = (r) => `<div style="display:flex;gap:8px;padding:7px 0;border-top:1px dashed var(--line);font-size:12.5px">
      <span style="flex:0 0 18px;text-align:center">${r.ok === true ? '<b style="color:var(--ok)">✓</b>' : r.ok === false ? '<b style="color:var(--danger)">✕</b>' : '<b style="color:var(--warn)">?</b>'}</span>
      <span style="flex:0 0 64px;color:var(--muted)">${esc(r.cat)}${r.hard ? ' ·硬性' : ''}</span>
      <span style="flex:1;min-width:0">记录里是：${esc(r.mine)}<br>条件要求：${esc(r.req)}</span></div>`;
    return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 96px;text-align:center;background:var(--sprout-soft);border-radius:12px;padding:10px 6px">
          <div style="font-size:26px;font-weight:700;color:var(--sprout-deep)">${pct === null ? '—' : pct + '%'}</div>
          <div style="font-size:10.5px;color:var(--muted)">登记字段符合度</div>
          <div style="font-size:11px;margin-top:4px;color:var(--ink-2)"><b>${okN} / ${m}</b> 项对得上<br>· ${pendN} 项待确认</div>
          ${pct === null ? '<div style="font-size:10px;color:var(--warn);margin-top:3px">可对照项不足 2 条，不给百分数</div>' : ''}
        </div>
        <div style="flex:1;min-width:240px">
          <b style="font-size:14px">${esc(t.title)}</b>
          <p class="small-note" style="margin-top:4px">${esc(t.nctLike)} · ${esc(t.phase)} · ${esc(t.status)} · ${esc(t.sponsor)} · ${t.sites} 家中心</p>
          <p class="small-note" style="margin-top:2px">候选池口径：本页示例 ${trials.length} 项（虚构示例快照，不是全库扫描）。</p>
          <div class="actions" style="margin-top:8px">${btn('看逐条判据', 'trial-detail', 'soft', `data-key="${esc(t.key)}"`)}</div>
        </div>
      </div>
      <details class="phase-fold" style="margin-top:10px"><summary>判据（先看不符合与待确认 ${bad.length} 条）</summary>
        <div class="fold-body">${bad.map(evRow).join('')}${rest.length ? `<details style="margin-top:6px"><summary style="cursor:pointer;font-size:12px;color:var(--muted)">符合 ${rest.length} 条（折叠）</summary>${rest.map(evRow).join('')}</details>` : ''}</div>
      </details>
    </div>`;
  }).join('');
  const ageM = ageMonthsOf(profile());
  const fields = [
    ['诊断', '确诊档案：基因报告 2026-08-01（已核对入库）', '已入库'],
    ['年龄段', `档案属性：${esc(profile().age)}（${ageM === null ? '未记录' : ageM + ' 月龄'}）`, '已入库'],
    ['骨骺状态', '未记录（待确认；对照需以检查为准）', '未记录'],
    ['活动能力（部分登记需要）', '未记录步态评估', '未记录']
  ];
  const prefs = ['优先「招募中」', '优先离家近的中心'];
  const hardPills = (rows) => rows.filter((r) => r.hard).map((r) => `<span class="pill ${r.ok === true ? 'green' : r.ok === false ? 'rose' : 'yellow'}">${r.ok === true ? '✓' : r.ok === false ? '✕' : '?'} ${esc(r.cat)}</span>`).join(' ');
  const cards2 = trials.map((t) => {
    const rows = trialCriteria(t);
    const definite = rows.filter((r) => r.ok !== null);
    const okN = definite.filter((r) => r.ok).length;
    const pendN = rows.filter((r) => r.ok === null).length;
    const m = definite.length;
    const hasEnough = m >= 2; /* E7③：可对照项不足 2 条不给百分数 */
    const pct = hasEnough ? Math.round((okN / m) * 100) : null;
    const bad = rows.filter((r) => r.ok === false).concat(rows.filter((r) => r.ok === null));
    const rest = rows.filter((r) => r.ok === true);
    const evRow = (r) => `<div style="display:flex;gap:8px;padding:7px 0;border-top:1px dashed var(--line);font-size:12.5px">
      <span style="flex:0 0 18px;text-align:center">${r.ok === true ? '<b style="color:var(--ok)">✓</b>' : r.ok === false ? '<b style="color:var(--danger)">✕</b>' : '<b style="color:var(--warn)">?</b>'}</span>
      <span style="flex:0 0 64px;color:var(--muted)">${esc(r.cat)}${r.hard ? ' ·硬性' : ''}</span>
      <span style="flex:1;min-width:0">记录里是：${esc(r.mine)}<br>条件要求：${esc(r.req)}</span></div>`;
    return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
        <div style="flex:0 0 96px;text-align:center;background:var(--sprout-soft);border-radius:12px;padding:10px 6px">
          <div style="font-size:26px;font-weight:700;color:var(--sprout-deep)">${pct === null ? '—' : pct + '%'}</div>
          <div style="font-size:10.5px;color:var(--muted)">登记字段符合度</div>
          <div style="font-size:11px;margin-top:4px;color:var(--ink-2)"><b>${okN} / ${m}</b> 项对得上<br>· ${pendN} 项待确认</div>
          ${pct === null ? '<div style="font-size:10px;color:var(--warn);margin-top:3px">可对照项不足 2 条，不给百分数</div>' : ''}
        </div>
        <div style="flex:1;min-width:240px">
          <b style="font-size:14px">${esc(t.title)}</b>
          <p class="small-note" style="margin-top:4px">${esc(t.nctLike)} · ${esc(t.phase)} · ${esc(t.status)} · ${esc(t.sponsor)} · ${t.sites} 家中心</p>
          <p class="small-note" style="margin-top:2px">候选池口径：本页示例 ${trials.length} 项（虚构示例快照，不是全库扫描）。</p>
          <div class="actions" style="margin-top:8px">${btn('看逐条判据', 'trial-detail', 'soft', `data-key="${esc(t.key)}"`)}</div>
        </div>
        <div style="flex:0 0 132px;display:flex;flex-direction:column;gap:5px;align-items:flex-start"><span class="small-note">硬性条件</span>${hardPills(rows) || '<span class="small-note">—</span>'}</div>
      </div>
      <details class="phase-fold" style="margin-top:10px"><summary>判据（先看不符合与待确认 ${bad.length} 条）</summary>
        <div class="fold-body">${bad.map(evRow).join('')}${rest.length ? `<details style="margin-top:6px"><summary style="cursor:pointer;font-size:12px;color:var(--muted)">符合 ${rest.length} 条（折叠）</summary>${rest.map(evRow).join('')}</details>` : ''}</div>
      </details>
    </div>`;
  }).join('');
  return head('匹配', '「我这份档案，哪些登记能对上？」——只有已核对入档的字段参与对照；未核对候选不参与。', aiBtn('trial')) +
    `<div class="card"><h3>档案字段网格（参与对照的字段）</h3>
      <div class="grid four" style="margin-top:10px">${fields.map(([k, v, st]) => `<div class="card" style="padding:10px 12px"><b style="font-size:12.5px">${esc(k)}</b><p class="small-note" style="margin-top:3px">${esc(v)}</p>${st === '已入库' ? pill('已核对入库', 'green') : pill('未记录（不参与）', 'yellow')}</div>`).join('')}</div>
      <p class="small-note" style="margin-top:8px"><b>药物靶点不进对照</b>——「药打哪里」与你的检测条件是两回事（靶点在详情浮窗单列展示）。</p></div>
    <div class="card" style="margin-top:10px"><h3>偏好（只影响排序）</h3><div class="chip-row" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${prefs.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div><p class="small-note" style="margin-top:6px">偏好不改变对不对得上的判断，只改变卡片排列顺序。</p></div>
    <p class="small-note" style="margin-top:8px">${esc(DATA.meta.trialNote)}</p>
    <div style="margin-top:12px">${cards2}</div>`;
}
function pageTrialSearch() {
  const f = state.trialFilter;
  const items = (DATA.trials || []).filter((t) => (!f.q || (t.title + t.nctLike + t.sponsor).includes(f.q)) && (f.status === 'all' || t.status === f.status) && (f.phase === 'all' || t.phase === f.phase) && (f.region === 'all' || !f.region || (t.region || '国际多中心') === f.region))
    .sort((a, b) => f.sort === 'status' ? a.status.localeCompare(b.status) : f.sort === 'phase' ? a.phase.localeCompare(b.phase) : a.title.localeCompare(b.title));
  return head('检索', '「我要找某个方向/状态/期别」——按你选的条件排列，不掺任何分数。', aiBtn('trial')) +
    `<div class="card"><div class="form-grid" style="grid-template-columns:1fr 1fr 1fr auto;align-items:end">
      <label>关键词<input data-trial-q value="${esc(f.q)}" placeholder="方向 / 申办方 / 编号"></label>
      <label>状态<select data-trial-status><option value="all">全部</option><option value="招募中">招募中</option><option value="进行中·不再招募">进行中·不再招募</option></select></label>
      <label>阶段<select data-trial-phase><option value="all">全部</option><option value="III 期">III 期</option><option value="II 期">II 期</option><option value="观察性">观察性</option></select></label>
      <label>地区<select data-trial-region><option value="all">全部</option><option value="中国">中国</option><option value="国际多中心">国际多中心</option></select></label>
      <label>排序<select data-trial-sort><option value="status">按状态</option><option value="phase">按期别</option><option value="title">按标题</option></select></label>
      <button data-action="trial-apply" class="primary">按条件检索</button>
    </div><p class="small-note" style="margin-top:8px">双通道：本机快照（虚构示例）+ 在线登记（原型未接入；FAILED 时如实显示「未查过」）。</p></div>
    <div style="margin-top:12px">${items.length ? items.map((t) => `<div class="cand-row"><div class="cand-main"><b>${esc(t.title)}</b><p class="small-note" style="margin-top:3px">${esc(t.nctLike)} · ${esc(t.phase)} · ${esc(t.status)} · ${esc(t.sponsor)} · ${t.sites} 家中心</p></div><div class="actions">${btn('详情', 'trial-detail', 'soft', `data-key="${esc(t.key)}"`)}</div></div>`).join('<div style="height:8px"></div>') : emptyBox('没有符合条件的结果', '试试放宽关键词或状态；在线通道未接入时本页只查本地快照。')}</div>
    <p class="small-note" style="margin-top:10px">登记状态一律「未核实」；快照日期 ${esc(DATA.snapshot.date)}，快照会过期。</p>`;
}
function pageTrialSaved() {
  const saved = mem().savedTrials;
  return head('收藏与跟踪', '「我留了哪些，各自到哪一步」——只存本机；没有状态变化时间线就明写「没有」。', aiBtn('trial')) +
    (saved.length ? saved.map((s) => {
      const t = (DATA.trials || []).find((x) => x.key === s.key);
      if (!t) return '';
      return `<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center">
        <div><b>${esc(t.title)}</b><p class="small-note" style="margin-top:3px">收藏于 ${esc(s.savedOn)} · 登记状态：${esc(t.status)}（未核实）</p>
        <p class="small-note">本快照没有登记状态变化时间线——不画假进度条。</p></div>
        <div class="actions"><label style="font-size:12px">跟进状态
          <select data-saved-state data-key="${esc(s.key)}" style="margin-top:4px"><option ${s.state === '在跟' ? 'selected' : ''}>在跟</option><option ${s.state === '准备问' ? 'selected' : ''}>准备问</option><option ${s.state === '已归档' ? 'selected' : ''}>已归档</option></select></label>
        ${btn('移出收藏', 'trial-unsave', 'soft', `data-key="${esc(s.key)}"`)}</div></div></div>`;
    }).join('') : emptyBox('还没有收藏', '在「匹配」或「检索」里把感兴趣的登记收进来；收藏只存在本机。', go('去匹配', 'trial', 'match', 'primary'))) ;
}
/* E5：详情是右侧浮窗（非居中弹窗）：遮罩 / ✕ / Esc 三个关闭口；不改 hash、不进导航栈；关闭焦点回触发卡 */
let trialPaneTrigger = null;
function trialDetailPane(key) {
  const t = (DATA.trials || []).find((x) => x.key === key);
  if (!t) return;
  trialPaneTrigger = document.activeElement;
  const rows = trialCriteria(t);
  const saved = mem().savedTrials.some((s) => s.key === key);
  $('.trial-mask')?.remove();
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="trial-mask" data-tp="mask"></div><aside class="trial-pane" role="dialog" aria-modal="true" aria-label="登记详情：${esc(t.title)}">
    <div class="tp-head"><b>${esc(t.title)}</b><button class="icon-button" data-tp="close" aria-label="关闭详情浮窗">×</button></div>
    <div class="tp-body">
      <div class="notice plain">分数与声明：登记字段符合度只按已入档字段对照，<b>不是入选概率、不是入组资格</b>；登记状态「未核实」。</div>
      <div class="card" style="margin-top:10px"><dl class="kv">
        <dt>登记编号</dt><dd>${esc(t.nctLike)}</dd><dt>期别/状态</dt><dd>${esc(t.phase)} · ${esc(t.status)}</dd>
        <dt>申办方</dt><dd>${esc(t.sponsor)}</dd><dt>中心数</dt><dd class="nowrap-num">${t.sites}</dd>
        <dt>年龄要求</dt><dd class="nowrap-num">${t.ageMin}–${t.ageMax} 岁</dd>
      </dl></div>
      <div class="card" style="margin-top:10px"><b style="font-size:13px">判据逐条（先看不符合与待确认）</b>
        ${rows.slice().sort((a, b) => (a.ok === true) - (b.ok === true)).map((r) => `<div class="kv" style="border-top:1px dashed var(--line);padding-top:8px;margin-top:8px"><dt>${r.ok === true ? '✓' : r.ok === false ? '✕' : '?'} ${esc(r.cat)}${r.hard ? '（硬性）' : ''}</dt><dd>记录里是：${esc(r.mine)}<br>条件要求：${esc(r.req)}</dd></div>`).join('')}
      </div>
      <div class="card" style="margin-top:10px"><b style="font-size:13px">研究药物/方向（不进对照分母）</b><p class="small-note" style="margin-top:4px">靶点是「药打哪里」，与你的检测条件是两回事；是否相关由医生与研究中心判断。</p></div>
      <div class="notice danger" style="margin-top:10px">本机快照只存登记的结构化字段，<b>入排标准请到官方登记页核对</b>。</div>
      <p class="small-note" style="margin-top:8px">快照日期 ${esc(DATA.snapshot.date)}（${esc(DATA.snapshot.source)}）· 快照会过期。</p>
    </div>
    <div class="tp-foot">${saved ? pill('已收藏', 'green') : btn('收藏（只存本机）', 'trial-save', 'primary', `data-key="${esc(key)}"`)}</div>
  </aside>`;
  document.body.appendChild(wrap);
  const pane = wrap.querySelector('.trial-pane');
  const close = () => { wrap.remove(); const tr = trialPaneTrigger; trialPaneTrigger = null; if (tr && document.contains(tr)) tr.focus(); };
  wrap.querySelector('[data-tp="close"]').addEventListener('click', close);
  wrap.querySelector('[data-tp="mask"]').addEventListener('click', close);
  pane.setAttribute('tabindex', '-1'); pane.focus();
  wrap._close = close;
}

/* ---------------- 设置（三 Tab：工作区 / 文档解析 / 临床数据库） ---------------- */
const CFG_TABS = [
  { id: 'ws', label: '工作区' },
  { id: 'mineru', label: '文档解析（MinerU）' },
  { id: 'clinic', label: '临床数据库' }
];
/* 设置弹窗的状态在切换 tab 间保持（C1：切换互不丢状态） */
const cfgState = { tab: 'ws', consent: false };
function settingsBody(tab) {
  if (tab === 'ws') return `<div class="card"><h3>业务资料根目录（示意）</h3><p class="small-note" style="margin-top:4px">示意值：~/<b>由 DSH 宿主指定</b>/achondroplasia（装机后由宿主按 slug 隔离）</p>
    <div class="actions" style="margin-top:8px">${btn('更改位置（装机后可用）', 'noop-disabled', 'soft', 'disabled')} </div>
    <div class="grid three" style="margin-top:12px">
      <div class="card"><h3>原件</h3><p class="small-note">2.1 GB（示意）</p></div>
      <div class="card"><h3>派生数据</h3><p class="small-note">18 MB（示意）</p></div>
      <div class="card"><h3>数据库</h3><p class="small-note">6.4 MB（示意）</p></div>
    </div>
    <p class="small-note" style="margin-top:10px">口径：资料目录<b>拒绝主目录/桌面/下载根</b>；备份与恢复行装机后可用。</p></div>`;
  if (tab === 'mineru') return `<div class="notice">未勾选同意前：<b>不会上传、不会调用</b>任何解析服务。</div>
    <div class="card" style="margin-top:10px"><label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" style="width:auto;margin-top:3px" data-mu-consent ${cfgState.consent ? 'checked' : ''}>我已了解：勾选并保存<b>仅在本机记录同意状态，不联网</b>（本仓未接入 MinerU）。</label>
    <div class="form-grid" style="margin-top:10px"><label>API Token（掩码，只显后 4 位）<input value="••••••••••••ab3f" disabled></label>
    <label>替换 Token（未勾选同意前禁用）<input data-mu-replace placeholder="粘贴新 Token（jm_开头）" ${cfgState.consent ? '' : 'disabled'}></label>
    <label>解析模型<input value="pipeline（固定；不可切 VLM——长报告成本与隐私考虑，官方口径）" disabled></label></div>
    <p class="small-note" style="margin-top:8px">Flash 免费额度：单文件 ≤10 MB / ≤20 页；超出自动降级为占位解析（如实提示，不假装解析成功）。</p>
    <p class="small-note" style="margin-top:4px">如何申请：① 打开 MinerU 控制台 → ② 创建 API Token → ③ 复制粘贴到上面 → ④ 保存并测试。</p>
    <p class="small-note" style="margin-top:6px"><b>本仓未接入 MinerU：勾选与保存不联网。</b></p></div>`;
  return `<div class="card"><h3>临床数据快照</h3><dl class="kv" style="margin-top:8px">
      <dt>条数</dt><dd class="nowrap-num">${(DATA.trials || []).length} 条（虚构示例快照）</dd>
      <dt>快照日期</dt><dd class="nowrap-num">${esc(DATA.snapshot.date)}</dd>
      <dt>来源与通道终态</dt><dd>本地快照：OK · 在线登记（unified-trial-mcp）：原型未接入——<b>如装机后在线通道失败，将如实记 FAILED，不算查过</b></dd>
      <dt>断网口径</dt><dd>断网时临床页显示「快照不可用」，不假装零结果</dd>
    </dl><p class="small-note" style="margin-top:8px">${esc(DATA.meta.trialNote)}</p></div>`;
}
function openSettings(tab = null) { /* 无参=保持当前 tab（C1 状态保持） */
  if (tab) cfgState.tab = tab
  openModal('设置', `<div class="subnav" role="tablist" aria-label="设置页签">${CFG_TABS.map((t) => `<button role="tab" aria-selected="${cfgState.tab === t.id}" data-action="cfg-tab" data-tab="${t.id}">${t.label}</button>`).join('')}</div>${settingsBody(cfgState.tab)}`, '<button data-action="close">关闭</button>', '小苗宝 · 设置');
}

/* ---------------- 整页视图（32 号：history 是导航栈唯一真源） ---------------- */
let pvReturnFocus = null, pvScroll = 0;
function openPageView(id, title, bodyHtml) {
  pvReturnFocus = document.activeElement;
  pvScroll = $('#main').scrollTop;
  state.pvPage = state.page;
  state.pv = id;
  const el = document.createElement('div');
  el.className = 'page-view'; el.id = id; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', title);
  el.innerHTML = `<div class="pv-topbar"><div><span class="eyebrow">小苗宝</span><h2 style="margin-top:2px">${esc(title)}</h2></div>
    <div class="actions">${btn('← 返回', 'pv-back', 'soft')}${btn('✕ 关闭', 'pv-close', 'soft')}</div></div>
    <div class="pv-body">${bodyHtml}</div>`;
  document.body.appendChild(el);
  history.pushState({ pv: id }, '', '#' + id);
  renderBreadcrumb(title);
}
function closePageView(viaBack = false) {
  const el = $('.page-view');
  const keep = el?.id;
  if (el) el.remove();
  state.pv = null;
  if (!viaBack && history.state?.pv) history.back(); /* A3：关闭=退栈，浏览器返回键等价 */
  if (pvReturnFocus && document.contains(pvReturnFocus)) pvReturnFocus.focus(); else $('#main').focus();
  $('#main').scrollTop = pvScroll; /* A5 */
  render();
}
function renderBreadcrumb(t) { $('#breadcrumb').textContent = t || (PAGES.find((p) => p.id === state.page)?.label || '看板'); }

/* ---------------- 表单（≤6 字段；数字键盘；三态按钮） ---------------- */
function openForm(kind, pre = {}) {
  const p = profile();
  let title = '', body = '', foot = '';
  const field = (label, inner, hint = '') => `<label>${label}${inner}${hint ? `<span class="hint">${hint}</span>` : ''}</label>`;
  const AICAND = (k) => AI_DEMOS[k] ? `<div class="cand-row" style="margin-bottom:10px"><div class="cand-main"><b>AI 候选（演示）：${esc(AI_DEMOS[k].cand.title)}</b><dl class="kv" style="margin-top:4px">${AI_DEMOS[k].cand.fields.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl><p class="small-note">核对后填入；拒收零副作用。</p></div><div class="actions">${btn('填入', 'noop-disabled', 'soft', 'disabled')}<a class="chip" href="achondroplasia:agent-draft?prompt=${encodeURIComponent(aiPromptWithCtx(k))}" data-ai="${k}">发送给 AI ↗</a></div></div>` : '';
  if (kind === 'measure') {
    title = '记一次测量';
    body = AICAND('growth') + `<div class="form-grid">
      ${field('指标<select data-f="code">' + CAT_KEYS().map((c) => `<option value="${c}" ${pre.code === c ? 'selected' : ''}>${CATALOG[c].name}</option>`).join('') + '</select>')}
      ${field('数值<input data-f="v" inputmode="decimal" placeholder="如 84.2">')}
      ${field('测量日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('来源<select data-f="src"><option>家庭自测</option><option>儿保门诊</option><option>内分泌门诊</option><option>其他（在备注写明）</option></select>')}
      ${field('机构<input data-f="org" placeholder="可留空（家庭自测）">')}
      ${field('可见性<select data-f="visibility"><option value="shared">共享（进一图秀/导出）</option><option value="private">私密（不进图/导出/AI）</option></select>')}
    </div><p class="small-note" style="margin-top:8px">≤6 字段；日期没记可选「日期未记」：改在备注写明。</p>`;
  } else if (kind === 'screening') {
    title = '登记筛查结果';
    body = AICAND('screening') + `<div class="form-grid">
      ${field('类别<select data-f="cat">' + SCREEN_CATS.map((c) => `<option value="${c.id}" ${pre.cat === c.id ? 'selected' : ''}>${c.label}</option>`).join('') + '</select>')}
      ${field('项目<input data-f="item" placeholder="如：多导睡眠监测（PSG）">')}
      ${field('结果原文<input data-f="result" placeholder="照抄报告或医生原话">')}
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('机构<input data-f="org" placeholder="如：省儿童医院耳鼻喉科">')}
    </div><p class="small-note" style="margin-top:8px">结果照抄原文，本台不解读。</p>`;
  } else if (kind === 'surgery') {
    title = '登记手术';
    body = AICAND('events') + `<div class="form-grid">
      ${field('手术名称<select data-f="name"><option>腺样体扁桃体切除术</option><option>鼓膜置管术</option><option>枕骨大孔减压术</option><option>脑室-腹腔分流术</option><option>脊柱后路融合术</option><option>下肢截骨矫形术</option><option>其他（手工输入）</option></select>')}
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('机构<input data-f="org" placeholder="医院与科室">')}
      ${field('医生原话（照抄）<textarea data-f="quote" style="min-height:72px" placeholder="术前谈话或医嘱原话，不添不改"></textarea>')}
    </div>`;
  } else if (kind === 'injection') {
    title = '记注射';
    body = AICAND('events') + `<div class="form-grid">
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('执行<select data-f="done"><option>已注射</option><option>漏记</option></select>')}
      ${field('孩子配合度（家长原话，可空）<input data-f="cooperation" placeholder="如：顺利 / 哭闹后完成">')}
      ${field('备注（可空）<input data-f="note">')}
    </div>`;
  } else if (kind === 'doc') {
    title = '登记报告';
    body = AICAND('growth') + `<div class="form-grid">
      ${field('报告名称<input data-f="name" placeholder="如：听力检查单（2026-08-15）">')}
      ${field('类型<select data-f="type"><option>基因检测</option><option>听力</option><option>睡眠</option><option>影像</option><option>门诊</option><option>手术</option><option>其他</option></select>')}
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('是否有原件<select data-f="hasOriginal"><option value="yes">有原件</option><option value="no">无原件（据二次来源）</option></select>')}
    </div><p class="small-note" style="margin-top:8px">原件扫描/导入装机后在「设置 · 文档解析」进行；本表单先登记目录。</p>`;
  } else if (kind === 'hospital') {
    title = '登记医院';
    body = `<div class="form-grid">
      ${field('医院名称<input data-f="name" placeholder="如：省儿童医院">')}
      ${field('科室<input data-f="dept" placeholder="如：内分泌科">')}
      ${field('联系方式（电话或「见病历出处」）<input data-f="contact">')}
    </div>`;
  } else if (kind === 'correct-hospital') {
    title = `更正：${pre.name}（更正=新增版本）`;
    body = `<div class="form-grid">
      ${field('医院名称<input data-f="name" value="${esc(pre.name)}">')}
      ${field('科室<input data-f="dept" value="${esc(pre.dept)}">')}
      ${field('联系方式<input data-f="contact" value="${esc(pre.contact)}">')}
    </div><p class="small-note" style="margin-top:8px">原版本保留可查；本台无「删除」。</p>`;
  } else if (kind === 'family') {
    title = '记一条家庭沟通';
    body = AICAND('visit') + `<div class="form-grid">
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('事项（照实记）<textarea data-f="item" style="min-height:72px" placeholder="如：和长辈沟通基因检测结果的记录"></textarea>')}
    </div><p class="small-note" style="margin-top:8px">默认私密：不进看板摘要预览、导出与 AI 上下文（三出口同一过滤）。</p>`;
  } else if (kind === 'question') {
    title = '加一条待问';
    body = AICAND('visit') + `<div class="form-grid">${field('想问的问题<input data-f="q" placeholder="如：下次听力什么时候查？">')}</div>`;
  } else if (kind === 'correct-surgery') {
    title = `更正：${pre.name}（更正=新增版本 v${Number(pre.v || 1) + 1}）`;
    body = `<div class="form-grid">
      ${field('手术名称<input data-f="name" value="${esc(pre.name)}">')}
      ${field('日期<input data-f="d" type="date" value="${esc(pre.d)}">')}
      ${field('机构<input data-f="org" value="${esc(pre.org)}">')}
      ${field('医生原话（照抄）<textarea data-f="quote" style="min-height:72px">${esc(pre.quote)}</textarea>')}
    </div><p class="small-note" style="margin-top:8px">原版本保留可查；本台无「删除」。</p>`;
  } else if (kind === 'correct-measure') {
    title = '更正测量（新增版本）';
    body = `<div class="form-grid">
      ${field('指标<input value="' + esc(CATALOG[pre.code]?.name || '') + '" disabled>')}
      ${field('测量日期<input value="' + esc(pre.d) + '" disabled>')}
      ${field('更正后数值<input data-f="v" inputmode="decimal">')}
      ${field('更正原因（存入历史）<input data-f="why" placeholder="如：抄错小数点">')}
    </div><p class="small-note" style="margin-top:8px">原值保留在历史版本；图表与卡片按最新版本展示。</p>`;
  }
  foot = `${btn('保存并继续录入', 'form-save-continue', 'primary', `data-kind="${kind}"`)}${btn('保存并关闭', 'form-save', 'primary', `data-kind="${kind}"`)}${btn('取消', 'close', 'soft')}`;
  openModal(title, body, foot, '小苗宝 · 录入');
}
function formCollect() {
  const out = {};
  $('#dialog-body').querySelectorAll('[data-f]').forEach((el) => { out[el.dataset.f] = el.value.trim(); });
  return out;
}
function saveForm(kind, keepOpen) {
  const v = formCollect();
  if (DATA_SOURCE === 'api') {
    const map = { measure: 'measure', screening: 'screening', surgery: 'surgery', injection: 'injection', question: 'question', doc: 'doc', hospital: 'hospital', 'correct-surgery': 'correct-surgery', 'correct-measure': 'correct-measure', 'correct-hospital': 'correct-hospital', family: 'family' };
    return apiSaveRecord(map[kind] || kind, { ...v, kind }, keepOpen ? '已保存，可继续录下一条' : '已保存', keepOpen);
  }
  const m = mem();
  if (kind === 'measure') {
    if (!v.v || isNaN(Number(v.v))) { toast('数值要填数字（或用键盘上的数字键）', { long: true }); return; }
    const dateKnown = !!v.d;
    m.measures.push({ _id: 'm' + Date.now(), code: v.code, v: Number(v.v), d: dateKnown ? v.d : '（日期未记）', src: v.src, org: v.org || null, note: v.note || null, visibility: v.visibility || 'shared', _v: 1 });
    toast('测量已记录（待核对候选之外的手工录入，同走事实层）', { long: true });
  } else if (kind === 'screening') {
    if (!v.item || !v.result) { toast('项目与结果原文都要填', { long: true }); return; }
    m.screenings.push({ cat: v.cat, item: v.item, result: v.result, d: v.d || null, org: v.org || null, visibility: 'shared' });
    toast('筛查结果已登记');
  } else if (kind === 'surgery') {
    if (!v.name || !v.d) { toast('名称与日期必填', { long: true }); return; }
    m.surgeries.push({ id: 's' + Date.now(), name: v.name, d: v.d, org: v.org, doctorQuote: v.quote, version: 1 });
    toast('手术已登记（医生原话已照抄保存）');
  } else if (kind === 'injection') {
    if (!v.d) { toast('日期必填（漏记走「漏记」选项，不选别的日期回填）', { long: true }); return; }
    m.injections.push({ d: v.d, done: v.done, cooperation: v.cooperation || null, note: v.note || null });
    toast(v.done === '漏记' ? '已如实记「漏记」（不回填当天）' : '注射已记录');
  } else if (kind === 'doc') {
    title = '登记报告';
    body = AICAND('growth') + `<div class="form-grid">
      ${field('报告名称<input data-f="name" placeholder="如：听力检查单（2026-08-15）">')}
      ${field('类型<select data-f="type"><option>基因检测</option><option>听力</option><option>睡眠</option><option>影像</option><option>门诊</option><option>手术</option><option>其他</option></select>')}
      ${field('日期<input data-f="d" type="date" max="${esc(TODAY)}">')}
      ${field('是否有原件<select data-f="hasOriginal"><option value="yes">有原件</option><option value="no">无原件（据二次来源）</option></select>')}
    </div><p class="small-note" style="margin-top:8px">原件扫描/导入装机后在「设置 · 文档解析」进行；本表单先登记目录。</p>`;
  } else if (kind === 'hospital') {
    title = '登记医院';
    body = `<div class="form-grid">
      ${field('医院名称<input data-f="name" placeholder="如：省儿童医院">')}
      ${field('科室<input data-f="dept" placeholder="如：内分泌科">')}
      ${field('联系方式（电话或「见病历出处」）<input data-f="contact">')}
    </div>`;
  } else if (kind === 'doc') {
    if (!v.name) { toast('报告名称必填', { long: true }); return; }
    if (!v.d) { toast('日期必填（没记就在纸质原件上查）', { long: true }); return; }
    const id = 'doc' + Date.now();
    profile().docs.push({ id, name: v.name, date: v.d, type: v.type, status: '待核对', hasOriginal: v.hasOriginal === 'yes' });
    toast('报告已登记（待核对；原件导入走设置 · 文档解析）', { long: true });
  } else if (kind === 'hospital') {
    if (!v.name) { toast('医院名称必填', { long: true }); return; }
    if (!mem().hospitals) mem().hospitals = [];
    mem().hospitals.push({ name: v.name, dept: v.dept, contact: v.contact, version: 1 });
    toast('医院已登记（可逐条修改，支持多家）');
  } else if (kind === 'correct-hospital') {
    if (!v.name) { toast('医院名称必填', { long: true }); return; }
    const base = profile().hospitals || [];
    const target = base[Number(pre.i)];
    if (target) { target.name = v.name; target.dept = v.dept; target.contact = v.contact; target.version = (target.version || 1) + 1; }
    m.corrections.push({ refKey: `hosp:${pre.name}:${pre.dept}`, v: (target?.version) || 2, name: v.name, dept: v.dept, contact: v.contact, at: TODAY });
    toast('已按新版本更正（旧版本可查）', { long: true });
  } else if (kind === 'family') {
    if (!v.item) { toast('写一句事项再保存', { long: true }); return; }
    (p.family.notes = p.family.notes || []).push({ d: v.d || null, item: v.item, visibility: 'private' });
    toast('已记录（默认私密：不进摘要预览/导出/AI）', { long: true });
  } else if (kind === 'question') {
    if (!v.q) { toast('写一句话再保存', { long: true }); return; }
    allQuestions().push({ q: v.q, asked: false });
    toast('已加入待问清单');
  } else if (kind === 'correct-surgery') {
    if (!v.name || !v.d) { toast('名称与日期必填', { long: true }); return; }
    m.corrections.push({ refId: pre.id, refKey: 'surgery', v: Number(pre.v || 1) + 1, name: v.name, d: v.d, org: v.org, doctorQuote: v.quote, at: TODAY });
    const base = allSurgeries().find((s) => s.id === pre.id);
    if (base) { base.name = v.name; base.d = v.d; base.org = v.org; base.doctorQuote = v.quote; base.version = Number(pre.v || 1) + 1; }
    toast(`已保存为新版本 v${Number(pre.v || 1) + 1}（旧版本在「查看历史」）`, { long: true });
  } else if (kind === 'correct-measure') {
    if (!v.v || isNaN(Number(v.v))) { toast('更正后数值要填数字', { long: true }); return; }
    m.corrections.push({ refKey: `m:${pre.code}:${pre.d}`, v: 2, value: Number(v.v), why: v.why, at: TODAY });
    const arr = allMeasures(pre.code);
    const target = arr.find((x) => x.d === pre.d && !x._added);
    if (target) target.v = Number(v.v);
    const addedTarget = m.measures.find((x) => x.code === pre.code && x.d === pre.d);
    if (addedTarget) addedTarget.v = Number(v.v), addedTarget._v = 2;
    toast('已按新版本更正（原值在历史）', { long: true });
  }
  if (!keepOpen) closeModal();
  render();
}

/* ---------------- 导出（私密过滤 + 代记标记） ---------------- */
function exportPack() {
  const md = buildPackMarkdown();
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `小苗宝-资料包-${profile().name.replace(/（.*）/, '')}-${TODAY}.md`;
  a.click(); URL.revokeObjectURL(a.href);
  toast('已导出 .md（私密记录已排除，含家长代记标记）', { long: true });
}

/* ---------------- AI 一键发送（34 号：achondroplasia:agent-draft · send:true） ---------------- */
const EMBEDDED = () => window.parent && window.parent !== window;
function agentSend(prompt) {
  if (EMBEDDED()) {
    window.parent.postMessage({ type: 'achondroplasia:agent-draft', prompt, send: true }, location.origin === 'null' ? '*' : location.origin);
    toast('已把提示词与档案上下文发送到 AI 对话（回复是候选，核对才采纳）', { long: true });
  } else {
    toast('演示面板：原型独立打开不假装发送——嵌入式（壳层 iframe）形态会经 achondroplasia:agent-draft · send:true 直接发送到 AI 对话', { long: true });
    if (!state.agent.open) toggleAgent(true);
  }
}

/* ---------------- 档案切换（Q10：切换整页联动不串档） ---------------- */
function openProfiles() {
  openModal('切换演示档案', DATA.profiles.map((p) => `
    <button class="profile profile-btn" data-action="use-profile" data-id="${esc(p.id)}" style="margin-bottom:10px;width:100%">
      <div class="avatar" aria-hidden="true">${esc(p.name[0])}</div>
      <div style="flex:1;text-align:left"><b>${esc(p.name)}的档案${p.id === state.profileId ? '（当前）' : ''}</b><span>${esc(p.age)} · ${esc(p.headline)}</span></div>
      <span class="profile-caret">→</span>
    </button>`).join('') + '<p class="small-note">A 档案=刚确诊记录少；B 档案=长期随访记录多。两套都是合成示例。</p>', '', '小苗宝 · 演示档案');
}
function useProfile(id) {
  if (id === state.profileId) { closeModal(); return; }
  state.profileId = id;
  state.pin = null;
  closeModal();
  const p = profile();
  $('#profile-name').textContent = `${p.name}的档案`;
  $('#profile-meta').textContent = `${p.age} · ${CARE_LABEL[p.careRole]}`;
  $('#profile-avatar').textContent = p.name[0];
  $('#profile-btn').setAttribute('aria-label', `切换演示档案，当前为${p.name}`);
  render(true);
  toast(`已切换到 ${p.name}（整页数据联动，互不串档）`);
}

/* ---------------- 路由表（探针覆盖断言用：每条叶子路由 = 一个 (view,sub)） ---------------- */
const ROUTES = {
  dash: pageDash,
  'growth/overview': pageGrowthOverview, 'growth/cards': pageGrowthCards, 'growth/recent': pageGrowthRecent, 'growth/cands': pageGrowthCands, 'growth/docs': pageGrowthDocs,
  'screening/ledger': pageScreeningLedger, 'screening/rhythm': pageScreeningRhythm,
  'events/timeline': pageEventsTimeline, 'events/surgeries': pageEventsSurgeries, 'events/meds': pageEventsMeds,
  'visit/pack': pageVisitPack, 'visit/questions': pageVisitQuestions,
  'trial/match': pageTrialMatch, 'trial/search': pageTrialSearch, 'trial/saved': pageTrialSaved
};
/* ---------------- 渲染调度 ---------------- */
function render(keepScroll) {
  const pNow = profile();
  if ($('#profile-name') && pNow) { $('#profile-name').textContent = `${pNow.name}的档案`; $('#profile-meta').textContent = `${pNow.age} · ${CARE_LABEL[pNow.careRole]}`; $('#profile-avatar').textContent = (pNow.name || '苗')[0]; }
  const main = $('#main');
  const scroll = keepScroll ? main.scrollTop : 0;
  const views = { dash: pageDash, growth: pageGrowth, screening: pageScreening, events: pageEvents, visit: pageVisit, trial: () => { const sub = state.sub.trial || 'match'; const subnav = `<div class="subnav">${SUBPAGES.trial.map(([id, label]) => `<button aria-current="${sub === id}" data-action="go" data-page="trial" data-sub="${id}">${label}</button>`).join('')}</div>`; const body = { match: pageTrialMatch, search: pageTrialSearch, saved: pageTrialSaved }[sub](); return subnav + body; } };
  main.innerHTML = (views[state.page] || pageDash)();
  if (state.pv) { /* 整页视图打开时重挂（内容不丢） */ }
  renderBreadcrumb();
  if (keepScroll) main.scrollTop = scroll;
  document.querySelectorAll('#nav .nav-button').forEach((b) => b.setAttribute('aria-current', b.dataset.page === state.page ? 'page' : 'false'));
  $('#agent-toggle').setAttribute('aria-expanded', state.agent.open);
  $('#agent-toggle').style.background = state.agent.open ? 'var(--sprout-soft)' : '';
}
function buildNav() {
  $('#nav').innerHTML = PAGES.map((p) => `<button class="nav-button" data-action="go" data-page="${p.id}">${ICONS[p.id]}<span>${p.label}</span></button>`).join('');
}
function toggleAgent(open) {
  state.agent.open = open ?? !state.agent.open;
  $('#agent-pane').hidden = !state.agent.open;
  $('#agent-splitter').hidden = !state.agent.open;
  $('#agent-toggle').setAttribute('aria-expanded', state.agent.open);
  $('#agent-toggle').style.background = state.agent.open ? 'var(--sprout-soft)' : '';
}

/* ---------------- splitter（Q18/Q32：25–45%，键盘步进 2%） ---------------- */
function setupSplitter() {
  const sp = $('#agent-splitter'), pane = $('#agent-pane');
  const clamp = (v) => Math.min(45, Math.max(25, v));
  const setW = (pct) => { pane.style.width = clamp(pct) + '%'; sp.setAttribute('aria-valuenow', String(Math.round(clamp(pct)))); };
  let dragging = false;
  sp.addEventListener('pointerdown', (e) => { dragging = true; sp.setPointerCapture(e.pointerId); document.body.style.userSelect = 'none'; });
  sp.addEventListener('pointermove', (e) => { if (!dragging) return; const stage = sp.parentElement.getBoundingClientRect(); setW(((stage.right - e.clientX) / stage.width) * 100); });
  sp.addEventListener('pointerup', () => { dragging = false; document.body.style.userSelect = ''; });
  sp.addEventListener('keydown', (e) => { const cur = Number(sp.getAttribute('aria-valuenow')); if (e.key === 'ArrowLeft') setW(cur + 2); else if (e.key === 'ArrowRight') setW(cur - 2); else if (e.key === 'Home') setW(45); else if (e.key === 'End') setW(25); else return; e.preventDefault(); });
}

/* ---------------- 事件总线 ---------------- */
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-action]');
  const ai = e.target.closest('a[href^="achondroplasia:agent-draft"]');
  if (ai) { e.preventDefault(); agentSend(decodeURIComponent((ai.getAttribute('href').split('?prompt=')[1] || ''))); return; }
  if (e.target.closest('.mcard')) { /* 翻卡独立处理 */ }
  const pt = e.target.closest('[data-point]');
  if (pt) { const [code, d] = pt.dataset.point.split('|'); chartPointDialog(code, d); return; }
  const ev = e.target.closest('[data-ev]');
  if (ev) { const [kind, d, label] = ev.dataset.ev.split('|'); openModal(`${kind} · ${fmtD(d)}`, `<div class="card"><dl class="kv"><dt>类型</dt><dd>${esc(kind)}</dd><dt>日期</dt><dd class="nowrap-num">${esc(d)}</dd><dt>内容</dt><dd>${esc(label)}</dd></dl></div><p class="small-note" style="margin-top:8px">点事件节点回看原始记录；整卡不翻面（MT09）。</p>`); return; }
  if (!t) return;
  const a = t.dataset.action;
  switch (a) {
    case 'go': goHash(t.dataset.page, t.dataset.sub); break;
    case 'profiles': openProfiles(); break;
    case 'use-profile': useProfile(t.dataset.id); break;
    case 'settings': openSettings(); break;
    case 'cfg-tab': cfgState.tab = t.dataset.tab; openSettings(); break;
    case 'primer-open-proxy': document.querySelector('[data-primer-open]')?.click(); break;
    case 'open-store': openModal('资料目录', '<p class="small-note">原型演示：装机后由 DSH 宿主指定业务资料目录（config.root = dshHomePath(\'achondroplasia\')），目录拒绝主目录/桌面/下载根。</p>'); break;
    case 'about': openModal(`关于 ${APP_INFO.name}`, `<p style="font-size:13.5px">版本 <b>${APP_INFO.version}</b>（构建 ${APP_INFO.build}）<br>软骨发育不全患儿家庭工作台 · 交互原型<br>全部数据为合成示例；本页未接入 DSH 宿主与 AI。</p>`); break;
    case 'help': openModal('原型操作说明', '<p style="font-size:13.5px">· 左侧切换 6 条一级线；页内页签在各页顶部。<br>· 顶栏「?」打开疾病概要（整页）。<br>· 「AI 协助 ↗」为 achondroplasia:agent-draft 协议链接（34 号）：嵌入式直接发送；独立打开走演示面板。<br>· 侧栏上方切换 A/B 演示档案。<br>· 所有数据为合成示例；刷新重置。</p>'); break;
    case 'close': closeModal(); break;
    case 'agent-toggle': toggleAgent(); break;
    case 'agent-hide': toggleAgent(false); break;
    case 'range': state.range = t.dataset.range; render(); break;
    case 'sel-metric': {
      const code = t.dataset.code; const cur = state.sel[state.profileId] || (state.sel[state.profileId] = []);
      const i = cur.indexOf(code);
      if (i >= 0) cur.splice(i, 1); else { if (cur.length >= 4) { toast('最多同时 4 条：先取消一条再选'); render(); break; } cur.push(code); }
      render(); break;
    }
    case 'layer': state.layer[t.dataset.layer] = !state.layer[t.dataset.layer]; render(); break;
    case 'flip': {
      const card = t.closest('.mcard');
      const pressed = card.getAttribute('aria-pressed') === 'true';
      card.setAttribute('aria-pressed', String(!pressed));
      break;
    }
    case 'point': chartPointDialog(t.dataset.code, t.dataset.d); break;
    case 'doc': { const doc = (profile().docs || []).find((x) => x.id === t.dataset.doc); if (doc) openModal(doc.name, `<div class="card"><dl class="kv"><dt>类型</dt><dd>${esc(doc.type)}</dd><dt>日期</dt><dd class="nowrap-num">${esc(doc.date)}</dd><dt>状态</dt><dd>${esc(doc.status)}</dd><dt>原件</dt><dd>${doc.hasOriginal ? '有（装机后可打开原件）' : '无原件（据二次来源整理）'}</dd></dl></div>`); break; }
    case 'form-measure': openForm('measure'); break;
    case 'form-screening': openForm('screening', { cat: t.dataset.cat }); break;
    case 'form-surgery': openForm('surgery'); break;
    case 'form-injection': openForm('injection'); break;
    case 'form-question': openForm('question'); break;
    case 'form-doc': openForm('doc'); break;
    case 'form-hospital': openForm('hospital'); break;
    case 'correct-hospital': openForm('correct-hospital', { i: t.dataset.i, name: t.dataset.name, dept: t.dataset.dept, contact: t.dataset.contact }); break;
    case 'hospital-history': openModal('医院历史版本', '<p class="small-note">更正后旧版本保留在库（in_use=0），装机版经「查看历史」接口列出；演示态暂无可查历史。</p>'); break;
    case 'form-save': saveForm(t.dataset.kind, false); break;
    case 'form-save-continue': saveForm(t.dataset.kind, true); break;
    case 'correct-surgery': openForm('correct-surgery', { id: t.dataset.id, name: t.dataset.name, d: t.dataset.d, org: t.dataset.org, quote: t.dataset.quote, v: t.dataset.v }); break;
    case 'correct-measure': openForm('correct-measure', { code: t.dataset.code, d: t.dataset.d }); break;
    case 'surgery-history': {
      const corr = mem().corrections.filter((c) => c.refId === t.dataset.id);
      openModal('历史版本', corr.length ? corr.map((c) => `<div class="card" style="margin-bottom:8px"><b>v${c.v}</b>（${esc(c.at)} 更正）<dl class="kv" style="margin-top:6px"><dt>名称</dt><dd>${esc(c.name)}</dd><dt>日期</dt><dd class="nowrap-num">${esc(c.d)}</dd><dt>医生原话</dt><dd>${esc(c.doctorQuote)}</dd></dl></div>`).join('') : '<p class="small-note">还没有更正记录（原版本即 v1）。</p>'); break;
    }
    case 'screening-detail': {
      const cat = SCREEN_CATS.find((c) => c.id === t.dataset.cat); const item = allScreenings(cat.id).find((s) => (s.d || '') === t.dataset.d);
      if (item) openModal(`${cat.label} · ${item.d ? fmtD(item.d) : '日期未记'}`, `<div class="card"><dl class="kv"><dt>项目</dt><dd>${esc(item.item)}</dd><dt>结果</dt><dd>${esc(item.result)}</dd><dt>机构</dt><dd>${esc(item.org || '未记录')}</dd><dt>原件</dt><dd>${item.docId ? '关联报告见「生长记录 · 报告档案」' : '无原件（据二次来源）'}</dd></dl></div>`); break;
    }
    case 'accept-cand': {
      if (DATA_SOURCE === 'api') {
        void apiPostJson(`/candidate/${encodeURIComponent(t.dataset.cand)}/measure/accept`, {})
          .then(() => { toast('已核对入库（候选→事实层）', { long: true }); return apiRefetch(); })
          .catch((e) => toast('未确认：' + e.message, { long: true }));
        break;
      }
      const c = (profile().candidates || []).find((x) => x.id === t.dataset.cand);
      mem().acceptedCands.push(c.id);
      if (c.kind === 'measure') mem().measures.push({ _id: 'c' + c.id, code: 'HEAD', v: Number((String(c.fields[1][1]).match(/[\d.]+/) || ['0'])[0]), d: c.fields[0][1], src: 'AI 候选核对入库', org: null, visibility: 'shared', _v: 1 });
      else if (c.kind === 'injection') mem().injections.push({ d: c.fields[0][1], done: c.fields[1][1], cooperation: c.fields[2][1], note: '家人代记（AI 候选核对入库）' });
      else mem().screenings.push({ cat: 'hearing', item: c.fields[1][1], result: c.fields[2][1], d: c.fields[0][1], org: 'AI 候选核对入库' });
      toast('已核对入库（候选→事实层）；拒收的候选零副作用', { long: true });
      render(); break;
    }
    case 'reject-cand':
      if (DATA_SOURCE === 'api') { void apiPostJson(`/candidate/${encodeURIComponent(t.dataset.cand)}/measure/reject`, {}).then(() => apiRefetch()).catch((e) => toast('未拒收：' + e.message)); break; }
      toast('已拒收这条候选（无副作用：档案与图表不变）'); break;
    case 'pack-preview': openPackPreview(); break;
    case 'pv-back': history.back(); break;
    case 'pv-close': closePageView(false); break;
    case 'export-pack': exportPack(); break;
    case 'toggle-question': { const qs = allQuestions(); qs[Number(t.dataset.i)].asked = !qs[Number(t.dataset.i)].asked; render(); break; }
    case 'rhythm-to-questions': { const qs = allQuestions(); if (!qs.some((q) => q.q.includes('下次复查安排'))) qs.push({ q: '下次复查安排与要查的项目（清单页发起）', asked: false }); toast('已把「问医生」事项加进待问清单'); goHash('visit', 'questions'); break; }
    case 'trial-detail': trialDetailPane(t.dataset.key); break;
    case 'trial-save': mem().savedTrials.push({ key: t.dataset.key, savedOn: TODAY, state: '在跟' }); { const mask = $('.trial-mask'); if (mask) mask.parentElement._close(); } toast('已收藏（只存本机）'); render(); break;
    case 'trial-unsave': mem().savedTrials = mem().savedTrials.filter((s) => s.key !== t.dataset.key); render(); break;
    case 'trial-apply': { state.trialFilter.q = $('[data-trial-q]')?.value || ''; state.trialFilter.status = $('[data-trial-status]')?.value || 'all'; state.trialFilter.phase = $('[data-trial-phase]')?.value || 'all'; state.trialFilter.region = $('[data-trial-region]')?.value || 'all'; state.trialFilter.sort = $('[data-trial-sort]')?.value || 'status'; render(); toast('已按你选的条件排列（不掺分数）'); break; }
    default: break;
  }
});
document.addEventListener('change', (e) => {
  if (e.target.matches('[data-mu-consent]')) {
    cfgState.consent = e.target.checked
    const rep = document.querySelector('[data-mu-replace]')
    if (rep) rep.disabled = !cfgState.consent
    return
  }
  const ss = e.target.closest('[data-saved-state]');
  if (ss) { const s = mem().savedTrials.find((x) => x.key === ss.dataset.key); if (s) s.state = ss.value; toast('跟进状态已更新（只存本机）'); }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if ($('.trial-pane')) { $('.trial-mask').parentElement._close(); return; } /* E5：浮窗 Esc 只退浮窗 */
  if ($('#dialog')?.open) return; /* 弹窗 Esc 由 dialog 原生处理 */
  if ($('.page-view')) { history.back(); return; } /* A2：一层一退 */
});
window.addEventListener('hashchange', () => {
  const before = state.pv;
  applyHash();
  if (before && !state.pv && $('.page-view')) $('.page-view').remove();
  if (state.pv === 'pv-pack' && !$('.page-view')) openPackPreview();
  render();
});
window.addEventListener('popstate', () => { applyHash(); if (!state.pv && $('.page-view')) $('.page-view').remove(); render(); });
$('#font-toggle').addEventListener('click', () => { const on = document.body.classList.toggle('large'); $('#font-toggle').setAttribute('aria-pressed', String(on)); });
window.addEventListener('beforeprint', () => { document.querySelectorAll('details.phase-fold').forEach((d) => d.open = true); });

/* ---------------- 启动 ---------------- */
buildNav();
applyHash();
void (async () => { DATA_SOURCE = await loadBootstrap(); applySourceBanner(); render(); })();
const p0 = profile();
$('#profile-name').textContent = `${p0.name}的档案`;
$('#profile-meta').textContent = `${p0.age} · ${CARE_LABEL[p0.careRole]}`;
$('#profile-avatar').textContent = p0.name[0];
setupSplitter();
render();
/* 探针钩子（只读状态 + 受控重渲；不新增写路径） */
window.__ACH_APP__ = { state, render, goHash, CATALOG, SCREEN_CATS, profile, allMeasures, allScreenings, allSurgeries, allInjections, allQuestions, sharedOnly, privateCount, aiCtx, renderChart, smoothPath, buildPackMarkdown, openPageView, closePageView, openForm, saveForm, openProfiles, useProfile, openSettings, trialCriteria };
