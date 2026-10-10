/* ============================================================================
 * 自检脚本  ——  深海与木箱 · Docker 深度学习手册
 * 用法： node tools/check.js            校验全部章节
 *        node tools/check.js ch05        只校验某一章
 * 校验内容：
 *   1) 章首 / 章末结构区块是否齐备
 *   2) 正文纯文本中文字数（去掉 HTML 标签、脚本、代码块）
 *   3) 各种必需元素的数量（回望、前瞻、方法、易错、比喻、折叠、表格、代码块、思考题）
 *   4) 文件是否存在、data-page 与文件名是否对应
 *   5) 是否出现禁止的空话套话
 *   6) 是否手写了 data-term、内联 style、emoji、外部 CDN
 *   7) 资源链接是否都在白名单内
 * ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CH_DIR = path.join(ROOT, 'chapters');
const only = process.argv[2] || '';

/* 从 chapters.data.js 里读取章节清单（不执行文件，直接解析） */
const chSrc = fs.readFileSync(path.join(ROOT, 'data', 'chapters.data.js'), 'utf8');
const CHAPTERS = [];
{
  const blocks = chSrc.split(/\n\s*\{\s*\n/).slice(1);
  for (const b of blocks) {
    const id = (b.match(/id:\s*'([^']+)'/) || [])[1];
    const file = (b.match(/file:\s*'([^']+)'/) || [])[1];
    const num = (b.match(/num:\s*'([^']+)'/) || [])[1];
    const title = (b.match(/title:\s*'([^']+)'/) || [])[1];
    if (id && file) CHAPTERS.push({ id, file, num, title });
  }
}
if (!CHAPTERS.length) { console.error('无法从 data/chapters.data.js 解析章节清单'); process.exit(2); }

/* 链接白名单：官方域名 + 具体允许的第三方站点 */
const DOMAIN_OK = [
  'docs.docker.com', 'hub.docker.com', 'www.docker.com', 'opencontainers.org',
  'github.com', 'containerd.io', 'kubernetes.io', '12factor.net', 'man7.org',
  'learn.microsoft.com', 'www.kernel.org', 'yeasy.gitbook.io', 'labs.play-with-docker.com',
  'missing-semester-cn.github.io', 'roadmap.sh', 'missing.csail.mit.edu'
];

const BANNED = ['总的来说', '综上所述', '值得注意的是', '不难发现', '我们可以看到', '在当今时代', '随着技术的发展', '众所周知', '众所周知', '接下来我们来看下一个', '下面我将详细介绍'];

function readUtf8(p) { return fs.readFileSync(p, 'utf8'); }

/* 去掉代码块与脚本，再剥标签 */
function plainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ');
}

function countCJK(s) {
  const m = s.match(/[\u3400-\u4dbf\u4e00-\u9fff]/g);
  return m ? m.length : 0;
}

function count(html, re) {
  const m = html.match(re);
  return m ? m.length : 0;
}

let failures = 0, warnings = 0;
const rows = [];

