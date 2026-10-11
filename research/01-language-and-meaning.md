# 自然语言架构目标 → 可机械求值的约束：词汇表与公式语法研究

> 研究对象：`dongxi-architecture` 的自然语言目标编译层。  
> 研究日期：2026-09-30。  
> 证据标记：**[已核实]** 表示有原文、官方资料或权威二手资料支持；**[合理推断]** 表示由这些资料推到本项目的语义设计；**[建议]** 表示工程取舍。不能核实者明确写 **[未核实]**。

## 0. 核心结论

**[建议]** 词汇表（signature）不宜直接等同于自然语言词表，而应由三层契约组成：**表面表达（surface form）→ 词义/框架（sense/frame）→ 类型化关系符号（typed predicate）**。中文和英文只在表面层不同；进入机器层后，两种语言必须收敛到同一组关系符号、论元角色、实体类型、情态算子、量词与路径/时间约束。这样既允许人自然地说“服务 A 不应直接依赖数据库 B”或“Service A should not directly depend on database B”，又能把二者编译到同一个可求值对象。

**[合理推断]** 项目的 Tarski 框架需要补一个重要限定。经典 Tarski 满足关系是在一个已解释的结构中把公式判为满足或不满足；Tarski 传统讨论的完整解释语言是二值的。项目要求的 `unknown` 因而不是经典 `M ⊨ φ` 的第三个经典真值，而应来自**部分结构（partial model）/不完备解释**上的求值层。建议保留 `M ⊨ φ` 表示“满足”，另定义 `Eval(M, φ) ∈ {satisfied, violated, unknown}`；只有在谓词解释与证据完备范围足够时，缺失事实才能从 `unknown` 降为 `violated`。Tarski 的满足关系及其递归/组合性参见 Stanford Encyclopedia of Philosophy 的 Tarski 条目与 Truth Definitions 条目。[来源：资源外的模型论背景，见文末 S0]

---

## 1. 词汇表设计原则

1. **表面词与机器谓词分层。** **[建议；依据 1、2、3、4]** `依赖/depend on`、`经过/pass through` 等是自然语言入口，不直接作为无条件唯一的机器关系。先判定词义与框架，再映射到关系符号；HowNet 的义原树、CFN 的框架—框架元素、AMR/UMR 的谓词—论元图都支持这种分层思路。

2. **一个机器谓词对应一个稳定论元框架。** **[建议；依据 3、4]** 每个谓词必须声明论元数、角色顺序、允许的实体类型、方向性，以及必要时的关系性质。自然语言中同一动词若对应不同论元结构，应拆成不同 sense，而不是在求值器里猜。

3. **语义角色优先于句法位置。** **[已核实→合理推断；依据 3]** CFN 用 frame elements 表示参与者角色；袁毓林的配价研究区分论元数目、论旨/语义角色、句法特征、语义特征和配位方式，并强调句法形式与论元结构并非一一对应。项目因此应把“谁是调用者/被调用者、谁是读取者/数据源”作为契约，而不是把中文主语或英文 subject 当成机器角色。

4. **词义原子与可观测事实原子分开。** **[建议；依据 2、3]** NSM（Natural Semantic Metalanguage，自然语义元语言）的语义基元适合约束“这个词大致由哪些更小的意义构成”，但不等于代码抽取器的事实类型。`DO/CAN/IF/NOT/INSIDE` 可以帮助解释“依赖/隔离”，却不意味着代码中应直接抽取这些 NSM 基元。

5. **情态至少拆成义务、推荐、许可、能力、可能性五类。** **[已核实→建议；依据 1]** ISO/IEC 与 GB/T 都区分 requirement、recommendation、permission、possibility/capability；GB/T 1.1—2020 更进一步把“能力（能/不能）”和“可能性（可能/不可能）”分表。项目不能把 `can/能/可能/可` 压成同一个强弱轴。

6. **规范强度与极性是正交维度。** **[建议；依据 1]** `不应 φ` 是禁止 `φ`；`不宜 φ` 是负向推荐；`不必 φ` 是“允许不 φ/无须 φ”，不是禁止。项目内部应先确定情态种类，再确定命题极性，避免把表面上的“不”统一解释为逻辑否定后的同一算子。

7. **不为“负许可”设一个含混词形。** **[已核实→建议；依据 1]** ISO/IEC Directives Part 2:2021 明确提醒 negative permissions 有歧义，应改写；历史版本在 `need not` 与 `may not` 上也发生过变化。机器层应直接写 `P(¬φ)` 或 `¬O(φ)`，自然语言层再生成“不必/need not”等无歧义表达。

8. **指称接地（grounding）独立于词义解析。** **[合理推断；依据 6]** Frege 的“意义（sense）/指称（reference）”说明两个不同表达可以同指而意义不同；Kripke 的专名/刚性指示理论说明名称与对象的关系不能简单还原成一组描述属性。项目应保存“表面名称—意义/类型—代码实体 ID”的独立绑定及来源；绑定失败是 `unbound`，不是谓词为假。

9. **直接边、传递路径与流经节点是不同语义。** **[建议；依据 4、8]** `依赖` 可能指直接依赖或传递依赖；`经过` 可能指“存在一条路径经过”或“所有相关路径都经过”。这些差异会改变真值，必须进入公式，不得由求值器默认。

10. **时间、体（aspect）与情态单独挂在谓词/事件之外。** **[建议；依据 4]** UMR 把 predicate-argument、aspect、document-level temporal/modal relations 分层。架构目标宜采用同样的正交化：关系说“发生/存在什么”，时间说“何时成立”，体说“状态/过程如何展开”，情态说“目标对它有什么规范态度”。

11. **会话含义不自动升级为硬约束。** **[已核实→建议；依据 5]** Grice 式 conversational implicature 的典型性质是依赖上下文且通常可取消。比如“应该用 Redis”字面只给出对 `use(..., Redis)` 的推荐/义务，不语义蕴含“不再用 PostgreSQL”；后者只有在“Redis 与 PostgreSQL 是排他替代方案”或“替换 PostgreSQL”的上下文中才是候选含义。候选必须标 `implicature`，经确认或显式领域规则提升后才能并入硬公式。

12. **歧义保存为候选解释集合，而不是过早猜一个答案。** **[合理推断；依据 5、8]** 若一句话存在两个以上会产生不同公式或不同真值的合理解释，编译结果应保留候选集并标 `ambiguous`。只有等价解释（在当前 signature 下归一到同一公式）才可静默合并。

13. **每个谓词都声明证据完备边界。** **[建议；依据项目 Tarski 目标]** 对静态 import、包依赖清单等可以建立局部 closed-world 的谓词，缺失事实可判假；对运行时调用、网络流量、动态反射等往往只能建立 open-world 谓词，没观察到不能等于不存在。`unknown` 的关键不是“数据库里没有这条边”，而是“当前证据是否足以排除这条边”。

14. **中英双语只共享 canonical sense，不强求逐词翻译。** **[建议；依据 1、2]** ISO/GB 的情态表已经证明语言间并非逐词对称；NSM 也区分语义基元与各语言 exponent。词汇条目应有语言别 alias，但机器 ID、角色、类型与真值条件应语言中立。

15. **所有消歧、接地、蕴含提升与求值都带 provenance。** **[建议；依据 3、5、6]** 对机器可解释性而言，结果需要回答：用了哪一个 sense、名称绑定到什么实体、是否用了语用推理、事实来自什么抽取器、该抽取器在哪个范围被认为完备。没有 provenance 的“正确结果”无法稳定审计。

---

