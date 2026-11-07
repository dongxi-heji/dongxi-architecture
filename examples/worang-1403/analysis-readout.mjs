// Captured result of an actual dependency-cruiser invocation on M5, not a simulated graph.
// The Worang checkout and the pinned main commit were compared for all 8 analyzed files.
export const analyzerReadout = {
  contract:"dongxi-architecture.analyzer-readout/v0",
  id:"worang-hive-dependencies-2026-11-07",
  targetNodeId:"hive",
  relevantRelationIds:["r-claim","r-ownership"],
  origin:"M5 Worang local checkout; read-only static source analysis",
  tool:{name:"dependency-cruiser",version:"18.7.2",nodeVersion:"22.23.1"},
  invocation:"npx --yes dependency-cruiser@18.7.2 --no-config --include-only '^scripts' --output-type json scripts/lib/durable-hive-runtime.mjs",
  source:{
    repository:"dongxi-heji/worang",
    observedCommit:"bf7835eea45adb617245ff061b4d8d5b54b4b29d",
    comparisonCommit:"a6b0b93be046f2aeb20e33365fec889e93ae6b2b",
    scopeEquivalence:"verified_equal",
    method:"git diff --name-status <comparisonCommit> HEAD -- <all 8 traversed files> produced no file differences",
    paths:[
      "scripts/lib/durable-hive-runtime.mjs",
      "scripts/lib/durable-hive-construction-store.mjs",
      "scripts/lib/durable-hive-construction-binding.mjs",
      "scripts/lib/durable-hive-handoff-store.mjs",
      "scripts/lib/durable-hive-task-closeout-store.mjs",
      "scripts/lib/persistence.mjs",
      "scripts/lib/persistence-inventory.mjs",
      "scripts/lib/persistence-schemas.mjs"
    ]
  },
  coverage:{
    entrypoint:"scripts/lib/durable-hive-runtime.mjs",
    includeOnly:"^scripts",
    type:"ESM static module dependency",
    totalModules:8,
    totalEdges:7,
    configuredArchitectureRules:false,
    countsExternalAndBuiltin:false
  },
  edges:[
    ["scripts/lib/durable-hive-runtime.mjs","scripts/lib/durable-hive-construction-store.mjs"],
    ["scripts/lib/durable-hive-runtime.mjs","scripts/lib/durable-hive-handoff-store.mjs"],
    ["scripts/lib/durable-hive-runtime.mjs","scripts/lib/durable-hive-task-closeout-store.mjs"],
    ["scripts/lib/durable-hive-runtime.mjs","scripts/lib/persistence.mjs"],
    ["scripts/lib/durable-hive-construction-store.mjs","scripts/lib/durable-hive-construction-binding.mjs"],
    ["scripts/lib/persistence.mjs","scripts/lib/persistence-inventory.mjs"],
    ["scripts/lib/persistence-inventory.mjs","scripts/lib/persistence-schemas.mjs"]
  ],
  interpretation:{
    supported:"在这组源文件与静态 import 范围内，可观察到上述模块依赖；Hive 主模块有四个直接的本地依赖。",
    notEstablished:"该工具未检查 Claim 的事务正确性、并发唯一性、实际运行、授权、Chat 派发或 #1403 的自动补位。未配置架构规则，因此零 violations 不表示已满足架构约束。",
    assessmentStatus:"scoped-structural-observation"
  }
};

export function auditReadoutAgainstCase(readout,caseData){
 const errors=[];
 if(readout.source.repository!==caseData.snapshot.repository)errors.push("repository_mismatch");
 if(readout.source.comparisonCommit!==caseData.snapshot.commit)errors.push("snapshot_mismatch");
 if(readout.source.scopeEquivalence!=="verified_equal")errors.push("scope_equivalence_unknown");
 if(readout.coverage.totalModules!==readout.source.paths.length)errors.push("module_count_mismatch");
 if(readout.coverage.totalEdges!==readout.edges.length)errors.push("edge_count_mismatch");
 const scoped=new Set(readout.source.paths);
 for(const [from,to] of readout.edges)if(!scoped.has(from)||!scoped.has(to))errors.push("edge_outside_scope");
 if(!caseData.nodes.some(x=>x.id===readout.targetNodeId))errors.push("target_missing");
 return errors;
}
export function toolReadingFor(selection,caseData,readout=analyzerReadout){
 if(selection!==readout.targetNodeId && !readout.relevantRelationIds.includes(selection))return null;
 const errors=auditReadoutAgainstCase(readout,caseData);
 if(errors.length)return {status:"open",text:"工具结果暂不可用于该快照："+errors.join("、")};
 return {
   status:"scoped-observation",
   text:readout.interpretation.supported,
   boundary:readout.interpretation.notEstablished,
   tool:readout.tool.name+" "+readout.tool.version,
   scope:"读取 "+readout.coverage.totalModules+" 个模块、"+readout.coverage.totalEdges+" 条静态依赖；已核实这些源文件与图所绑定快照内容一致",
   directImports:readout.edges.filter(([a])=>a===readout.coverage.entrypoint).map(([,b])=>b)
 };
}
