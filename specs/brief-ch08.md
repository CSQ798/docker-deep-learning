# 章节写作任务书 · 第 08 章

**文件**：`chapters\ch08-Compose.html` （`data-page="ch08"`）
**标题**：`Compose：把一整座机房写进一个 YAML 文件`
**分区标签**：`声 明 式 的 世 界` / `COMPOSE`
**tagline 建议**：`从"我敲了一堆命令"到"我描述了我想要的世界"`
**字数**：纯文本中文 11000—15000 字（硬下限 10000）

## 上一章与下一章
- 上一章（第 07 章）：网络与容器间通信。
- 下一章（第 09 章）：安全。
本章是读者的"生产力跃迁点"：从记命令转向描述系统。同时它也是通往第 12 章 Kubernetes 最重要的跳板。

## 必须讲透的内容

1. **命令式与声明式的思维差别**（本章的灵魂，要写在最前面）：
   - 命令式：我要做第一步、第二步、第三步（顺序即逻辑，出错要回滚）；
   - 声明式：我描述最终应该是什么样（系统负责把现实拉向期望）。
   - 为什么声明式更适合"环境"这种东西（可重复、可评审、可版本化、幂等）；
   - 但要提醒：**声明式不是银弹**，它把复杂度从"执行顺序"转移到了"依赖关系与状态收敛"，你要付出理解成本。
2. **为什么 Docker 需要 Compose**：`docker run` 的参数在单容器时很好，一旦有 5 个服务、网络、卷、环境变量，命令就变成无法维护的咒语；Compose 把这一堆命令变成一份可以放进 Git 的文件。要用"手敲 8 条 docker run"与"一份 compose.yaml"做直观对比。
3. **compose.yaml 的结构与核心字段**（要逐层讲清，并给出完整可跑示例）：
   - 顶层：`name`、`services`、`networks`、`volumes`、`configs`、`secrets`；
   - 服务级：`image` / `build`（含 `context`、`dockerfile`、`args`、`target`）、`command`、`entrypoint`、`ports`、`environment` / `env_file`、`volumes`（短语法与长语法）、`networks`、`depends_on`、`healthcheck`、`restart`、`deploy.resources.limits`、`profiles`、`labels`、`user`、`working_dir`。
   - 要讲清短语法与长语法的差异（长语法更明确、支持 `read_only`、`bind.propagation` 等）。
4. **服务发现与网络**：Compose 自动创建一个项目级网络，服务之间用**服务名**互相访问；端口映射只在需要对外时写；要解释"为什么容器之间连 `db:5432` 而不是 `localhost:5432`"（与第 07 章呼应）。
5. **`depends_on` 的陷阱与正确做法**（重点小节）：
   - 默认只保证"容器已启动"，不保证"服务已就绪"；
   - `condition: service_healthy` + `healthcheck` 才是可靠方案；
   - 但更根本的方案是：**应用自身具备重试与容错能力**（十二要素思想，第 10 章展开）；
   - 要给出三个层次的解法对照表（不管 → depends_on → 健康检查 → 应用重试），并指出"越靠下的方案越健壮"。
6. **环境变量、`.env` 与密钥纪律**：
   - `environment`、`env_file` 与 `.env` 的优先级关系（要讲清楚，这是高频困惑）；
   - 变量插值 `${VAR}` 与默认值 `${VAR:-default}`；
   - 为什么 `.env` 绝不能提交进 Git（要给出 `.gitignore` 的具体行与 `.env.example` 的实践）；
   - compose 的 `secrets` 与"密钥不该写进镜像"（第 09 章展开）。