## 2. 情态层：标准化语言、对应关系与逻辑算子

### 2.1 已核实的标准用法

**[已核实] ISO/IEC Directives Part 2（2021，第 7 章）** 的核心区分是：`shall` 表 requirement，`should` 表 recommendation，`may` 表 permission，`can` 表 possibility/capability；ISO House Style 还明确把 `must` 留给文件外部约束，不应拿来替代 `shall`。ISO 2021 的官方质量委员会说明进一步指出：negative permission 有歧义，应改写为明确允许什么，或改成“不做某事”的 requirement/recommendation。旧版材料存在历史差异：2011 版许可表使用 `may / need not`；2018 版说明曾把负许可从 `need not` 改为 `may not`。因此负许可尤其不适合按词面建立稳定跨版本契约。[S1–S3]

**[已核实] GB/T 1.1—2020 附录 C（规范性），第 42–43 页**：要求为`应/不应`，推荐为`宜/不宜`，允许为`可/不必`，能力为`能/不能`，可能性为`可能/不可能`。标准正文还明说：在许可语境中不用“能”“可能”替代“可”；“可”表示文件给出的允许，“能”表示由主客观原因产生的能力，“可能”表示主客观原因产生的可能性。全国标准信息公共服务平台显示该标准现行，2026-01-08 复审结论为继续有效，并注明它非等效采用 ISO/IEC Directives Part 2:2018。[S4–S5]

**[已核实] RFC 2119 / RFC 8174（BCP 14）**：`MUST/REQUIRED/SHALL` 是绝对要求；`MUST NOT/SHALL NOT` 是绝对禁止；`SHOULD/RECOMMENDED` 与 `SHOULD NOT/NOT RECOMMENDED` 允许在充分理解后果的特殊情况下偏离；`MAY/OPTIONAL` 表示真正可选。RFC 8174 进一步规定，只有全大写关键词才带 BCP 14 的特殊规范性含义。[S6–S7]

### 2.2 中英对照与机器算子

以下“逻辑算子”是**[建议]**，不是 ISO、GB/T 或 RFC 自己规定的形式逻辑翻译。

| 语义维度 | 极性 | 中文首选 | ISO/IEC 英文 | RFC 2119/8174 | 建议机器表示 | 说明 |
|---|---|---|---|---|---|---|
| 硬要求 requirement | 正 | 应 | shall | MUST / REQUIRED / SHALL | `O φ` | `O` = obligation，满足目标必须使 φ 成立 |
| 硬要求/禁止 | 负 | 不应 | shall not | MUST NOT / SHALL NOT | `F φ ≝ O ¬φ` | `F` = forbidden |
| 推荐 recommendation | 正 | 宜 | should | SHOULD / RECOMMENDED | `R φ` | `R` 是软规范算子，不等同于 `O` |
| 推荐 recommendation | 负 | 不宜 | should not | SHOULD NOT / NOT RECOMMENDED | `R ¬φ` | “不首选”，不是禁止 |
| 许可 permission | 正 | 可 | may | MAY / OPTIONAL | `P φ` | `P` = permitted |
| 许可“不做” | 负/豁免 | 不必 | ISO 2021 建议改写；旧版曾用 need not / may not | 无专门对称关键词 | `P ¬φ`，在标准义务逻辑中亦可写 `¬O φ` | 不是 `F φ` |
| 能力 capability | 正 | 能 | can | 未定义 | `Able(a, φ)` | 主体是否具备做到 φ 的能力 |
| 能力 capability | 负 | 不能 | cannot | 未定义 | `¬Able(a, φ)` | 不应与禁止混淆 |
| 可能性 possibility | 正 | 可能 | can（ISO 与 capability 共用） | 未定义 | `◇ φ` 或 `Possible(φ)` | GB/T 在词面上与“能”分开 |
| 可能性 possibility | 负 | 不可能 | cannot（ISO 与 capability 共用） | 未定义 | `¬◇φ` / `□¬φ` | 不是规范性禁止 |
| 外部约束 external constraint | 正 | 必须（GB/T 亦警告勿代替“应”） | must | RFC 中 MUST 恰是规范要求 | `ExtO φ` 或来源标注的 `O φ` | **ISO 与 RFC 的重大假朋友（false friend）** |

### 2.3 两套中英表没有逐项对应的地方

**[已核实]** 至少有五处不对称：

- **`can` 不一一对应。** ISO 的 `can/cannot` 同时覆盖 possibility 与 capability；GB/T 用`能/不能`和`可能/不可能`两套形式拆开。
- **`不必`没有稳定的 ISO 2021 单词对称项。** GB/T 明确规定 `不必 = 可以不/无须`；ISO 2021 反而提醒负许可本身容易歧义，建议改写。
- **RFC 没有能力/可能性层。** RFC 2119/8174 只定义 requirement-level 关键词，没有定义 BCP 14 意义的 `CAN/CANNOT`。
- **`must` 在 ISO 与 RFC 中角色冲突。** ISO House Style 用 `shall` 表文件要求、`must` 表外部约束；RFC 则把大写 `MUST` 直接定义为规范的绝对要求。
- **RFC 的大写条件没有中文对称机制。** RFC 8174 的特殊语义依赖全大写；GB/T 的`应/宜/可/能/可能`不靠字形大小写区分规范性。

**[建议]** 因此项目不要维护“中文词 ↔ 英文词”二维字典，而应维护“中文/英文表面词 → canonical modality sense → operator”的三层表。

---

## 3. NSM：哪些语义基元可做动词表的底层原子

### 3.1 语义基元清单

**[已核实]** 后期 NSM 文献通常列 65 个 semantic primes。按 Goddard/Wierzbicka 系谱整理为：

- 实体：`I~ME, YOU, SOMEONE, PEOPLE, SOMETHING~THING, BODY`
- 关系实体：`KIND, PART`
- 限定：`THIS, THE SAME, OTHER~ELSE~ANOTHER`
- 量词：`ONE, TWO, SOME, ALL, MUCH~MANY, LITTLE~FEW`
- 评价：`GOOD, BAD`
- 描述：`BIG, SMALL`
- 心智：`THINK, KNOW, WANT, DON'T WANT, FEEL, SEE, HEAR`
- 言说：`SAY, WORDS, TRUE`
- 行动/事件/运动：`DO, HAPPEN, MOVE`
- 位置/存在/指定/领属：`BE (SOMEWHERE), THERE IS, BE (SOMEONE/SOMETHING), (IS) MINE`
- 生命：`LIVE, DIE`
- 时间：`WHEN~TIME, NOW, BEFORE, AFTER, A LONG TIME, A SHORT TIME, FOR SOME TIME, MOMENT`
- 空间：`WHERE~PLACE, HERE, ABOVE, BELOW, FAR, NEAR, SIDE, INSIDE, TOUCH`
- 逻辑：`NOT, MAYBE, CAN, BECAUSE, IF`
- 强度/比较：`VERY, MORE`
- 相似：`LIKE~AS~WAY`

当前 65 项清单可由 2026 年 JASIST 综述追溯到 Wierzbicka/Goddard 系谱。[S8]

### 3.2 汉语验证的证据边界

**[已核实]** Hilary Chappell 2002《The universal syntax of semantic primes in Mandarin Chinese》专门检验普通话中的 semantic primes 及其组合句法，篇幅 243–322；NSM 项目资料说明该研究覆盖当时的 **59** 个 proposed primes，并扩展了 1994 年对 39 个 prime exponents 的工作。[S9]

