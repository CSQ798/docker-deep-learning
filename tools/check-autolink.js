/* ============================================================================
 * 自动标注预览：node tools/check-autolink.js [章节关键词，可省略]
 * 它会模拟浏览器里的术语自动标注逻辑，报告：
 *   1) 正文中会被自动加下划线的词及出现次数
 *   2) 抽查若干处上下文，方便判断是否有误匹配
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');

/* ---- 读取术语表（与应用逻辑保持一致） ---- */
const termsSrc = fs.readFileSync(path.join(ROOT, 'data', 'terms.data.js'), 'utf8');
const sandbox = { window: {} };
const W = new Function('window', termsSrc + '\nreturn window;')(sandbox.window);
const TERMS = W.DL_TERMS;

const LINK_STOP = {
  'Image': 1, 'Layer': 1, 'Context': 1, 'Network': 1, 'Volume': 1, 'Tag': 1,
  'Repository': 1, 'Registry': 1, 'Container': 1, 'Service': 1, 'Signal': 1,
  'Kernel': 1, 'daemon': 1, 'Desktop': 1, 'system df': 1, 'prune': 1, 'stats': 1,
  'cache': 1, 'run': 1, 'exec': 1, 'logs': 1, 'inspect': 1, 'cp': 1, 'publish': 1,
  'services': 1, 'context': 1, 'secret': 1, 'Secrets': 1, 'bridge': 1, 'volume': 1,
  'tag': 1, 'registry': 1, 'namespace': 1, 'Namespace': 1, 'namespaces': 1,
  'capabilities': 1, 'Privileged': 1, 'distroless': 1, 'defunct': 1,
  '1 号进程': 1, 'init 进程': 1, '-p': 1,
  '镜像仓库': 1, '基础镜像': 1, '环境变量': 1
};

const ALIAS = {};
TERMS.forEach(t => { ALIAS[t.term] = t; (t.alias || []).forEach(a => { if (a && !ALIAS[a]) ALIAS[a] = t; }); });

/* 与 assets/app.js 保持一致：长术语前缀跳过 + 整页预算 */
const EXTEND = {};
TERMS.forEach(t => {
  [t.term].concat(t.alias || []).forEach(w => { for (let n = 2; n < w.length; n++) EXTEND[w.slice(0, n)] = 1; });
});
const LINK_MAX = {
  '容器': 8, '镜像': 8, '虚拟机': 6, '虚拟化': 4, '内核': 4, '操作系统': 4,
  'Linux': 6, 'Docker': 6, 'Docker Desktop': 4, 'Dockerfile': 5, 'Compose': 5,
  'Docker Compose': 4, '数据卷': 4, '绑定挂载': 4, '服务': 4, '网络': 4,
  '命名空间': 3, 'cgroups': 3, 'Kubernetes': 3, '容器编排': 3, '层': 4
};
const budget = t => LINK_MAX[t] || 3;

let LINK_WORDS = [];
TERMS.forEach(t => {
  if (t.link === false) return;
  if (!LINK_STOP[t.term]) LINK_WORDS.push(t.term);
  (t.alias || []).forEach(a => { if (a && !LINK_STOP[a] && (/[A-Za-z]/.test(a) || a.length >= 4)) LINK_WORDS.push(a); });
});
LINK_WORDS = [...new Set(LINK_WORDS)].sort((a, b) => b.length - a.length);
const RE = new RegExp('(' + LINK_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');

console.log(`自动标注词条数：${LINK_WORDS.length}（术语总表共 ${TERMS.length} 条）`);

const filter = process.argv[2] || '';
const files = fs.readdirSync(CH_DIR).filter(f => f.endsWith('.html') && !f.startsWith('_') && (!filter || f.includes(filter)));
if (!files.length) { console.log('没有匹配的章节文件。'); process.exit(0); }

for (const f of files) {
  const html = fs.readFileSync(path.join(CH_DIR, f), 'utf8');
  const prose = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');

  const hits = {}, tally = {};
  let m;
  RE.lastIndex = 0;
  let skippedExtend = 0, skippedBudget = 0;
  while ((m = RE.exec(prose))) {
    const w = m[0];
    if (/^[A-Za-z0-9._-]+$/.test(w)) {
      const b = prose[m.index - 1], a = prose[m.index + w.length];
      if ((b && /[A-Za-z0-9_.-]/.test(b)) || (a && /[A-Za-z0-9_.-]/.test(a))) continue;
    }
    const term = ALIAS[w];
    if (!term) continue;
    if (EXTEND[w]) { skippedExtend++; continue; }
    if ((tally[term.term] || 0) >= budget(term.term)) { skippedBudget++; continue; }
    tally[term.term] = (tally[term.term] || 0) + 1;
    hits[w] = (hits[w] || 0) + 1;
  }

  const list = Object.entries(hits).sort((a, b) => b[1] - a[1]);
  const totalHits = list.reduce((s, x) => s + x[1], 0);
  console.log(`\n=== ${f} ===`);
  console.log(`命中种类 ${list.length} 个，标注点 ${totalHits} 处`);
  console.log('  ' + list.map(([w, n]) => `${w}×${n}`).join('  '));

  /* 抽查：把每个词的第一处上下文打出来 */
  const odd = list.filter(([w]) => /^[A-Za-z]/.test(w) && w.split(' ').length === 1);
  if (odd.length) {
    console.log('  英文单词的上下文抽查：');
    for (const [w] of odd.slice(0, 12)) {
      const i = prose.indexOf(w);
      console.log(`    ${w} → …${prose.slice(Math.max(0, i - 24), i + w.length + 24).trim()}…`);
    }
  }
}
console.log('');
