/* 内部链接完整性：node tools/check-links.js */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const pages = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'tools' || e.name === 'specs' || e.name.startsWith('.')) continue;
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) walk(fp);
    else if (e.name.endsWith('.html')) pages.push(fp);
  }
}
walk(ROOT);
pages.sort();

/* 收集每页的 id 集合 */
const ids = {};
for (const p of pages) {
  const t = fs.readFileSync(p, 'utf8');
  ids[p] = new Set((t.match(/\sid="([^"]+)"/g) || []).map(s => s.slice(5, -1)));
}

let bad = 0, total = 0;
for (const p of pages) {
  const t = fs.readFileSync(p, 'utf8');
  const hrefs = (t.match(/href="([^"]+)"/g) || []).map(s => s.slice(6, -1));
  for (const h of hrefs) {
    if (/^(https?:|mailto:|javascript:)/.test(h)) continue;
    total++;
    const [target, hash] = h.split('#');
    const dir = path.dirname(p);
    let file;
    if (!target) file = p;                                  /* 页内锚点 */
    else if (target.startsWith('/')) { file = path.join(ROOT, target); }
    else file = path.resolve(dir, target);
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');

    if (!fs.existsSync(file)) { console.log(`✗ ${rel} → ${h}（目标文件不存在）`); bad++; continue; }
    /* 只校验 html 文件的锚点 */
    if (hash && file.endsWith('.html')) {
      if (!ids[file]) ids[file] = new Set((fs.readFileSync(file, 'utf8').match(/\sid="([^"]+)"/g) || []).map(s => s.slice(5, -1)));
      if (!ids[file].has(hash)) { console.log(`✗ ${rel} → ${h}（锚点 #${hash} 不存在于目标页）`); bad++; }
    }
  }
  /* 数据文件与脚本引用 */
  const srcs = (t.match(/src="([^"]+)"/g) || []).map(s => s.slice(5, -1));
  for (const s of srcs) {
    if (/^https?:/.test(s)) continue;
    total++;
    const f = path.resolve(path.dirname(p), s);
    if (!fs.existsSync(f)) { console.log(`✗ ${path.relative(ROOT, p)} → src ${s} 不存在`); bad++; }
  }
}

console.log(`\n检查 ${pages.length} 个页面，共 ${total} 条内部引用，问题 ${bad} 处。`);
process.exit(bad ? 1 : 0);