**[未核实]** 本次没有找到一篇“逐项重新验证当前完整 65 个基元普通话 exponent 与句法”的独立研究。因此不能把“Chappell 2002 验证了今天的 65 项”写成事实。可以准确写成：**普通话有系统性的 NSM 验证传统，但 2002 研究对应的是当时 59 项库存。**

### 3.3 对架构词汇的用途

**[建议]** 最适合做底层语义检查表的 NSM 原子是：`DO, HAPPEN, MOVE, CAN, IF, NOT, BECAUSE, PART, KIND, INSIDE, TOUCH, BE(SOMEWHERE), THERE IS, BEFORE, AFTER, FOR SOME TIME, SOME, ALL, SAME, OTHER`，其次是 `KNOW/SAY/WORDS`（接口/消息语义时有用）。

**[建议]** NSM 在这里的作用不是直接生成可执行 predicate，而是提供一种“去术语循环”的释义检查：如果 `依赖`只能用另一个同样含混的技术词“需要”定义，词汇表还没有真正澄清；若能大致拆成 `IF Y NOT ... THEN X CAN NOT DO ...`，就更容易看到它究竟是在表达因果依赖、能力依赖还是规范依赖。

---

## 4. 中文语义资源：从词到“动词—论元—角色”

### 4.1 HowNet / OpenHowNet

**[已核实]** OpenHowNet（THUNLP）把 HowNet 描述为 sememe（义原）知识库：预定义约两千个义原，标注二十多万个中英文词义；当前核心数据仓库说明包含 237,973 concepts/senses。其结构化 sememe tree 不是一串平面标签，而可带 `modifier`、`CoEvent`、`scope`、`patient` 等角色。[S10]

**[合理推断]** HowNet 最值得借的是“**一个词有多个 sense；每个 sense 是带角色的结构化定义**”。不建议把两千多个义原直接导入架构 signature，因为其中大量概念无法从代码事实中可靠抽取，也不符合“目标用什么、现状抽什么”的最小契约原则。

### 4.2 汉语框架网 CFN

**[已核实]** 山西大学 CFN 1.0 项目资料称其基于真实汉语语料构建，含近 700 个语义框架、约 20,000 条标注例句；其框架语义解析数据显式给出 `frame`、触发目标词 `target` 以及 frame element spans。[S11]

**[合理推断]** 这给本项目一个直接模板：词汇条目不是“动词 = 二元边”这么简单，而是“**sense/frame + core roles + 可选修饰角色**”。例如“部署于”至少有 `workload` 与 `runtime_target` 两个 core role；“暴露”若目标句强调“只向内网暴露”，则 `audience/zone` 是改变真值的必要角色，不能当普通修饰语丢弃。

### 4.3 袁毓林的配价语法

**[已核实]** 袁毓林 1998《汉语动词的配价研究》把单一“价”分解为“联、项、位、元”等层级，并处理约 1640 个动词/形容词的支配能力、从属成分语义角色及语义格与句法成分之间的配位。其 2002《论元角色的层级关系和语义特征》明确把汉语动词论元结构研究概括为论元数目、论旨角色、句法特征、语义特征、配位方式等方面；2004 论文又强调动词与句式互动会发生论元插入/删除，二者关系“有理据但不可完全预测”。[S12–S14]

**[建议]** 对 dongxi-architecture，配价理论的实际贡献是三条：a) 每个 verb sense 明确 valency；b) role 与中文语序解耦；c) 允许自然语言省略某些角色，但省略后是否能自动补齐必须由 frame 规则与 grounding 证据决定，而不是由句法位置硬编码。

---

## 5. 首批动词候选

> **重要说明。** 下表“NSM 基元分解”均为**[建议] 的 NSM-style 工程释义**，表示该关系最可能需要哪些已核实 semantic primes 才能说明白；它们**不是** Wierzbicka/Goddard/Chappell 已发表的标准 NSM explication。其目的在于暴露词义构件与歧义，不是把 NSM 当作代码事实模式。

| 中文 / English | 建议 canonical sense；论元数与角色 | NSM-style 候选基元 | 主要歧义类型 | 代码侧需要的候选事实（不涉及实现） |
|---|---|---|---|---|
| **依赖 / depend on** | `depend_on(Dependent, Dependency, Kind)`，3 元；`Kind ∈ {build,runtime,data,control,...}` | `CAN, DO, IF, NOT, BECAUSE, KIND` | “依赖”可指构建、运行时、数据、控制；直接/传递依赖；必要/仅使用 | 包清单/import、链接关系、调用边、配置引用、数据访问、运行时服务依赖，以及每类证据的完备范围 |
| **调用 / call** | `call(Caller, Callee)`，2 元；Callee 可为 service/function/endpoint | `DO, HAPPEN, BECAUSE, SAY` | 静态调用 vs 运行时调用；函数调用 vs RPC；直接 vs 间接 | AST/符号调用边、RPC client→endpoint、消息触发映射、trace（若有） |
| **读取 / read** | `read(Reader, DataResource)`，2 元 | `DO, KNOW, AFTER, INSIDE` | “读”可指数据库查询、文件读取、消费消息、配置加载 | SQL/query 权限与调用、文件读取、consumer subscription、配置读取、对象存储 GET |
| **写入 / write** | `write(Writer, DataResource)`，2 元 | `DO, HAPPEN, AFTER, INSIDE` | insert/update/delete 是否都算写；同步/异步；写缓存还是源数据 | SQL mutation、文件写、producer publish、对象存储 PUT、缓存 mutation |
| **访问 / access** | `access(Actor, Resource)`，2 元 | `CAN, DO, SOMETHING, THERE IS` | 可达权限 vs 实际访问；read/write/call 的上位词；网络访问 vs API 访问 | ACL/IAM、网络可达、调用/读写事实；必须标清采用“能力”还是“实际发生” sense |
| **经过 / pass through** | `pass_through(Flow, Mediator)`，2 元；Flow 是一等实体 | `MOVE, BEFORE, AFTER, INSIDE, PLACE` | “存在某条路径经过” vs “所有相关路径经过”；数据流/请求流/构建流；中间节点还是边 | 可枚举的 path/flow、入口出口、代理/gateway/queue hop、路由拓扑及 path 完备性 |
| **暴露 / expose** | `expose(Provider, Interface, Audience)`，3 元 | `DO, CAN, OTHER, SIDE, INSIDE` | “有接口” vs “对某范围可访问”；公网/内网/集群内；端口 vs API | listener/port、API route、Ingress/Gateway、网络策略、允许访问的 zone/audience |
| **提供 / provide** | `provide(Provider, Interface)`，2 元 | `DO, CAN, OTHER, SOMETHING` | 提供 API、能力、库、事件；声明提供 vs 实际可用 | API/IDL 定义、exported symbol、service declaration、published topic/schema |
| **部署于 / be deployed on** | `deployed_on(Workload, RuntimeTarget)`，2 元 | `BE(SOMEWHERE), INSIDE, CAN, DO, FOR SOME TIME` | 逻辑环境 vs 物理节点；期望 placement vs 当前 placement | deployment manifest、scheduler placement、namespace/cluster/environment membership、runtime inventory |
| **位于 / be in / located in** | `located_in(Entity, Container)`，2 元 | `BE(SOMEWHERE), INSIDE` | 代码目录、模块层级、网络区、运行环境的“位于”并非同一关系 | module/file containment、namespace、zone、cluster、repository path；建议按实体类型拆 sense |
| **包含 / contain** | `contain(Container, Member)`，2 元 | `PART, INSIDE` | 物理/词法包含、逻辑归属、集合成员关系；是否传递 | package/module/file tree、deployment membership、schema membership；声明传递性范围 |
| **导入 / import** | `import(CodeUnit, PackageOrModule)`，2 元 | `PART, DO, BECAUSE` | 语言 import、动态加载、类型引用、仅 dev/test 依赖 | import/use/include 声明、模块解析结果、依赖 scope（prod/test/dev） |
| **实现 / implement** | `implement(Implementer, InterfaceOrContract)`，2 元 | `KIND, DO, SAY, WORDS, THE SAME` | 语言 interface implementation、协议兼容、业务“实现功能” | type/interface relation、protocol/IDL conformance declaration、adapter mapping；不同 sense 不混用 |
| **连接 / connect to** | `connect_to(Source, Target)`，2 元，默认有向 | `CAN, DO, THERE IS, BECAUSE` | 拓扑连接、会话已建立、配置了 endpoint、网络可达；有向/无向 | socket/client config、network policy/topology、connection pool target、service discovery |
| **可达 / be reachable** | `reachable(Source, Target)`，2 元，通常为派生关系 | `CAN, MOVE, PLACE, THERE IS` | L3/L4 网络可达、应用可调用、鉴权后可达；存在路径 vs 可成功完成请求 | 网络图、ACL/firewall、routing、service endpoint；需要指定 reachability layer |
| **发送 / send** | `send(Sender, MessageOrData, Receiver)`，3 元 | `DO, MOVE, BEFORE, AFTER, BE(SOMEWHERE)` | 直接发送、经 broker、广播；消息类型/实例；意图 vs 实际事件 | producer/consumer binding、HTTP/RPC request edge、message topic、event schema |
| **存储于 / be stored in** | `stored_in(Data, Store)`，2 元 | `INSIDE, FOR SOME TIME, AFTER, CAN, KNOW` | 主存储、缓存、副本、备份；数据类型 vs 数据实例 | schema/table/collection mapping、cache keyspace、object bucket、replica/backup declaration |
| **隔离 / be isolated from** | `isolated_from(A, B, Dimension)`，3 元，Dimension 必填 | `NOT, CAN, DO, MOVE, TOUCH, KIND, SIDE` | 网络隔离、部署隔离、数据隔离、依赖隔离、故障隔离、团队边界；“完全隔离”是否允许受控中介 | 对应维度的边/路径缺失证据、network policy、deployment placement、dependency graph、data ownership/access；需完备性声明 |

