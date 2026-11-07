# Worang #1403 · 交互式架构关系导航（起步实现）

这是 [dongxi-architecture #3](https://github.com/dongxi-heji/dongxi-architecture/issues/3) 的**第一块可运行试验**，不是 Worang 正式架构母本、真实调度器或生产运行可视化。

## 打开

从本仓库根目录运行：

~~~sh
python3 -m http.server 8765
~~~

打开 http://localhost:8765/examples/worang-1403/ ，在「结构与责任」／「领取与交接」之间切换，选中节点或关系，再切换五镜。点击右栏来源可以追溯到相关 Issue、代码或测试。

运行最小语义与交互数据回归：

~~~sh
node --test examples/worang-1403/case.test.mjs
~~~

本次采用**无外部运行依赖的只读 HTML/SVG 表示**，用来验证对象在视图和五镜之间不丢失；这不是重写完整绘图引擎。下一步用 OpenFlowKit / LikeC4 对照替换这一临时显示层，并接入有界的 dependency-cruiser 分析。

## 来源与已知边界

- Worang #1403: https://github.com/dongxi-heji/worang/issues/1403
- 来源 Git main 快照：a6b0b93be046f2aeb20e33365fec889e93ae6b2b
- 当前局部源码：scripts/lib/durable-hive-runtime.mjs 的 claimWork；相关原子 Claim 测试和 handoff 4+1 测试。
- #1403 的队列排序、自动补位、真实 M5 canary 仍属于开放的整体验收，不能由源码或本页图推出完成。
- case.mjs 目前是**有源实验投影**，不是 Worang Semantic Graph IR v0 结构的完整符合实现，也不替代已有关系投影查看器。与正式 IR 的适配和跨工具映射尚未完成。
- 五镜只改变当前关系的 Reading；图与文本不会建立新 owner、权限、事实或现实动作。
- 本例没有执行新的生产测试或读取现场运行状态。表中的「既有局部测试」只表示测试代码存在，不表示本轮新鲜测试已运行或通过。
- 工具集成：OpenFlowKit、LikeC4、dependency-cruiser 等均**未在此版本实际集成**；本版先落实 Issue 的 A 阶段和 B 阶段的有限实验，C/D 阶段继续开放。

## 第二轮进展：先落实语义接缝和真实分析

- 实验 case 经 [`src/adapters/worang-sgir-v02.mjs`](../../src/adapters/worang-sgir-v02.mjs) 转成 **Worang Semantic Graph IR v0.2** 的可交换形状；正式 v0.2 JSON Schema 保存在 [`vendor/worang.semantic-graph-ir.v0.2.schema.json`](vendor/worang.semantic-graph-ir.v0.2.schema.json)，来源为 Worang Git commit `a6b0b93be046f2aeb20e33365fec889e93ae6b2b` 下的 `成为/图腾/semantic-graph-ir.v0.schema.json`（blob `5e45d8dd8ec0fcfe03653a19ccfcf2ea9a9f58e4`）。
- 现行五镜 `causation / implication` 和 v0.2 历史 `causality / entailment` **明确双向映射**，不更改规范源，也不把 Lens 提升为关系类型。实验 case 的 `source-implemented`、`tested-locally` 仅保存为投影限定，绝不自动提升至 `canonical`。
- [`analysis-readout.mjs`](analysis-readout.mjs) 保存一项实际运行的 dependency-cruiser 18.7.2 分析结果：由 Worang `scripts/lib/durable-hive-runtime.mjs` 开始，`--include-only '^scripts'` 得到 **8 个模块 / 7 条静态依赖 / 4 条主模块直接依赖**。执行时工作副本处于 `bf7835eea45adb617245ff061b4d8d5b54b4b29d`；实际逐文件 `git diff` 确认分析所涉及的全部八个文件与固定的 `main` 快照 `a6b0b93be046f2aeb20e33365fec889e93ae6b2b` 相同。
- 在界面选中 **Durable Hive、事务性建立 Claim** 或 **唯一所有权** 时，该读数返回相同对象，说明静态依赖是什么、哪些结论无法因此获得。**dependency-cruiser 未配置规则检查；“0 violations”不能被解释为通过架构约束，更不能证明并发／运行正确性。**
- 新增负例回归检查不明来源、错误快照、关系身份丢失和错误权威升级；CI 使用固定来源的完整 JSON Schema 验证生成的 IR。

导出实验 IR（它是**由已审阅 case 投影生成**，而不是从 Worang canonical IR 读取得到的新权威）：

~~~sh
node examples/worang-1403/export-sgir.mjs
~~~

运行回归：

~~~sh
node --test examples/worang-1403/*.test.mjs src/adapters/*.test.mjs
~~~

**截至第二轮时尚未完成：** 浏览器现场验收、从 Worang canonical IR 反向读取的完整链路、OpenFlowKit / LikeC4 接入、分析器本地重复执行的 UI 接口、#1403 生产 canary。当前工具读数是一次被固定并可追溯的实际分析快照，不是页面加载时的新鲜实时结果。下方第三轮记录更新了 LikeC4 的实际验收状态。

## 第三轮进展：真实嵌入 LikeC4 并在 Chromium 验证交互

独立工程试验在 [`likec4-spike/`](likec4-spike/)；**原本的零依赖 HTML/SVG 原型继续保留**。新入口使用 React 19.3.1、Vite 8.3.6、TypeScript 5.8.3 和 LikeC4 1.60.0，Vite 插件的可选 AI 自动发现显式关闭。

从 `likec4-spike/` 执行 `npm install`、`npm test`、`npm run build`、`npm run dev` 即可本地验证。CI 在 Node 22 与 Node 26 进行安装、类型检查及生产构建；在 Node 22 上额外使用 Playwright Chromium 执行真实节点点击、五镜切换和工具读数回显测试。

- [通过的完整 CI 证据](https://github.com/dongxi-heji/dongxi-architecture/actions/runs/42365209358)：三个作业均为 success，包含 Chromium 实际节点交互。
- [React LikeC4 试验的 README](likec4-spike/README.md)：说明源身份解析、合并边失败封闭和当前有损投影的界限。
- 已处理实际兼容问题：LikeC4 1.60.0 要求 React 19.3.x、Vite 8.3.x 和匹配的 Vite React 插件。未通过 `--force`／忽略 peer dependency 继续安装。
- 真实浏览器测试最初点击标题文字层被节点容器拦截；修正为点击真实 React Flow 节点容器后通过。不能把最初测试定位器失败误读为 LikeC4 核心交互失败。

**剩余验收／选型约束：** 当前 Chromium 测试证明节点点击、跨镜选中、真实分析读数回显；**尚无端到端浏览器关系连线点击测试**，虽然事件适配与合并边拒绝的单元测试已通过。当前 LikeC4 试验生产构建主 JS 包约 **2,618.34 KB（gzip 762.09 KB）**，有 chunk size 警告。发布前需要分包／懒加载与真实性能、许可证、包锁和可持续更新策略检查，才能最终冻结产品栈。现阶段 `model.c4` 仍是案例投影，而不是自动从 Worang canonical IR 生成。

## 第四轮进展：来源生成、真实关系点击与初始拆包

- 在 `likec4-spike/src/generate-model.mjs` 中建立 `case.mjs → model.c4` **确定性单向投影**，使用 `npm run generate:model` 生成、`npm run check:model` 做字节一致性门槛；重复关系、非法标识和破坏视图对应会失败。**输入仍是 case 实验投影，不是 Worang canonical IR。**
- 在真实 Chromium 浏览器中点击 LikeC4 节点及 SVG 关系连线，选择结果回读原 ID（本次边读回 `r-candidates`），跨五镜仍保留所选关系；源码来源面板保持与该关系相连。[实际 E2E 和 Node 双版本结果](https://github.com/dongxi-heji/dongxi-architecture/actions/runs/42365999931) 为 success：10 项单元测试、两项浏览器交互测试均通过。
- 使用 `React.lazy` 把 LikeC4 重组件从初始工作面拆为独立 chunk：初始 JS 从约 2,618 kB 降到约 **239 kB**，图形异步模块仍约 **2,381 kB**（gzip 687 kB）。拆包减少初始依赖体积，不等于总下载或运行性能已经过关。
- 引入 `src/check-bundle.mjs` 作为构建回归门：检查初始入口 JS 不超过 350 kB，并确保重图形引擎仍是独立 chunk；发布性能与许可证审查仍开放。

**依然开放：** 从沃壤正式且具 authority 的图 IR 自动读取；专业分析对新版源码的按需执行；构建产物的总体积、锁文件与许可证审计、真实设备性能；#1403 生产端到端验收。以上已验证的是仓库原型，不是生产系统验收。

## 第五轮进展：真正读取沃壤原生来源，并为重新分析设置变化门

**先区分哪些来源真正拥有何种效力。** 在 Worang Git commit `a6b0b93be046f2aeb20e33365fec889e93ae6b2b` 下：
- `设计要求.md`（blob `9926f5b84737fbfeef74e616e88906291131d529`）是现行设计母本，包含软件设计六角色。读取器只验证固定 blob、定位六角色源行，不自动推定任一 #1403 设计 Claim 已经生效。
- `成为/图腾/mother-graph.ir.v0.json`（blob `da5781b6bafea511153ef43c14eca56385865c52`）是真实存在的 Worang Semantic Graph IR v0.2，**图元数据明确标记「语义母图候选」**。其单项节点可能有 canonical standing，但**整图不是已经冻结的设计权威**。它内部保留的来源快照 `739c8a1d9d1fe82ea977449546fe52ce39d4d332` 也不能和文件所在的外层 Git commit 混为一谈。

新增 `src/adapters/worang-native-source.mjs` 与 `worang-design-source.mjs`，以 **Git blob OID + 合同版本 + 不变来源身份** 回读，不将现有关系投影自我提升为正式语义源。不把多参与者关系强制转成二元边；例如母图 `r-verify` 有 claim、evidence、criteria、standing 四个参与者，应以关系节点（reification）呈现，不能无说明地画成某两节点的直接因果边。

有本地沃壤 Git checkout 时，在本仓库根目录运行：

```sh
node examples/worang-1403/inspect-native-ir.mjs \
  --repo-root /absolute/path/to/worang --relation r-verify
```

输出会同时列出固定设计母本的六角色源定位、原生母图的关系参与者、完整 provenance 与 standing；只执行本地 Git 读取，**不读工作区未提交改动，不上传私有材料，不写回沃壤**。固定提交若不在本地 clone 中则失败，而不是偷偷改为最新版本。

**真正的专业工具重新执行与结果失效**：新增 `src/adapters/reanalysis-gate.mjs` 与 `reanalyze.mjs`。命令在明确的用户本地沃壤 checkout 上读取 Git 远端身份、执行已固定的 `dependency-cruiser@18.7.2`，对每个实际参与分析的文件逐一比较“案例固定 Git blob”与“当前工作目录文件 blob”，并输出完整静态依赖读数及其适用范围。

为避免向沃壤 checkout 安装依赖，可以在**本仓库根目录**通过 npm 的隔离工具 PATH 执行（第一次安装第三方工具可能访问 npm registry；源码检查在本地完成）：

```sh
npm exec --yes --package=dependency-cruiser@18.7.2 -- \
  node examples/worang-1403/reanalyze.mjs --repo-root /absolute/path/to/worang
```

也可手动指定已安装的 `--analyzer-bin /path/to/depcruise`。CLI 只输出 JSON 到标准输出，不自动写文件、上传源码或改 Git。代码本身拒绝不是 `dongxi-heji/worang` 的 origin、错误的分析器版本、超出 `scripts/` 的模块路径。源码不变时结果只是**有限范围的静态依赖观察**；文件变了或不能确定时，为当前旧案例输出 `open-for-current-case`，不悄悄沿用旧结论。即使文件相同，它也**不会证明生产运行并发正确性、真实 Chat 派工或 #1403 端到端验收**。

**实际核对与边界**：2026-11-07 在 M5 的本地 Worang 工作副本重新运行 dependency-cruiser 18.7.2，仍读到 8 个模块／7 条静态本地依赖；这 8 个文件经 Git blob 逐个对比，和本例绑定的 `a6b0b93...` 快照完全一致。已另外在本地 Git blob 上确认原生母图含 32 个节点、32 条关系、9 个分组，`r-verify` 具四个参与者。新读取／失效适配器与负例由 GitHub Actions CI 执行。

**未称作完成的内容**：新 CLI 对真实沃壤工作副本的端到端执行仍需要在开发工作面按上述命令验收（已经分别验证数据、工具运行和读取边界）；从正式源自动推断出某个 #1403 专属关系及其效力仍不是自动化能力。不能把 Worang 的通用语义母图候选当成 #1403 的现成架构事实。
