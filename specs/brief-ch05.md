# 章节写作任务书 · 第 05 章

**文件**：`chapters\ch05-Dockerfile.html` （`data-page="ch05"`）
**标题**：`Dockerfile：把手工步骤写成不可辩驳的说明书`
**分区标签**：`构 建 的 艺 术` / `BUILDING IMAGES`
**tagline 建议**：`写得好的 Dockerfile 读起来像一篇结构清晰的短文`
**字数**：纯文本中文 **12000—16000** 字（硬下限 10000，本章要求更高）

## 上一章与下一章
- 上一章（第 04 章）：容器生命周期、命令运维、退出码与排障。
- 下一章（第 06 章）：数据与卷。
本章是全书技术含量最高、也最需要反复重读的一章。要把"写 Dockerfile"从"背语法"变成"做工程决策"。

## 必须讲透的内容

1. **Dockerfile 的精神**：它是把手工步骤写成可版本化、可评审、可复现的文本；它是基础设施即代码在日常开发中最常见的落地。要讲清它与"我 ssh 上去装一遍"的本质差别：**前者是可复现的声明，后者是一次性的动作**。
2. **一份 Dockerfile 的逻辑骨架**：基础镜像 → 装依赖 → 拷代码 → 定启动。要反复用这个骨架解释后面所有优化。
3. **指令逐个讲透**（这是主体，每条指令都要有"它的语义、它产生层吗、常见错误、什么时候用"）：
   - `FROM`（含 `AS` 命名阶段、`scratch`）
   - `RUN`（每次执行都会产生新层；链式 `&&` 与清理；为什么 `apt-get update` 要和 `install` 写在一起）
   - `COPY` 与 `ADD` 的取舍（ADD 会自动解压 tar、支持 URL，为什么反而不推荐）
   - `WORKDIR`（为什么不用 `RUN cd`）
   - `ENV` 与 `ARG` 的区别（构建期 vs 运行期；**ARG 的值会留在构建历史里，绝不能用来传密钥**）
   - `EXPOSE`（只是文档性声明，并不真的发布端口——要与 `-p` 对照讲清，这是初学者最常见的误解之一）
   - `VOLUME`（声明匿名卷，及其"看不见的磁盘黑洞"副作用，第 06 章展开）
   - `USER`（非 root 运行，第 09 章展开）
   - `HEALTHCHECK`（三种状态；unhealthy 不会自动重启容器）
   - `LABEL`（元数据、OCI 标准标签）
   - `SHELL`、`STOPSIGNAL`、`ONBUILD`（了解即可，讲清为什么 ONBUILD 不推荐）
4. **CMD 与 ENTRYPOINT：必须彻底讲清的一组概念**（要给出对比表 + 4 种组合的运行结果推演）：
   - 只有 CMD；只有 ENTRYPOINT；两者都有；运行命令时追加参数时分别发生什么。
   - **exec 形式（JSON 数组）与 shell 形式（字符串）的区别**：shell 形式会包一层 `/bin/sh -c`，导致信号不能直接送达进程（呼应第 04 章的优雅停机），且变量展开行为不同。
   - 推荐写法 `ENTRYPOINT ["python", "app.py"]` + `CMD ["--help"]` 的语义。
   - 一个经典陷阱：`ENTRYPOINT` 用 shell 形式写，导致 `docker run myimg -it bash` 完全失效。
5. **构建上下文与 `.dockerignore`**：`docker build -t x .` 里的 `.` 意味着什么；为什么目录里有 `node_modules`/`.git`/大文件时会先卡在"发送上下文"；`.dockerignore` 的语法与必备条目；`COPY` 只能从上下文里取文件（不能取上下文之外的路径），要解释 `../` 为什么不行。
6. **构建缓存机制**（本章的技术核心之一）：
   - 缓存键由什么构成（父层 + 指令文本 + 被复制文件的内容哈希，`COPY`/`ADD` 尤其敏感）；
   - 因此**指令顺序决定开发体验**：先装依赖、后拷代码；
   - 常见反模式：`COPY . .` 放在依赖安装之前；`RUN apt-get update` 单独一层；构建时下载大文件；
   - 如何观察缓存命中（`CACHED` 字样）；如何用 `--no-cache` 验证；如何用 `--progress=plain` 看细节。