### 5.1 首批词汇表的两个强约束

**[建议]** 第一，**不默认传递性**。`A depend_on B` 且 `B depend_on C` 不自动等于 `A depend_on C`；若目标确实说“直接依赖”或“任何传递依赖”，分别使用 direct relation 与 transitive closure。`contains` 也只有在明确的层级域内才可声明传递。

**[建议]** 第二，**不可把“隔离”做成无维度的二元布尔谓词**。它是架构文本中最容易产生虚假确定性的词之一。若用户只说“A 与 B 隔离”，在没有上下文足以唯一确定 `Dimension` 时应标 `ambiguous`；不应偷偷选择 network isolation。

---

## 6. 实体类型候选

**[建议]** 初版类型系统宜小而可扩展，优先覆盖可从常见代码/配置/部署事实中接地的对象：

| 上位类型 | 候选实体类型 | 典型用途 |
|---|---|---|
| `ArchitecturalUnit` | `System`, `Subsystem`, `Service`, `Module`, `Component` | 架构边界、依赖、调用、包含 |
| `CodeUnit` | `Package`, `Library`, `SourceFile`, `Class`, `Function/Method` | import、实现、静态调用 |
| `Interface` | `API`, `Endpoint`, `Port`, `Protocol`, `Contract` | 提供、调用、暴露、实现 |
| `DataResource` | `DataStore`, `Database`, `Table/Collection`, `Cache`, `ObjectStore`, `Dataset` | 读、写、存储、访问 |
| `MessagingResource` | `Queue`, `Topic`, `Stream`, `Message/EventType` | 发送、接收、经过、依赖 |
| `RuntimeTarget` | `Process`, `Workload`, `Container`, `Host/Node`, `Cluster`, `Environment`, `Namespace` | 部署于、位于、隔离 |
| `Network/Trust` | `NetworkZone`, `TrustZone`, `Gateway`, `Proxy` | 暴露、可达、经过、网络隔离 |
| `Flow` | `RequestFlow`, `DataFlow`, `MessageFlow` | 路径量词与“经过” |
| `RepositoryEntity` | `Repository`, `BuildTarget`, `Artifact` | 构建依赖、归属、发布 |
| `ExternalEntity` | `ExternalSystem`, `ThirdPartyService` | 边界外依赖/调用 |

**[合理推断]** 实体层级应服务于**谓词类型检查**，而不是试图复刻完整软件本体。比如 `Gateway` 同时可能是 `Service` 与 `Network/Trust` 中介；允许多重类型比强迫单继承更自然。

---

## 7. 意义表示：AMR/UMR 能借什么，不能照搬什么

### 7.1 AMR

**[已核实]** AMR（Abstract Meaning Representation）1.2.6 把句子表示为 rooted directed acyclic graph，核心目标是“who is doing what to whom”，采用谓词—论元关系；其规范用 concept（如 `possible-01`、`obligate-01` 等）表达模态。但 AMR 规范明确承认它没有深层的 quantifier representation，只做有限的规范化；经典 AMR 也没有系统覆盖 tense/aspect。[S15]

**[建议]** 因此 AMR 很适合借作**自然语言编译中间表示（IR）**：先把目标句变成 predicate-argument graph，再映射到项目 signature；但不适合直接拿 AMR graph 当最终约束语言。最终公式需要更明确的量词、情态 scope、路径和时间真值条件。

### 7.2 UMR

**[已核实]** UMR（Uniform Meaning Representation）第一版数据把 sentence-level graph 用于 predicate-argument、实体、词义、event aspectuality、person/number；document-level graph 用于 coreference、temporal 与 modal relations。早期 UMR 工作明确把 quantification、negation、modality scope 作为补足 AMR 的问题，并用 scope graph 表示；当前 UMR 工具还显式提供 temporal relations（如 `before/after/overlap/contained`）与 modal dependency/strength。[S16–S19]

**[已核实]** UMR aspect 体系在项目教程中明确列出 `Process, State, Habitual, Activity, Endeavor, Performance`，并把 `State` 进一步细分为 reversible / irreversible / inherent / point state；教程还把时间解释建模为 event 与 reference time 的依赖图，并以 dependency structure 表示 modal source 的嵌套。[S19a] 2024 的汉语 UMR aspect 研究进一步指出，汉语 aspect 标注会受词汇语义、含义推断和体标记等因素影响，存在显著标注分歧。[S20]

### 7.3 对标评估

| UMR 部分 | 是否直接借用 | 结论 |
|---|---|---|
| predicate-argument graph | **可直接借思想** | 与 signature 的 typed predicate / semantic roles 高度一致 |
| sense disambiguation | **可借** | 目标词先落到 sense/frame，再进机器 predicate |
| aspect attribute | **裁剪后借** | 初版只保留架构目标真正用到的 State/Habitual/Process/完成性信息 |
| temporal dependency | **可借核心关系** | 采用相对 DCT/reference 的 before/after/overlap，比照搬英语时态更跨语言 |
| quantifier/scope | **借问题意识，不借最终表示** | 最终约束直接用显式 `∀/∃/count` 更适合机械求值 |
| modal dependency/strength | **不能直接对标规范情态** | UMR 的 modal strength 主要处理 factuality/epistemic source；架构要求需要独立 deontic `O/P/F/R` 层 |
| coreference | **并入 grounding 层** | 对项目而言更自然地处理为名称/提及到实体 ID 的绑定 |

