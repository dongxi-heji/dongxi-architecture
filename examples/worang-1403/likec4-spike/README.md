# LikeC4 × Architecture：嵌入式视图与语义身份试验

这是 [dongxi-architecture #3](https://github.com/dongxi-heji/dongxi-architecture/issues/3) 的**独立 React/Vite 技术栈验收切片**，不是全面迁移现有无依赖原型，也不改变 Worang 语义权威。

**栈**：TypeScript 5.8.3 / React 19.3.1 / Vite 8.3.6 / LikeC4 1.60.0；版本按 LikeC4 实际 peerDependencies 和 Vite 主版本要求锁定；Vite 插件的 AI 自动探测在本试验中显式关闭。模型仅为 [../case.mjs](../case.mjs) 的**只读、有损投影**。

## 运行

在本目录执行：

```sh
npm install
npm test
npm run build
npm run dev
```

浏览器打开本地地址（Vite 默认 http://127.0.0.1:5173/ ）。原来的无依赖原型仍可从上一级目录单独使用。

## 验收点

- LikeC4 **ReactLikeC4** 组件已接入，使用 `onNodeClick` 和 `onEdgeClick` 返回当前选择；
- `src/bridge.mjs` 把 `node.modelRef` 或具有单一底层关系的 `edge.source/target/label` 转换回原 case ID；出现合并边、重复含义、失配或未绑定时拒绝强行认定。真实 Chromium 测试已分别验证节点及关系连线点击；
- `bridge.test.mjs` 校对 `model.c4` 中所有对象、关系与原 case 的一一对应，并用合并边和关系失配的负例确认不会静默伪造身份；
- 右栏五镜与专业分析读数一直来自原 case 与 [../analysis-readout.mjs](../analysis-readout.mjs)，不从图形位置、标题或颜色推导事实；
- 现有旧界面仍然存在；本试验只验证插件与交互 API 是否适合产品集成。

## 损失与边界

- LikeC4 负责图形布局与交互，不天然表达 Worang 六角色、事实 authority、Claim Assessment、五镜和证据；这些仍在 source-bound case 与侧栏，不能凭图形转换提升 standing。
- 嵌入式 LikeC4 视图可以合并边，因此 **一条视觉边不一定是一条领域关系**；本试验只有在唯一明确映射时接受，否则显示“未绑定／有歧义”。
- `model.c4` 现在由 `../case.mjs` 经 `src/generate-model.mjs` 确定性生成，CI 使用逐字节对照测试防漂移。**它仍不是从 Worang canonical IR 自动读取**，也不提供无损反向编辑。
- 工具静态分析读数是之前真实运行的固定快照，页面不会实时重新分析私有源码。
- Node 22 / 26 的安装、类型检查和生产构建已在 GitHub Actions 通过，Node 22 额外经过 Chromium 节点、SVG 关系边与五镜连续性验收。第三方依赖的完整 lockfile、许可证审计及实际性能基准仍属发布门，不能因 CI green 而提前放行。

## 实际生成和验收结果（2026-11-07）

从本目录运行：

```sh
npm run generate:model # 由 ../case.mjs 重新生成 src/model.c4；须审查产生的 diff
npm run check:model    # 只读校验，源与模型不一致则失败
npm test               # 10 项测试：映射、歧义、负例、来源漂移
npm run build          # 类型检查、Vite 8 构建及初始包体积回归门
npm run test:e2e       # 需要 Playwright Chromium，实际点击节点和 SVG 边
```

[本轮 Chromium 与 Node 双版本完整检查](https://github.com/dongxi-heji/dongxi-architecture/actions/runs/42365999931) 已通过：两项浏览器测试分别在真实 LikeC4 节点和 SVG 关系路径上点击；关系边返回 `r-candidates`，切镜头仍保留身份。对于合并、多义或没有底层归属的边，适配器会拒绝自动认定（单元负例）。

**加载边界：** 将 LikeC4 放到 React lazy 异步模块，Vite 实测初始入口约 **238.75 kB（gzip 76.47 kB）**，独立 LikeC4 chunk 约 **2,380.93 kB（gzip 687.32 kB）**。这是初始工作面与重图形组件的**拆包**，不是已经压缩/减少全部字节；浏览器打开图仍需加载重图形代码。构建增加了入口小于 350 kB 的防回归检查，不能取代真实加载耗时、设备性能、离线与许可审计。
