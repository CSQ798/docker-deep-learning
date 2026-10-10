/* 从会话日志中恢复某次 write 调用的原始内容 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const file = process.argv[2];
const needle = process.argv[3] || 'ch01';
if (!file) { console.error('用法: node tools/recover.js <session.jsonl.zstd> <文件名关键词>'); process.exit(2); }

const raw = fs.readFileSync(file);
let text;
try { text = zlib.zstdDecompressSync(raw).toString('utf8'); }
catch (e) { console.error('解压失败: ' + e.message); process.exit(2); }

console.log('解压后字节数: ' + text.length);

const lines = text.split('\n').filter(Boolean);
console.log('日志条目数: ' + lines.length);

let hits = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].indexOf(needle) < 0) continue;
  let obj;
  try { obj = JSON.parse(lines[i]); } catch (e) { continue; }
  const s = JSON.stringify(obj);
  if (s.indexOf('"write"') < 0 && s.indexOf('write_file') < 0 && s.indexOf('file_path') < 0) continue;
  hits++;
  /* 深度搜索所有字符串值，找出最长的那个（通常就是文件内容） */
  let best = '', bestPath = '';
  (function walk(v, key) {
    if (typeof v === 'string') {
      if (v.length > best.length) { best = v; bestPath = key || ''; }
      return;
    }
    if (Array.isArray(v)) { v.forEach(x => walk(x, key)); return; }
    if (v && typeof v === 'object') {
      for (const k of Object.keys(v)) walk(v[k], k);
    }
  })(obj, '');

  if (best.length > 2000) {
    console.log(`\n--- 条目 ${i} 命中，最长字符串 ${best.length} 字符（字段: ${bestPath}）---`);
    if (/<!DOCTYPE html>/i.test(best)) {
      const out = path.resolve(__dirname, '..', '.recovered-' + needle + '.html');
      fs.writeFileSync(out, best, 'utf8');
      console.log('已保存到: ' + out);
      console.log('其中 </strong>…<strong> 反转缺陷数量: ' +
        (best.match(/<\/strong>(?:(?!<strong>)[\s\S]){1,120}?<strong>/g) || []).length);
    } else {
      console.log('（这段不是 HTML 全文，前 200 字：' + best.slice(0, 200).replace(/\n/g, ' ') + '）');
    }
  }
}
console.log(`\n共命中 ${hits} 条相关日志。`);