---

## 8. 公式语法草案

> 以下是**[建议] 语义语法**，是数学表示草案，不是实现代码。

### 8.1 核心：多类型一阶逻辑

基础项包括：

- 类型化变量：`x : Service`, `d : DataStore`, `p : Flow`；
- 常量：grounding 后的 canonical entity ID；
- 原子公式：`R(t₁, …, tₙ)`；
- 逻辑联结：`¬φ`, `φ ∧ ψ`, `φ ∨ ψ`, `φ → ψ`；
- 量词：`∀x:T. φ`, `∃x:T. φ`；
- 数量约束：`count{x:T | φ} ⋈ n`，其中 `⋈ ∈ {=, ≠, <, ≤, >, ≥}`。

**[建议]** 机器层不把自然语言“所有/任何/每个/至少一个/最多一个/只有”留作字符串；它们必须在编译时落到量词或基数约束。

### 8.2 情态

- **要求**：`O φ`
- **禁止**：`F φ ≝ O ¬φ`
- **许可**：`P φ`
- **推荐**：`R φ`（soft recommendation）
- **能力**：`Able(a, φ)`
- **可能性**：`◇φ` 或显式 `Possible(φ)`

**[建议]** `R` 不先验定义为弱化版 `O` 的数值权重，因为 RFC/ISO 对 SHOULD/宜 的语义是“可因特定理由偏离，但需理解后果”，不是一个天然的 0–1 概率或分数。将来若要优化求解，可另加 preference/penalty 层。

### 8.3 路径

建议明确区分三类：

1. **直接边**：`R(x,y)`；
2. **传递闭包**：`R⁺(x,y)`，表示存在一条一条或多条 R 边组成的路径；
3. **显式路径/流**：`Path/Flow` 成为一等对象，支持 `source(p,x)`, `target(p,y)`, `contains(p,z)`。

对“所有从 A 到 B 的请求都经过 G”，目标语义是：对所有属于该流量域的路径 `p`，若 `source(p,A) ∧ target(p,B)`，则 `contains(p,G)`。对“至少有一条请求路径经过 G”，则是存在量词。两者不能合并。

**[合理推断]** 如果不把 path 作为结构中的一等对象，任意图可达性通常需要超出普通一阶逻辑的 transitive-closure/path 扩展；如果在 `M` 中已经物化可达路径，则最终求值仍可保持在一阶关系层。这一取舍应由现状抽取模型决定。

### 8.4 时间与“时态”

**[建议]** 不把英语 grammatical tense 当核心机器范畴，而采用 UMR 风格的**时间依赖（temporal dependency）**：

- `BEFORE(e₁,e₂)` / `AFTER(e₁,e₂)` / `OVERLAP(e₁,e₂)`；
- `AT(t, φ)`：在明确时间点/版本上 φ 成立；
- `FROM(t, φ)` / `UNTIL(t, φ)`：目标生效窗口；
- `DCT`（document creation time）或项目显式 `ReferenceTime` 作为“现在/之后/之前”的锚点。

自然语言“目前不应依赖 X”“迁移后必须只写 Y”“从 v3 起所有流量经过 G”都先确定 reference time，再产生约束。若时间参照对象本身无法 grounding，应是 `unbound`，而不是 `unknown`。

### 8.5 体（aspect）

**[建议]** 初版只保留会改变目标真值的少数体信息：

- `State`：当前/持续状态，如“服务部署在 cluster A”；
- `Habitual`：常态/反复行为，如“请求通常经过 gateway”——注意这通常不足以表达硬架构要求；
- `Process`：迁移/演进过程未明确完成边界；
- `Performance`：已达到结果态；
- `Endeavor`：过程终止但未达结果态，仅当目标句确实讨论迁移执行状态时使用。

多数静态架构目标可把谓词解释为 `State`，无需在最终公式中显式写 aspect；只有“正在迁移/最终迁完/持续写入”等目标才需要事件化。

### 8.6 事件化规则

**[建议]** 若时间、体、消息实例或来源角色会改变真值，把关系 reify 成事件/流对象；否则保留简单 n 元关系。比如普通“Service A 调用 Service B”用二元 `call(A,B)` 足够；“A 在迁移完成之后不再调用 B”则需要调用事件或时间索引关系，以承载 `AFTER`。

---

## 9. 指称与 grounding：从自然语言名称到代码实体

**[已核实]** Frege 1892 的 sense/reference 区分说明，同一指称对象可由不同 sense 的表达触达；反之，表达可以有 sense 而无实际 denotation。Kripke 对 rigid designation 与 causal grounding 的讨论则区分了“名称怎样固定到对象”与“靠描述找到对象”这两类问题。[S23–S24]

**[合理推断]** 项目应把 grounding 建模为有 provenance 的偏关系，而不是字符串相等：

`mention(surface, language, context) → sense/type → candidate entity IDs → selected binding`。

典型情况：

- “用户服务”与 `user-service` 可同指，但表面词不同；
- `payments` 可能同时是 repository、namespace、service，必须由 predicate type/上下文消歧；
- “主库”是描述性指称，可能随环境改变，不应当成永久 canonical ID；
- 零候选是 `unbound`；多个不可区分候选是 `ambiguous`；唯一绑定后，才进入 `M` 上的公式求值。

**[建议]** Kripke 理论在这里只提供“不要把名称等同于描述集合”的哲学提醒，不能直接当作软件实体命名理论；这是类比性借用，而非文献原义。

---

## 10. 言语行为与会话含义

### 10.1 目标句是指令类，但公式内容与言外行为要分开

**[已核实]** Austin 的 speech act 区分与 Searle 的 illocutionary 分类中，directive（指令类）是说话者试图让听者采取行动，使命题内容得到实现；SEP 的 pragmatics 条目以“Close the door!”为典型 directive。[S21]

**[合理推断]** 架构目标句总体属于 directive-like 规范语言，但机器公式不必记录“谁命令谁”的完整社会行动结构；更有用的是把 illocutionary force 编译成 `O/F/P/R`，把 proposition 编译成普通关系公式。这样“建议 A 经过 G”和“A 必须经过 G”共享同一个 propositional core，只是情态不同。

### 10.2 implicature 处理规则

**[已核实]** Grice 式 conversational implicature 依赖语境，且典型地可取消；这正是它与语义蕴含的关键区别之一。[S22]

**[建议]** 处理规则：

1. 先编译 conventional/literal content，得到 `φ_literal`；
2. 再生成零个或多个 `implicature candidates`，每个带触发依据与上下文；
3. candidate **不得**默认进入 `φ_literal` 的合取；
4. 只有用户明示、项目 glossary 明示排他性、或有可审计领域规则时，candidate 才可 promote 为正式约束；
5. 未提升的 candidate 仍可作为诊断显示，标签为 `implicature`。

例：“**应该用 Redis**”。字面为 `R use(X, Redis)`。它**不蕴含** `¬use(X, PostgreSQL)`；只有出现“替换 PostgreSQL”“Redis 是唯一允许的数据存储”或已绑定的互斥策略，才能加入负约束。若上下文只是技术讨论中把 Redis 和 PostgreSQL 并列为两个选项，排他解读仍只是可取消含义。

---

## 11. 差距标注：ambiguous / unbound / implicature / unknown

这四类最好看成不同阶段、可共存的诊断，而不是互斥的四个真值。

