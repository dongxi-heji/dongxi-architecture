// Source-bound, read-only experimental projection. Not Worang's canonical Semantic Graph IR.
export const caseData = {
  contract: "dongxi-architecture.case-projection/v0",
  title: "Worang #1403 · Work 与 Claim 的关系",
  description: "从候选 Issue 到 Claim 和 Chat 交棒的局部架构探索；严格区分已有源码、设计目标与端到端未知。",
  snapshot: {
    repository: "dongxi-heji/worang",
    branch: "main",
    commit: "a6b0b93be046f2aeb20e33365fec889e93ae6b2b",
    issue: "https://github.com/dongxi-heji/worang/issues/1403"
  },
  nodes: [
    {id:"project",label:"GitHub Project #1",kind:"source",detail:"Issue 与原生 Status 的事实来源；现有 project1-vnext-read 是读取入口。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/project1-vnext-read.mjs"]},
    {id:"controller",label:"队列与补位控制",kind:"target",detail:"Issue #1403 要补的能力：候选筛选、排序、领取及释放后补位；不把目标画成已上线实现。",refs:["https://github.com/dongxi-heji/worang/issues/1403"]},
    {id:"hive",label:"Durable Hive",kind:"source-implementation",detail:"持久 Work 与 Claim 的实现与状态协调边界；代码已包含事务性 claimWork。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/lib/durable-hive-runtime.mjs#L1416-L1478"]},
    {id:"work",label:"Work 同一性",kind:"design-concept",detail:"同一 Issue 在 Chat 交棒之后仍然延续同一 Work；成立与恢复条件由其领域合同承担。",refs:["https://github.com/dongxi-heji/worang/issues/1403","https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/devspace/contracts/praxis.md"]},
    {id:"claim",label:"活跃 Claim",kind:"source-implementation",detail:"由 Hive 建立的具名工作所有权，包含 claim_id、epoch、fencing_token、lease。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/durable-hive-runtime.md#L112-L128"]},
    {id:"chat",label:"Chat 执行槽",kind:"target",detail:"四个常态槽与一个可选过渡槽；实际 Chat 创建需走得到授权的 adapter。",refs:["https://github.com/dongxi-heji/worang/issues/1403"]}
  ],
  relations: [
    {id:"r-candidates",from:"project",to:"controller",label:"提供待筛选候选",standing:"planned",detail:"当前有 Project 读取入口；优先级与 eligibility 排序和自动补位属于 #1403 待实现项。",refs:["https://github.com/dongxi-heji/worang/issues/1403","https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/project1-vnext-read.mjs"]},
    {id:"r-dispatch",from:"controller",to:"hive",label:"请求领取（设计目标）",standing:"planned",detail:"根据当前可执行候选原子领取；这一端到端编排尚未有生产验证。",refs:["https://github.com/dongxi-heji/worang/issues/1403"]},
    {id:"r-claim",from:"hive",to:"claim",label:"事务性建立 Claim",standing:"source-implemented",detail:"claimWork 在 transaction 中检查就绪、冲突域及唯一活跃领取，并建立 lease/fencing 信息。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/lib/durable-hive-runtime.mjs#L1416-L1478","https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/durable-hive-runtime.md#L112-L128"]},
    {id:"r-ownership",from:"claim",to:"work",label:"约束同一 Work 的领取",standing:"tested-locally",detail:"Hive 的 claim 代码与并发竞争测试覆盖局部所有权；不能推出 #1403 整体队列／真实 Chat 已完成。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/lib/durable-hive-runtime.mjs#L1416-L1478","https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/durable-hive-runtime.test.mjs#L52-L90"]},
    {id:"r-handoff",from:"hive",to:"chat",label:"交棒与过渡槽",standing:"tested-locally",detail:"已有交棒与 4+1 容量相关测试；#1403 的实际 canary 和自动补位仍然开放。",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/durable-hive-handoff.test.mjs#L310-L355","https://github.com/dongxi-heji/worang/issues/1403"]},
    {id:"r-refill",from:"chat",to:"controller",label:"释放后补位（设计目标）",standing:"planned",detail:"已验证槽位释放后选择下一个可执行 Issue；尚需队列控制与真实 M5 canary。",refs:["https://github.com/dongxi-heji/worang/issues/1403"]}
  ],
  views: {
    structure:{
      title:"结构与责任",
      description:"谁负责候选、Claim、工作身份和执行？线表示具名关系，不表示已上线链路。",
      nodeIds:["project","controller","hive","claim","work","chat"],
      relationIds:["r-candidates","r-dispatch","r-claim","r-ownership","r-handoff","r-refill"]
    },
    behavior:{
      title:"领取与交接",
      description:"按关注问题重排同一批对象；这是局部行为阅读，不是假装具有完整状态机验证。",
      nodeIds:["project","controller","hive","claim","work","chat"],
      relationIds:["r-candidates","r-dispatch","r-claim","r-ownership","r-handoff","r-refill"]
    }
  },
  lensQuestions:{
    causation:"哪些实际作用改变了什么？移去作用后的反事实是什么？",
    meaning:"这件事对当前协作者和持续工作的处境成为什么？",
    association:"哪些对象有何种联系？目前能确认到哪一层？",
    constitution:"哪些部分及其关系共同构成该能力？",
    implication:"哪些前提真的推出结论？什么还不能推出？"
  },
  lensReadings:{
    "r-ownership":{
      causation:"在 Hive 的受控领取路径中，事务与唯一性检查参与阻止冲突；如果绕过它会怎样，仍需要独立反例或实验。不能把代码先后顺序当作真实因果证明。",
      meaning:"对于持续处理同一 Issue 的协作者，唯一 Claim 关系要维护的是同一 Work 的承接位置，而不是把每次新 Chat 当作重新开工。",
      association:"设计要求、claimWork 源码和并发测试都与此关系有关。代码存在与测试覆盖形成局部支持，不等于运行中每个真实 Chat 都已被验证。",
      constitution:"工作身份、有效 Claim、冲突域、交棒与恢复彼此约束；要形成 #1403 整体自动补位，还必须有候选排序、派工与真实核定。",
      implication:"从当前源码与局部测试，可以支持 Hive 层的受检领取语义；不能推出四槽自动补位已上线，也不能推出实际 M5 canary 已通过。"
    }
  },
  assessments:[
    {target:"r-ownership",claim:"Hive 层具有受检的原子 Claim 领取与局部竞争语义",status:"supported-in-scope",criterion:"claimWork 的受控事务与测试覆盖",method:"阅读已版本化代码与测试",boundary:"静态源码／测试层；本原型尚未重新执行测试",refs:["https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/lib/durable-hive-runtime.mjs#L1416-L1478","https://github.com/dongxi-heji/worang/blob/a6b0b93be046f2aeb20e33365fec889e93ae6b2b/scripts/durable-hive-runtime.test.mjs"]},
    {target:"r-refill",claim:"#1403 真实 M5 四常态槽自动补位已完成",status:"open",criterion:"Issue 所列真实 canary 与逐项权威回读",method:"本次未取得有效运行材料",boundary:"无可引用的本次现场验收证据",refs:["https://github.com/dongxi-heji/worang/issues/1403"]}
  ]
};

