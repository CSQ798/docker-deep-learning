/* 把由多个 zstd 帧拼接而成的 .zstd 文件完整解压（Node 的 zstd API 只解第一帧） */
'use strict';
const fs = require('fs');
const zlib = require('zlib');

const MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd]);

function frameLength(buf, start) {
  let p = start + 4;
  const fhd = buf[p++];
  const fcsFlag = fhd >> 6;
  const singleSegment = (fhd >> 5) & 1;
  const checksum = (fhd >> 2) & 1;
  const dictFlag = fhd & 3;

  if (!singleSegment) p += 1;                     /* window descriptor */
  if (dictFlag === 1) p += 1;
  else if (dictFlag === 2) p += 2;
  else if (dictFlag === 3) p += 4;

  let fcsSize = 0;
  if (fcsFlag === 0) fcsSize = singleSegment ? 1 : 0;
  else if (fcsFlag === 1) fcsSize = 2;
  else if (fcsFlag === 2) fcsSize = 4;
  else fcsSize = 8;
  p += fcsSize;

  /* 扫描数据块 */
  for (;;) {
    if (p + 3 > buf.length) return buf.length - start;
    const h = buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16);
    const last = h & 1;
    const type = (h >> 1) & 3;
    const size = h >> 3;
    p += 3;
    if (type === 0) p += size;                    /* raw */
    else if (type === 1) p += 1;                  /* RLE */
    else if (type === 2) p += size;               /* compressed */
    else return buf.length - start;               /* reserved：放弃，交给整体兜底 */
    if (last) break;
  }
  if (checksum) p += 4;
  return p - start;
}

function decompressAll(file) {
  const buf = fs.readFileSync(file);
  const parts = [];
  let off = 0, frames = 0;
  while (off < buf.length) {
    if (buf.indexOf(MAGIC, off) !== off) {
      /* 不是帧头，尝试整体兜底 */
      try { parts.push(zlib.zstdDecompressSync(buf.slice(off))); } catch (e) { /* 忽略 */ }
      break;
    }
    const len = frameLength(buf, off);
    try {
      parts.push(zlib.zstdDecompressSync(buf.slice(off, off + len)));
      frames++;
    } catch (e) {
      /* 单帧失败则尝试用剩余数据整体解压 */
      try { parts.push(zlib.zstdDecompressSync(buf.slice(off))); } catch (e2) { /* 忽略 */ }
      break;
    }
    off += len;
  }
  return { text: Buffer.concat(parts).toString('utf8'), frames };
}

module.exports = { decompressAll };

if (require.main === module) {
  const file = process.argv[2];
  const needle = process.argv[3] || '';
  const path = require('path');
  const { text, frames } = decompressAll(file);
  console.log(`帧数 ${frames}，解压后 ${text.length} 字符`);
  const lines = text.split('\n').filter(Boolean);
  console.log(`日志条目 ${lines.length} 条`);
  if (!needle) process.exit(0);

  let saved = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(needle) < 0) continue;
    let obj; try { obj = JSON.parse(lines[i]); } catch (e) { continue; }
    let best = '';
    (function walk(v) {
      if (typeof v === 'string') { if (v.length > best.length) best = v; return; }
      if (Array.isArray(v)) { v.forEach(walk); return; }
      if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k]);
    })(obj);
    if (best.length > 3000 && /<!DOCTYPE html>/i.test(best)) {
      const out = path.resolve(__dirname, '..', '.recovered-' + needle.replace(/[^\w.-]/g, '_') + '.html');
      fs.writeFileSync(out, best, 'utf8');
      const rev = (best.match(/<\/strong>(?:(?!<strong>)[\s\S]){1,120}?<strong>/g) || []).length;
      console.log(`条目 ${i}: 恢复 ${best.length} 字符 → ${out}（反转 strong 缺陷 ${rev} 处）`);
      saved++;
    }
  }
  console.log(saved ? `共恢复 ${saved} 个版本。` : '未找到完整 HTML 内容。');
}