| 标签 | 定义 | 判定条件 | 是否已有可求值公式 | 典型例子 |
|---|---|---|---|---|
| `ambiguous` | 表面表达有两个以上**实质不同**且当前证据不能唯一选定的语义解释 | 不同 sense、论元角色、scope、路径量词或 grounding 候选会产生不同公式/真值 | 通常有多个候选公式，尚无唯一公式 | “A 与 B 隔离”未说明 network/data/deploy；“经过”不明是 all paths 还是 some path |
| `unbound` | 语义结构基本确定，但一个指称项无法绑定到当前结构中的唯一实体 | 0 个合法 candidate；若 >1 且无法区分则通常归 `ambiguous` | 公式 schema 有，但含未绑定 term | “订单库”在当前事实图没有对应实体 |
| `implicature` | 解释依赖可取消的语用推断，而非句子 conventional meaning 的必然内容 | 需要上下文/会话合作原则/领域常识才能推出，且可被“但仍保留 X”等话语取消 | 字面公式可求值；隐含候选另存 | “应该用 Redis”→“不再用 PostgreSQL” |
| `unknown` | 公式、sense 与 grounding 已确定，但 `M` 的当前证据不足以决定真/假 | 谓词未抽取、抽取器不覆盖该范围、open-world 下事实缺失、或必要派生关系不可确定 | **有唯一可求值公式，但求值结果缺证据** | 已知要判 `call(A,B)`，但当前只做静态分析且调用由运行时反射决定 |

### 11.1 `unknown` 与 `violated` 的机械边界

**[建议]** 对每个 predicate interpretation 增加 `completeness scope`。原子公式 `R(a,b)`：

- 有正事实 → `satisfied`；
- 有明确负事实，或在声明为完整的 closed-world scope 中确定不存在 → `violated`；
- 否则 → `unknown`。

复合公式可先采用 **Strong Kleene 风格**的三值传播作为最小版本：`false ∧ unknown = false`、`true ∨ unknown = true`，其余含未知分支的情况按三值表传播。**[建议]** 是否最终采用 Strong Kleene、supervaluation 或“证据真值 + provenance”双轨，应列入未决问题；经典 Tarski `⊨` 本身仍保持二值含义。

### 11.2 推荐的诊断顺序

**[建议]** 编译/求值依次检查：`ambiguous → unbound → literal formula + implicature sidecar → evaluation → unknown/satisfied/violated`。这样不会把“没听懂目标”“没找到对象”“现状证据不够”三种完全不同的问题揉成一个 unknown。

---

## 12. 把燕卜荪“七种朦胧”改造成架构目标歧义分类

**[已核实]** William Empson 的 *Seven Types of Ambiguity*（1930；后修订）本是文学批评。Poetry Foundation 转述其目录式七型：细节同时以多种方式起效；多个替代意义归一；不相干意义同时出现；替代意义共同显出复杂心态；作者在写作中才发现意图；陈述矛盾/无关迫使读者补解释；彻底矛盾。[S25]

下面不是 Empson 原分类在软件架构中的既有用法，而是**[建议] 的启发式改造**：

| 架构型 | 来自 Empson 的启发 | 架构目标中的表现 | 例子 |
|---|---|---|---|
| A1 多义并效 | 一个细节同时以多种方式起效 | 单词带多个相容维度，但句子没说明是否都要 | “A 与 B **隔离**”：可能同时暗示网络、部署、数据、依赖边界 |
| A2 多解归一 | 多个替代意义最终归一 | 不同解析在当前 signature 下等价，可自动归一 | “请求经由/经过 G”若两个句法分析都归到同一个已明确 `all-paths through` frame |
| A3 异质并存 | 两个看似不相干意义同时成立 | 一个词确实同时要求两个不同关系 | “A **依赖** B”在上下文中同时指 build dependency 与 runtime dependency |
| A4 复合约束 | 多个意义合起来才表达完整状态 | 目标词是政策包，需要拆成多条 conjunct | “核心域与外部系统**隔离**”被项目 glossary 明确定义为网络隔离 + 数据隔离 + 禁止直接依赖 |
| A5 意图形成中 | 作者边写边发现想法 | 目标本身尚未收敛到可验终态 | “逐步隔离”“尽量减少依赖”“以后最好都经过网关”——应保留 soft/underspecified，而非伪造精确公式 |
| A6 解释修补 | 字面矛盾/空泛，读者被迫补义 | 需要语用或领域知识才能变成可执行目标 | “A 不依赖 B，但 A 必须使用 B 的 SDK 才能启动”——要判断“依赖”sense 是否被窄化 |
| A7 真冲突 | 完全矛盾 | 同一 scope/时间/维度下公式互不相容 | “A 与 B 完全网络隔离”且“A 必须直接调用 B”——若无受控中介例外，目标集自身冲突 |

### 12.1 三个高风险词的最小消歧问题

- **隔离**：隔离的 *dimension* 是什么？是否允许受控中介？“没有直接边”还是“任何路径都不可达”？
- **依赖**：依赖的 *kind* 是什么？直接还是传递？描述当前事实还是目标禁令？
- **经过**：量化的是哪一类 flow？是“所有路径”还是“至少一条路径”？“经过”节点、服务、网关还是逻辑阶段？

**[建议]** 对这三个词，若缺失上述信息会改变公式真值，编译器应优先产生 `ambiguous`，而不是依赖 LLM 的“最可能理解”。

---

## 13. 中国思想与文学：项目立场

**[已核实]** 《系辞》有“书不尽言，言不尽意”，并以“立象以尽意”回应；《庄子·外物》以筌鱼、蹄兔比喻“言者所以在意，得意而忘言”；王弼《周易略例·明象》进一步提出“得象而忘言”“得意而忘象”；刘勰《文心雕龙·神思》写到“意授于思，言授于意，密则无际，疏则千里”，明确看到心意与言辞之间可能极近也可能极远。[S26–S29]

**[合理推断 / 项目立场]** 对 dongxi-architecture，这组传统不应被解释成“语言不可靠，所以可以让模型自由猜意”，恰恰相反：**言、象、公式都是通向意图的表征层，表征可以被使用、比较、校正，却不与意图本身同一。** 系统的责任是让每一次转换留下可检查的形式：哪里已落到稳定 predicate，哪里仍多义，哪里没有指称对象，哪里只是会话含义，哪里现状证据不足。机械语义的价值不是宣称“尽意”，而是把“言未尽意”的剩余量具体标出。

---

## 14. 公式编译的建议分层

**[建议]** 最小完整链条为：

1. **Utterance**：原始中文/英文目标句；
2. **Speech-force / modality**：识别 `O/F/P/R`、能力、可能性；
3. **Frame graph**：predicate sense + semantic roles + quantifier/scope + time/aspect；
4. **Grounding**：role filler → canonical entity；
5. **Constraint formula**：类型化逻辑公式；
6. **Interpretation contract**：公式中每个 predicate 对应哪些现状 facts、完备范围是什么；
7. **Eval**：`satisfied / violated / unknown`；
8. **Gap sidecars**：`ambiguous / unbound / implicature` 与 provenance。

这一分层使 LLM 可以参与 1→4 的语言理解，但不拥有最终语义特权：最终机器意义由 canonical frame、binding、formula 与 evidence contract 决定。

---

## 15. 未决问题清单

