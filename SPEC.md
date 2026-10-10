# 写作规范 · 深海与木箱（Docker 深度学习手册）

> 这份文件是**所有章节的唯一写作契约**。写任何一章之前，先完整读一遍；
> 写完一章之后，回头逐条自查。任何一条不满足，都算这一章没写完。

---

## 一、读者是谁（必须时刻记在心里）

- **大一新生，刚装上 Docker Desktop。** 计算机基础课可能才上了一学期，操作系统、网络、Linux 命令都只是听过名字。
- 他对 Docker 的全部认知是："好像是个装软件的东西。"
- 他**不怕长**，明确要求每章正文**不少于一万字**；他怕的是"看起来很长、其实什么都没说"。
- 他反感"速通"、"三分钟学会"、"保姆级"。他要的是**深度理解**，并愿意投入一两个月。
- 他的核心诉求不只是学会 Docker，更是**学会如何学习一项技术**：他要在这套手册里看到方法论、看到独立思考的过程、看到问题被一层层剥开的样子。
- 他喜欢清晰的直白，也喜欢偶尔被一句话击中的美感。他愿意读慢文章。

---

## 二、语言风格（这是文风契约，不是建议）

**要这样写：**

- 用"你"直接对话，像一位大你几届、很愿意讲清楚的学长。
- 讲清"为什么"永远优先于"怎么做"。给出命令之前，先说清它解决的问题。
- 允许使用恰当的比喻，但**比喻之后必须回到技术本体**，不能让比喻替代解释。
- 关键结论**加粗**（`<strong>`）。加粗要有节制：一段最多一处，加粗的必须是"如果只记住一句话，就记这句"。
- 举例子要用**真实可感的场景**：宿舍的笔记本、课程设计、给同学演示、服务器迁移、把项目交给老师检查。
- 适度的美感表达：在章节开头、转折处、章末总结前，可以有一两句沉静、克制的短句，制造呼吸感。例如"层是 Docker 世界里最美的抽象"。但一章最多两三处，多了就腻。
- 数字要具体：说"快"就写"几百毫秒"，说"小"就写"从 1.2 GB 降到 18 MB"。

**绝对不要这样写：**

- 空话套话：`总的来说`、`综上所述`、`值得注意的是`、`不难发现`、`我们可以看到`、`在当今时代`、`随着技术的发展`、`众所周知`。
- 无信息量的过渡段：`接下来我们来看下一个部分`、`下面我将详细介绍`。
- 只罗列名词不解释：`Docker 有镜像、容器、网络、卷、Compose……`（列完就走的写法一律禁止）。
- 用"简单来说就是……"来逃避真正的解释。
- 编造事实。命令、参数、文件名、版本号、URL 都必须是真的。不确定就不写，或写成"你可以自己查证一下"。
- 编造 URL。只能使用本规范第八节给出的链接；如需额外链接，只能使用**官方文档域名下的名称级路径**（如 `https://docs.docker.com/`），不许编造长路径。

**关于"提出问题而不是给答案"（读者第 12 条要求，非常重要）：**

- 每章至少 **8 个**真正的思考题，放在 `.block.think` 里。
- 思考题必须**没有唯一答案**，且能引发推理、取舍、联想或价值判断。反例（太浅）："Docker 的执行顺序是什么？"
  正例："如果容器真的完全隔离，那为什么同一个镜像在两个容器里同时运行，修改文件却互不影响？这种隔离是免费的吗？你为此付出了什么代价？"
- 每章至少 **3 处**在正文中途插入的"悬念式提问"：先提出问题、故意不立刻回答，隔几段之后再揭晓。这是培养读者思维耐性的手法。
- 对确实很难的问题，可以在折叠块里给出"思考的脚手架"（不是答案），例如"可以从'谁来承担成本'这个角度想"。

---

## 三、篇章结构（每章必须严格包含）

章节文件放在 `chapters/` 目录下，以 `_TEMPLATE.html` 为骨架。**必须保留模板里的所有区块顺序**，并按要求填满：

### A. 章首（顺序固定）

1. `.ch-eyebrow`：`<span class="num">第 NN 章</span>` + 一个 2—6 字的英文/中文分区标签（如 `思 想 的 诞 生`）。
2. `<h1>`：章节标题（与 `data/chapters.data.js` 里的 `title` 保持一致）。
3. `<p class="ch-tagline">`：一句话点出灵魂。
4. `.block.goal` —— **本章学习目标**：4—7 条。目标要是"理解层面"的，不是"操作层面"的。
   反例：`学会使用 docker ps`。正例：`能解释容器"启动快"的物理原因，并指出它在什么场景下不再成立`。
