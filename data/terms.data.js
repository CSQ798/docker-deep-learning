/* ============================================================================
 * 术语总表数据源  ——  深海与木箱 · Docker 深度学习手册
 * ----------------------------------------------------------------------------
 * 字段说明：
 *   term : 术语的标准写法（正文里出现这个词时，可以自动关联到本条目）
 *   alias: 同义词（正文里出现这些写法，也指向同一条目）
 *   abbr : 英文缩写（没有缩写则为空字符串）
 *   en   : 英文全称（专有名词、命令、文件名的完整英文形式）
 *   zh   : 中文释义（一句话能读懂的名字）
 *   cat  : 分类（必须与下方 CATEGORIES 里的 key 一致）
 *   def  : 详细解释（这是核心内容：它是什么、为什么存在、怎么工作、容易误解在哪）
 *   link : true 表示正文阅读时自动加下划线、可点击；false 表示只进术语总表
 *          原则：只让"值得停下来点开"的术语自动加下划线，避免满屏下划线。
 *   tip  : 学法提示（可选，告诉读者这个概念该怎么学、容易卡在哪）
 * ==========================================================================*/
window.DL_CATEGORIES = [
  { key: 'concept',  name: '一、容器与虚拟化：根本概念' },
  { key: 'docker',   name: '二、Docker 体系：组件与部件' },
  { key: 'image',    name: '三、镜像与构建：从源码到交付物' },
  { key: 'cmd',      name: '四、命令与运维：日常手上的工具' },
  { key: 'storage',  name: '五、存储与数据：让数据活下来' },
  { key: 'network',  name: '六、网络：容器之间如何说话' },
  { key: 'compose',  name: '七、Compose 与编排：从单机到集群' },
  { key: 'linux',    name: '八、Linux 地基：容器脚下的土地' },
  { key: 'ai',       name: '九、AI / 机器学习场景' },
  { key: 'security', name: '十、安全与供应链' },
  { key: 'eng',      name: '十一、工程方法与职业素养' }
];

