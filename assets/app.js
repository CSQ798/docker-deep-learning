/* ============================================================================
 * 深海与木箱 · Docker 深度学习手册  ——  交互脚本
 * ----------------------------------------------------------------------------
 * 职责：
 *   1) 自动把正文里出现的术语变成可点击的词（跳过代码块、链接、标题里的代码）
 *   2) 点击术语时弹出「英文缩写 / 英文全称 / 中文释义 / 详细解释 / 学法提示」
 *   3) 生成侧边栏目录与当前小节高亮
 *   4) 首页与章节页的数据渲染
 *   5) 术语总表页的搜索与分类筛选
 *   6) 阅读进度条、打印前自动展开折叠内容、字号调节、术语下划线开关
 * ==========================================================================*/
(function () {
  'use strict';

  var CATS = window.DL_CATEGORIES || [];
  var TERMS = window.DL_TERMS || [];
  var CHS = window.DL_CHAPTERS || [];
  var META = window.DL_META || {};

  /* ---------------------------------------------------------------- 工具 */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function catName(key) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].key === key) return CATS[i].name;
    return '其他';
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* 每个术语的唯一 id：用于术语总表锚点与弹窗导航 */
  TERMS.forEach(function (t, i) { t._i = i; t._id = 'term-' + i; });

  /* 别名 → 术语 映射（术语本身 + alias） */
  var ALIAS = {};
  TERMS.forEach(function (t) {
    ALIAS[t.term] = t;
    (t.alias || []).forEach(function (a) { if (a && !ALIAS[a]) ALIAS[a] = t; });
  });

  /* 参与自动加下划线的词（仅 link: true），长词优先匹配 */
  /* 真实写作中大量出现的普通英文单词与通用中文词，不做自动标注，
     否则正文会满屏下划线，反而干扰阅读。它们仍然完整地存在于术语总表中，
     读者可以在术语总表里查阅到。 */
  var LINK_STOP = {
    'Image': 1, 'Layer': 1, 'Context': 1, 'Network': 1, 'Volume': 1, 'Tag': 1,
    'Repository': 1, 'Registry': 1, 'Container': 1, 'Service': 1, 'Signal': 1,
    'Kernel': 1, 'daemon': 1, 'Desktop': 1, 'system df': 1, 'prune': 1, 'stats': 1,
    'cache': 1, 'run': 1, 'exec': 1, 'logs': 1, 'inspect': 1, 'cp': 1, 'publish': 1,
    'services': 1, 'context': 1, 'secret': 1, 'Secrets': 1, 'bridge': 1, 'volume': 1,
    'tag': 1, 'registry': 1, 'namespace': 1, 'Namespace': 1, 'namespaces': 1,
    'capabilities': 1, 'Privileged': 1, 'distroless': 1, 'defunct': 1,
    '1 号进程': 1, 'init 进程': 1, '-p': 1, 'cp': 1,
    '镜像仓库': 1, '基础镜像': 1, '环境变量': 1
  };

  var LINK_WORDS = [];
  TERMS.forEach(function (t) {
    if (t.link === false) return;
    if (!LINK_STOP[t.term]) LINK_WORDS.push(t.term);
    (t.alias || []).forEach(function (a) {
      if (!a || LINK_STOP[a]) return;
      if (/[A-Za-z]/.test(a) || a.length >= 4) LINK_WORDS.push(a);
    });
  });
  LINK_WORDS = LINK_WORDS.filter(function (w, i, arr) { return w && arr.indexOf(w) === i; });
  LINK_WORDS.sort(function (a, b) { return b.length - a.length; });

  var LINK_RE = LINK_WORDS.length
    ? new RegExp('(' + LINK_WORDS.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g')
    : null;

  /* ============================ 术语弹窗 ============================ */
  var mask, modal, navIdx = 0, navList = [];

  function buildModal() {
    mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.setAttribute('role', 'dialog');
    mask.setAttribute('aria-modal', 'true');
    mask.innerHTML =
      '<div class="modal" role="document">' +
        '<button class="m-close" aria-label="关闭">✕</button>' +
        '<div class="m-body"></div>' +
      '</div>';
    document.body.appendChild(mask);
    modal = $('.modal', mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
    $('.m-close', mask).addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (!mask.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (!navList.length) return;
        navIdx = (navIdx + (e.key === 'ArrowRight' ? 1 : navList.length - 1)) % navList.length;
        renderTerm(navList[navIdx], false);
      }
    });
  }

  function closeModal() {
    if (mask) mask.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderTerm(t, push) {
    if (!t || !modal) return;
    var body = $('.m-body', modal);
    body.innerHTML =
      '<div class="m-cat">' + esc(catName(t.cat)) + '</div>' +
      '<h3 class="m-term">' + esc(t.term) + '</h3>' +
      (t.abbr && t.abbr !== '—' ? '<span class="m-abbr">' + esc(t.abbr) + '</span>' : '') +
      '<span class="m-en">' + esc(t.en) + '</span>' +
      '<div class="m-zh">' + esc(t.zh) + '</div>' +
      '<div class="m-def">' + esc(t.def) + '</div>' +
      (t.tip ? '<div class="m-tip"><b>学法提示：</b>' + esc(t.tip) + '</div>' : '') +
      '<div class="m-foot">' +
        '<span>← → 键可翻阅相邻术语，Esc 关闭</span>' +
        '<span><a href="' + pagePrefix() + 'glossary.html#' + t._id + '">在术语总表中查看 →</a></span>' +
      '</div>';
    navIdx = t._i;
  }

  /* 章节页在 chapters/ 目录下，需要回到上一级 */
  function pagePrefix() {
    return /[\\/]chapters[\\/][^\\/]*$/.test(location.pathname) || /\/chapters\//.test(location.pathname.replace(/\\/g, '/')) ? '../' : '';
  }

  function openTerm(t) { navList = TERMS; renderTerm(t, true); mask.classList.add('open'); document.body.style.overflow = 'hidden'; }

  /* 中文没有空格，正则无法用词边界判断"一个词到哪里结束"。
     例如正文里的"镜像仓库"会被短词"镜像"先命中。这里的做法是：
     凡是"某个更长术语的前缀"的说法，一律跳过，交给更长的那个词去匹配。 */
  var EXTEND = {};
  TERMS.forEach(function (t) {
    [t.term].concat(t.alias || []).forEach(function (w) {
      for (var n = 2; n < w.length; n++) EXTEND[w.slice(0, n)] = 1;
    });
  });

  /* 每个术语在整页中的自动标注上限：超过之后不再加下划线。
     读者不需要看到同一个词的每一次出现都是链接；重复出现几次，
     既能在需要的时候被点到，又不会把正文变成一片下划线。 */
  var LINK_MAX = {
    '容器': 8, '镜像': 8, '虚拟机': 6, '虚拟化': 4, '内核': 4, '操作系统': 4,
    'Linux': 6, 'Docker': 6, 'Docker Desktop': 4, 'Dockerfile': 5, 'Compose': 5,
    'Docker Compose': 4, '数据卷': 4, '绑定挂载': 4, '服务': 4, '网络': 4,
    '命名空间': 3, 'cgroups': 3, 'Kubernetes': 3, '容器编排': 3, '层': 4
  };
  var DEFAULT_MAX = 3;

  function linkBudget(term) { return LINK_MAX[term] || DEFAULT_MAX; }

  /* ======================= 正文术语自动注入 ======================= */
  var SKIP_TAGS = { CODE: 1, PRE: 1, A: 1, SCRIPT: 1, STYLE: 1, BUTTON: 1, INPUT: 1, TEXTAREA: 1, KBD: 1, SUMMARY: 1, H1: 1, H2: 1, H3: 1 };

  /* 用 DOMParser 逐段处理，避免破坏原文本；仅处理"纯文本"节点 */
  function linkify(root) {
    if (!LINK_RE || !root) return 0;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentNode;
        while (p && p !== root) {
          if (SKIP_TAGS[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if (p.classList && (p.classList.contains('term') || p.classList.contains('no-linkify'))) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var targets = [], n;
    while ((n = walker.nextNode())) targets.push(n);
    var count = 0;
    var touched = 0, tally = {};
    targets.forEach(function (node) {
      var text = node.nodeValue;
      LINK_RE.lastIndex = 0;
      if (text.search(LINK_RE) < 0) return;
      LINK_RE.lastIndex = 0;
      var frag = document.createDocumentFragment();
      var last = 0, m, seen = {}, hit = 0;
      while ((m = LINK_RE.exec(text))) {
        var word = m[0], t = ALIAS[word];
        if (!t) continue;
        if (seen[t.term]) continue;              /* 同一段里同一术语只标一次，避免下划线过密 */
        /* 整页预算：同一个术语标注到一定次数后就不再标了 */
        if ((tally[t.term] || 0) >= linkBudget(t.term)) continue;
        /* 中文词边界：若这个词其实是某个更长术语的前缀，跳过，让长词去命中 */
        if (EXTEND[word]) continue;
        /* 纯英文/数字词要求词边界，避免命中 "runc" 里的 "un" 之类 */
        if (/^[A-Za-z0-9._-]+$/.test(word)) {
          var before = text[m.index - 1], after = text[m.index + word.length];
          if ((before && /[A-Za-z0-9_.-]/.test(before)) || (after && /[A-Za-z0-9_.-]/.test(after))) continue;
        }
        seen[t.term] = 1;
        tally[t.term] = (tally[t.term] || 0) + 1;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var span = document.createElement('span');
        span.className = 'term no-linkify';
        span.setAttribute('role', 'button');
        span.setAttribute('tabindex', '0');
        span.setAttribute('data-term', String(t._i));
        span.title = t.term + ' · ' + t.zh + '（点击查看详细解释）';
        span.textContent = word;
        frag.appendChild(span);
        last = m.index + word.length;
        hit++;
      }
      if (!hit) return;
      frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
      touched += hit;
    });
    return touched;
  }

  /* 事件委托：点击 / 回车打开术语 */
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('.term[data-term]') : null;
    if (el) { e.preventDefault(); openTerm(TERMS[+el.getAttribute('data-term')]); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest ? e.target.closest('.term[data-term]') : null;
    if (el) { e.preventDefault(); openTerm(TERMS[+el.getAttribute('data-term')]); }
  });

  /* ============================ 阅读进度 ============================ */
  function initProgress() {
    var bar = document.createElement('div');
    bar.className = 'progress';
    document.body.appendChild(bar);
    function upd() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0) + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ============================ 侧边栏 ============================ */
  function chapterHref(c) {
    return pagePrefix() + 'chapters/' + c.file;
  }

  function initSidebar(pageId) {
    var host = $('#sidebar');
    if (!host) return;
    var html = '<p class="side-title">学 习 地 图</p><ul class="toc">';
    CHS.forEach(function (c) {
      var on = c.id === pageId ? ' class="active"' : '';
      html += '<li><a href="' + chapterHref(c) + '"' + on + '><span class="n">' + c.num + '</span><span class="t">' + esc(c.short) + '</span></a></li>';
    });
    html += '</ul>';

    /* 当前页的一级/二级小节 */
    var hs = $$('.article h2, .article h3').filter(function (h) { return h.id; });
    if (hs.length) {
      html += '<p class="side-title">本 章 目 录</p><ul class="toc-sec">';
      hs.forEach(function (h) {
        html += '<li><a href="#' + h.id + '" class="' + (h.tagName === 'H3' ? 'lvl3' : 'lvl2') + '">' + esc(h.getAttribute('data-toc') || h.textContent.replace(/^\s*\d+\s*/, '').trim()) + '</a></li>';
      });
      html += '</ul>';
    }

    html += '<p class="side-title">其 他</p><ul class="toc">' +
      '<li><a href="' + pagePrefix() + 'index.html"><span class="n">◎</span><span class="t">总览与地图</span></a></li>' +
      '<li><a href="' + pagePrefix() + 'glossary.html"><span class="n">※</span><span class="t">术语总表</span></a></li>' +
      '</ul>';

    html += '<p class="side-note">阅读提示：正文中<b>带点状下划线的词</b>都可以点击，会弹出它的英文全称、中文释义与详细解释。遇到不懂的词，别跳过——那正是你成长的入口。</p>';
    host.innerHTML = html;

    /* 滚动高亮 */
    var links = $$('.toc-sec a', host);
    if (links.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        });
      }, { rootMargin: '-72px 0px -70% 0px', threshold: 0 });
      hs.forEach(function (h) { io.observe(h); });
    }
  }

  /* ============================ 顶栏工具 ============================ */
  function buildTopbar(pageId) {
    var bar = $('#topbar');
    if (!bar) return;
    bar.innerHTML =
      '<a class="brand plain" href="' + pagePrefix() + 'index.html"><b>深海与木箱</b><span>DOCKER 深度学习手册</span></a>' +
      '<nav>' +
        '<a href="' + pagePrefix() + 'index.html" class="' + (pageId === 'home' ? 'active' : '') + '">总览</a>' +
        '<a href="' + pagePrefix() + 'glossary.html" class="' + (pageId === 'glossary' ? 'active' : '') + '">术语总表</a>' +
        '<a href="' + pagePrefix() + 'index.html#howto">怎么用</a>' +
      '</nav>' +
      '<div class="tools">' +
        '<button class="iconbtn" id="btn-link" title="显示或隐藏正文中的术语下划线">术语下划线</button>' +
        '<button class="iconbtn" id="btn-font" title="调整正文字号">字号</button>' +
        '<button class="iconbtn" id="btn-print" title="打印或导出为 PDF">打印 / 存 PDF</button>' +
      '</div>';

    /* 术语下划线开关 */
    var btnL = $('#btn-link', bar), on = store('dl.link') !== '0';
    function applyLink() {
      document.documentElement.classList.toggle('no-autolink', !on);
      btnL.classList.toggle('on', on);
    }
    applyLink();
    btnL.addEventListener('click', function () { on = !on; store('dl.link', on ? '1' : '0'); applyLink(); });

    /* 字号 */
    var steps = [16, 17.5, 19, 21], si = +(store('dl.font') || 1);
    if (isNaN(si) || si < 0 || si > 3) si = 1;
    function applyFont() { document.documentElement.style.fontSize = steps[si] + 'px'; }
    applyFont();
    $('#btn-font', bar).addEventListener('click', function () { si = (si + 1) % steps.length; store('dl.font', si); applyFont(); });

    /* 打印：先展开所有折叠内容 */
    $('#btn-print', bar).addEventListener('click', function () {
      var closed = $$('details:not([open])');
      closed.forEach(function (d) { d.open = true; });
      window.print();
    });
  }

  /* ============================ 首页渲染 ============================ */
  function renderHome() {
    var map = $('#map');
    if (map) {
      map.innerHTML = CHS.map(function (c) {
        return '<a href="' + chapterHref(c) + '">' +
          '<div class="mn">第 ' + c.num + ' 章</div>' +
          '<div class="mt">' + esc(c.title) + '</div>' +
          '<div class="ms">' + esc(c.tagline || '') + '</div>' +
          '<div class="md">' + esc(c.desc || '') + '</div>' +
        '</a>';
      }).join('');
    }
    var st = $('#stats');
    if (st) {
      var deep = CHS.filter(function (c) { return c.id !== 'ch00'; }).length;
      st.innerHTML =
        '<div><b>' + deep + '</b>个深入学习板块</div>' +
        '<div><b>' + CHS.length + '</b>章连续阅读路径</div>' +
        '<div><b>' + TERMS.length + '</b>条术语详解</div>' +
        '<div><b>' + CATS.length + '</b>个术语分类</div>' +
        '<div><b>' + (deep * 10) + 'k+</b>字正文（每章万字以上）</div>';
    }
    var tc = $('#term-cloud');
    if (tc) {
      tc.innerHTML = TERMS.filter(function (t) { return t.link !== false; }).map(function (t, i) {
        return '<a href="glossary.html#' + t._id + '">' + esc(t.term) + '</a>';
      }).join('');
    }
    /* 首页上的示例术语也做成可点击 */
    linkify($('#article') || document.body);
  }

  /* ============================ 术语总表渲染 ============================ */
  function renderGlossary() {
    var host = $('#glossary-body');
    if (!host) return;
    var q = '', cat = 'all';

    function draw() {
      var kw = q.trim().toLowerCase();
      var out = '', total = 0;
      CATS.forEach(function (c) {
        if (cat !== 'all' && cat !== c.key) return;
        var items = TERMS.filter(function (t) {
          if (t.cat !== c.key) return false;
          if (!kw) return true;
          var hay = [t.term, (t.alias || []).join(' '), t.abbr, t.en, t.zh, t.def, t.tip].join(' ').toLowerCase();
          return hay.indexOf(kw) >= 0;
        });
        if (!items.length) return;
        total += items.length;
        out += '<section class="gl-cat"><h2>' + esc(c.name) + '<span class="gl-count">　共 ' + items.length + ' 条</span></h2>';
        items = items.sort(function (a, b) { return a.term.localeCompare(b.term, 'zh'); });
        items.forEach(function (t) {
          out += '<article class="gl-item" id="' + t._id + '">' +
            '<h3>' + esc(t.term) + '</h3>' +
            '<div class="g-en">' + (t.abbr && t.abbr !== '—' ? '[' + esc(t.abbr) + '] ' : '') + esc(t.en) + '</div>' +
            '<div class="g-zh">' + esc(t.zh) + '</div>' +
            '<div class="g-def">' + esc(t.def) + '</div>' +
            (t.tip ? '<div class="g-tip"><b>学法提示：</b>' + esc(t.tip) + '</div>' : '') +
            '<div class="g-more"><a href="javascript:void(0)" data-pop="' + t._i + '">弹出卡片查看 →</a>　' +
            (t.link === false ? '<span style="color:var(--slate-70)">（此词不参与正文自动标注）</span>' : '') + '</div>' +
          '</article>';
        });
        out += '</section>';
      });
      host.innerHTML = out || '<p style="color:var(--slate)">没有匹配的术语。换个关键词试试，或清空筛选。</p>';
      $('#gl-total').textContent = total;
    }

    $('#gl-search').addEventListener('input', function (e) { q = e.target.value; draw(); });
    $$('#gl-chips .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#gl-chips .chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        cat = b.getAttribute('data-cat');
        draw();
      });
    });
    host.addEventListener('click', function (e) {
      var a = e.target.closest('[data-pop]');
      if (a) { e.preventDefault(); openTerm(TERMS[+a.getAttribute('data-pop')]); }
    });
    draw();
    if (location.hash) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(function () { el.scrollIntoView({ block: 'center' }); }, 60);
    }
  }

  /* ============================ 启动 ============================ */
  function boot() {
    var pageId = document.body.getAttribute('data-page') || '';
    buildModal();
    buildTopbar(pageId === 'home' ? 'home' : pageId === 'glossary' ? 'glossary' : pageId);
    initSidebar(pageId);
    initProgress();

    if (pageId === 'home') renderHome();
    else if (pageId === 'glossary') renderGlossary();
    else {
      var art = $('#article');
      if (art) linkify(art);
      /* 章节页底部/顶部导航由静态 HTML 提供；此处补上"上一章 / 下一章"锚点 */
      var idx = -1;
      CHS.forEach(function (c, i) { if (c.id === pageId) idx = i; });
      var nav = $('#chnav');
      if (nav && idx >= 0) {
        var prev = CHS[idx - 1], next = CHS[idx + 1];
        nav.innerHTML =
          (prev ? '<a class="pv" href="' + prev.file + '"><span class="lbl">上一章</span>← ' + esc(prev.short) + '</a>' : '<a class="pv" href="../index.html"><span class="lbl">返回</span>← 总览与地图</a>') +
          (next ? '<a class="nx" href="' + next.file + '"><span class="lbl">下一章</span>' + esc(next.short) + ' →</a>' : '<a class="nx" href="../glossary.html"><span class="lbl">继续</span>术语总表 →</a>');
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
