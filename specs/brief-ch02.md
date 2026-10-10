# 章节写作任务书 · 第 02 章

**文件**：`chapters\ch02-架构.html` （`data-page="ch02"`）
**标题**：`剖开 Docker：一台机器里的七个部件`
**分区标签**：`透 明 的 机 械 钟` / `ARCHITECTURE`
**tagline 建议**：`当黑箱变成透明的机械钟，你才真正开始掌握它`
**字数**：纯文本中文 11000—15000 字（硬下限 10000）

## 上一章与下一章
- 上一章（第 01 章）：容器思想为什么诞生、容器与虚拟机的本质区别、隔离从 chroot 到 namespace+cgroups 的演进、Docker 在 2013 年胜出的关键其实是"分发"。
- 下一章（第 03 章）：镜像的层结构、内容寻址、写时复制。
本章是承上启下的枢纽：把第 01 章的"思想"落成第 02 章的"机械结构"，为第 03 章讲层准备好舞台。

## 必须讲透的内容

1. **客户端—服务器架构**：`docker` 命令是一个客户端，真正干活的是后台守护进程 dockerd，两者通过 API（Linux 上是 Unix 套接字 `/var/run/docker.sock`）通信。要讲清三层含义：
   - 你敲的每一条命令，本质是一个 HTTP 请求；
   - 因此 CLI 与引擎可以分处两台机器（用 Docker Context 切换）；要给出可做的实验：`docker context ls`、`docker context inspect`。
   - 因此"连不上 Docker"通常是守护进程没起来，而不是命令写错了。要列出 Docker Desktop 下的自查方法（托盘图标状态、`docker version` 看 Client 与 Server 两段是否都有、`docker info`）。
2. **七个部件逐个解剖**（这部分是本章主体，每个部件要有独立小标题，讲清"它负责什么、不负责什么、出错时症状是什么"）：
   - `docker` CLI：解析参数、组装请求、格式化输出。它不是引擎。
   - `dockerd`：守护进程，负责镜像管理、容器生命周期、网络与卷的编排、对外提供 API。
   - `containerd`：真正的容器运行时管理器，负责镜像拉取与解包、容器与任务的执行。2017 年捐给 CNCF。
   - `runc`：OCI 运行时，只做最后一件事——按配置调用内核接口把进程关进笼子，然后退出。
   - 镜像仓库（Registry / Docker Hub）：分发镜像；`pull` 与 `push` 是分布式系统的"物流"。
   - Docker Desktop：Windows/macOS 上的集成环境，包含引擎、CLI、Compose、BuildKit、单节点 Kubernetes 与图形界面。
   - WSL2 / Hyper-V：Windows 上没有 Linux 内核，所以引擎必须跑在一台轻量 Linux 虚拟机里。要解释这带来的三个可观察后果：文件跨边界读写慢、容器里的路径与 Windows 路径不是一回事、内存占用是按虚拟机给的（可在 Docker Desktop 设置里限制）。
3. **一条 `docker run nginx` 的完整旅程**（本章的高潮，要写成有节奏的分解，建议用有序列表 + 每一步的耗时感受说明）：
   解析命令 → CLI 发请求 → dockerd 收到 → 本地有无该镜像 → 没有则向仓库请求清单（manifest）→ 逐层下载并解压 → 组装 rootfs → 创建容器元数据 → 调用 containerd → containerd 调用 runc → runc 设置 namespace / cgroups / 挂载 → 启动主进程 → dockerd 记录状态 → CLI 打印容器 ID。
   每一步都要说明：**谁在做、用了什么信息、失败了会看到什么报错**。
4. **镜像、容器、存储驱动的三角关系**：镜像 = 只读层 + 配置（JSON）；容器 = 镜像 + 一层可写层 + 运行时状态；存储驱动（overlay2）= 把层叠成统一视图并实现写时复制的执行者。要用一张表格把三者的"谁的、可变的吗、删了会怎样"说清。
5. **Windows 特有问题**（读者正在 Windows 上，这一节会极大提升他的体验）：为什么打开 PowerShell 敲 `docker` 能用而 `docker` 不在 Windows 的 PATH 里（Docker Desktop 注入了 CLI）；为什么容器里 `cd /app` 找不到你 D 盘的文件；为什么挂载 Windows 目录后文件监听（hot reload）常失效（要提示这是第 06 章会展开的坑）。
6. **Docker 不负责什么**（要有力，防止读者产生错误期待）：它不管多机调度（那是编排系统）、不管你的 CI 流水线（那是 CI 工具）、不管数据备份、不管日志收集与存储、不管密钥的安全保管。要解释"工具的边界感"是工程成熟度的标志。

## 必做实验（≥4 个，命令要真实可跑）
1. `docker version` —— 让读者亲眼看 Client 与 Server 两段，理解 C/S。
2. `docker info` —— 找到 Storage Driver、Cgroup 版本、运行时、Docker Root Dir、内存总量等字段，逐个解释它们意味着什么。
3. `docker context ls` 与 `docker context inspect` —— 看见"连接目标"这一层抽象。
4. `docker run -d --name web -p 8080:80 nginx` 后用 `docker ps`、`docker inspect web`、`docker logs web`，把"命令 → 组件 → 结果"的链条走一遍。要提醒 8080 被占用时的替代方案。
5. 可选：在容器内 `uname -r` 与 `cat /etc/os-release` 对比宿主机。

## 回望（≥3）与前瞻（≥3）方向
- 回望第 01 章：隔离是内核能力 → 本章指出到底是哪个组件在调用内核（runc）。
- 回望第 01 章的"共享内核"实验 → 用本节组件链解释它。
- 前瞻第 03 章：镜像拉取时下载的"层"到底是什么。
- 前瞻第 04 章：本章提到的容器状态，下一章会变成一套命令与排障流程。
- 前瞻第 07 章：dockerd 负责的网络编排，下一章只是提及，第 07 章展开。
- 前瞻第 09 章：API 套接字等同 root 权限这一事实的安全含义。

## 思考题方向（≥8）
- 为什么把架构拆成 CLI / daemon / containerd / runc 四层，而不是一个程序干完？
- 如果 runc 执行完就退出，那么"容器在运行"这件事是谁在维护？
- Docker 必须联网才能拉镜像，这对"离线环境部署"意味着什么？企业怎么解决？
- Windows 上跑 Linux 容器必须借助虚拟机，那么"容器比虚拟机轻"这句话在 Windows 上还成立吗？成立多少？
- 同一个 API 既能被 CLI 调用也能被你自己写的脚本调用，这打开了什么可能性？又带来了什么风险？
- 如果 Docker Desktop 是免费给个人用的商业产品，这对个人学习者与公司分别意味着什么？
- 一个工具明确"不负责什么"和明确"负责什么"哪个更重要？

## 章末资源方向
- 白名单优先：`https://docs.docker.com/get-started/docker-overview/`、`https://containerd.io/`、`https://opencontainers.org/`、`https://docs.docker.com/desktop/`、`https://learn.microsoft.com/zh-cn/windows/wsl/`、`https://docs.docker.com/reference/cli/docker/`
- 书：《深入浅出 Docker》（建立整体图像）、《Docker 实战》（Jeff Nickoloff，原理扎实）。

## 交付前
1. `node tools/check.js ch02` 必须通过。
2. 字数 ≥10000 且尽量落在 11000—15000。
3. 通读删空话，确认无内联 style / 无图片 / 无手写 data-term / 链接在白名单内。
