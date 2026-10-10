/* 打印文件尾部：node tools/tail.js <文件> [行数] */
'use strict';
const fs = require('fs');
const f = process.argv[2];
const n = Number(process.argv[3] || 25);
const lines = fs.readFileSync(f, 'utf8').split('\n');
console.log('总行数 ' + lines.length);
console.log(lines.slice(-n).map((l, i) => (lines.length - n + i + 1) + ': ' + l.slice(0, 200)).join('\n'));
