/* 列出未转义 & 的上下文：node tools/check-amp.js [章节关键词] */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');
const filter = process.argv[2] || '';
const files = fs.readdirSync(CH_DIR).filter(f => f.endsWith('.html') && !f.startsWith('_') && (!filter || f.includes(filter)));

for (const f of files) {
  let t = fs.readFileSync(path.join(CH_DIR, f), 'utf8');
  /* 挖掉受保护区，只保留正文 */
  t = t.replace(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, m => ' '.repeat(m.length));
  const re = /&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)/g;
  let m, n = 0, out = [];
  while ((m = re.exec(t)) && n < 6) {
    out.push(t.slice(Math.max(0, m.index - 45), m.index + 45).replace(/\s+/g, ' '));
    n++;
  }
  const total = (t.match(re) || []).length;
  if (total) {
    console.log(`\n${f}：${total} 处`);
    out.forEach(c => console.log('   …' + c + '…'));
  }
}
