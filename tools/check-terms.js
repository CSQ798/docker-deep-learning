/* ============================================================================
 * 术语库自检：node tools/check-terms.js
 * 1) 术语与别名是否重复
 * 2) 自动加下划线的词是否会造成大面积误匹配（列出会被正文自动标注的词表）
 * 3) 每条术语的字段是否完整
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const src = fs.readFileSync(path.join(ROOT, 'data', 'terms.data.js'), 'utf8');
const sandbox = { window: {} };
const fn = new Function('window', src + '\nreturn window;');
const W = fn(sandbox.window);
const TERMS = W.DL_TERMS, CATS = W.DL_CATEGORIES;

let bad = 0;
const words = new Set();
const dupTerm = [], dupWord = [];

TERMS.forEach((t, i) => {
  for (const f of ['term', 'en', 'zh', 'def', 'cat']) {
    if (!t[f] || !String(t[f]).trim()) { console.log(`✗ 第 ${i} 条缺少字段 ${f}:`, t.term); bad++; }
  }
  if (!CATS.some(c => c.key === t.cat)) { console.log(`✗ 分类不存在: ${t.term} -> ${t.cat}`); bad++; }
  if (words.has(t.term)) dupTerm.push(t.term);
  words.add(t.term);
  (t.alias || []).forEach(a => {
    if (words.has(a)) dupWord.push(a);
    words.add(a);
  });
});

if (dupTerm.length) { console.log('✗ 重复的术语名：' + dupTerm.join('、')); bad++; }
if (dupWord.length) { console.log('✗ 重复的别名：' + dupWord.join('、')); bad++; }

/* 检查别名冲突：不同术语共用同一个别名 */
const owner = {};
TERMS.forEach(t => {
  [t.term].concat(t.alias || []).forEach(w => {
    if (owner[w] && owner[w] !== t.term) console.log(`✗ 别名冲突：${w} 同时属于 ${owner[w]} 与 ${t.term}`);
    owner[w] = t.term;
  });
});

/* 统计 */
const linkable = TERMS.filter(t => t.link !== false);
const linkWords = new Set();
linkable.forEach(t => { linkWords.add(t.term); (t.alias || []).forEach(a => { if (/[A-Za-z]/.test(a) || a.length >= 4) linkWords.add(a); }); });

console.log(`\n术语总数：${TERMS.length}　分类：${CATS.length}　正文自动标注词数：${linkWords.size}`);
console.log('\n各分类条目数：');
CATS.forEach(c => {
  const n = TERMS.filter(t => t.cat === c.key).length;
  console.log('  ' + (n < 3 ? '△' : ' ') + ' ' + c.name + '：' + n + ' 条');
});
console.log('\n正文中会自动加下划线的词（按长度降序）：');
console.log('  ' + [...linkWords].sort((a, b) => b.length - a.length).join('  '));

/* 单字/双字词风险提示 */
const short = [...linkWords].filter(w => [...w].length <= 2);
if (short.length) console.log('\n△ 短词（可能误匹配，建议人工确认）：' + short.join('、'));

console.log(bad ? `\n发现 ${bad} 处问题。\n` : '\n术语库校验通过。\n');
process.exit(0);