for (const ch of CHAPTERS) {
  if (only && !ch.file.includes(only) && ch.id !== only) continue;
  const fp = path.join(CH_DIR, ch.file);
  const problems = [], warns = [];

  if (!fs.existsSync(fp)) {
    problems.push('文件不存在: chapters/' + ch.file);
    rows.push({ ch, cjk: 0, problems, warns });
    failures++;
    continue;
  }

  const html = readUtf8(fp);
  const txt = plainText(html);
  const cjk = countCJK(txt);

  /* 1. 结构与必需元素 */
  const need = [
    /* 说明：原先这些正则结尾多写了一个引号（如 /class="block goal"/），
       它永远不可能匹配；而且它们缺少 /g，配合 String.match 只会返回
       [整体匹配, 捕获组] 这个数组，长度恒为 2、根本不等于出现次数。
       这里统一改成：匹配到类名边界（引号或空格）为止，并加上 /g 全局标志。 */
    ['学习目标块', /class="block goal[" ]/g, 1],
    ['技能清单块', /class="block skill[" ]/g, 1],
    ['章首 tagline', /class="ch-tagline"/g, 1],
    ['开场引子', /class="ch-lead"/g, 1],
    ['回望块', /class="block back[" ]/g, 3],
    ['前瞻块', /class="block ahead[" ]/g, 3],
    ['方法块', /class="block method[" ]/g, 2],
    ['易错点块', /class="block alert[" ]/g, 2],
    ['比喻块', /class="block metaphor[" ]/g, 1],
    ['引用 blockquote', /<blockquote>/g, 1],
    ['折叠 details', /<details>/g, 4],
    ['表格', /<table>/g, 3],
    ['命令代码块', /<pre data-lang=/g, 8],
    ['命令说明 cmd-note', /class="cmd-note"/g, 6],
    ['思考块', /class="block think"/g, 2],
    ['思考题条目', /class="block think"[\s\S]*?<\/div>/g, 2],
    ['自测块', /class="block check"/g, 1],
    ['自测题', /<details><summary>参考答案<\/summary>/g, 10],
    ['章末自问自答', /id="ask"/, 1],
    ['章末总结', /id="summary"/, 1],
    ['章末拓展', /id="more"/, 1],
    ['资源列表', /class="res-list"/g, 1],
    ['书单', /class="booklist"/g, 1],
    ['章节导航容器', /id="chnav"/, 1]
  ];
  for (const [name, re, min] of need) {
    const c = count(html, re);
    if (c < min) problems.push(`${name} 不足：${c} < ${min}`);
  }

  /* H2 只统计"正文小节"（id="sN"）；章末的 selfcheck / ask / summary / more 不计入，
     因为它们由 SPEC 的章末骨架强制要求，属于固定结构而非正文小节。 */
  const h2 = count(html, /<h2 id="s\d/g);
  const h2all = count(html, /<h2 id="/g);
  if (h2 < 6) warns.push(`正文小节偏少：${h2} 个（建议 6—9）`);
  else if (h2 > 9) warns.push(`正文小节偏多：${h2} 个（建议 6—9）`);
  if (h2all - h2 !== 4) warns.push(`章末固定区块 H2 为 ${h2all - h2} 个（应为 4：selfcheck/ask/summary/more）`);

  /* 每个正文小节的篇幅（SPEC 要求 1500—3000 字，允许一定浮动） */
  const secParts = html.split(/<h2 id="s\d/g).slice(1);
  const secLens = secParts.map((p, i) => ({
    n: i + 1,
    len: countCJK(plainText('<h2 id="sX' + p.split(/<h2 id="(?:selfcheck|ask|summary|more)"/)[0]))
  }));
  const tooShort = secLens.filter(s => s.len < 900);
  const tooLong = secLens.filter(s => s.len > 4200);
  if (tooShort.length) warns.push('偏短的小节：' + tooShort.map(s => `s${s.n}(${s.len}字)`).join('、'));
  if (tooLong.length) warns.push('偏长的小节：' + tooLong.map(s => `s${s.n}(${s.len}字)`).join('、'));

  /* 2. 字数 */
  if (cjk < 10000) problems.push(`纯文本中文字数不足：${cjk} < 10000`);
  else if (cjk < 11000) warns.push(`字数 ${cjk}，低于目标区间 11000—15000`);

  /* 3. 空话套话 */
  const bannedHit = BANNED.filter(b => txt.includes(b));
  if (bannedHit.length) problems.push('出现空话套话：' + bannedHit.join('、'));

  /* 4. 技术卫生 */
  if (/data-term=/.test(html)) problems.push('手写了 data-term 属性（术语应由脚本自动标注）');
  if (/\sstyle="/.test(html)) warns.push('出现内联 style');
  if (/<img|\.png|\.jpg|\.svg/.test(html)) warns.push('出现图片引用（手册不使用图片）');
  if (/https?:\/\/(?!docs\.docker\.com|hub\.docker\.com|www\.docker\.com)/.test(html)) {
    /* 逐条做域名白名单检查 */
    const urls = (html.match(/href="(https?:\/\/[^"]+)"/g) || []).map(s => s.slice(6, -1));
    const bad = urls.filter(u => {
      let host;
      try { host = new URL(u).host; } catch (e) { return true; }
      return !DOMAIN_OK.includes(host);
    });
    if (bad.length) problems.push('白名单外的链接：' + [...new Set(bad)].join(' , '));
  }

  /* 5. data-page 与文件名 */
  const m = html.match(/<body data-page="([^"]+)"/);
  if (!m) problems.push('body 缺少 data-page');
  else if (m[1] !== ch.id) problems.push(`data-page="${m[1]}" 与章节 id "${ch.id}" 不一致`);

  /* 6. 编码 */
  if (!/^<!DOCTYPE html>/i.test(html.trim())) problems.push('缺少 DOCTYPE');

  rows.push({ ch, cjk, problems, warns });
  failures += problems.length;
  warnings += warns.length;
}

/* 输出报告 */
const pad = (s, n) => String(s).padEnd(n, ' ');
console.log('\n=== 深海与木箱 · 章节自检报告 ===\n');
console.log(pad('章节', 8) + pad('中文字数', 12) + pad('正文节', 8) + '状态');
console.log('-'.repeat(60));
for (const r of rows) {
  const status = r.problems.length ? '✗ 有问题' : (r.warns.length ? '△ 提醒' : '✓ 通过');
  console.log(pad(r.ch.id, 8) + pad(r.cjk, 12) + pad(count(readUtf8Safe(r.ch), /<h2 id="s\d/g), 8) + status);
}
function readUtf8Safe(ch) {
  const fp = path.join(CH_DIR, ch.file);
  return fs.existsSync(fp) ? readUtf8(fp) : '';
}

for (const r of rows) {
  if (!r.problems.length && !r.warns.length) continue;
  console.log('\n【' + r.ch.id + '】' + r.ch.title);
  r.problems.forEach(p => console.log('  ✗ ' + p));
  r.warns.forEach(w => console.log('  △ ' + w));
}

const total = rows.reduce((a, r) => a + r.cjk, 0);
console.log('\n------------------------------------------------------------');
console.log(`章节数：${rows.length}　中文字数合计：${total}　问题：${failures}　提醒：${warnings}`);
console.log(failures ? '\n结果：存在必须修复的问题。\n' : '\n结果：结构校验通过。\n');
process.exit(failures ? 1 : 0);
