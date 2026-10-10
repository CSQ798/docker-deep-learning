# 章节写作任务书 · 第 04 章

**文件**：`chapters\ch04-命令.html` （`data-page="ch04"`）
**标题**：`命令与容器：把生命周期的每一天过明白`
**分区标签**：`手 上 的 工 具` / `EVERYDAY CLI`
**tagline 建议**：`命令行不是门槛，而是你和系统之间最短的那条路`
**字数**：纯文本中文 11000—15000 字（硬下限 10000）

## 上一章与下一章
- 上一章（第 03 章）：镜像的层、内容寻址、写时复制、标签与仓库。
- 下一章（第 05 章）：Dockerfile 与构建。本章讲"用别人做好的镜像把容器跑起来、管起来"，下一章讲"自己做镜像"。

## 必须讲透的内容

1. **容器生命周期**：created → running → paused → exited → dead 的完整状态图；每个状态由哪些命令进入与离开。要强调一个反直觉事实：**容器的生死完全由其中主进程（PID 1）决定**（第 05 章会讲 PID 1 的陷阱，本章先埋）。
2. **`docker run` 的精确语义**：它其实是 `create` + `start` + 可选接管终端。要逐组讲清常用参数，并给出"为什么需要它"：
   - `-d` 与前台运行的区别，以及为什么生产上倾向 `-d` 但调试时前台更好（能看到日志）。
   - `-it`：`-i`（interactive，保持标准输入打开）与 `-t`（tty，分配伪终端）**各自在做什么**，为什么少一个体验都会变形。要给出对比实验。
   - `--name`、`--rm`、`-p`、`-v`、`-e`、`--network`、`--restart`、`-m` / `--cpus`。
   - `--entrypoint` 覆盖入口（第 05 章展开）。
   - 命令末尾参数的传递规则：镜像的 CMD 与你在命令后面写的东西谁覆盖谁（第 05 章详细展开，这里给出可观察现象）。
3. **`docker exec` 与 `docker attach` 的本质区别**：exec 是在容器内**另起一个进程**，attach 是把终端接到主进程的标准流上。要讲清后果：attach 时按 Ctrl-C 可能直接终止主进程（甚至让容器退出），exec 则不会。要给出纪律：**exec 用于排障观察，不用于修改运行中的容器**（改了不落盘，重启即消失）。
4. **`docker logs` 与"应用只往标准输出打印"的哲学**：解释日志驱动（json-file 等）、`--tail`、`-f`、`--since`；解释为什么容器的日志不该写进容器内的文件；解释日志轮转与磁盘被日志撑爆的真实事故。要指出这与第 10 章的可观测性直接相连。
5. **退出码与推理方法**：0 成功；1 应用自身错误；137 = 128+9 被 SIGKILL（常见于内存超限被杀）；143 = 128+15 被 SIGTERM（正常停止）；126/127 命令不可执行/找不到。要教读者**用退出码反推故障类型**，并给出 `docker inspect --format "{{.State.ExitCode}}"` 的取法。可顺带介绍 `docker wait`。
6. **`docker inspect`：从现象走向真相**：JSON 结构里值得看的位置（State、Config、NetworkSettings、Mounts、HostConfig）；`--format` 模板语法入门（Go template），给出几个实用例子：
   - 取容器 IP、取退出码、取挂载来源、取环境变量。要提醒 PowerShell 下引号的处理方式（外层用单引号、内层用双引号即可正常工作，必要时给出说明）。
7. **资源限制与重启策略**：
   - `--memory`、`--memory-reservation`、`--cpus`、`--pids-limit` 的作用与底层（cgroups，第 08 章展开）；
   - 超限的表现：容器被杀、退出码 137、日志突然中断；
   - `--restart no / on-failure[:n] / always / unless-stopped` 的四种语义与取舍，为什么 `unless-stopped` 常被推荐；
   - 要让读者意识到：**重启策略不是"启动一次"，而是"保持运行"这一期望状态的雏形**（第 08、12 章的伏笔）。