7. **多阶段构建**：为什么需要它（编译需要完整工具链，运行时不需要）；`COPY --from=builder` 的用法；`FROM x AS <name>` 与 `--from=<index>`；用同一个基础镜像的不同阶段；**要给出一个把镜像从 1 GB 降到 30 MB 的真实前后对比**。要分别演示 Node（构建前端）、Python（编译依赖）、Go（静态编译）三类项目的思路差异。
8. **BuildKit 的进阶能力**（讲到"知道它能做什么、什么时候去用"的深度即可）：
   - `--mount=type=cache` 缓存包管理器目录（`/root/.cache`、`/root/.npm`、`/go/pkg/mod`）；
   - `--mount=type=secret` 在构建期安全注入密钥（密钥不进层）；
   - 多平台构建 `--platform`；
   - SBOM 与 provenance（第 09 章展开）。
9. **基础镜像的选择**：Debian/Ubuntu、Alpine（musl libc 的兼容性代价）、`-slim` 变体、distroless、scratch；要给出选择决策树与取舍表（体积、兼容性、调试便利、漏洞数量）。要提示 Alpine 上 Python 编译某些包会失败的经典问题。
10. **镜像减重与可维护性的平衡**：减重的手段清单（多阶段、`.dockerignore`、清理缓存、选小基础镜像、合并 RUN），以及**不要过度优化**的判断（可读性与构建时间的成本）。

## 必做实验（≥5，命令真实可跑）
1. 写一个"最朴素"的 Node/Python Dockerfile 并构建，记录镜像体积与构建耗时作为基线。
2. 改成多阶段构建，再次构建并对比体积（要有具体数字）。
3. 故意制造缓存失效：先构建一次，然后改一行源码再构建，观察哪些层 `CACHED`、哪些重建；再调整指令顺序重做实验，对比差异。
4. 演示 `COPY . .` 把 `node_modules` 带进镜像的后果（先构建出问题，再加 `.dockerignore` 修好）。
5. 用 `docker run --rm <镜像> env` 验证 ENV 生效、用 `docker history <镜像>` 验证 ARG 泄漏。
6. 用两种形式写 ENTRYPOINT，然后分别 `docker run <镜像> somearg` 观察行为差异。

## 回望（≥3）与前瞻（≥3）
- 回望第 03 章：层与缓存的关系、"删除不减小体积"如何在 Dockerfile 里被规避。
- 回望第 04 章：CMD 与 `docker run` 末尾参数的关系、`-p` 与 `EXPOSE` 的区别、退出码与信号。
- 前瞻第 06 章：`VOLUME` 指令带来的匿名卷。
- 前瞻第 09 章：非 root 用户、密钥注入、漏洞扫描与基础镜像选择。
- 前瞻第 10 章：多阶段构建与 CI 流水线的配合、缓存导入导出。
- 前瞻第 11 章：AI 场景下"巨大基础镜像"的特殊困境。

## 思考题方向（≥8）
- 如果把 `COPY . .` 放在最前面，Dockerfile 更短更简单，为什么工程上不这么做？请从"人类开发节奏"的角度解释。
- 缓存是加速器，它也可能让你构建出一个"过期的镜像"。什么情况下缓存会骗你？
- 为什么 `RUN apt-get update && apt-get install -y foo` 必须写在一层？拆开会怎样？
- 多阶段构建真的"免费"吗？它有没有代价？
- Alpine 更小，为什么很多官方镜像的默认版本仍然基于 Debian？
- `EXPOSE` 不发布端口，那它存在的意义是什么？一个"什么都不做"的指令为什么值得保留？
- 如果镜像里不该有密钥，那私有依赖（私有 npm 包、私有 apt 源）在构建时怎么装？
- 你能接受"构建时间变长 3 倍，镜像变小 40%"吗？在什么条件下你的答案会反转？

## 章末资源方向
- 白名单优先：`https://docs.docker.com/reference/dockerfile/`、`https://docs.docker.com/build/building/best-practices/`、`https://docs.docker.com/build/building/multi-stage/`、`https://docs.docker.com/build/cache/`、`https://docs.docker.com/build/building/context/`、`https://docs.docker.com/guides/`、`https://github.com/docker/awesome-compose`、`https://docs.docker.com/build/building/secrets/`（若不在白名单请改用 `https://docs.docker.com/build/building/best-practices/`）
- 书：《Docker 实践》（Ian Miell 等）、《Docker 开发指南》（Adrian Mouat）、《重构》（Martin Fowler，用于培养"持续整理"的意识）。

## 交付前
1. `node tools/check.js ch05` 必须通过。
2. 字数 ≥10000，目标 12000—16000。
3. 无内联 style、无图片、无手写 data-term、链接全在白名单内。
