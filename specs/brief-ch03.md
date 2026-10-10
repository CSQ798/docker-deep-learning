# 章节写作任务书 · 第 03 章

**文件**：`chapters\ch03-镜像.html` （`data-page="ch03"`）
**标题**：`镜像：代码如何凝结成一块可搬运的化石`
**分区标签**：`层 的 美 学` / `IMAGES`
**tagline 建议**：`层是 Docker 世界里最美的抽象`
**字数**：纯文本中文 11000—15000 字（硬下限 10000）

## 上一章与下一章
- 上一章（第 02 章）：Docker 的七个部件与 `docker run` 的完整旅程，已经提到镜像拉取时下载的是"层"。
- 下一章（第 04 章）：容器的生命周期与命令运维。
本章要把"镜像"从一个模糊的名词，变成读者能在脑子里转动的三维结构。

## 必须讲透的内容

1. **镜像不是一个大文件**：镜像是"若干只读层 + 一份配置（JSON）"，用内容寻址（内容算哈希）标识。要讲清内容寻址的三个好处：可以去重共享、可以被验证完整性、可以被精确定位（digest）。要解释一件反直觉的事：**镜像没有"文件名"意义上的版本，只有内容摘要**，标签只是人类友好的指针。
2. **层的本质**：一条 Dockerfile 指令通常产生一层，层内记录"相对上一层发生了什么变化"（新增、修改、删除）。层不可变、可共享。要解释三个推论，并给出可验证的实验：
   - 为什么把 `RUN apt-get update` 与 `RUN apt-get install` 拆成两条会有缓存风险（第 05 章展开，这里先埋）；
   - 为什么后来某层删掉的文件，镜像体积并不会减小（白障/whiteout，文件仍在底层里）；
   - 为什么镜像越多、磁盘占用却不一定线性增长（共享底层）。
3. **写时复制与联合文件系统**：OverlayFS 与 overlay2 存储驱动；读文件自上而下查找、写文件先复制到可写层再改、删文件用白障遮蔽。要讲清代价：**修改大文件会带来一次完整拷贝（写放大）**，这正是数据库数据不该放在可写层的深层原因，也是第 06 章"数据要外置"的技术根据。
4. **镜像的命名法则**（必须给出完整语法并逐字段解释）：`[registry[:port]/][namespace/]repository[:tag][@digest]`。要举大量真实例子：
   - `nginx` 的完整身份其实是 `docker.io/library/nginx:latest`；
   - `python:3.12-slim` 的 `-slim` 是什么；
   - `ghcr.io/owner/app:1.4.2` 里每一段分别是什么。
   要讲清 `latest` 的真实含义（不是"最新"，而是"默认标签"，且可以被覆盖），并给出生产环境的标签纪律。
5. **观察镜像的工具与解释**：
   - `docker images` 各列含义（含 `IMAGE ID` 为什么只有 12 位、`SIZE` 是"独占+共享"的总和，所以不能简单相加）；
   - `docker image inspect` 中值得看的字段（Architecture、Os、Config.Cmd、Config.Env、RootFS.Layers、GraphDriver）；
   - `docker image history` 看每一层来自哪条指令、体积多大；要指出 `0B` 的层并不代表什么都没发生；
   - `docker pull` 输出里 `Pull complete`、`Already exists`、`Verified Checksum` 的含义；
   - `docker tag`、`docker rmi`、`<none>`（dangling 悬空镜像）的成因与清理。
6. **一个从零到可发布的完整旅程**（本章要有叙事性的收束）：写下第一个 Dockerfile → 构建 → 打标签 → 在本地运行验证 → 登录仓库 → 推送 → 在另一台机器上拉取运行。要让读者体会到"我的代码变成了一件可以搬运、可以交付的东西"这一情感节点。
7. **镜像与仓库的生态**：Docker Hub 的官方镜像（Official Images）、认证镜像、速率限制；私有仓库为什么必要；镜像签名与可信来源（点到为止，第 09 章展开）。

## 必做实验（≥5）
1. `docker pull nginx` 然后 `docker images`，解释每列。
2. `docker image history nginx`，找出一条 `0B` 的层并解释。
3. `docker run --rm alpine sh -c "echo hi > /tmp/a.txt && rm /tmp/a.txt"` 之类的实验，用来引出"删除不减小体积"的困惑。
4. 拉取 `python:3.12-slim` 与 `python:3.12` 两个镜像，用 `docker images` 对比体积差，并让他猜差在哪里（要提示：看 `docker image history` 找线索，但不给死答案）。
5. `docker tag` 给同一个镜像起两个名字，`docker images` 观察 IMAGE ID 相同，据此理解"标签是指针"。
6. 用 `docker image inspect nginx --format "{{.RootFS.Layers}}"` 看到层的摘要列表（要提示 Windows PowerShell 下引号的处理方式：用双引号包裹模板并注意转义，或写成不含空格的简单模板）。

## 回望（≥3）与前瞻（≥3）方向
- 回望第 02 章：pull 时下载的层、containerd 解包的过程。
- 回望第 01 章：两个容器共享一个镜像却不互相污染——现在可以解释了（只读层 + 可写层）。
- 前瞻第 05 章：如何写好 Dockerfile 让层顺序为你服务。
- 前瞻第 06 章：写放大与可写层的代价，导出"数据外置"。
- 前瞻第 09 章：digest 与漏洞扫描如何配合。
- 前瞻第 10 章：镜像标签纪律如何进入 CI 流水线。

## 思考题方向（≥8）
- 如果层是内容寻址的，那么"用同一份 Dockerfile 构建两次得到同一个镜像"这句话成立吗？什么条件下成立，什么条件下不成立？
- 为什么删除文件不能让镜像变小？如果要让最终镜像真的变小，应该怎么做？
- 标签可以被覆盖，digest 不能。为什么还要发明标签？
- 一个 100 MB 的镜像和十个 100 MB 的镜像，磁盘占用可能是多少？这怎样影响你的构建策略？
- 如果镜像层可以共享，那么"我的镜像里包含了一份被删掉的密钥"这件事有多严重？（`docker history` 能看到吗？）
- 官方镜像 `library/` 这个命名空间意味着什么？谁在为它的安全性背书？
- 一个镜像的"大小"到底该怎么衡量？为什么 `docker images` 的数字加总往往超过实际磁盘占用？

## 章末资源方向
- 白名单优先：`https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/` 不可用则用 `https://docs.docker.com/get-started/`；`https://docs.docker.com/build/building/context/`、`https://github.com/opencontainers/image-spec`、`https://hub.docker.com/`、`https://github.com/yeasy/docker_practice`、`https://docs.docker.com/reference/cli/docker/`
- 注意：SPEC.md 白名单里没有 `docs.docker.com/get-started/docker-concepts/...` 这条，**请只用白名单中列出的链接**。
- 书：《Docker 实战》（Jeff Nickoloff，讲层与存储扎实）、《深入浅出 Docker》（Nigel Poulton，图多好懂）。

## 交付前
1. `node tools/check.js ch03` 必须通过。
2. 字数 ≥10000，目标 11000—15000。
3. 无内联 style、无图片、无手写 data-term、链接全在白名单内。