window.DL_TERMS = [

/* ======================= 一、容器与虚拟化：根本概念 ======================= */
{
  term: '容器', alias: ['Container'], abbr: '—', en: 'Container（容器）', zh: '容器', cat: 'concept', link: true,
  def: '容器是"被操作系统特殊照顾的一个（组）进程"：它运行在宿主机同一个内核之上，但通过内核提供的隔离机制（namespace 管"看得见什么"，cgroups 管"能用多少"）被包装成一个仿佛独立的小机器。它没有自己的内核，也没有虚拟硬件的模拟层，所以启动只要几百毫秒、开销接近普通进程。关键认知：容器不是"小虚拟机"，而是一种"进程的包装与约束方式"；容器的生命周期等于其中主进程的生命周期，主进程一退出，容器就结束。',
  tip: '初学最常见的错误是拿虚拟机的直觉去理解容器。请反复念一句话：容器共享内核，虚拟机共享硬件。'
},
{
  term: '虚拟机', alias: ['VM', 'Virtual Machine'], abbr: 'VM', en: 'Virtual Machine（虚拟机）', zh: '虚拟机', cat: 'concept', link: true,
  def: '在一台物理机上用软件模拟出若干台"完整计算机"的技术：每台虚拟机都有自己的虚拟 CPU、虚拟内存、虚拟磁盘和一份完整的操作系统内核，由 Hypervisor（虚拟机监视器）负责调度。它的隔离性来自硬件层面，因此非常强（可以跑不同内核、不同操作系统），代价是每台都要启动并维护一整套系统，占用 GB 级磁盘和数百 MB 内存，启动通常以秒到分钟计。与容器的关系不是"谁淘汰谁"，而是分层共存：云上常常是"物理机 → 虚拟机 → 容器"。'
},
{
  term: '虚拟化', alias: ['Virtualization'], abbr: '—', en: 'Virtualization（虚拟化）', zh: '虚拟化', cat: 'concept', link: true,
  def: '把一份物理资源（CPU、内存、磁盘、网络）抽象成多份"看起来各自独立"的逻辑资源的技术总称。虚拟化是计算机科学里反复出现的母题：操作系统虚拟化进程、虚拟机虚拟硬件、容器虚拟运行环境、编程语言虚拟机（如 JVM）虚拟指令集。学会识别"谁在虚拟谁、抽象边界在哪里"，你就能一通百通。'
},
{
  term: 'Hypervisor', alias: ['虚拟机监视器', 'VMM'], abbr: 'VMM', en: 'Hypervisor / Virtual Machine Monitor（虚拟机监视器）', zh: '虚拟机监视器', cat: 'concept', link: true,
  def: '负责创建和调度虚拟机的软件层。类型一（Type 1，裸机型）直接跑在硬件上，如 VMware ESXi、Microsoft Hyper-V、KVM；类型二（Type 2，宿主型）跑在操作系统之上，如 VirtualBox、VMware Workstation。Windows 上 Docker Desktop 用到的 Hyper-V 与 WSL2 都属于虚拟化技术，这也是"为什么 Docker 也会占内存、也会让你重启电脑开启虚拟化功能"的原因。'
},
{
  term: '操作系统', alias: ['OS', 'Operating System'], abbr: 'OS', en: 'Operating System（操作系统）', zh: '操作系统', cat: 'concept', link: true,
  def: '管理硬件、为程序提供运行环境的系统软件，核心是内核。它负责四件事：进程调度（谁先跑）、内存管理（谁能用哪块内存）、文件系统（数据怎么存成文件）、设备与网络（怎么和外界通信）。容器的四大隔离能力全部由内核提供，所以"学容器到深处一定会回到操作系统"。'
},
{
  term: '内核', alias: ['Kernel'], abbr: '—', en: 'Kernel（内核）', zh: '内核', cat: 'concept', link: true,
  def: '操作系统的核心部分，常驻内存，拥有最高权限（Ring 0），负责进程、内存、文件系统、网络与设备驱动。普通程序运行在用户态，只能通过"系统调用"请求内核做事。容器之所以轻，是因为它不复制内核；容器之所以不能装一个完全不同的内核，也是同一个原因。'
},
{
  term: '系统调用', alias: ['syscall', 'System Call'], abbr: 'syscall', en: 'System Call（系统调用）', zh: '系统调用', cat: 'concept', link: true,
  def: '用户态程序向内核请求服务的唯一正规入口，例如 open（打开文件）、read、write、fork（创建进程）、socket（创建网络连接）。它是用户态与内核态之间的"海关"。理解它，你就理解了容器技术的边界：容器里的程序仍然在向同一个宿主机内核发起系统调用，所以隔离强度取决于内核对调用者的检查有多严（这也是容器逃逸漏洞的根源）。'
},
{
  term: 'Docker', alias: [], abbr: '—', en: 'Docker（容器化平台与工具链）', zh: 'Docker', cat: 'docker', link: true,
  def: '一套让"打包—分发—运行"应用变得标准化的工具链与平台，2013 年由 dotCloud 公司的 Solomon Hykes 团队开源。它本身不是容器技术的发明者（namespace、cgroups 早在 2000 年代就存在于 Linux），Docker 真正的贡献是：把复杂的内核能力包装成普通人能用的命令行与镜像格式，并建立了镜像分发生态。一句话：Docker 让容器从"内核工程师的玩具"变成"每个开发者的日常工具"。'
},
{
  term: '容器化', alias: ['Containerization'], abbr: '—', en: 'Containerization（容器化）', zh: '容器化', cat: 'concept', link: true,
  def: '把应用及其全部运行依赖（代码、运行时、系统库、配置、目录结构）一起封装进镜像，使它在任何装有容器运行时的机器上表现一致的过程与理念。它解决的是"在我机器上明明能跑"这一软件工程史上最古老的痛：环境不一致。'
},

/* ========================= 二、Docker 体系：组件 ========================= */
{
  term: 'Docker Desktop', alias: ['Desktop'], abbr: '—', en: 'Docker Desktop（桌面集成环境）', zh: 'Docker 桌面版', cat: 'docker', link: true,
  def: '官方为 Windows 和 macOS 提供的桌面应用，把 Docker Engine（跑在虚拟机或 WSL2 里）、Docker CLI、Docker Compose、BuildKit、Kubernetes 单节点集群以及图形界面打包成一个安装包。它的意义是：Windows/macOS 没有 Linux 内核，无法原生跑 Linux 容器，所以它偷偷替你开了一台 Linux 虚拟机，并把命令行"接"进去。理解这一点，你才能解释为什么 Docker Desktop 要占资源、为什么会和 WSL2 纠缠、为什么容器里的路径是 /app 而你的文件在 D:\\ 上。'
},
{
  term: 'Docker Engine', alias: ['Engine', 'Docker 引擎'], abbr: '—', en: 'Docker Engine（Docker 引擎）', zh: 'Docker 引擎', cat: 'docker', link: true,
  def: '真正干活的软件，运行在 Linux 上，由三部分组成：常驻后台的守护进程 dockerd、提供 HTTP API 的服务端接口、以及客户端命令行 docker。它采用客户端—服务器（C/S）架构：你敲的 docker 命令其实是一个 HTTP 请求，发给了 dockerd。所以"连不上 Docker"时，第一件事不是重装，而是确认 dockerd 是否活着。'
},
{
  term: '守护进程', alias: ['daemon', 'dockerd', 'Docker Daemon'], abbr: '—', en: 'Daemon（守护进程）', zh: '守护进程', cat: 'docker', link: true,
  def: '在后台长期运行、不占用终端、随时待命的进程。Docker 的守护进程叫 dockerd，它监听一个 Unix 套接字（Linux 上通常是 /var/run/docker.sock）接收指令，负责管理镜像、容器、网络、存储卷。因为套接字权限等同于 root 权限，所以"把 docker.sock 挂进容器"是一种极高风险的常见错误做法。'
},
{
  term: 'Docker CLI', alias: ['docker 命令', '命令行客户端'], abbr: 'CLI', en: 'Command-Line Interface（命令行界面）', zh: '命令行界面', cat: 'docker', link: true,
  def: '你输入 docker 时执行的那个客户端程序。它解析参数、组装成 REST API 请求、发给 dockerd，再把结果排版打印给你。它本身不干活，所以把 CLI 装在 A 机器上、用 Docker 上下文（context）指向 B 机器上的 dockerd，就能远程操作 B 机器——这是理解 Docker 架构最直观的一个实验。'
},
{
  term: 'containerd', alias: [], abbr: '—', en: 'containerd（容器运行时管理器）', zh: '容器运行时管理器', cat: 'docker', link: true,
  def: '一个工业级容器运行时，2017 年由 Docker 公司捐给 CNCF 基金会。dockerd 把"真正去创建/启停容器"的活交给它。它负责镜像拉取与解包、容器生命周期管理、快照、任务执行，但自己不直接碰内核隔离细节。记住层级：docker CLI → dockerd → containerd → runc。'
},
{
  term: 'runc', alias: [], abbr: '—', en: 'runc（OCI 运行时实现）', zh: 'OCI 容器运行时', cat: 'docker', link: true,
  def: '依据 OCI 运行时规范实现的轻量工具，由 containerd 调用，职责非常单一：按照一份配置文件（config.json，包含挂载点、namespace、cgroups 设置）调用内核接口，把进程真正"关进笼子"里，然后自己退出（在容器里你会看到它的化身是 PID 1 附近的进程）。它是"最后一公里"的执行者。'
},
{
  term: 'Docker Hub', alias: ['Hub'], abbr: '—', en: 'Docker Hub（官方镜像仓库）', zh: 'Docker 官方镜像仓库', cat: 'docker', link: true,
  def: 'Docker 官方的公共镜像托管服务，是全球最大的镜像集散地，你写的 docker pull nginx 默认就从这里下载。免费账号有匿名与登录两种拉取速率限制（rate limit），这也是企业搭建私有仓库（Harbor、GitLab Registry 等）的现实动机之一。'
},
{
  term: '镜像仓库', alias: ['Registry', 'registry'], abbr: '—', en: 'Registry（镜像仓库服务）', zh: '镜像仓库', cat: 'docker', link: true,
  def: '存储与分发镜像的服务器（服务），是镜像世界的"物流中心"。它提供两件事：按名字与标签存取镜像（pull/push），以及管理谁有权限访问。注意区分三个层级：Registry（仓库服务，如 Docker Hub）→ Repository（某个镜像的仓库，如 library/nginx）→ Tag（仓库里的某个版本，如 1.27-alpine）。'
},
{
  term: '仓库', alias: ['Repository'], abbr: '—', en: 'Repository（镜像仓库）', zh: '镜像仓库（单个镜像的所有版本集合）', cat: 'docker', link: true,
  def: '一个镜像名下的所有版本集合。nginx 是一个仓库，nginx:latest、nginx:1.27、nginx:1.27-alpine 是这个仓库里的不同标签。仓库可以和 Git 仓库类比，但要小心一个致命区别：镜像仓库的标签可以被覆盖并指向完全不同的内容，所以"用 latest 部署生产"等于把命运交给运气。'
},
{
  term: '镜像标签', alias: ['Tag', 'tag'], abbr: '—', en: 'Tag（标签）', zh: '镜像标签', cat: 'image', link: true,
  def: '镜像的版本别名，形如 名称:标签。它是一个可变的指针，指向某个具体的镜像内容摘要（digest）。最佳实践：用语义化版本或 git 提交号做标签，永不依赖 latest；生产环境甚至可以按 digest（sha256:…）拉取，因为摘要由内容算出来，无法被冒充。'
},
{
  term: 'Docker Context', alias: ['context', 'docker context'], abbr: '—', en: 'Docker Context（Docker 上下文）', zh: 'Docker 上下文（连接目标）', cat: 'cmd', link: true,
  def: '一组"要连到哪台 dockerd、用什么证书、走什么协议"的连接配置。docker context ls 能看到 default（本地）、desktop-linux（Docker Desktop）等。它是理解 C/S 架构的抓手：切换上下文，你的同一条命令会作用到完全不同的机器上。'
},

/* ====================== 三、镜像与构建：交付物 ====================== */
{
  term: '镜像', alias: ['Image'], abbr: '—', en: 'Image（镜像）', zh: '镜像', cat: 'image', link: true,
  def: '一个只读的、分层的、自包含的应用打包模板：包含文件系统内容、启动时要执行的命令、环境变量、暴露的端口、挂载点声明等元数据。它不是单个大文件，而是"一组层 + 一份配置"的组合，层之间通过内容寻址（内容算哈希）复用，所以 10 个基于 alpine 的镜像可能只共享一份操作系统层。容器就是"镜像 + 一层可写层 + 运行时状态"。'
},
{
  term: '层', alias: ['Layer', '镜像层'], abbr: '—', en: 'Layer（层）', zh: '镜像层', cat: 'image', link: true,
  def: '镜像由若干只读层叠成，每个 Dockerfile 指令（如 RUN、COPY）通常产生一层，层内记录"相对于上一层的文件变化"。层是不可变的、可共享的、按内容哈希标识的，因此构建缓存、镜像瘦身、多镜像复用空间都建立在这个机制上。理解层，你就能解释三个现象：为什么把 RUN 拆成多行会变大、为什么改一行代码会导致后续层全部重建、为什么删除文件的那一层并不会让镜像变小。'
},
{
  term: '联合文件系统', alias: ['UnionFS', 'OverlayFS', 'overlay2'], abbr: 'UnionFS', en: 'Union File System（联合文件系统）', zh: '联合文件系统', cat: 'image', link: true,
  def: '把多个目录（层）叠加成一个统一视图的文件系统能力，OverlayFS 是 Linux 上最常用的实现，Docker 默认的存储驱动 overlay2 就基于它。它决定了"容器里看到的 / 目录"是若干只读层加一层可写层合并的结果：读文件时自上而下找，写文件时用写时复制（Copy-on-Write）把文件复制到可写层再改，删除文件时用"白障（whiteout）"标记遮蔽下层的同名文件。'
},
{
  term: '写时复制', alias: ['Copy-on-Write', 'CoW'], abbr: 'CoW', en: 'Copy-on-Write（写时复制）', zh: '写时复制', cat: 'linux', link: true,
  def: '一种"先共享、要改才复制"的懒惰策略：多个使用者共享同一份数据，只有当某人要修改时才为它单独复制一份。容器启动快、磁盘省、内存页可共享，全靠它。它也有代价：修改大文件会带来一次完整拷贝（写放大），所以在容器里频繁写大文件（例如数据库数据目录）性能会变差——这正是"数据要放卷里"的深层原因，而不只是"怕丢"。'
},
{
  term: 'Dockerfile', alias: [], abbr: '—', en: 'Dockerfile（镜像构建脚本）', zh: '镜像构建脚本', cat: 'image', link: true,
  def: '一份纯文本构筑说明书，逐行描述"如何从基础镜像长出你的镜像"。它是基础设施即代码（Infrastructure as Code）思想在日常开发中最常见的落地：镜像不再靠手工点击生成，而是可以由版本控制系统管理、评审、复现的文本。它是 Docker 世界里最值得反复打磨的一份文件。'
},
{
  term: 'BuildKit', alias: ['Buildx'], abbr: '—', en: 'BuildKit / Buildx（下一代构建引擎）', zh: '下一代镜像构建引擎', cat: 'image', link: true,
  def: 'Docker 现在默认使用的构建引擎（前端命令是 docker buildx），相比旧构建器有三点革命性改变：一是并行执行互不依赖的构建步骤；二是支持缓存挂载（cache mount）把包管理器缓存跨构建保留；三是支持多平台构建、密钥注入、SBOM 与来源证明（provenance）。它不是"更快的 docker build"，而是把构建当成一个有向无环图（DAG）来优化。'
},
{
  term: '构建上下文', alias: ['Build Context', 'Context'], abbr: '—', en: 'Build Context（构建上下文）', zh: '构建上下文', cat: 'image', link: true,
  def: '执行 docker build 时被发送给构建引擎的那一堆文件（默认是你指定的目录，结尾的那个 .）。这是初学者最容易踩坑的概念：docker build -t x . 里的 . 不是"当前目录"这么简单，它意味着整包发送；若目录里有 node_modules、.git、几十 GB 数据，构建会先卡在"发送上下文"，甚至把敏感文件带进镜像。解决工具是 .dockerignore。'
},
{
  term: '.dockerignore', alias: ['dockerignore'], abbr: '—', en: '.dockerignore（构建忽略清单）', zh: '构建忽略清单', cat: 'image', link: true,
  def: '放在构建上下文根目录的忽略规则文件，语法类似 .gitignore，用来把不需要的文件排除在上下文之外。它同时提升构建速度、减小镜像体积、避免密钥泄漏。请把它当成每个项目的必备文件，而不是可选项。'
},
{
  term: '多阶段构建', alias: ['Multi-stage Build', '多阶段'], abbr: '—', en: 'Multi-stage Build（多阶段构建）', zh: '多阶段构建', cat: 'image', link: true,
  def: '在一份 Dockerfile 里写多个 FROM，前面的阶段只用于编译（可以带上庞大完整的编译工具链），后面的阶段只从前面阶段复制产物（COPY --from=builder）。它带来的结果极具美感：镜像里最终不含编译器、源码、测试依赖，体积可下降一个数量级。它是 Go、Rust、Java、前端项目构建生产镜像的标准姿势。'
},
{
  term: '构建缓存', alias: ['Build Cache', 'cache'], abbr: '—', en: 'Build Cache（构建缓存）', zh: '构建缓存', cat: 'image', link: true,
  def: '构建引擎记住每一层的输入（指令文本、文件内容哈希、基础层），若输入未变就直接复用已有层。因此 Dockerfile 的指令顺序直接决定开发体验：把变化最频繁的步骤（复制源码）放在最后，把稳定的步骤（安装依赖）放在前面。高级用法还有 BuildKit 的缓存挂载（--mount=type=cache）与外部缓存导入导出（CI 里跨流水线共享）。'
},
{
  term: '基础镜像', alias: ['Base Image'], abbr: '—', en: 'Base Image（基础镜像）', zh: '基础镜像', cat: 'image', link: true,
  def: '你的 FROM 指定的那个镜像，决定了一切的地基：操作系统发行版、可用包管理器、glibc 还是 musl、默认用户、文件布局、镜像体积与攻击面。选择基础镜像是一次重要的工程决策：Ubuntu/Debian 兼容性最好但大；Alpine 极小但可能因 musl libc 导致兼容问题；distroless 只含运行时无 shell，攻击面最小但调试困难。'
},
{
  term: 'scratch', alias: [], abbr: '—', en: 'scratch（空镜像）', zh: '空镜像（从零开始）', cat: 'image', link: true,
  def: 'Docker 里的一个特殊名字，表示"什么都不基于"。FROM scratch 意味着你的镜像里只有你 COPY 进去的东西，通常用于静态编译的 Go/Rust 程序，最终镜像能小到几 MB。代价是：没有 shell、没有证书、没有时区文件，一切都要自己带上。'
},
{
  term: 'Distroless', alias: ['distroless', '无发行版镜像'], abbr: '—', en: 'Distroless Image（无发行版镜像）', zh: '无发行版镜像', cat: 'security', link: true,
  def: 'Google 提出的镜像构建思路：镜像里只包含应用与它真正需要的运行时库，没有包管理器、没有 shell、没有任何多余工具。好处是攻击面大幅缩小、CVE 漏洞数量显著减少（因为不含那些用不到却常年爆漏洞的工具）；代价是调试困难（docker exec 进去没有 bash 可用），需要靠日志与外部工具定位问题。'
},
{
  term: 'ARG', alias: ['构建参数'], abbr: '—', en: 'ARG（Build-time Argument，构建期参数）', zh: '构建期参数', cat: 'image', link: false,
  def: '只在构建期存在、可被 docker build --build-arg 传入的变量。它不能保留在最终镜像的运行时环境里（除非显式写成 ENV），因此不要用 ARG 传密钥：ARG 的值会留在镜像构建历史中，可以被 docker history 看到。'
},
{
  term: 'ENV', alias: ['环境变量指令'], abbr: '—', en: 'ENV（Environment Variable，环境变量）', zh: '环境变量', cat: 'image', link: true,
  def: '设置镜像的运行时环境变量，会被后续所有指令和容器内进程继承。它是十二要素应用（Twelve-Factor App）推荐的配置载体：把数据库地址、日志级别等"因环境而异"的东西放进环境变量，同一份镜像就能在开发、测试、生产三个环境跑。它也是密钥管理的常见踩坑区——ENV 写入的密钥会永久留在镜像里。'
},
{
  term: 'HEALTHCHECK', alias: ['健康检查'], abbr: '—', en: 'HEALTHCHECK（容器健康检查指令）', zh: '健康检查', cat: 'image', link: true,
  def: '告诉 Docker"如何判断这个容器还健康"，例如定时请求一个 HTTP 接口。状态分为 starting、healthy、unhealthy 三种。关键细节：unhealthy 不会让容器自动重启（除非配了编排层的策略），它只是把事实记录下来，供你、供 Compose、供编排系统决策。'
},
{
  term: 'ENTRYPOINT', alias: [], abbr: '—', en: 'ENTRYPOINT（容器入口指令）', zh: '容器入口点', cat: 'image', link: true,
  def: '定义容器启动时"必须执行的那个程序"，它使镜像表现得像一个可执行文件：docker run myimage --help 里的 --help 会被当成参数传给 ENTRYPOINT。与之对比，CMD 提供"可被覆盖的默认参数"。经典组合是 ENTRYPOINT ["python"] + CMD ["app.py"]：默认跑 app.py，但你可以 docker run myimg other.py 替换掉。'
},
{
  term: 'CMD', alias: [], abbr: '—', en: 'CMD（默认启动命令指令）', zh: '默认启动命令', cat: 'image', link: true,
  def: '镜像的默认命令或默认参数，写在 Dockerfile 里，但可以被 docker run 后面的命令整体覆盖。一个 Dockerfile 里只有最后一条 CMD 生效。初学者最常混淆的就是 CMD 与 ENTRYPOINT 的关系，记住类比：ENTRYPOINT 是动词（跑什么），CMD 是默认宾语（跑什么参数）。'
},
{
  term: 'PID 1', alias: ['1 号进程', 'init 进程'], abbr: '—', en: 'Process ID 1（进程号为 1 的进程）', zh: '1 号进程 / init 进程', cat: 'linux', link: true,
  def: '在 Linux 里，1 号进程是系统的"孤儿回收者"，负责收养所有失去父进程的子进程并回收它们，同时要正确处理信号（如 SIGTERM）。在容器里，你启动的第一个程序就是 PID 1，但它往往不是为这个角色设计的（例如 Node、Python、Java 主程序不会回收僵尸进程，也可能不转发信号）。这解释了三个经典现象：容器停止很慢、容器里出现僵尸进程、docker stop 杀不掉应用。解决方案是使用 tini / dumb-init 这类微型 init 作为 PID 1。'
},
{
  term: '信号', alias: ['Signal', 'SIGTERM', 'SIGKILL'], abbr: '—', en: 'Signal（信号）', zh: '信号', cat: 'linux', link: true,
  def: '操作系统发给进程的软件中断，用来通知事件。容器世界里最重要的两个：SIGTERM（15）是"请你优雅退出"，进程可以捕获它做清理、保存数据、关闭连接；SIGKILL（9）是"立刻死"，不可捕获、不可忽略。docker stop 默认先发 SIGTERM 等待 10 秒，超时才发 SIGKILL。理解这一点，你才能写出"优雅停机"的服务——这是生产系统的基本素养。'
},
{
  term: '僵尸进程', alias: ['Zombie Process', 'defunct'], abbr: '—', en: 'Zombie Process（僵尸进程）', zh: '僵尸进程', cat: 'linux', link: true,
  def: '已经结束、但父进程还没读取它的退出状态，因而在进程表里留下一个空壳的进程。它不占内存和 CPU，只占一个进程号。如果父进程一直不回收（wait），进程号会被耗尽。容器里若主进程不回收子进程，就会出现僵尸进程——这正是上面 PID 1 问题的一个具体后果。'
},

/* ========================= 四、命令与运维 ========================= */
{
  term: 'docker run', alias: ['run'], abbr: '—', en: 'docker run（创建并启动容器）', zh: '创建并运行容器', cat: 'cmd', link: true,
  def: '最常用的命令，实际做了三件事：从镜像创建容器（create）、启动它（start）、把终端接上去（可选 -it）。常用参数构成一套"心智拼图"：-d 后台、-it 交互、-p 端口映射、-v 挂载数据、--name 起名、--rm 退出即删、-e 传环境变量、--network 指定网络、--restart 重启策略、-m 与 --cpus 限制资源。'
},
{
  term: '交互式终端', alias: ['-it', 'TTY'], abbr: 'TTY', en: 'Teletype / Interactive Terminal（交互式终端）', zh: '交互式终端', cat: 'cmd', link: true,
  def: '-i 保持标准输入打开（interactive），-t 分配一个伪终端（pseudo-TTY）。两者通常成对出现，写作 -it，用于"我要进去敲命令"的场景，例如 docker run -it ubuntu bash。只用 -i 会没有提示符与回显，只用 -t 则输入不接给你，体验都很怪。'
},
{
  term: 'docker exec', alias: ['exec'], abbr: '—', en: 'docker exec（在运行中的容器内执行命令）', zh: '在运行中的容器内执行命令', cat: 'cmd', link: true,
  def: '进入一个已经在跑的容器里执行命令，典型用法 docker exec -it web bash。它与 docker attach 的关键区别：attach 是把你的终端接到容器主进程的标准输入输出上（可能被 Ctrl-C 直接杀掉主进程），exec 是"在容器里另开一个进程"，安全得多。生产环境的纪律是：exec 用于排障，不用于改配置——改了不落盘，重启即消失。'
},
{
  term: 'docker inspect', alias: ['inspect'], abbr: '—', en: 'docker inspect（查看对象详细元数据）', zh: '查看对象详细元数据', cat: 'cmd', link: true,
  def: '把一个容器/镜像/网络/卷的完整 JSON 描述打印出来，包括网络地址、挂载点、环境变量、状态、退出码等。它是"从现象走向真相"的必备工具，配合 --format 或 jq 提取字段，例如查容器 IP：docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" web。养成"不懂就 inspect"的习惯，你会少走大量弯路。'
},
{
  term: 'docker logs', alias: ['logs'], abbr: '—', en: 'docker logs（查看容器日志）', zh: '查看容器日志', cat: 'cmd', link: true,
  def: '读取容器主进程写到标准输出/标准错误的内容（需用 json-file 等日志驱动）。背后的哲学极其重要：容器不管理日志文件，应用只管往 stdout/stderr 打印，由外部系统负责收集与轮转。这与"应用自己写 /var/log/app.log"的传统做法截然不同，是云原生可观测性的起点。'
},
{
  term: 'docker system df', alias: ['system df', 'docker system prune', 'prune'], abbr: '—', en: 'docker system df / docker system prune（空间统计与清理）', zh: '空间统计与清理', cat: 'cmd', link: true,
  def: 'df 显示镜像、容器、卷、构建缓存各占多少空间（含可回收部分），prune 用于清理未使用的对象。危险点在于：docker system prune -a --volumes 会把未被使用的卷一并删除，而卷里可能存着你的数据库数据。请把"删卷"当成"格式化硬盘"同等级别的操作来对待。'
},
{
  term: 'docker cp', alias: ['cp'], abbr: '—', en: 'docker cp（在容器与宿主机之间复制文件）', zh: '宿主机与容器间复制文件', cat: 'cmd', link: true,
  def: '双向复制文件，用于临时取日志、取产物、塞配置。它的存在提醒你：容器文件系统不是"远方"，但也不该被当成持久存储。频繁使用 docker cp 往往意味着你的构建或挂载设计有问题。'
},
{
  term: 'docker stats', alias: ['stats'], abbr: '—', en: 'docker stats（实时资源占用）', zh: '实时资源占用', cat: 'cmd', link: true,
  def: '类 top 的实时视图，显示每个容器的 CPU、内存、网络、块设备 IO。它最实用的价值是验证资源限制（-m / --cpus）是否生效，以及发现"内存持续增长"这类泄漏迹象。'
},
{
  term: '退出码', alias: ['Exit Code', 'exit code'], abbr: '—', en: 'Exit Code（进程退出码）', zh: '退出码', cat: 'linux', link: true,
  def: '进程结束时返回给调用者的整数，0 表示成功，非 0 表示某种失败。容器主进程的退出码可通过 docker inspect 的 State.ExitCode 查看。常见特殊值：137 通常是被 SIGKILL（常见于内存超限被 OOM Killer 杀）、143 是被 SIGTERM、1 是应用自身报错。学会读退出码，你的排障速度会快一倍。'
},
{
  term: 'OOM Killer', alias: ['内存超限', 'OOM'], abbr: 'OOM', en: 'Out Of Memory Killer（内存不足终结者）', zh: '内存不足终结者', cat: 'linux', link: true,
  def: '当系统或 cgroup 内存耗尽时，内核选择"杀死某个进程"来保护整体稳定。容器设置了内存上限后，超限通常表现为容器被杀、退出码 137、日志毫无征兆地中断。理解它，你就明白为什么"内存限制"不是建议而是必须显式配置的生产参数，以及为什么 Java 容器里要处理堆与容器内存的关系。'
},
{
  term: '资源限制', alias: ['resource constraints', '--cpus', '--memory'], abbr: '—', en: 'Resource Constraints（资源约束）', zh: '资源限制', cat: 'cmd', link: true,
  def: '用 --memory、--cpus、--pids-limit 等参数给容器划定资源上限，底层由 cgroups 实现。它的意义是"防止一个失控的邻居拖垮整台机器"，这也是多租户环境的基本礼仪。注意区分软限制（--memory-reservation）与硬限制（--memory）：前者是尽量，后者是红线。'
},
{
  term: '重启策略', alias: ['restart policy', '--restart'], abbr: '—', en: 'Restart Policy（重启策略）', zh: '重启策略', cat: 'cmd', link: true,
  def: '容器退出后 Docker 是否自动拉起它，可选 no、on-failure[:n]、always、unless-stopped。unless-stopped 是最常用的生产选择：机器重启后会自动拉起，但你手动 stop 过的容器不会被强行复活。它体现了"声明式期望状态"的雏形——不是"启动一次"，而是"保持运行"。'
},

/* ========================= 五、存储与数据 ========================= */
{
  term: '数据卷', alias: ['Volume', 'volume', 'docker volume'], abbr: '—', en: 'Volume（数据卷）', zh: '数据卷', cat: 'storage', link: true,
  def: '由 Docker 管理、存放在宿主机专门目录（Linux 上通常 /var/lib/docker/volumes/）的数据存储，生命周期独立于容器，容器删了数据还在。它是最推荐的持久化方式：由 Docker 管理目录、可命名、可备份、可只读挂载、跨容器共享，且在 Docker Desktop 的虚拟机里也能被正确处理。'
},
{
  term: '绑定挂载', alias: ['Bind Mount', 'bind mount'], abbr: '—', en: 'Bind Mount（绑定挂载）', zh: '绑定挂载', cat: 'storage', link: true,
  def: '把宿主机上的某个具体路径直接挂进容器（-v /宿主机/路径:/容器/路径），两边实时双向同步。开发时极其实用（改代码立即生效，不用重新构建镜像），但代价是：依赖宿主机目录结构、跨平台路径差异大、容易把宿主机重要目录写坏。判断准则：开发用绑定挂载，生产用数据卷。'
},
{
  term: 'tmpfs', alias: ['内存文件系统'], abbr: '—', en: 'tmpfs（Temporary File System，内存临时文件系统）', zh: '内存临时文件系统', cat: 'storage', link: true,
  def: '把数据只存在内存里、不落磁盘的挂载方式（--tmpfs 或 --mount type=tmpfs）。适合存放会话密钥、临时缓存等敏感或无需持久化的数据，容器一停数据即消失。它也提醒你一件事：容器的可写层虽然"看起来"是磁盘，但设计上应被视为临时的。'
},
{
  term: '匿名卷', alias: ['Anonymous Volume'], abbr: '—', en: 'Anonymous Volume（匿名卷）', zh: '匿名卷', cat: 'storage', link: false,
  def: '没有名字、由 Docker 自动生成一串随机 ID 的数据卷。它常在 Dockerfile 里写了 VOLUME 指令或 compose 里只写了容器内路径时出现。匿名卷容易变成"看不见的空间黑洞"：删除容器时若不用 -v 就不会被清掉，久而久之占用大量磁盘。'
},
{
  term: '存储驱动', alias: ['Storage Driver'], abbr: '—', en: 'Storage Driver（存储驱动）', zh: '存储驱动', cat: 'storage', link: true,
  def: 'Docker 用来在宿主机文件系统之上实现镜像分层与容器可写层的组件，Linux 上默认是 overlay2（基于 OverlayFS）。它决定了容器读写文件的具体行为与性能特征。理解它属于"知道有这一层"的深度，不必一开始就钻进去，但当你遇到"容器里删了文件磁盘却没释放""IO 性能异常"时，就必须回到这一层。'
},
{
  term: '数据持久化', alias: ['Persistence'], abbr: '—', en: 'Data Persistence（数据持久化）', zh: '数据持久化', cat: 'storage', link: true,
  def: '让数据在容器生命周期之外继续存在的能力与设计。核心原则叫"容器无状态，数据外置"：容器可以随时被杀掉重建，状态放数据库、对象存储、数据卷里。这条原则是你能不能在半夜安心睡觉的分水岭。'
},
{
  term: '无状态', alias: ['Stateless', '有状态', 'Stateful'], abbr: '—', en: 'Stateless / Stateful（无状态 / 有状态）', zh: '无状态 / 有状态', cat: 'eng', link: true,
  def: '无状态指服务不把用户数据保存在自己的进程或本地磁盘里，任意一个实例都能处理任意请求，因此可以随意增删副本；有状态指服务必须保存并维护数据（数据库、消息队列、会话）。容器编排之所以偏爱无状态服务，是因为它可以任意重启、迁移、扩缩容。把有状态的东西挤到少数几个专门组件里，是架构设计的一项基本功。'
},

/* ============================ 六、网络 ============================ */
{
  term: 'Docker 网络', alias: ['docker network', 'Network'], abbr: '—', en: 'Docker Network（Docker 网络）', zh: 'Docker 网络', cat: 'network', link: true,
  def: 'Docker 用 Linux 网络虚拟化能力（网络命名空间、veth 虚拟网卡对、网桥、iptables）为容器构造的虚拟网络。常见驱动：bridge（默认，单机容器互联）、host（共享宿主机网络栈）、none（无网络）、overlay（跨主机）、macvlan（让容器像物理设备一样出现在局域网里）。命令层面用 docker network create/ls/inspect/connect/disconnect 操作。'
},
{
  term: '网桥', alias: ['Bridge Network', 'bridge'], abbr: '—', en: 'Bridge Network（桥接网络）', zh: '桥接网络', cat: 'network', link: true,
  def: '单机默认的网络模式，Docker 会创建一个虚拟交换机（docker0），容器通过一对 veth 虚拟网线接到它上面，获得内网 IP。关键实用知识：默认的 bridge 网络不支持用容器名互相解析，而自定义 bridge 网络支持（内置 DNS）——这就是为什么多容器项目一定要自定义网络，也是 docker run --link 被淘汰的原因。'
},
{
  term: '端口映射', alias: ['Port Mapping', '-p', 'publish'], abbr: '—', en: 'Port Mapping / Publishing（端口映射）', zh: '端口映射', cat: 'network', link: true,
  def: '把宿主机的某个端口转发到容器的某个端口（-p 8080:80，格式为 宿主机:容器）。原理是 Docker 在宿主机 iptables 里写入转发规则。它回答了一个很实际的疑惑：容器明明在跑，为什么浏览器打不开？因为没发布端口，或发布错了 IP（0.0.0.0 与 127.0.0.1 的区别）。'
},
{
  term: '容器 DNS', alias: ['Docker DNS', '嵌入式 DNS'], abbr: 'DNS', en: 'Domain Name System（域名系统）', zh: '域名系统 / 容器内域名解析', cat: 'network', link: true,
  def: '自定义网络中的容器可以通过"服务名/容器名"互相访问，靠的是 Docker 内置的 DNS 服务器（127.0.0.11）。这是容器化最优雅的设计之一：应用配置里写 db:5432 而不是某个会变的 IP。DNS 是互联网最古老的分布式系统之一，也是排障时最该先检查的一环（先 nslookup，再 curl）。'
},
{
  term: 'veth', alias: ['veth pair', '虚拟网卡对'], abbr: '—', en: 'Virtual Ethernet Pair（虚拟以太网卡对）', zh: '虚拟网卡对', cat: 'linux', link: true,
  def: '成对出现的虚拟网卡，像一根"虚拟网线"：一头插在容器的网络命名空间里，另一头插在宿主机的网桥上。数据从一头进去，从另一头出来。它是理解"容器网络其实没什么魔法"的钥匙：所有虚拟网络，最终都是虚拟设备 + 转发规则。'
},
{
  term: 'iptables', alias: ['netfilter'], abbr: '—', en: 'iptables / netfilter（Linux 包过滤与转发）', zh: 'Linux 包过滤与转发', cat: 'linux', link: false,
  def: 'Linux 内核中的网络包处理框架，Docker 用它实现端口映射、容器间隔离、出网地址转换（NAT）。用 iptables -t nat -L -n 可以看到 Docker 插入的 DNAT 规则。这是"知道它在哪儿"的层次：你不必手写规则，但要知道端口映射不是魔法，而是一堆转发规则。'
},
{
  term: 'Overlay 网络', alias: ['overlay network'], abbr: '—', en: 'Overlay Network（覆盖网络）', zh: '覆盖网络', cat: 'network', link: true,
  def: '在现有网络之上再构造一层虚拟网络，让分布在不同物理主机上的容器像在同一局域网里通信。它需要一套控制平面来维护成员与路由，因此属于编排系统（Swarm、Kubernetes）的地盘。它是"单机容器"通往"集群容器"的桥。'
},
{
  term: '反向代理', alias: ['Reverse Proxy'], abbr: '—', en: 'Reverse Proxy（反向代理）', zh: '反向代理', cat: 'network', link: true,
  def: '位于客户端与后端服务之间的中间层，代表后端接收请求，负责路由、负载均衡、TLS 终止、缓存、限流。容器世界里 nginx、Traefik、Caddy 最常用。它与正向代理的区别在于"代表谁"：正向代理代表客户端出网，反向代理代表服务端接客。'
},
{
  term: '负载均衡', alias: ['Load Balancing'], abbr: 'LB', en: 'Load Balancing（负载均衡）', zh: '负载均衡', cat: 'network', link: true,
  def: '把请求分散到多个后端实例，以提高吞吐、降低延迟、提供冗余。这是"多副本"能发挥作用的前提：没有负载均衡，多个容器实例只是摆设。'
},

/* ====================== 七、Compose 与编排 ====================== */
{
  term: 'Docker Compose', alias: ['Compose', 'docker compose'], abbr: '—', en: 'Docker Compose（多容器应用编排工具）', zh: '多容器应用编排工具', cat: 'compose', link: true,
  def: '用一个 YAML 文件声明"这个应用由哪些容器组成、它们如何连接、各自需要什么配置和存储"，然后用一条命令统一建起整套环境。它是从"我手动敲 docker run"走向"我把环境写成代码"的关键一步，也是理解 Kubernetes 最好的跳板：Compose 是单机版的编排，K8s 是集群版的编排，二者解决的问题同源。'
},
{
  term: 'compose.yaml', alias: ['docker-compose.yml', 'compose 文件'], abbr: '—', en: 'compose.yaml / docker-compose.yml（编排声明文件）', zh: '编排声明文件', cat: 'compose', link: true,
  def: 'Compose 的配置文件，顶层常用键有 services（服务）、networks（网络）、volumes（卷）、configs、secrets。官方现在更推荐 compose.yaml 这个名字（compose.yaml 优先于 docker-compose.yml）。它属于"声明式配置"：你描述期望的最终状态，工具负责把现实拉近到期望。'
},
{
  term: '服务', alias: ['Service', 'services'], abbr: '—', en: 'Service（服务）', zh: '服务', cat: 'compose', link: true,
  def: 'Compose 与编排系统里的核心抽象：一个"应该有几个副本、用哪个镜像、暴露哪个端口、依赖谁"的逻辑单元。它是面向"期望状态"的描述，而不是"具体某个容器"。service 与 container 的关系，类似"岗位"与"某位在岗员工"。'
},
{
  term: 'depends_on', alias: ['依赖顺序'], abbr: '—', en: 'depends_on（启动依赖声明）', zh: '启动依赖声明', cat: 'compose', link: true,
  def: '声明服务之间的启动顺序。极其重要的陷阱：默认的 depends_on 只保证"容器已启动"，不保证"服务已就绪"。数据库容器可能还在初始化，你的应用就冲上去连接然后崩溃。正确做法是配合健康检查与 depends_on 的 condition: service_healthy，或在应用里实现重试逻辑。'
},
{
  term: 'Profiles', alias: ['profiles'], abbr: '—', en: 'Compose Profiles（配置档案）', zh: '配置档案', cat: 'compose', link: false,
  def: '给服务打标签，使其只在激活某个 profile 时才启动（docker compose --profile debug up）。它让一份 compose 文件同时服务于日常开发与排障场景，避免为每种组合维护多份文件。'
},
{
  term: '容器编排', alias: ['Orchestration', '编排'], abbr: '—', en: 'Container Orchestration（容器编排）', zh: '容器编排', cat: 'compose', link: true,
  def: '在一批机器上自动调度、部署、扩缩、修复、联网容器集群的系统能力，要解决的问题包括：放在哪台机器、挂了怎么重启、流量怎么分、怎么滚动升级、怎么扩缩容、怎么发现彼此。代表产品是 Kubernetes（事实标准）与 Docker Swarm（轻量简单）。它本质上是"把运维决策写成代码，让机器执行"。'
},
{
  term: 'Swarm', alias: ['Swarm 模式', 'Docker Swarm'], abbr: '—', en: 'Docker Swarm Mode（Docker 集群模式）', zh: 'Docker 集群模式', cat: 'compose', link: true,
  def: 'Docker 原生的集群编排能力，把多台机器组成一个 Swarm，用管理节点（manager）与工作节点（worker）协作，通过 docker service create 或 docker stack deploy 部署。核心概念有节点、服务、任务（task）。它比 Kubernetes 简单得多，适合小规模与教学理解编排本质，但在生态与功能上已明显落后。'
},
{
  term: 'Kubernetes', alias: ['K8s', 'k8s'], abbr: 'K8s', en: 'Kubernetes（希腊语"舵手"，容器编排系统）', zh: 'Kubernetes / K8s', cat: 'compose', link: true,
  def: 'CNCF 旗下、源自 Google Borg 经验的容器编排系统，已成为业界事实标准。它把容器包装成 Pod 来调度，提供声明式 API、自愈、服务发现、滚动发布、配置与密钥管理、水平扩缩容等能力。学习建议：先把 Docker 和 Compose 学扎实，再学 K8s——因为 K8s 的每一个概念（镜像、容器、卷、网络、健康检查）都以 Docker 为基础，Docker 不清楚，K8s 只能死记硬背。'
},
{
  term: 'Pod', alias: ['豆荚'], abbr: '—', en: 'Pod（Kubernetes 最小调度单元）', zh: 'Pod', cat: 'compose', link: false,
  def: 'Kubernetes 中最小的可调度单元，可包含一个或多个共享网络命名空间与存储卷的容器，它们总是被一起调度、一起生死。它解决的问题是"有些进程必须紧密同居"（例如主容器 + 日志采集边车）。'
},
{
  term: '边车', alias: ['Sidecar'], abbr: '—', en: 'Sidecar（边车容器）', zh: '边车容器', cat: 'compose', link: false,
  def: '与主应用容器并肩运行、替它完成横切关注点（日志采集、代理、证书轮换、指标暴露）的辅助容器。它是"单一职责"原则在部署层面的延伸：让应用只为业务负责，基础设施的事由边车代劳。'
},
{
  term: '微服务', alias: ['Microservices'], abbr: '—', en: 'Microservices（微服务架构）', zh: '微服务', cat: 'eng', link: true,
  def: '把系统拆成一组可独立开发、独立部署、围绕业务能力组织的小服务，它们通过网络通信。优点是独立演进与按需扩缩；代价是分布式系统的一切复杂度（网络不可靠、数据一致性、链路追踪、运维成本）。务实的判断：微服务的收益来自组织规模与部署独立性，不来自"看起来先进"。容器技术正是让微服务变得可操作的关键基础设施。'
},
{
  term: '单体', alias: ['Monolith', '单体应用'], abbr: '—', en: 'Monolith（单体应用）', zh: '单体应用', cat: 'eng', link: false,
  def: '所有功能打包成一个部署单元的架构。它绝不是贬义词：对多数团队，单体 + 容器化 + 良好模块化，是成本最低、最容易起步的方案。先用容器解决"环境一致"，再谈拆分。'
},
{
  term: '云原生', alias: ['Cloud Native'], abbr: '—', en: 'Cloud Native（云原生）', zh: '云原生', cat: 'eng', link: true,
  def: 'CNCF 的定义：在公有云、私有云、混合云等动态环境中构建和运行可弹性扩展应用的方法论，通常以容器、服务网格、微服务、不可变基础设施、声明式 API 为特征。理解它的最简方式：不是"把应用搬到云上"，而是"按云的规则重新设计应用"。'
},
{
  term: '十二要素应用', alias: ['Twelve-Factor App', '12-Factor'], abbr: '—', en: 'The Twelve-Factor App（十二要素应用方法论）', zh: '十二要素应用', cat: 'eng', link: true,
  def: 'Heroku 工程师总结的一套构建可移植、可部署、易扩展服务的方法论，包含十二条原则：基准代码、依赖显式声明、配置存于环境、后端服务视为资源、严格分离构建与运行、以进程运行应用、端口绑定、并发靠进程模型扩展、快速启动与优雅终止、开发与生产环境尽量一致、日志作为事件流、管理任务作为一次性进程。它几乎是为容器的世界量身写的设计准则，值得逐条对照自己的项目自查。'
},
{
  term: '基础设施即代码', alias: ['IaC', 'Infrastructure as Code'], abbr: 'IaC', en: 'Infrastructure as Code（基础设施即代码）', zh: '基础设施即代码', cat: 'eng', link: true,
  def: '用可版本化、可评审、可复现的代码/配置文件描述基础设施与环境，而不是靠人在界面上点击或手动敲命令。Dockerfile、compose.yaml、Terraform、Ansible 都是它的载体。它最重要的收益不是"省事"，而是"可复现"与"可审计"。'
},
{
  term: '不可变基础设施', alias: ['Immutable Infrastructure'], abbr: '—', en: 'Immutable Infrastructure（不可变基础设施）', zh: '不可变基础设施', cat: 'eng', link: true,
  def: '部署时不修改已运行的实例，而是用新构建的镜像替换旧的。带来的好处是：环境漂移（configuration drift）消失、回滚变得简单（回到上一个镜像版本）、"这台机器被谁改过"这类幽灵问题不再出现。'
},

/* ========================= 八、Linux 地基 ========================= */
{
  term: '命名空间', alias: ['namespace', 'namespaces', 'Namespace'], abbr: '—', en: 'Namespace（Linux 命名空间）', zh: '命名空间（隔离视野）', cat: 'linux', link: true,
  def: 'Linux 内核提供的资源视图隔离机制：把同一台机器上的全局资源包装成"每个命名空间一份"，让其中的进程以为自己独占。容器用到的主要有：PID（进程号）、Mount（挂载点）、Network（网卡与端口）、UTS（主机名）、IPC（进程间通信）、User（用户与权限映射）、Cgroup（资源限制视图）、Time（时间偏移）。记忆法：namespace 回答"你能看见什么"。',
  tip: '有个绝佳的动手实验：unshare --fork --pid --mount-proc bash，一条命令造出一个"只有你和 bash 的世界"。亲自做一次，容器就再也不是黑箱。'
},
{
  term: 'cgroups', alias: ['cgroup', '控制组'], abbr: '—', en: 'Control Groups（控制组）', zh: '控制组', cat: 'linux', link: true,
  def: '内核提供的资源限制与统计机制，可以为一组进程设定 CPU、内存、磁盘 IO、进程数等上限，并统计它们实际用了多少。Docker 的 --memory、--cpus 就是翻译成了 cgroups 配置。记忆法：cgroups 回答"你最多能用多少"。',
  tip: '进入宿主机（或 Docker Desktop 的 WSL2 里）看 /sys/fs/cgroup/ 下的文件，你会发现"资源限制"原来就是几个文本文件里的数字。'
},
{
  term: 'chroot', alias: [], abbr: '—', en: 'chroot（change root，改变根目录）', zh: '改变根目录', cat: 'linux', link: true,
  def: '1979 年就出现在 Unix 中的老技术：把进程看到的根目录 / 换成某个子目录，使它无法访问该目录之外的文件。它是容器隔离思想的祖先，但只有文件系统隔离，没有进程、网络、用户隔离，逃逸极其容易。理解它，你就理解了"容器是一层层加上去的，不是凭空出现的"。'
},
{
  term: 'rootfs', alias: ['根文件系统'], abbr: '—', en: 'Root File System（根文件系统）', zh: '根文件系统', cat: 'linux', link: true,
  def: '容器看到的那个"根目录"背后的一整套文件，是镜像各层叠加出来的只读内容加一层可写层。它给容器一种"这是一台独立机器"的错觉，实际上只是宿主机上被挂载与遮蔽过的一组目录。'
},
{
  term: 'Linux 能力', alias: ['Capabilities', 'capabilities'], abbr: '—', en: 'Linux Capabilities（Linux 能力）', zh: 'Linux 能力', cat: 'security', link: true,
  def: '把 root 的超级权限拆成几十个细粒度特权（如 CAP_NET_ADMIN 管网络配置、CAP_SYS_ADMIN 管挂载、CAP_CHOWN 管改文件属主），进程可以只拥有需要的那几项。容器默认丢弃了大量危险能力，因此"容器里是 root"并不等于"拥有宿主机的完全 root"。它体现了权限设计的基本原则：最小权限。'
},
{
  term: '用户命名空间', alias: ['User Namespace', 'userns-remap'], abbr: '—', en: 'User Namespace（用户命名空间）', zh: '用户命名空间', cat: 'security', link: false,
  def: '让容器内的 root（uid 0）映射到宿主机上的一个普通用户（如 uid 100000），从而即使容器内提权成功，在宿主机上也只是个无权用户。这是纵深防御中很有效的一层，也是 rootless 模式的基础。'
},
{
  term: 'WSL2', alias: ['WSL', 'Windows Subsystem for Linux'], abbr: 'WSL', en: 'Windows Subsystem for Linux 2（Windows 的 Linux 子系统第二代）', zh: '适用于 Windows 的 Linux 子系统', cat: 'docker', link: true,
  def: '微软提供的在 Windows 上运行真实 Linux 内核的技术，基于轻量虚拟化。它是 Windows 上的开发者能顺畅使用 Docker 的关键：Docker Desktop 可以把引擎跑在 WSL2 里（默认模式），从而获得接近原生的文件与网络性能，还能直接在 WSL 发行版里用 docker 命令。'
},
{
  term: 'Hyper-V', alias: [], abbr: '—', en: 'Microsoft Hyper-V（微软虚拟化平台）', zh: '微软虚拟化平台', cat: 'docker', link: false,
  def: '微软的 Type-1 虚拟机监视器。Docker Desktop 在 Windows 上有两种后端：较早的 Hyper-V 后端（独立轻量虚拟机）与较新的 WSL2 后端。理解二者的区别，有助于你排查性能与网络问题（例如 WSL2 有自己独立的 IP 与端口转发行为）。'
},
{
  term: '开机自启', alias: ['daemon.json', '配置守护进程'], abbr: '—', en: 'Daemon Configuration（守护进程配置）', zh: '守护进程配置', cat: 'docker', link: false,
  def: 'Docker 引擎通过 /etc/docker/daemon.json 配置，可设置默认运行时、日志驱动与日志上限、镜像加速地址、数据目录位置、私有仓库信任等。Docker Desktop 里这些配置可以在 Settings → Docker Engine 中编辑（本质是编辑同一个 JSON）。'
},

/* ========================= 九、AI / 机器学习 ========================= */
{
  term: '人工智能', alias: ['AI', 'Artificial Intelligence'], abbr: 'AI', en: 'Artificial Intelligence（人工智能）', zh: '人工智能', cat: 'ai', link: true,
  def: '让机器表现出通常需要人类智能的行为的研究与工程领域，涵盖推理、学习、感知、规划、语言理解等方向。今天大众语境里的 AI 多半特指基于神经网络的机器学习。理解它的工程含义比争论定义更有用：AI 系统的独特之处在于"行为由数据与参数决定"，因此对环境的可复现性、算力与数据的可获得性要求极高——这正是容器在 AI 领域大放异彩的原因。'
},
{
  term: '机器学习', alias: ['ML', 'Machine Learning'], abbr: 'ML', en: 'Machine Learning（机器学习）', zh: '机器学习', cat: 'ai', link: true,
  def: '让程序从数据中自动总结规律（而不是由人写死规则）的方法总称，主要包括监督学习、无监督学习、强化学习。它是"训练—评估—部署"的完整工程闭环，这也是它与传统软件最大的不同：传统软件是"写逻辑、跑数据"，机器学习是"喂数据、得逻辑"。'
},
{
  term: '深度学习', alias: ['DL', 'Deep Learning'], abbr: 'DL', en: 'Deep Learning（深度学习）', zh: '深度学习', cat: 'ai', link: true,
  def: '使用多层神经网络从数据中逐层提取特征的机器学习分支，是图像识别、语音、大语言模型的共同基础。它对计算环境极其挑剔：CUDA 驱动版本、cuDNN、Python 依赖版本彼此耦合，历史上被称为"环境地狱"。容器化正是这一领域最受欢迎的解法之一。'
},
{
  term: 'CUDA', alias: ['CUDA Toolkit'], abbr: '—', en: 'Compute Unified Device Architecture（统一计算设备架构）', zh: '英伟达并行计算平台', cat: 'ai', link: true,
  def: 'NVIDIA 提供的让程序使用 GPU 做通用并行计算的平台与编程模型。版本关系是 AI 环境里最容易出错的地方：宿主机显卡驱动 → CUDA 驱动接口版本 → 镜像里的 CUDA 运行时 → 深度学习框架编译时依赖的版本，四层必须互相兼容。容器化把后两层固定下来，只把第一层留给宿主机，显著降低了"配环境"的痛苦。'
},
{
  term: 'GPU 直通', alias: ['GPU Passthrough', 'NVIDIA Container Toolkit', 'nvidia-container-toolkit'], abbr: '—', en: 'GPU Passthrough / NVIDIA Container Toolkit（GPU 直通）', zh: 'GPU 直通', cat: 'ai', link: true,
  def: '把宿主机上的 GPU 设备暴露给容器使用。Linux 上通过 --gpus all 或 --runtime=nvidia 配合 NVIDIA Container Toolkit 实现；容器内因此能跑 nvidia-smi、训练与推理任务。Windows 上则依赖 WSL2 的 GPU 支持（需要在 WSL 里装驱动与工具链）。这是"环境一致性"与"硬件专属资源"之间的一次重要妥协。'
},
{
  term: 'Jupyter', alias: ['Jupyter Notebook'], abbr: '—', en: 'Jupyter Notebook（交互式计算笔记本）', zh: '交互式计算笔记本', cat: 'ai', link: true,
  def: '把代码、运行结果、图表与说明文字混排在一个浏览器页面里的交互式环境，是数据科学与机器学习探索阶段的主力工具。官方提供 jupyter 系列镜像，一条 docker run 命令就能得到一个完整的数据科学环境——这也是很多人第一次感受到容器威力的场景。'
},
{
  term: '模型部署', alias: ['Model Serving', '推理服务'], abbr: '—', en: 'Model Serving / Inference（模型服务化）', zh: '模型服务化', cat: 'ai', link: true,
  def: '把训练好的模型包装成可被外部调用的服务（通常是 HTTP/gRPC 接口），并处理并发、批处理、显存管理、版本切换、灰度发布等问题。容器化在这里的价值是：模型与它的运行时被固化成一个不可变的交付物，让"这次上线的是哪个版本"不再有歧义。'
},
{
  term: 'MLOps', alias: ['机器学习运维'], abbr: '—', en: 'Machine Learning Operations（机器学习运维）', zh: '机器学习运维', cat: 'ai', link: true,
  def: '把 DevOps 的工程实践（版本控制、自动化测试、CI/CD、监控、可复现）引入机器学习全生命周期的学科，覆盖数据版本、实验追踪、模型注册、部署与漂移监控。它回答一个残酷的问题：一个在笔记本上跑通的模型，怎么变成每天服务百万用户的系统。'
},
{
  term: '容器镜像加速', alias: ['镜像加速器', 'registry mirror'], abbr: '—', en: 'Registry Mirror（镜像仓库镜像加速）', zh: '镜像加速', cat: 'docker', link: false,
  def: '在国内网络环境下，从 Docker Hub 拉取镜像常常极其缓慢甚至失败，可通过配置镜像加速地址（daemon.json 的 registry-mirrors）改善。安全提醒：第三方加速服务能看到你拉取的内容，私有镜像不要走不可信的加速器。'
},

/* ======================= 十、安全与供应链 ======================= */
{
  term: '容器逃逸', alias: ['Container Escape'], abbr: '—', en: 'Container Escape（容器逃逸）', zh: '容器逃逸', cat: 'security', link: true,
  def: '容器内的攻击者突破隔离、获得宿主机权限的攻击行为。常见路径包括：挂载了 docker.sock、以特权模式（--privileged）运行、危险的 Capabilities 未丢弃、内核漏洞、挂载了宿主机的敏感目录。它的启示是：容器隔离的强度取决于你的配置，而不是理所当然的安全。'
},
{
  term: '特权模式', alias: ['--privileged', 'Privileged'], abbr: '—', en: 'Privileged Mode（特权模式）', zh: '特权模式', cat: 'security', link: true,
  def: '--privileged 让容器几乎拥有宿主机的全部能力与设备访问权。它常被用来"解决一个权限报错"，但代价是隔离形同虚设。专业做法是把报错查清楚，只授予具体需要的那一项能力（--cap-add）或设备（--device）。'
},
{
  term: 'seccomp', alias: ['Secure Computing Mode'], abbr: '—', en: 'Secure Computing Mode（安全计算模式）', zh: '安全计算模式', cat: 'security', link: true,
  def: 'Linux 内核特性，用于过滤进程可以调用哪些系统调用。Docker 默认给容器加载一份 seccomp 白名单，屏蔽掉危险的系统调用。它是"最小权限"在内核接口层面的落实：即使攻击者拿到代码执行，也调不动不该调的接口。'
},
{
  term: 'AppArmor', alias: ['SELinux'], abbr: '—', en: 'AppArmor / SELinux（强制访问控制框架）', zh: '强制访问控制', cat: 'security', link: false,
  def: 'Linux 上的强制访问控制（MAC）框架：即使进程是 root，也要通过策略检查才能访问文件、网络、设备。AppArmor 常见于 Ubuntu，SELinux 常见于 RHEL/CentOS。Docker 会为容器加载默认策略，进一步收窄攻击面。'
},
{
  term: '供应链安全', alias: ['Supply Chain Security', 'SBOM'], abbr: 'SBOM', en: 'Software Bill of Materials（软件物料清单）', zh: '软件物料清单 / 供应链安全', cat: 'security', link: true,
  def: '软件供应链安全关注"你用的东西从哪来、里面有什么、有没有被动过"。SBOM 是一份列出镜像中全部软件组件与版本的清单（类似食品配料表），用于在爆出漏洞时快速判断"我是否受影响"。Docker BuildKit 可生成 SBOM 与来源证明（provenance），Scout 则用于扫描漏洞。这是现代工程素养的重要部分。'
},
{
  term: '漏洞扫描', alias: ['Docker Scout', 'CVE'], abbr: 'CVE', en: 'Common Vulnerabilities and Exposures（通用漏洞披露）', zh: '通用漏洞披露 / 镜像漏洞扫描', cat: 'security', link: true,
  def: 'CVE 是公开安全漏洞的统一编号体系；镜像漏洞扫描是把镜像里所有软件包的版本与漏洞数据库比对，列出风险项。命令如 docker scout cves 镜像名。要点：漏洞数量与基础镜像选择强相关，越"胖"的镜像通常漏洞越多，这也是选择精简基础镜像的重要理由之一。'
},
{
  term: '密钥管理', alias: ['Secrets', 'secret'], abbr: '—', en: 'Secrets Management（密钥与敏感信息管理）', zh: '密钥管理', cat: 'security', link: true,
  def: '安全地传递密码、令牌、证书的做法。不安全的常见做法：写进 Dockerfile（永久留在镜像层里）、写进 ENV、提交进 Git。推荐做法：构建期用 BuildKit 的 --mount=type=secret，运行期用环境变量注入（来自密钥管理系统）或挂载只读文件、Compose 的 secrets、K8s 的 Secret 与外部密钥服务。判断标准很简单：镜像里不该有任何秘密。'
},
{
  term: '最小权限原则', alias: ['Least Privilege'], abbr: '—', en: 'Principle of Least Privilege（最小权限原则）', zh: '最小权限原则', cat: 'security', link: true,
  def: '任何主体（人、进程、容器、服务）都只应拥有完成其任务所必需的最小权限。这条原则贯穿安全设计的全部层次：容器不用 root 运行、只加必需的能力、只挂必需的目录、镜像只装必需的包、CI 令牌只给必需的仓库权限。它是安全领域投入产出比最高的一条纪律。'
},

/* ==================== 十一、工程方法与职业素养 ==================== */
{
  term: 'DevOps', alias: ['开发运维一体化'], abbr: '—', en: 'Development + Operations（开发与运维一体化）', zh: '开发运维一体化', cat: 'eng', link: true,
  def: '一套让开发与运维协作、通过自动化把变更快速且可靠地交付到生产的方法、文化与工具集合。它要打破的是"开发只管写完、运维只管上线"的部门墙。容器是 DevOps 最有力的技术抓手之一，因为它让"交付物"本身变得标准化。'
},
{
  term: 'CI/CD', alias: ['持续集成', '持续交付', '持续部署'], abbr: 'CI/CD', en: 'Continuous Integration / Continuous Delivery / Continuous Deployment（持续集成 / 持续交付 / 持续部署）', zh: '持续集成／交付／部署', cat: 'eng', link: true,
  def: '持续集成（CI）指开发者频繁把代码合并进主干并自动构建与测试；持续交付（CD）指每次合并都产生一个随时可发布的版本；持续部署则进一步自动发布到生产。容器让这条流水线变得干净：构建一次镜像，测试、预发、生产都用同一个镜像，只是配置不同。'
},
{
  term: 'GitHub Actions', alias: ['Actions'], abbr: '—', en: 'GitHub Actions（GitHub 的自动化流水线服务）', zh: 'GitHub 自动化流水线', cat: 'eng', link: true,
  def: 'GitHub 提供的内置 CI/CD 服务，在仓库里放一个 YAML 文件就能定义"代码推送后自动做什么"。对初学者是最低门槛的自动化入口：可以免费构建镜像、跑测试、推送到镜像仓库。它也是把 Docker 从"本地工具"变成"工程流水线一环"的最佳练习场。'
},
{
  term: 'Git', alias: ['版本控制'], abbr: '—', en: 'Git（分布式版本控制系统）', zh: 'Git 版本控制系统', cat: 'eng', link: true,
  def: '目前最主流的分布式版本控制系统，用于记录代码与配置文件的每一次改动。它与 Docker 的关系极其紧密：Dockerfile、compose.yaml 都应该是 Git 仓库中的一部分，镜像标签最好对应提交号。请把"每天提交、写清楚提交信息"当成一项必须养成的工程肌肉。'
},
{
  term: '依赖地狱', alias: ['Dependency Hell'], abbr: '—', en: 'Dependency Hell（依赖地狱）', zh: '依赖地狱', cat: 'eng', link: true,
  def: '多个软件对同一依赖库的不同版本提出互不相容的要求，导致无法同时安装或运行的现象，例如 A 项目要 Python 3.8 + numpy 1.x，B 项目要 Python 3.12 + numpy 2.x。容器给出的解法不是"调和冲突"，而是"让每个项目活在自己的世界里"——用隔离取代妥协，这是工程上极漂亮的一招。'
},
{
  term: '环境漂移', alias: ['Configuration Drift'], abbr: '—', en: 'Configuration Drift（配置漂移）', zh: '配置漂移', cat: 'eng', link: true,
  def: '系统长期被手工修改后，实际状态与设计状态、或不同环境之间逐渐产生差异的现象。"生产环境和测试环境不一致""只有那台服务器上有这个文件"都是它的症状。应对之道是声明式配置 + 不可变基础设施 + 自动化。'
},
{
  term: '可复现性', alias: ['Reproducibility', '可复现'], abbr: '—', en: 'Reproducibility（可复现性）', zh: '可复现性', cat: 'eng', link: true,
  def: '同样的输入与配置能稳定产生同样结果的性质。对容器意味着：同一个镜像摘要在任何机器上都产生相同行为；对科学计算与机器学习还意味着实验结果可以被别人重跑出来。它是工程可信度的基石，也是初学者最容易忽视、资深工程师最看重的东西。'
},
{
  term: '可观测性', alias: ['Observability', '可观测'], abbr: '—', en: 'Observability（可观测性）', zh: '可观测性', cat: 'eng', link: true,
  def: '通过系统外部输出（日志 Logs、指标 Metrics、链路追踪 Traces，合称三大支柱）推断其内部状态的能力。容器带来一个新常态：容器随时消失、实例名称随机、数量动态变化，所以"登录机器看日志"的做法失效了，必须靠标准输出采集、集中存储与关联分析。'
},
{
  term: '技术债', alias: ['Technical Debt'], abbr: '—', en: 'Technical Debt（技术债务）', zh: '技术债', cat: 'eng', link: false,
  def: '为了短期速度而做出的妥协设计，会在未来以更高的修改成本"连本带息"收回。容器领域的典型技术债：镜像用 latest 标签、Dockerfile 里塞满临时指令、root 运行、把密钥写进镜像、没有 .dockerignore。它们当时都能"跑通"，代价在半年后显现。'
},
{
  term: '学习曲线', alias: ['Learning Curve'], abbr: '—', en: 'Learning Curve（学习曲线）', zh: '学习曲线', cat: 'eng', link: false,
  def: '掌握一项技能所需投入与产出之间的关系。技术学习有个普遍规律：前 20% 的知识能解决 80% 的日常问题（对 Docker 来说就是 run/build/pull/ps/logs/exec），但剩下 20% 的深度知识（层机制、网络原理、安全边界、编排）决定了你是"会用工具的人"还是"能设计系统的人"。本手册的目标是带你把两条曲线都走完。'
}
];
