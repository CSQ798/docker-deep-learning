# 章节写作任务书 · 第 12 章

**文件**：`chapters\ch12-进阶.html` （`data-page="ch12"`）
**标题**：`走向远方：编排、集群与你的下一步`
**分区标签**：`与 复 杂 性 相 处` / `ORCHESTRATION & BEYOND`
**tagline 建议**：`你学会的从来不是 Docker，而是如何与复杂性相处`
**字数**：纯文本中文 11000—15000 字（硬下限 10000）

## 上一章与下一章
- 上一章（第 11 章）：AI 场景与 MLOps。
- 本章是全书最后一章，承担三件事：把单机知识提升到集群视角；把 Compose 与 Kubernetes 建立映射；为读者规划真正属于他自己的下一步，并回望整本书的方法论。

## 必须讲透的内容

1. **从单机到集群：思维跃迁**（本章开篇）：
   - 一台机器装不下时，问题不再是"怎么跑"，而是"放在哪跑、挂了怎么办、流量怎么分"；
   - 编排系统要解决的六个问题（要作为本章骨架反复出现）：**调度、自愈、服务发现、配置与密钥分发、扩缩容、滚动升级与回滚**；
   - 每一台机器都不可信、都会挂——这是集群思维与单机思维的分水岭。
2. **Docker Swarm 的定位**（要客观，不吹不贬）：
   - 核心概念：节点（manager / worker）、服务、任务、栈；
   - `docker swarm init`、`docker service create`、`docker stack deploy` 的基本形态；
   - 它为什么没有成为主流（生态、功能、社区势能），以及它今天仍然适合什么（小规模、教学、快速验证编排概念）。
   - **诚实**：如果读者只打算了解编排思想，Swarm 是最低成本的理解工具。
3. **Kubernetes 核心概念（讲"是什么与为什么"，不展开 YAML 细节）**：
   - 控制平面与工作节点、期望状态与调谐循环（reconciliation loop）——这是 K8s 的灵魂，务必讲透"声明式 + 控制器"的思想；
   - Pod：为什么最小的调度单位不是容器（共享网络命名空间的同居者）；
   - Deployment / ReplicaSet：副本与滚动更新；
   - Service：稳定的虚拟地址与负载均衡；
   - Ingress：从外部进入集群的入口；
   - ConfigMap / Secret：配置与密钥分发；
   - Namespace：逻辑隔离；
   - Volume / PVC：存储的抽象与"存储与计算分离"；
   - `kubectl` 的最基本动作（get / describe / logs / exec / apply）。
4. **Compose → Kubernetes 的概念映射表**（本章最有教学价值的一张表，务必精心设计）：
   | Compose | Kubernetes | 说明 |
   |---|---|---|
   | service | Deployment + Service | 一个逻辑服务变成"工作负载 + 稳定入口"两件事 |
   | image | image | 相同 |
   | ports | Service / Ingress | 暴露方式的层级更高 |
   | volumes | PersistentVolumeClaim | 从"卷"变成"存储申请" |
   | environment / env_file | ConfigMap / Secret | 配置被对象化 |
   | depends_on | 探针 + 重试（K8s 不保证启动顺序） | 思维方式的重大变化 |
   | healthcheck | livenessProbe / readinessProbe | 区别是"活着"与"能接流量" |
   | deploy.replicas | replicas | 相同 |
   | profiles | Namespace / 独立清单 | 组织方式不同 |
   要逐行解释，并指出**最重要的观念转变：K8s 不保证启动顺序，它假设你的应用能容忍"依赖暂时不在"**（回收第 08 章 depends_on 的那一课）。
5. **在本地接触 Kubernetes 的路径**（要现实、不要制造门槛）：
   - Docker Desktop 内置的单节点 Kubernetes（在设置里启用）；
   - `kind` / `minikube` 的定位（名称级介绍即可）；
   - 提醒资源占用，建议学完 Docker 再启用；
   - 给出一条"最小可行体验"：启用 → `kubectl get nodes` → 部署一个 nginx → 暴露服务 → 扩容 → 回滚。**如果你不确定某个具体命令的准确形式，请写得更概括并让读者查官方文档，不要编造。**
6. **可观测性与故障演练**（把第 10 章的思想推到集群）：
   - 为什么"实例会消失"让传统排查方法失效；
   - 日志、指标、追踪三支柱在集群中的形态（了解名词即可）；
   - **故意制造故障**是提升可靠性的正途（混沌工程的直觉解释）；要给读者一个可在本地做的小演练：杀掉一个容器看编排层是否自动恢复。
7. **成本与复杂性：什么时候不该用编排**（必须写，这是成熟工程师的标志）：
   - 一台机器能解决的事，不要引入集群；
   - 编排带来的认知负担、运维负担、调试难度；
   - 一个判断清单：团队规模、发布频率、可用性要求、数据规模。
