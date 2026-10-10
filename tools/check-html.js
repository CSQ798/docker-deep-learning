/* ============================================================================
 * HTML 结构体检：node tools/check-html.js [章节关键词]
 * 不依赖任何外部库，检查：
 *   1) 标签是否成对闭合（忽略自闭合与 void 元素）
 *   2) 是否出现未转义的裸 & 与尖括号
 *   3) 关键容器是否只出现一次（topbar / sidebar / article 等）
 *   4) class 是否都是样式表里定义过的（防止写出没有样式的组件）
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/* 样式表里出现过的 class 名 */
const css = fs.readFileSync(path.join(ROOT, 'assets', 'style.css'), 'utf8');
const CSS_CLASSES = new Set((css.match(/\.[A-Za-z][A-Za-z0-9_-]*/g) || []).map(s => s.slice(1)));

const filter = process.argv[2] || '';
const files = [];
for (const dir of [ROOT, CH_DIR]) {
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    if (f.startsWith('_')) continue;
    if (filter && !f.includes(filter)) continue;
    files.push(path.join(dir, f));
  }
}
if (!files.length) { console.log('没有匹配的 HTML 文件。'); process.exit(0); }

let totalProblems = 0;

for (const fp of files) {
  const html = fs.readFileSync(fp, 'utf8');
  const rel = path.relative(ROOT, fp).replace(/\\/g, '/');
  const problems = [];

  /* 1) 标签配对 */
  const stack = [];
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let m;
  /* 先把 script/style 内容挖掉，避免里面出现 < > 造成误判 */
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');
  while ((m = tagRe.exec(stripped))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] || '';
    if (VOID.has(tag)) continue;
    if (attrs.trim().endsWith('/')) continue;
    if (!closing) stack.push({ tag, index: m.index });
    else {
      const top = stack.pop();
      if (!top) problems.push(`多余的结束标签 </${tag}>`);
      else if (top.tag !== tag) problems.push(`标签不匹配：<${top.tag}> 被 </${tag}> 关闭`);
    }
  }
  stack.forEach(s => problems.push(`未闭合的标签 <${s.tag}>`));

  /* 2) 未转义的裸 &（先挖掉 pre/code/script/style，里面的 && 是代码，不是 HTML 错误） */
  const textOnly = html.replace(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, m => ' '.repeat(m.length));
  const bareAmp = textOnly.match(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)/g);
  if (bareAmp) problems.push(`正文出现 ${bareAmp.length} 处未转义的 &`);

  /* 3) 关键容器唯一性 */
  const mustHave = rel.startsWith('chapters/')
    ? ['id="topbar"', 'id="sidebar"', 'id="article"', 'id="chnav"']
    : ['id="topbar"', 'id="sidebar"'];
  mustHave.forEach(k => {
    const n = (html.split(k).length - 1);
    if (n !== 1) problems.push(`${k} 出现 ${n} 次（应为 1 次）`);
  });

  /* 4) 未知 class */
  const classAttrs = html.match(/class="([^"]*)"/g) || [];
  const unknown = new Set();
  classAttrs.forEach(ca => {
    ca.slice(7, -1).split(/\s+/).filter(Boolean).forEach(c => {
      if (!CSS_CLASSES.has(c)) unknown.add(c);
    });
  });
  if (unknown.size) problems.push('样式表中未定义的 class：' + [...unknown].join('、'));

  /* 5) 编码与标题 */
  const expectPage = path.basename(fp).replace(/\.html$/, '').split('-')[0];
  if (rel.startsWith('chapters/')) {
    const m2 = html.match(/data-page="([^"]+)"/);
    if (m2 && m2[1] !== expectPage) problems.push(`data-page="${m2[1]}" 与文件名前缀 "${expectPage}" 不一致`);
  }
  if (!/<meta charset="UTF-8">/i.test(html)) problems.push('缺少 <meta charset="UTF-8">');

  if (problems.length) {
    totalProblems += problems.length;
    console.log(`\n✗ ${rel}`);
    problems.forEach(p => console.log('   - ' + p));
  } else {
    console.log(`✓ ${rel}`);
  }
}

console.log(totalProblems ? `\n共发现 ${totalProblems} 处结构问题。\n` : '\nHTML 结构体检全部通过。\n');
process.exit(totalProblems ? 1 : 0);