5. `.block.skill` —— **学完之后，你应该能够（技能清单）**：5—8 条，全部以可验证的动词开头（能写出、能判断、能解释、能设计、能排查）。
6. 一段"开场引子"（`<p class="ch-lead">`），承接上一章并抛出本章要解决的核心问题。**必须显式提到上一章学过的东西**。

### B. 正文

- 用 `<h2 id="...">` 分小节，每章 **6—9 个 `<h2>`**，每个 `<h2>` 下 **1500—3000 字**。
- 小节内部可以用 `<h3 id="...">` 再分（每个 h2 下 0—3 个 h3）。
- 每个 `<h2>` 下至少包含一种"非纯文字"元素：代码块、表格、折叠细节、比喻块、易错点块或思考块。**不要出现连续 2000 字的纯段落墙。**
- 至少 **3 处** `.block.back`（回望：明确写出"第 X 章讲过……现在我们把它接到这里"）。
- 至少 **3 处** `.block.ahead`（前瞻：明确写出"第 Y 章会讲到……现在先埋一个伏笔"）。
- 至少 **2 处** `.block.method`（方法论：不只讲知识，还讲"这一类问题该怎么学、怎么查、怎么验证"）。
- 至少 **2 处** `.block.alert`（易错点：初学者在这里会怎么错、错在哪里、怎么自查）。
- 至少 **1 处** `.block.metaphor`（比喻块）。
- 至少 **1 处** `<blockquote>`（一句值得被记住的话）。
- 至少 **4 处** `<details>` 折叠块（深入话题、历史背景、边界情况、思考脚手架）。
- 至少 **3 个** 表格 `.tablewrap > table`（对比表最有价值：A 与 B 的区别、方案取舍、参数速查）。
- 至少 **8 个** 可执行的命令代码块 `<pre data-lang="bash"><code>…</code></pre>`，每块后面用 `<p class="cmd-note">` 说明"你会看到什么、为什么"。
  - 代码块里的命令必须是**真实可跑**的，且优先使用 `hello-world`、`alpine`、`nginx`、`ubuntu`、`python`、`node`、`redis`、`postgres` 这些常见镜像。
  - **在 Windows + PowerShell 环境下能跑**：避免 `\` 换行、避免只有 Linux 才有的命令行工具（如 `htop`、`ss` 在容器内可以，宿主机不行）。需要多行时用多行代码块，不要用反斜杠续行。
- 至少 **2 处** 引导读者"自己动手做实验"的段落，包含：实验目的 → 具体命令 → 预期现象 → 让他解释为什么 → 追问一个变体。

### C. 章末（顺序固定，且必须齐备）

1. `<h2 id="selfcheck">` —— **自测：检验你是否真的学懂了**
   - `.block.check` 内的 `<ol>`，**10—14 题**。
   - 题型混合：概念辨析、现象解释、命令预测（"这条命令会输出什么"）、故障诊断、方案取舍、动手任务。
   - 每题下面跟一个 `<details><summary>参考答案</summary>…</details>`。答案要给"思路"，不只给结论；开放题给出评分要点。
2. `<h2 id="ask">` —— **自问自答：把知识压进长期记忆**
   - `.block.think` 内 **8—10 个**问题，全部是"合上页面，用自己的话讲给自己听"的类型，答案在读者脑子里，不提供参考答案。
3. `<h2 id="summary">` —— **本章总结**
   - 用 `<ul>` 列 8—12 条要点，每条一到两句话，**必须包含"这一章最重要的一个判断"**。
   - 总结之后加一段 100—200 字的收束文字（可以带一点美感），并**指向下一章**。
4. `<h2 id="more">` —— **拓展：如果你想让这一章长得更深**
   - `.block.method` + `<ul class="res-list">`：**4—6 个**资源，必须写清"为什么值得读、读哪一部分、带着什么问题去读"。链接只能取自第八节的清单。
   - `.block.method` + `<ul class="booklist">`：**2—3 本**书（宁少勿多），写清"这本书补上什么、什么时候读、带着什么问题读"。
5. `<nav class="chnav" id="chnav"></nav>`：保持为空，脚本会自动填充上一章/下一章。

---

## 四、篇幅硬指标（会由脚本校验）

- 每章**纯文本中文字符数（去掉 HTML 标签与代码块之后）不少于 10000 字**，目标区间 **11000—15000 字**。
- 不要用重复、排比、复述同一句话来凑字数。凑字数是最容易被读者识破的失败。
- 判断标准：**每一段是否带来了新信息、新视角、新例子或新问题？** 如果删掉这一段读者毫无损失，就删掉它。
- 长不是目的，**密**才是。宁可每段都硬，也不要为凑数而稀。

---

## 五、术语处理（极重要，决定读者体验）

1. **正文里直接写术语原词**，例如：`容器共享宿主机的内核。`
2. **绝对不要手写** `<span class="term" data-term="...">`。页面脚本会自动扫描正文，为术语加上点状下划线与点击弹窗。
3. 术语链接由 `data/terms.data.js` 提供。写作时可以查阅该文件，确认哪些词已被收录（`link: true` 的会在正文中自动加下划线）。
4. **第一次**出现某个术语时，无论它是否会自动加下划线，都要在行文中顺带用一句人话解释它。平台期读者不查词也能读懂，查词是加深而不是救急。
   例：`镜像仓库（Registry，存放镜像的服务器）是镜像世界的物流中心。`
5. 若你需要一个**术语库里没有的关键词**，请在正文里顺带解释清楚，并在该章末尾的自测题或思考题中让读者去查证它——**不要**自己编造术语库条目。
6. 英文缩写首次出现时，写成 `中文（English Full Name，缩写）` 的形式，例如 `持续集成（Continuous Integration，CI）`。

---

## 六、HTML 骨架与可用组件（照抄即可）

### 页面骨架（必须与模板一致）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>第 NN 章 · 章节标题 · 深海与木箱</title>
<meta name="description" content="一句话描述本章内容。">
<link rel="stylesheet" href="../assets/style.css">
</head>
<body data-page="chNN">

<header class="topbar" id="topbar"></header>

<div class="shell">
  <aside class="sidebar" id="sidebar"></aside>
  <main class="main">
    <div class="wrap">
      <article class="article" id="article">
        <!-- 章首 / 正文 / 章末 -->
      </article>
      <footer class="footer">
        <p><b>深海与木箱 · Docker 深度学习手册</b>　第 NN 章</p>
        <p><a href="../index.html">← 返回总览与地图</a>　·　<a href="../glossary.html">术语总表</a></p>
      </footer>
    </div>
  </main>
</div>

<script src="../data/terms.data.js"></script>
<script src="../data/chapters.data.js"></script>
<script src="../assets/app.js"></script>
</body>
</html>
```