8. **回望全书：把十二章串成一条线**（本章的高潮与情感落点）：
   - 用一条完整的故事线重述：痛 → 思想 → 架构 → 镜像 → 命令 → 构建 → 数据 → 网络 → 编排 → 安全 → 工程 → AI → 集群；
   - 指出全书反复出现的**五个母题**（要明确写出来，这是给读者的思维礼物）：
     1. 隔离与共享的权衡；
     2. 不可变与可复现；
     3. 声明式与命令式；
     4. 边界与责任划分（每个工具负责什么、不负责什么）；
     5. 成本与收益的工程判断。
   - 让读者意识到：这五个母题不只属于 Docker，它们属于所有软件工程。
9. **致读者的下一步**（要具体、可执行、有温度）：
   - 三条可选路径：深入 Linux 与系统（操作系统、网络）、进入云原生（K8s、可观测性、GitOps）、把容器用于你自己的领域（AI、Web、嵌入式、科研）；
   - 学习方法论：读官方文档的方法（先读概念页再读参考页、带着问题检索、看 CHANGELOG）、读源码的入口（从 CLI 或 compose 这样的项目开始）、参与开源的起步方式（提 issue、改文档、修小 bug）；
   - 如何判断自己"学会了"：能否教会别人、能否在没有网络时把问题想清楚、能否在文档里快速找到答案；
   - 最后一段要写得有力量：他学会了的不只是 Docker，而是一种让复杂系统变得可描述、可运输、可复现的思维方式。

## 必做实验（≥4）
1. 在 Docker Desktop 里启用 Kubernetes（给出设置路径与资源提醒），`kubectl get nodes` 观察单节点集群。
2. 部署一个 nginx（`kubectl create deployment` 或 `kubectl apply`），用 `kubectl get pods`、`kubectl describe`、`kubectl logs` 观察。
3. 把副本数从 1 改到 3，观察 Pod 数量变化；再删掉一个 Pod，观察自动重建（**这是编排"自愈"最直观的一幕**）。**注意**：`kubectl create deployment` 未指定 replicas 时的默认值、以及 `kubectl scale` 的语法，请用你有把握的形式表述；不确定的地方写成"读者可用 `kubectl explain` 或官方文档确认"。
4. 用 Compose 起一个服务，手工 `docker kill` 掉一个容器，观察 Compose 是否会重启（引出"Compose 与编排系统的能力边界"）。若默认不会重启，要如实说明并解释 `restart` 策略的作用。
5. 可选：`docker service` 在单节点 Swarm 上跑一次（`docker swarm init` → `docker service create` → `docker service ls`），让他亲眼看到"服务"与"任务"的概念。要提醒 `docker swarm leave --force` 如何退出。

## 回望（≥3）与前瞻（收尾章：前瞻可指向读者自己的路）
- 回望第 02 章：架构分层 → 集群也是分层。
- 回望第 08 章：Compose 与 K8s 的映射。
- 回望第 09 章：集群中的最小权限（RBAC）。
- 回望第 10 章：可观测性与发布策略在集群中的延续。
- 前瞻：读者自己的项目、自己的领域。

## 思考题方向（≥8）
- 为什么 Kubernetes 选择"不保证启动顺序"？这个决定让应用开发者承担了什么责任？
- 如果一台机器的可靠性是 99%，三台机器组成集群后，你的系统可靠性是多少？（提示：先想清楚"冗余"到底解决了什么）
- 编排系统能自愈，那它会不会"自愈"出一个更糟的状态（反复重启、雪崩）？如何避免？
- 什么规模的问题不值得引入 Kubernetes？请给出你自己的判断标准。
- 如果容器让部署变简单了，为什么运维的复杂度反而上升了？（提示：想想"数量"这个变量）
- 你学完这十二章之后，最想用它解决自己的什么问题？
- 如果你要在一年后检验自己是否真的学会了容器，你会给自己出怎样的考题？

## 章末资源方向
- 白名单优先：`https://kubernetes.io/zh-cn/docs/home/`、`https://docs.docker.com/engine/swarm/`（若不在白名单，改用 `https://docs.docker.com/`）、`https://opencontainers.org/`、`https://roadmap.sh/devops`、`https://roadmap.sh/docker`、`https://github.com/veggiemonk/awesome-docker`、`https://12factor.net/zh_cn/`
- 书：《Kubernetes 权威指南》（龚正、吴治辉等）、《SRE：Google 运维解密》、《凤凰项目》（Gene Kim）。

## 交付前
1. `node tools/check.js ch12` 必须通过。
2. 字数 ≥10000，目标 11000—15000。
3. 无内联 style、无图片、无手写 data-term、链接全在白名单内。
4. 本章是收尾章，**总结部分要格外用心**：它要让读者有"我走过了一条完整的路"的感受。
