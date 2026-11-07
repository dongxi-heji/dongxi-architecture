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

**仍未完成：** 浏览器现场验收、从 Worang canonical IR 反向读取的完整链路、OpenFlowKit / LikeC4 接入、分析器本地重复执行的 UI 接口、#1403 生产 canary。当前工具读数是一次被固定并可追溯的实际分析快照，不是页面加载时的新鲜实时结果。