`data-page` 必须是 `ch00`…`ch12` 中与文件名匹配的值（`ch00-地图.html` 对应 `ch00`）。

### 可用组件清单（只用这些，不要自创 class）

| 用途 | HTML |
|---|---|
| 学习目标 | `<div class="block goal"><span class="bt">本 章 学 习 目 标</span><ul><li>…</li></ul></div>` |
| 技能清单 | `<div class="block skill"><span class="bt">学 完 之 后 ， 你 应 该 能 够</span><ul><li>…</li></ul></div>` |
| 回望 | `<div class="block back"><span class="bt">回 望</span><p>…</p></div>` |
| 前瞻 | `<div class="block ahead"><span class="bt">前 瞻</span><p>…</p></div>` |
| 思考题 | `<div class="block think"><span class="bt">思 考</span><ol><li>…<span class="sub">提示：…</span></li></ol></div>` |
| 方法论 | `<div class="block method"><span class="bt">方 法</span><p>…</p></div>` |
| 比喻 | `<div class="block metaphor"><span class="bt">比 喻</span><p>…</p></div>` |
| 易错点/警告 | `<div class="block alert"><span class="bt">易 错 点</span><p>…</p></div>` |
| 普通强调块 | `<div class="block"><span class="bt">标 题</span><p>…</p></div>` |
| 引用 | `<blockquote><p>…</p></blockquote>` |
| 折叠 | `<details><summary>展开：标题</summary><p>…</p></details>` |
| 代码块 | `<pre data-lang="bash"><code>docker ps</code></pre>` |
| 命令说明 | `<p class="cmd-note">你会看到……</p>` |
| 表格 | `<div class="tablewrap"><table><thead><tr><th>…</th></tr></thead><tbody><tr><td>…</td></tr></tbody></table></div>` |
| 自测题 | `<div class="block check"><span class="bt">检 查 题</span><ol><li>题…<details><summary>参考答案</summary><p>…</p></details></li></ol></div>` |
| 资源列表 | `<ul class="res-list"><li><span class="rt">名称<span class="tag">官方文档</span></span><a class="ru plain" href="…" target="_blank" rel="noopener">URL</a><span class="rd">为什么读</span></li></ul>` |
| 书单 | `<ul class="booklist"><li><span class="bn">《书名》</span> <span class="ba">作者</span><span class="bw">为什么要读</span></li></ul>` |
| 分隔装饰 | `<div class="ornament">短 语</div>` |

