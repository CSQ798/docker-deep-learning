/* ============================================================================
 * 从会话日志重建某个文件的历史版本
 * 用法: node tools/rebuild.js <session.jsonl.zstd> <文件名关键词>
 * 它会按顺序回放日志里对该文件的 write / edit 调用，打印每个版本的规模，
 * 并把最后一个版本保存为 .rebuilt-<关键词>.html
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const { decompressAll } = require('./zstd-multi.js');

const file = process.argv[2];
const needle = process.argv[3];
if (!file || !needle) { console.error('用法: node tools/rebuild.js <session.jsonl.zstd> <关键词>'); process.exit(2); }

const { text, frames } = decompressAll(file);
console.log(`帧数 ${frames}，日志 ${text.length} 字符`);

const lines = text.split('\n').filter(Boolean);
const events = [];
for (const l of lines) {
  let o; try { o = JSON.parse(l); } catch (e) { continue; }
  if (o.type !== 'tool/call') continue;
  events.push(o.data);
}

console.log(`工具调用事件 ${events.length} 条`);
console.log('样例结构: ' + JSON.stringify(events[0]).slice(0, 300));

let cur = null;
let versions = 0;
for (const ev of events) {
  const name = ev.name || ev.tool || '';
  let args = ev.args || ev.arguments || ev.input || {};
  if (typeof args === 'string') { try { args = JSON.parse(args); } catch (e) { continue; } }
  const fp = args.file_path || args.path || args.filePath || '';
  if (!fp || String(fp).indexOf(needle) < 0) continue;

  if (/write/i.test(name) && (args.content != null)) {
    cur = String(args.content);
    versions++;
    console.log(`  [write] 版本 ${versions}：${cur.length} 字符`);
  } else if (/edit/i.test(name) && cur && args.old_string != null) {
    const before = cur.length;
    if (cur.indexOf(args.old_string) < 0) {
      console.log(`  [edit] 未匹配（跳过）：${String(args.old_string).slice(0, 60).replace(/\n/g, '⏎')}`);
      continue;
    }
    cur = cur.split(args.old_string).join(args.new_string == null ? '' : String(args.new_string));
    versions++;
    console.log(`  [edit] 版本 ${versions}：${before} → ${cur.length} 字符`);
  }
}

if (!cur) { console.log('未找到可重建的内容。'); process.exit(1); }

const out = path.resolve(__dirname, '..', '.rebuilt-' + needle.replace(/[^\w.\u4e00-\u9fff-]/g, '_') + '.html');
fs.writeFileSync(out, cur, 'utf8');
const rev = (cur.match(/<\/strong>(?:(?!<strong>)[\s\S]){1,120}?<strong>/g) || []).length;
console.log(`\n最终版本 ${cur.length} 字符 → ${out}`);
console.log(`其中"反转 strong"缺陷 ${rev} 处`);