export function validateCase(data){
  const errors=[];
  if(!data?.snapshot?.commit || !/^[0-9a-f]{40}$/.test(data.snapshot.commit))errors.push("invalid_snapshot");
  const nodes=new Map(),relations=new Map();
  for(const n of data.nodes||[]){
    if(nodes.has(n.id))errors.push("duplicate_node:"+n.id);
    nodes.set(n.id,n);
    if(!n.refs?.length)errors.push("node_missing_source:"+n.id);
  }
  for(const r of data.relations||[]){
    if(relations.has(r.id))errors.push("duplicate_relation:"+r.id);
    relations.set(r.id,r);
    if(!nodes.has(r.from)||!nodes.has(r.to))errors.push("dangling_relation:"+r.id);
    if(!r.refs?.length)errors.push("relation_missing_source:"+r.id);
    if(!["planned","source-implemented","tested-locally","unknown"].includes(r.standing))errors.push("invalid_standing:"+r.id);
  }
  for(const [name,view] of Object.entries(data.views||{})){
    for(const id of view.nodeIds)if(!nodes.has(id))errors.push("view_missing_node:"+name+":"+id);
    for(const id of view.relationIds)if(!relations.has(id))errors.push("view_missing_relation:"+name+":"+id);
  }
  for(const l of ["causation","meaning","association","constitution","implication"])if(!data.lensQuestions[l])errors.push("missing_lens:"+l);
  return errors;
}

export function findItem(id){
  return caseData.relations.find(x=>x.id===id)||caseData.nodes.find(x=>x.id===id)||null;
}
export function lensReading(id,lens){
  return caseData.lensReadings[id]?.[lens]||"当前关系尚无独立、可核对的此镜读数。可以继续从来源研究，但不能把通用问题当作已验证结论。";
}