**`<h2>` 的 id 命名规则**：`s1`、`s2`…；`<h3>` 用 `s1-1`、`s2-3` 这样的形式。这样侧边栏自动目录与锚点跳转才能工作。

**注意**：`.article` 内的 `<h2>` 会自动编号显示（CSS 计数器），你不需要在标题文字里手写编号。标题只写文字，例如 `<h2 id="s1">镜像不是一个大文件</h2>`。

---

## 七、设计规范（牵涉到读者的视觉体验，不要改动）

- 全站四色：深墨 `#16232e`（正文）、灰蓝 `#5b6b7a`（次要）、青蓝 `#1f5f74`（强调）、冷白 `#f4f6f8`（背景）。
- 字体宋体，正文行高 1.95。**背景是冷灰蓝，不是米白，不是暖色。**
- **不要**在正文里写 `style="color:…"`、`style="font-size:…"` 之类内联样式，也不要引入任何外部 CSS/JS/CDN/字体库（手册要求完全离线可用）。
- **不要**添加图片、emoji、图标字体。装饰只有 CSS 提供的细线、色块与 `.ornament`。
- 可以用 `class="plain"` 让链接不带下划线（资源列表里已用）。
- 代码块里若要加注释，用 `<span class="cmt"># 注释</span>`。

---

## 八、允许引用的链接白名单

优先使用下列链接；每条资源都要附上一句"为什么要读它、读哪一部分"。

**官方文档**
- Docker 文档总入口：https://docs.docker.com/
- 入门教程：https://docs.docker.com/get-started/
- Docker 是什么：https://docs.docker.com/get-started/docker-overview/
- 安装说明：https://docs.docker.com/engine/install/
- 官方指南合集（分语言）：https://docs.docker.com/guides/
- Dockerfile 参考：https://docs.docker.com/reference/dockerfile/
- 构建最佳实践：https://docs.docker.com/build/building/best-practices/
- 多阶段构建：https://docs.docker.com/build/building/multi-stage/
- 构建缓存：https://docs.docker.com/build/cache/
- 构建上下文：https://docs.docker.com/build/building/context/
- Compose 文档：https://docs.docker.com/compose/
- Compose 文件参考：https://docs.docker.com/compose/compose-file/
- 存储总览：https://docs.docker.com/engine/storage/
- 数据卷：https://docs.docker.com/engine/storage/volumes/
- 绑定挂载：https://docs.docker.com/engine/storage/bind-mounts/
- 网络总览：https://docs.docker.com/engine/network/
- 桥接网络：https://docs.docker.com/engine/network/drivers/bridge/
- 容器资源约束：https://docs.docker.com/engine/containers/resource_constraints/
- 安全总览：https://docs.docker.com/engine/security/
- 开发安全最佳实践：https://docs.docker.com/develop/security-best-practices/
- 镜像漏洞扫描（Scout）：https://docs.docker.com/scout/
- Docker 官方镜像（DHI）：https://docs.docker.com/dhi/
- 命令行参考：https://docs.docker.com/reference/cli/docker/
- 清理磁盘空间：https://docs.docker.com/config/pruning/
- 桌面版文档：https://docs.docker.com/desktop/
- Docker Hub：https://hub.docker.com/
- Compose 示例合集：https://github.com/docker/awesome-compose