7. **Profiles**：给服务打标签按需启动（`--profile`），让一份文件服务多种场景（日常开发 / 调试 / 测试）。
8. **多文件覆盖（override）**：`compose.yaml` + `compose.override.yaml` 的自动合并、`-f` 显式叠加、`!reset` / `!override` 的用途；用"基础文件 + 环境覆盖"实现开发与生产的差异。要讲清合并规则的直觉（列表通常是追加/替换的具体行为要谨慎表述，避免编造：**请只写你确信的规则，并告诉读者用 `docker compose config` 验证合并结果**——这是一个绝佳的方法论教学点：**不要猜配置，打印它**）。
9. **Compose 的完整命令流**：`up`（`-d`、`--build`）、`down`（`-v` 的危险）、`ps`、`logs -f`、`exec`、`run`（一次性任务）、`build`、`restart`、`stop`、`start`、`config`、`top`、`pull`、`scale`（若与 `deploy` 冲突要如实说明当前推荐做法）。
10. **从开发到生产的边界**（必须有一节，防止读者误用）：Compose 适合单机开发、演示、小型自托管；它**不解决**跨主机调度、滚动发布、自愈、水平扩缩；`deploy` 段落在非 Swarm 环境中的行为要诚实说明。要给出"什么时候该转向 Kubernetes"的判断清单。

## 必做实验（≥5，命令真实可跑）
1. 手敲一组 `docker run`（web + db + 网络 + 卷）并把命令抄下来，感受复杂度。
2. 写出等价的 `compose.yaml`，`docker compose up -d`，比较两者的可维护性。
3. `docker compose config` 打印最终合并结果——**这是本章最重要的方法论示范**。
4. 制造 `depends_on` 陷阱：让 web 立刻连 db，观察失败或重试；再加 `healthcheck` 修好。
5. 用 `compose.override.yaml` 加一个"开发模式"（绑定挂载源码 + 调试端口），验证 `docker compose config` 中两者已合并。
6. 用 `profiles` 加一个只在调试时启动的 `adminer`（或 `pgadmin`）服务。
7. `docker compose down` 与 `docker compose down -v` 的差别实验（数据是否还在）。

## 回望（≥3）与前瞻（≥3）
- 回望第 04 章：那些 `docker run` 参数现在变成了 YAML 键。
- 回望第 06 章：卷在 Compose 里的声明与命名规则（`项目名_卷名`）。
- 回望第 07 章：自动网络与服务名 DNS。
- 前瞻第 09 章：`secrets` 与非 root 用户。
- 前瞻第 10 章：十二要素、多环境配置、CI 中如何构建与发布。
- 前瞻第 12 章：service 与 Kubernetes 概念的对照（这是全书最重要的跨章连接之一，务必提前埋好）。

## 思考题方向（≥8）
- 声明式配置把"怎么做"隐藏了，这让你失去了什么？什么时候你反而需要知道"怎么做"？
- 如果 `depends_on` 不可靠，那"服务之间的启动顺序"到底该由谁负责？
- 为什么 `.env` 这么方便，却又这么危险？
- 一份 compose.yaml 同时服务开发和生产，是好设计还是坏设计？
- 如果 Compose 能一键起 5 个服务，为什么还需要 Kubernetes？请具体说出 3 件 Compose 做不到的事。
- `docker compose down -v` 删掉的东西里，哪些是"重建成本很高"的？
- 你会把 compose.yaml 当成"文档"还是"代码"？这个区别会怎样影响你写它的方式？

## 章末资源方向
- 白名单优先：`https://docs.docker.com/compose/`、`https://docs.docker.com/compose/compose-file/`、`https://github.com/docker/awesome-compose`、`https://docs.docker.com/get-started/`、`https://12factor.net/zh_cn/`、`https://docs.docker.com/reference/cli/docker/compose/`（若不在白名单，改用 `https://docs.docker.com/compose/`）
- 书：《Docker 开发指南》（Adrian Mouat）、《深入浅出 Docker》（Nigel Poulton）、《凤凰项目》（Gene Kim，理解交付流程为何重要）。

## 交付前
1. `node tools/check.js ch08` 必须通过。
2. 字数 ≥10000，目标 11000—15000。
3. 无内联 style、无图片、无手写 data-term、链接全在白名单内。