1. **三值逻辑选型。** `unknown` 的复合传播采用 Strong Kleene、supervaluation，还是显式证据逻辑？需要与“缺失事实是否可判假”的 completeness contract 一起定。
2. **推荐 `R` 的形式语义。** 仅作为不可判违规的 advisory，还是进入 preference/optimization？若进入，偏离理由如何表示？
3. **义务逻辑悖论与条件义务。** `O(φ→ψ)` 与 `φ→Oψ` 是否需要区分？架构目标常见“如果是公网接口，则必须经过 WAF”。
4. **冲突目标。** 同一 scope/时间下 `Oφ` 与 `Fφ` 是否直接判目标集 inconsistent，还是允许优先级/例外规则？
5. **路径语义。** `through` 的默认量化是否一律禁止省略？是否提供受控语言，如“所有…都经过 / 至少一条…经过 / 不得绕过”？
6. **依赖分类枚举。** `build/runtime/data/control` 是否足够；配置依赖、schema 依赖、ownership 是否另列？
7. **隔离维度枚举。** network/deploy/data/dependency/failure/trust/team 中哪些属于初版机器可观测语义？
8. **谓词层级。** `read/write/call` 是否蕴含 `access`；`import` 是否蕴含某类 `depend_on`；这些 entailment 要不要进入 signature ontology？
9. **派生事实与原始事实。** `reachable`、传递依赖、path-through 是结构 M 中预计算事实，还是求值器中的派生关系？
10. **Grounding 的时间性。** “主库”“生产服务”等描述性名称随环境/版本变化，binding 是否必须带 snapshot/reference time？
11. **别名与同一性。** repository、deployable service、runtime workload 可能共享名称但不是同一实体；是否引入 `realizes/instantiates` 关系连接不同层实体？
12. **词汇表版本化。** predicate 真值条件变化时如何版本化，确保旧目标可重放？
13. **中英生成规范。** canonical formula 回译成人话时，是否生成标准化“受控自然语言”以降低二次歧义？
14. **UMR aspect 裁剪。** 是否只保留 `State/Process/Performance/Habitual` 四档即可覆盖架构演进语言？
15. **Implicature promotion。** 哪些领域规则有资格把 implicature 自动提升为约束？建议默认“无”，除非 glossary 明文规定。
16. **Ambiguity threshold。** 候选解释在当前 M 上恰好同真值，但公式不同，能否暂时合并？建议不合并，因为未来 M 变化会分叉。
17. **开放世界粒度。** completeness 是按 predicate 全局声明，还是按 extractor × repository × environment × time window 声明？后者更精确但成本更高。
18. **负事实来源。** 哪些 extractor 能产生一等 `not-R` 证据，而不是仅靠 absence 推断？

---

## 16. 资源核对与出处

### S0. Tarski / 模型论背景（补充资源）

