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
