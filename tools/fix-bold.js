/* ============================================================================
 * 修复"反向加粗"缺陷
 * 症状：作者把 <strong>文本</strong> 写成了 **文本</strong>（或 </strong>文本<strong>），
 *       导致标签错配、正文里出现字面星号。
 * 用法：node tools/fix-bold.js chapters/ch01-思想.html [--dry]
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
const dry = process.argv.indexOf('--dry') > -1;
if (!file) { console.error('用法: node tools/fix-bold.js <文件> [--dry]'); process.exit(2); }
const fp = path.resolve(file);
let src = fs.readFileSync(fp, 'utf8');
const before = src;

/* 只处理正文区（<article> 到 </article>），避免误伤脚本与样式 */
const start = src.indexOf('<article');
const end = src.indexOf('</article>');
if (start < 0 || end < 0) { console.error('未找到 article 区域'); process.exit(2); }
let head = src.slice(0, start), body = src.slice(start, end), tail = src.slice(end);

const stats = { patternA: 0, patternB: 0 };

/* A) **文字</strong>  →  <strong>文字</strong>   （要求文字里不含 ** 与 < >） */
body = body.replace(/\*\*([^*<>]{1,240}?)<\/strong>/g, (m, inner) => {
  stats.patternA++;
  return '<strong>' + inner + '</strong>';
});

/* B) </strong>文字<strong> → <strong>文字</strong> （两头被写成闭合标签） */
body = body.replace(/<\/strong>([^<>*]{1,160}?)<strong>/g, (m, inner) => {
  stats.patternB++;
  return '<strong>' + inner + '</strong>';
});

src = head + body + tail;

const strongOpen = (src.match(/<strong>/g) || []).length;
const strongClose = (src.match(/<\/strong>/g) || []).length;
const stars = (src.match(/\*\*/g) || []).length;

console.log(`文件：${path.relative(process.cwd(), fp)}`);
console.log(`  修复 A 类（**文字</strong>）：${stats.patternA} 处`);
console.log(`  修复 B 类（</strong>文字<strong>）：${stats.patternB} 处`);
console.log(`  修复后 <strong> ${strongOpen} / </strong> ${strongClose}，剩余字面 **：${stars}`);
if (strongOpen !== strongClose) {
  console.log('  ⚠ 加粗标签仍不平衡，需要人工检查（可用 tools/check-html.js 定位）。');
}
if (stars) {
  const ctx = [];
  const re = /\*\*/g; let m;
  while ((m = re.exec(body)) && ctx.length < 5) {
    ctx.push(body.slice(Math.max(0, m.index - 70), m.index + 70).replace(/\n/g, ' '));
  }
  console.log('  ⚠ 剩余 ** 的上下文：');
  ctx.forEach(c => console.log('     …' + c + '…'));
}

if (dry) { console.log('  （--dry 模式，未写入文件）'); process.exit(0); }
if (src === before) { console.log('  文件无需修改。'); process.exit(0); }
fs.writeFileSync(fp, src, 'utf8');
console.log('  已写入。');