- **[已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Alfred Tarski”, satisfaction/model/logical consequence 部分。https://plato.stanford.edu/entries/tarski/
- **[已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Tarski’s Truth Definitions”, §§1–2。其说明 Tarski 讨论的 fully interpreted language 中句子为 true/false，并以 satisfaction 递归定义真值。https://plato.stanford.edu/entries/tarski-truth/

### S1–S7. 标准化语言：ISO / GB/T / RFC

- **S1 [已核实，官方]** ISO House Style，引用 ISO/IEC Directives Part 2:2021 Clause 7；明确 `shall` 用于 document requirements，`must` 用于 external constraints；并区分 `may` 与 `can`。https://www.iso.org/ISO-house-style.html
- **S2 [已核实，官方]** ISO/TC 184/SC 4 Quality Committee，“Saint-Denis quiz answers”，逐项引用 ISO/IEC Directives Part 2:2021：Table 3/5，并指出 negative permissions are ambiguous and should not be used。https://committee.iso.org/sites/tc184sc4/home/quality-committee.html
- **S3 [已核实，原始标准旧版 / 历史对照]** ISO/IEC Directives Part 2:2011, Annex H，Permission 表为 `may / need not`，Possibility and capability 为 `can / cannot`。ISO 托管文档搜索页可读；另 2018 版修订说明记载把负许可 `need not` 改为 `may not`。本研究用它只说明**版本历史**，不把旧版负许可当 2021 当前规则。
- **S4 [已核实，官方元数据]** 全国标准信息公共服务平台，GB/T 1.1—2020：现行；发布日期 2020-03-31，实施 2020-10-01；2026-01-08 复审继续有效；非等效采用 ISO/IEC Directives Part 2:2018。https://std.samr.gov.cn/gb/search/gbDetailed?id=A24AF19F41445C2EE05397BE0A0A5E0D
- **S5 [已核实，标准正文]** GB/T 1.1—2020《标准化工作导则 第1部分》，附录 C（规范性），p.42 表 C.1/C.3：`应/不应`、`宜/不宜`；p.43 表 C.4–C.6：`可/不必`、`能/不能`、`可能/不可能`。本次读取的是全文 PDF 镜像；标准身份与现行状态用 S4 官方平台交叉核对。正文镜像：https://eia543.com/documents/01-%E5%9F%BA%E7%A1%80%E6%80%A7%E6%A0%87%E5%87%86%E8%A7%84%E8%8C%83/03-%E9%80%9A%E7%94%A8%E8%A7%84%E8%8C%83%E4%B8%8E%E6%9C%AF%E8%AF%AD/01-%E6%A0%87%E5%87%86%E5%8C%96%E4%B8%8E%E4%BF%A1%E6%81%AF%E5%8C%96/%E6%A0%87%E5%87%86%E5%8C%96%E5%B7%A5%E4%BD%9C%E5%AF%BC%E5%88%99/%E6%A0%87%E5%87%86%E5%8C%96%E5%B7%A5%E4%BD%9C%E5%AF%BC%E5%88%99%20%20%E7%AC%AC1%E9%83%A8%E5%88%86%EF%BC%9A%E6%A0%87%E5%87%86%E5%8C%96%E6%96%87%E4%BB%B6%E7%9A%84%E7%BB%93%E6%9E%84%E5%92%8C%E8%B5%B7%E8%8D%89%E8%A7%84%E5%88%99%EF%BC%88GB%20T%201.1-2020%EF%BC%89.pdf
- **S6 [已核实，原始/官方]** Bradner, S. 1997. RFC 2119, *Key words for use in RFCs to Indicate Requirement Levels*, §§1–6。https://www.rfc-editor.org/rfc/rfc2119.html
- **S7 [已核实，原始/官方]** Leiba, B. 2017. RFC 8174, *Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words*, §§1–2；只给 UPPERCASE 用法特殊 BCP 14 含义。https://www.rfc-editor.org/rfc/rfc8174.html

### S8–S9. NSM

- **S8 [已核实，权威综述/二手]** Hjørland, B. 2026. “Semantic primitives and compositionality: An Annual Review of Information Science and Technology (ARIST) paper.” *Journal of the Association for Information Science and Technology*. 表 1 列 Wierzbicka 的 65 semantic primes，并追溯 Goddard/Wierzbicka 系谱。https://asistdl.onlinelibrary.wiley.com/doi/10.1002/asi.70011
- **S9 [已核实，原始研究的项目书目/摘要]** Chappell, Hilary. 2002. “The universal syntax of semantic primes in Mandarin Chinese.” In Goddard & Wierzbicka (eds.), *Meaning and Universal Grammar*, Vol. I, pp.243–322. DOI 10.1075/slcs.60.12cha。NSM 项目页说明 2002 研究覆盖当时 59 个 proposed primes，1994 工作覆盖 39 个。https://nsm-approach.net/archives/541

### S10–S14. HowNet / CFN / 配价

- **S10 [已核实，项目原始资料]** THUNLP OpenHowNet README：HowNet 义原、约 2,000 sememes、200,000+ senses；当前核心数据 237,973 concepts；示例 sememe tree 带 `modifier/CoEvent/scope/patient` 等 role。https://github.com/thunlp/OpenHowNet
- **S11 [已核实，项目原始资料]** Shanxi University / SXUNLP, Chinese Frame Semantic Parsing README：CFN 1.0，近 700 frames、20,000 annotated examples；数据字段含 frame、target、frame-element spans。https://github.com/SXUNLP/Chinese-Frame-Semantic-Parsing
- **S12 [已核实，书目信息与内容提要；二手]** 袁毓林，1998，《汉语动词的配价研究》，江西教育出版社。内容提要说明“联、项、位、元”、约 1640 个动词/形容词、语义角色与配位关系。Google Books / 豆瓣可核书目信息；本次未获得出版社开放全文，故具体页码 **未核实**。
- **S13 [已核实，机构库]** 袁毓林，2002，《论元角色的层级关系和语义特征》，《世界汉语教学》3:10–22。北京大学机构知识库摘要明确列论元数目、论旨角色、句法特征、语义特征、配位方式。https://ir.pku.edu.cn/handle/20.500.11897/91434
- **S14 [已核实，期刊门户摘要]** 袁毓林，2004，《论元结构和句式结构互动的动因、机制和条件——表达精细化对动词配价和句式构造的影响》，《语言研究》；摘要说明论元插入/删除及动词—句式对应“有理据但不可预测”。https://yyyj.cbpt.cnki.net/portal/journal/portal/client/paper/d6a88a7ada9c527e39bc3d6e98f5bc44

### S15–S20. AMR / UMR

- **S15 [已核实，原始规范]** AMR 1.2.6 Specification，Part I Introduction；Part III modality；quantifier section 明言 AMR 不做深层 quantifier representation。https://github.com/amrisi/amr-guidelines/blob/master/amr.md
- **S16 [已核实，原始论文]** Pustejovsky, Lai & Xue. 2019. “Modeling Quantification and Scope in Abstract Meaning Representations.” ACL Anthology W19-3303。提出 UMR 以 scope graph 补 quantification/negation/modality。https://aclanthology.org/W19-3303/
- **S17 [已核实，原始论文]** Bonn et al. 2024. “Building a Broad Infrastructure for Uniform Meaning Representations.” LREC-COLING 2024, pp.2537–2547。说明 sentence-level / document-level 分工及首版包含 Chinese。https://aclanthology.org/2024.lrec-main.229/
- **S18 [已核实，当前项目资料]** UMR Guidelines repository。https://github.com/umr4nlp/umr-guidelines
- **S19 [已核实，当前工具资料]** UMR Writer 3.0：document-level temporal relation 列出 `contained/before/after/overlap/depends-on`，modal relation 有多级 affirmative/negative strengths。https://umr-tool.cs.brandeis.edu/
- **S19a [已核实，项目原始教程]** Van Gysel, Vigus, Zhao & Xue. 2022. *Developing a Uniform Meaning Representation for Natural Language Processing*（LREC 2022 tutorial）：p.12/slide 13 说明 sentence-level 增加 aspect 与 quantification scope、document-level 增加 temporal/modal dependencies；p.32/slide 33 列出 `Process/State/Habitual/Activity/Endeavor/Performance` 及 state 子类；p.45/slide 46 以 reference-time dependency graph 处理时间；p.53/slide 54 用 dependency structure 表示嵌套 modal source。https://umr4nlp.github.io/web/umr_tutorial_lrec2022.pdf
- **S20 [已核实，原始论文]** Ge, Li, Chen & Wang. 2024. “Annotate Chinese Aspect with UMR——a Case Study on The Little Prince.” LREC-COLING 2024, pp.1161–1172；讨论 UMR aspect lattice 在汉语中的标注难点。https://aclanthology.org/2024.lrec-main.104/

### S21–S22. 言语行为与语用

- **S21 [已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Pragmatics”，speech act 分类部分：directive 是说话者试图让听者行动以实现 propositional content；条目追溯 Austin/Searle。https://plato.stanford.edu/entries/pragmatics/
- **S22 [已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Implicature”，§§1–2, 6：conversational implicature 依赖语境且通常可取消；追溯 Grice 1975。https://plato.stanford.edu/entries/implicature/

### S23–S24. Frege / Kripke 与指称

- **S23 [已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Gottlob Frege”，§3.1–3.2；介绍 1892 “On Sense and Reference” 的 sense/denotation 区分。https://plato.stanford.edu/entries/frege/
- **S24 [已核实，权威二手]** Stanford Encyclopedia of Philosophy, “Rigid Designators”，§1.2、§2.2.2；说明 rigid designation 与 causal grounding 的区分及 Kripke 相关论证。https://plato.stanford.edu/entries/rigid-designators/

### S25. 燕卜荪

- **S25 [已核实，权威二手并引原书目录]** Poetry Foundation, “William Empson”，转述 *Seven Types of Ambiguity* 七型的目录式定义，并说明 Empson 对 ambiguity 的扩展用法。https://www.poetryfoundation.org/poets/william-empson

### S26–S29. 中国思想与文学

- **S26 [已核实，原典]** 《周易正义·系辞上》：“书不尽言，言不尽意”“圣人立象以尽意”。Wikisource《周易正义/07.12》。https://zh.wikisource.org/zh-hans/%E5%91%A8%E6%98%93%E6%AD%A3%E7%BE%A9/07.12
- **S27 [已核实，原典]** 《庄子·外物》：“言者所以在意，得意而忘言。”Chinese Text Project / Wikisource《庄子·外物》。https://ctext.org/zhuangzi/what-comes-from-without/zh
- **S28 [已核实，原典]** 王弼《周易略例·明象》：“得象而忘言”“得意而忘象”。https://zh.wikisource.org/zh-hans/%E5%91%A8%E6%98%93%E7%95%A5%E4%BE%8B/%E6%98%8E%E8%B1%A1
- **S29 [已核实，原典]** 刘勰《文心雕龙·神思》：“意授于思，言授于意，密则无际，疏则千里。”Chinese Text Project / Wikisource。https://ctext.org/wenxin-diaolong/shen-si/zh

---

## 17. 建议作为第一版规范冻结的最小集合

**[建议]** 若现在就要冻结一个能开始工作的 v0.1，而又不把研究问题过早做死，最小集合应是：

- **机器情态**：`O, F, P, R, Able, Possible`；
- **逻辑核心**：typed predicates + `¬/∧/∨/→/∀/∃/count`；
- **路径核心**：direct / transitive-closure / explicit Flow 三分；
- **时间核心**：DCT/reference time + `before/after/overlap/at`；
- **词汇条目字段**：canonical sense ID、zh/en aliases、arity、roles、argument types、relation properties、NSM-style decomposition、ambiguity notes、fact interpretation、completeness scope；
- **诊断**：`ambiguous, unbound, implicature, unknown`，其中前三者属于编译/解释差距，`unknown` 属于已编译公式在部分结构上的证据差距；
- **首批高价值谓词**：`depend_on, call, read, write, access, pass_through, expose, provide, deployed_on, located_in, contain, import, implement, connect_to, reachable, send, stored_in, isolated_from`。

这个集合保留了自然语言中真正会改变架构目标真值的差异，同时把 NSM、HowNet/CFN、AMR/UMR、语用和指称理论放在各自最有价值的位置：**它们帮助编译意义，但最终可机械求值的契约仍由项目自己的 typed signature 与公式语义定义。**