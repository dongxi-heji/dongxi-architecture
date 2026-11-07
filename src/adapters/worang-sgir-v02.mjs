// Experimental adapter into Worang Semantic Graph IR v0.2.
// It transforms a source-bound *case projection*, not canonical Worang data.
// No generated node, relation or view obtains Worang design authority.
const CURRENT_TO_V02 = Object.freeze({
  causation: "causality",
  meaning: "meaning",
  association: "association",
  constitution: "constitution",
  implication: "entailment"
});
const V02_TO_CURRENT = Object.freeze(Object.fromEntries(
  Object.entries(CURRENT_TO_V02).map(([current, legacy]) => [legacy, current])
));
const CASE_STANDING = new Set(["planned","source-implemented","tested-locally","unknown"]);

export function toLegacyLens(lens) {
  if (!Object.hasOwn(CURRENT_TO_V02, lens)) throw new Error("unmapped_current_lens:" + lens);
  return CURRENT_TO_V02[lens];
}
export function toCurrentLens(lens) {
  if (!Object.hasOwn(V02_TO_CURRENT, lens)) throw new Error("unmapped_v02_lens:" + lens);
  return V02_TO_CURRENT[lens];
}
function standing(caseStatus) {
  if (caseStatus && !CASE_STANDING.has(caseStatus)) throw new Error("unknown_case_standing:" + caseStatus);
  return {semantic: caseStatus==="planned"?"candidate":"projection", lifetime:"snapshot",
    note:"从实验 case 投影生成；不是 Worang canonical authority 或生产验证读数"};
}
function sourceRef(url, snapshot) {
  const prefix = "https://github.com/" + snapshot.repository + "/blob/" + snapshot.commit + "/";
  if (url.startsWith(prefix)) {
    const [path, anchor] = url.slice(prefix.length).split("#");
    if (!path) throw new Error("empty_source_path");
    return {path: decodeURIComponent(path), ...(anchor?{anchor}:{}),sha:snapshot.commit};
  }
  const issuePrefix = "https://github.com/" + snapshot.repository + "/issues/";
  if (url.startsWith(issuePrefix) && /^\/issues\/\d+$/.test(url.slice(issuePrefix.length-7))) {
    return {path:url,note:"独立 GitHub Issue URL；其当前内容不受 Git 快照固定"};
  }
  throw new Error("unbound_or_unpinned_source:" + url);
}
export function toWorangSGIRV02(data) {
  if (!data || data.contract!=="dongxi-architecture.case-projection/v0") throw new Error("unsupported_case_contract");
  const snapshot=data.snapshot;
  if (!snapshot||!/^[0-9a-f]{40}$/.test(snapshot.commit)) throw new Error("invalid_case_snapshot");
  const nodeIds=new Set((data.nodes||[]).map(n=>n.id));
  if(nodeIds.size!==data.nodes.length)throw new Error("duplicate_case_node");
  const relationIds=new Set();
  const nodes=data.nodes.map(n=>({
    id:n.id,label:n.label,
    kind:n.kind==="target"?"possibility":n.id==="claim"?"state":"entity",
    layer:n.kind==="target"?"workface":n.kind==="design-concept"?"knowledge":"reality",
    definition:n.detail,
    answers:["当前这个对象是什么，来源在哪里？"],
    standing:standing(n.kind==="target"?"planned":undefined),
    sourceRefs:n.refs.map(url=>sourceRef(url,snapshot)),
    qualifiers:{projectionCaseKind:n.kind,sourceUrls:[...n.refs]}
  }));
  const relations=data.relations.map(r=>{
    if(relationIds.has(r.id))throw new Error("duplicate_case_relation:"+r.id);
    relationIds.add(r.id);
    if(!nodeIds.has(r.from)||!nodeIds.has(r.to))throw new Error("dangling_case_relation:"+r.id);
    return {
      id:r.id,label:r.label,predicate:r.label,family:"operational",
      primaryLens:null,
      participants:[
        {nodeId:r.from,role:"source",direction:"in"},
        {nodeId:r.to,role:"target",direction:"out"}
      ],
      modality:r.standing==="planned"?"candidate":"projected",
      answers:["这条关系目前由什么材料支持，能推出什么？"],
      standing:standing(r.standing),
      sourceRefs:r.refs.map(url=>sourceRef(url,snapshot)),
      qualifiers:{projectionCaseStanding:r.standing,sourceUrls:[...r.refs],
        auditBoundary:"已检查静态来源、设计目标与生产效力分别成立；此表示不证明运行行为"}
    };
  });
  const paths=[...new Set([...nodes,...relations].flatMap(item=>item.sourceRefs)
    .filter(ref=>!ref.path.startsWith("https://")).map(ref=>ref.path))].sort();
  return {
    contract:"worang.semantic-graph-ir",version:"0.2",
    graph:{
      id:"dongxi-architecture-worang-1403-experimental",
      title:data.title,
      question:"同一 Work 的 Claim、交棒和自动补位目前分别在哪些来源与证据范围内成立？",
      sourceSnapshot:{kind:"git_commit",value:snapshot.commit,paths},
      notes:"外部 Issue 持续变化，其 URL 不由本次 Git commit 固定。本 IR 是由实验 case 投影生成的互操作样例，并非 Worang 原生语义事实源。"
    },
    nodes,relations,groups:[],
    legend:{
      relationTags:[],
      lineSemantics:{solid:"局部关系表示，线型本身不承诺设计生效"},
      nodeSemantics:{candidate:"规划中的对象不等于已运行的对象"},
      notes:"现行五镜只作为 Reading；v0.2 primaryLens 保持 null，避免把 lens 当关系类型"
    },
    view:{
      renderer:"other",direction:"LR",legendPlacement:"bottom-right-preferred",
      showRelationTags:false,showStanding:true,
      notes:"可生成不同视图；本数据本身不拥有布局、交互或设计权威"
    }
  };
}
export function identityAudit(caseData,graph) {
  const errors=[];
  if(graph.graph.sourceSnapshot.value!==caseData.snapshot.commit)errors.push("snapshot_mismatch");
  for(const node of caseData.nodes)if(!graph.nodes.some(x=>x.id===node.id))errors.push("node_identity_lost:"+node.id);
  for(const r of caseData.relations){
    const x=graph.relations.find(x=>x.id===r.id);
    if(!x)errors.push("relation_identity_lost:"+r.id);
    else if(x.qualifiers.projectionCaseStanding!==r.standing)errors.push("standing_changed:"+r.id);
  }
  if(graph.nodes.some(n=>n.standing.semantic==="canonical")||graph.relations.some(r=>r.standing.semantic==="canonical")) errors.push("unauthorized_promotion");
  return errors;
}
