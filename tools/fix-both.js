/* ============================================================================
 * 加粗规范化：把作者误写的 Markdown **文字** 转成 <strong>文字</strong>
 * 用法：node tools/fix-both.js [文件关键词]
 * 安全保证：只在 <pre> / <code> / <script> / <style> / 标签属性之外替换，
 *          因此代码块里的 ** 与属性里的内容都不会被碰到。
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');

const filter = process.argv[2] || '';
const files = fs.readdirSync(CH_DIR)
  .filter(f => f.endsWith('.html') && !f.startsWith('_') && (!filter || f.includes(filter)))
  .map(f => path.join(CH_DIR, f));

let grand = 0;
for (const fp of files) {
  let src = fs.readFileSync(fp, 'utf8');

  /* 切分为"受保护区"与"可处理区" */
  const parts = [];
  const protectRe = /(<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/g;
  let last = 0, m, converted = 0;
  while ((m = protectRe.exec(src))) {
    parts.push({ text: src.slice(last, m.index), safe: true });
    parts.push({ text: m[0], safe: false });
    last = m.index + m[0].length;
  }
  parts.push({ text: src.slice(last), safe: true });

  const out = parts.map(p => {
    if (!p.safe) return p.text;
    /* 再按标签切开：只有标签之外的纯文本才处理 */
    return p.text.split(/(<[^>]+>)/).map(seg => {
      if (seg.startsWith('<')) return seg;
      /* A) **文字** → <strong>文字</strong>（文字内不含 * 与尖括号） */
      let s = seg.replace(/\*\*([^*<>]{1,300}?)\*\*/g, (mm, inner) => { converted++; return '<strong>' + inner + '</strong>'; });
      /* B) 落单的 **文字</strong> / </strong>文字** 之类 */
      s = s.replace(/\*\*([^*<>]{1,300}?)<\/strong>/g, (mm, inner) => { converted++; return '<strong>' + inner + '</strong>'; });
      s = s.replace(/<\/strong>([^<>*]{1,300}?)\*\*/g, (mm, inner) => { converted++; return '<strong>' + inner + '</strong>'; });
      /* C) __文字__ */
      s = s.replace(/__([^_<>]{1,300}?)__/g, (mm, inner) => { converted++; return '<strong>' + inner + '</strong>'; });
      return s;
    }).join('');
  }).join('');

  const open = (out.match(/<strong>/g) || []).length;
  const close = (out.match(/<\/strong>/g) || []).length;
  const left = (out.replace(/<pre\b[\s\S]*?<\/pre>/g, '').match(/\*\*/g) || []).length;

  const rel = path.relative(ROOT, fp);
  if (converted || open !== close || left) {
    console.log(`${rel}: 转换 ${converted} 处　<strong> ${open} / </strong> ${close}　剩余** ${left}`);
  } else {
    console.log(`${rel}: 无需修改`);
  }
  if (converted) fs.writeFileSync(fp, out, 'utf8');
  grand += converted;
}
console.log(`\n合计转换 ${grand} 处。`);
