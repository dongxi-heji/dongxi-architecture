# LikeC4 × Architecture：嵌入式视图与语义身份试验

这是 [dongxi-architecture #3](https://github.com/dongxi-heji/dongxi-architecture/issues/3) 的**独立 React/Vite 技术栈验收切片**，不是全面迁移现有无依赖原型，也不改变 Worang 语义权威。

**栈**：TypeScript 5.8.3 / React 19.2.0 / Vite 6.4.5 / LikeC4 1.60.0；当前包均明确记录版本。模型仅为 [../case.mjs](../case.mjs) 的**只读、有损投影**。

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
- `src/bridge.mjs` 把 `node.modelRef` 或具有单一底层关系的 `edge.source/target/label` 转换回原 case ID；出现合并边、重复含义、失配或未绑定时拒绝强行认定；
- `bridge.test.mjs` 校对 `model.c4` 中所有对象、关系与原 case 的一一对应，并用合并边和关系失配的负例确认不会静默伪造身份；
- 右栏五镜与专业分析读数一直来自原 case 与 [../analysis-readout.mjs](../analysis-readout.mjs)，不从图形位置、标题或颜色推导事实；
- 现有旧界面仍然存在；本试验只验证插件与交互 API 是否适合产品集成。

## 损失与边界

- LikeC4 负责图形布局与交互，不天然表达 Worang 六角色、事实 authority、Claim Assessment、五镜和证据；这些仍在 source-bound case 与侧栏，不能凭图形转换提升 standing。
- 嵌入式 LikeC4 视图可以合并边，因此 **一条视觉边不一定是一条领域关系**；本试验只有在唯一明确映射时接受，否则显示“未绑定／有歧义”。
- `model.c4` 目前是人工核对并由回归测试防漂移的投影源，不是自动从 Worang canonical IR 生成，也不提供无损反向编辑。
- 工具静态分析读数是之前真实运行的固定快照，页面不会实时重新分析私有源码。
- 本目录的第三方包在 CI 与实际安装后还须做 licenses、bundle 大小、浏览器交互与 Node 26 兼容性回读，不能只凭源码或单元测试宣称平台选型最终完成。
