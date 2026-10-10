/* 开发期快速体检：node tools/status.js */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');

const files = fs.readdirSync(CH_DIR).filter(f => /^ch\d.*\.html$/.test(f)).sort();
let total = 0;
console.log('章节'.padEnd(24) + '中文字数'.padEnd(10) + '正文节'.padEnd(8) + '文件KB'.padEnd(9) + '标记');
console.log('-'.repeat(66));
for (const f of files) {
  const t = fs.readFileSync(path.join(CH_DIR, f), 'utf8');
  const cjk = (t.match(/[\u4e00-\u9fff]/g) || []).length;
  const h2 = (t.match(/<h2 id="s\d/g) || []).length;
  const parts = (t.match(/<!--PART\d*-->/g) || []).join(',') || '完整';
  total += cjk;
  console.log(f.padEnd(24) + String(cjk).padEnd(10) + String(h2).padEnd(8) + String(Math.round(t.length / 1024)).padEnd(9) + parts);
}
console.log('-'.repeat(66));
console.log('合计中文字数：' + total + '（约 ' + (total / 10000).toFixed(1) + ' 万字）');