8. **空间与清理的纪律**：`docker system df` 的四个数字分别是什么；`docker system prune`、`docker image prune`、`docker volume prune` 各删什么；**`docker system prune -a --volumes` 的危险**（要写得非常醒目，因为读者可能刚学就照抄执行）。要给出"先 `df` 看、再 `ls` 确认、最后才 `prune`"的动作规范。
9. **一套固定的排障动作顺序**（本章要交付的核心"技能"）：
   看状态（`docker ps -a`）→ 看日志（`docker logs`）→ 看退出码（`inspect`）→ 看配置与挂载（`inspect`）→ 进容器看现场（`exec`）→ 看资源（`stats`）→ 看端口与网络（第 07 章展开）。
   要用一个完整的"故障复盘"叙事把它演一遍（例如：容器起来又立刻挂掉，怎么一道道缩小范围）。可以给出 2—3 个可制造的故障现场（例如 `docker run --rm alpine sh -c "exit 7"`、内存限制过小导致被杀、端口占用导致启动失败）。

## 必做实验（≥5，必须真实可跑）
1. `docker run hello-world` 后 `docker ps -a` 看已退出的容器，理解"容器不是进程，它有记录"。
2. `docker run -it --name t1 alpine sh`，在容器里 `exit 5`，然后 `docker inspect t1 --format "{{.State.ExitCode}}"` 看退出码。
3. `docker run -d --name web -p 8080:80 nginx` → `docker logs web` → `docker exec -it web sh`（注意 nginx 官方镜像基于 Debian，有 sh）→ `docker stop web` → `docker rm web`。
4. 制造内存超限：`docker run --rm -m 32m alpine sh -c "dd if=/dev/zero of=/dev/null bs=1M count=2000"` 不一定可靠，**请改用可靠方式**：`docker run --rm -m 16m python:3.12-alpine python -c "a='x'*10**8"`，观察退出码 137 与日志中断。若不确定，可改用一个更稳妥的演示：`docker run --rm -m 16m alpine sh -c "apk add --no-cache python3 >/dev/null 2>&1 || true"`。**命令必须是你确信可解释的，宁可写简单一点也不要写可能失败又解释不通的。**
5. `docker system df` 观察四类占用；`docker image prune` 感受清理。
6. `docker run -d --name p1 -p 8080:80 nginx` 然后 `docker run --name p1 -p 8080:80 nginx` 复现端口冲突（名字冲突或端口冲突），读报错并解释。

## 回望（≥3）与前瞻（≥3）
- 回望第 02 章：命令经过 CLI → dockerd → containerd → runc，本章的现象都能落回这条链。
- 回望第 03 章：`docker images` / `history` 与层的关系。
- 前瞻第 05 章：CMD 与 ENTRYPOINT、PID 1 的陷阱。
- 前瞻第 06 章：`-v` 背后的卷与挂载。
- 前瞻第 07 章：`-p` 与 `--network` 的网络原理。
- 前瞻第 10 章：日志与可观测性。

## 思考题方向（≥8）
- 容器退出后再 `docker start` 它，里面的文件还在吗？为什么？（用第 03 章的可写层回答）
- 为什么 `docker exec` 里修改的配置重启就没了？这对"排障"与"修复"的区分有什么启示？
- 退出码 137 一定是内存超限吗？还可能是什么？
- `docker stop` 为什么要等 10 秒？这 10 秒里理想的应用应该在做什么？
- 如果 `--restart always` 能让容器自愈，为什么还需要编排系统？
- 为什么"我进了容器改了配置就好了"是危险的坏习惯？正确的做法是什么？
- 容器里没有 `ps`、`curl`、`vim`，这究竟是缺点还是设计？

## 章末资源方向
- 白名单优先：`https://docs.docker.com/reference/cli/docker/`、`https://docs.docker.com/engine/containers/resource_constraints/`、`https://docs.docker.com/config/pruning/`、`https://docs.docker.com/get-started/`、`https://github.com/jlevy/the-art-of-command-line/blob/master/README-zh.md`、`https://github.com/yeasy/docker_practice`
- 书：《Docker 实践》（Ian Miell 等，大量真实技巧与坑）、《深入浅出 Docker》（Nigel Poulton）、《The Linux Command Line》（William Shotts，命令行基本功）。

## 交付前
1. `node tools/check.js ch04` 必须通过。
2. 字数 ≥10000，目标 11000—15000。
3. 无内联 style、无图片、无手写 data-term、链接全在白名单内。