**规范与其他官方站点**
- 开放容器倡议（OCI）：https://opencontainers.org/
- OCI 镜像规范：https://github.com/opencontainers/image-spec
- OCI 运行时规范：https://github.com/opencontainers/runtime-spec
- containerd 官网：https://containerd.io/
- Kubernetes 中文文档：https://kubernetes.io/zh-cn/docs/home/
- 十二要素应用（中文）：https://12factor.net/zh_cn/
- 十二要素应用（英文原文）：https://12factor.net/
- Linux 命名空间手册页：https://man7.org/linux/man-pages/man7/namespaces.7.html
- Linux cgroups 手册页：https://man7.org/linux/man-pages/man7/cgroups.7.html
- WSL 官方文档（中文）：https://learn.microsoft.com/zh-cn/windows/wsl/
- 内核 cgroup v2 文档：https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html

**社区与实践**
- Docker 从入门到实践（开源中文书）：https://github.com/yeasy/docker_practice
- 在线版：《Docker——从入门到实践》：https://yeasy.gitbook.io/docker_practice/
- Play with Docker（浏览器里的免费实验环境）：https://labs.play-with-docker.com/
- Docker 官方培训与教程：https://www.docker.com/trainings/
- 命令行艺术（中文）：https://github.com/jlevy/the-art-of-command-line/blob/master/README-zh.md
- MIT《计算机教育中缺失的一课》中文版：https://missing-semester-cn.github.io/
- 开发者路线图（Docker）：https://roadmap.sh/docker
- 开发者路线图（DevOps）：https://roadmap.sh/devops
- 精选 Docker 资源合集：https://github.com/veggiemonk/awesome-docker

---

## 九、可推荐的书（每章只挑 2—3 本，宁精勿多）

写书单时**必须**使用下列准确书名与作者，不要编造书名、不要编造译者与出版社细节：

- 《深入浅出 Docker》—— Nigel Poulton 著。最适合零基础建立整体图像，薄、图多、讲得清。
- 《Docker 实践》（Docker in Practice）—— Ian Miell、Aidan Hobson Sayers 著。大量真实技巧与"坑"，适合动手阶段配合阅读。
- 《Docker 开发指南》（Using Docker）—— Adrian Mouat 著。偏工程实践，讲如何把 Docker 用于真实开发流程。
- 《Docker 实战》（Docker in Action）—— Jeff Nickoloff 著。原理与用法并重，对层、网络、存储的讲解扎实。
- 《Kubernetes 权威指南》—— 龚正、吴治辉等编著。中文语境下 K8s 的经典参考书，适合第 12 章之后。
- 《UNIX 环境编程》与《深入理解计算机系统》（CS:APP）—— 后者是理解"程序—内存—系统调用"的基石，适合长期啃。
- 《计算机网络：自顶向下方法》—— Kurose、Ross 著。理解容器网络需要它打底。
- 《凤凰项目》—— Gene Kim 等。用小说形式讲 DevOps 为何重要，读起来轻松，适合建立工程价值观。
- 《SRE：Google 运维解密》—— 理解可观测性、可靠性与工程纪律。
- 《重构》—— Martin Fowler 著。培养"代码会腐化，需要持续整理"的意识。
- 《The Linux Command Line》—— William Shotts 著。命令行基本功的系统训练。

---

## 十、自查清单（写完必须逐条打勾）

- [ ] 章首：eyebrow、h1、tagline、学习目标、技能清单、开场引子全部齐备，开场引子里提到了上一章。
- [ ] 正文有 6—9 个 `<h2 id="sN">`，每个 h2 下 1500—3000 字。
- [ ] `.block.back` ≥3、`.block.ahead` ≥3、`.block.method` ≥2、`.block.alert` ≥2、`.block.metaphor` ≥1、`<blockquote>` ≥1、`<details>` ≥4、表格 ≥3、命令代码块 ≥8。
- [ ] `.block.think` 累计问题 ≥8 个；正文中途至少 3 处悬念式提问。
- [ ] 章末顺序完整：自测（10—14 题，带折叠答案）→ 自问自答（8—10 题）→ 总结（8—12 条 + 收束段）→ 拓展资源（4—6 条含白名单链接）+ 书单（2—3 本）→ 空 chnav。
- [ ] 纯文本中文字符 ≥10000（目标 11000—15000）。
- [ ] 没有出现第二节列出的空话套话。
- [ ] 没有手写 `data-term`，没有内联 style，没有 emoji，没有外部资源引用。
- [ ] 所有命令在 Windows + Docker Desktop 环境下可执行。
- [ ] 所有链接都在白名单内。
- [ ] `data-page` 正确，`<title>` 与文件名对应。
- [ ] 最后通读一遍：**它读起来像不像一个真正懂行、又真心想教会我的人在说话？**
