// Read-only inspection of an EXISTING Worang semantic graph.
// Crucial distinction: the graph document is explicitly a "语义母图候选".
// Individual canonical standing entries DO NOT freeze or authorize the graph as a whole.
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";

export const WORANG_NATIVE_SOURCE = Object.freeze({
  repository: "dongxi-heji/worang",
  containerCommit: "a6b0b93be046f2aeb20e33365fec889e93ae6b2b",
  path: "成为/图腾/mother-graph.ir.v0.json",
  blobOid: "da5781b6bafea511153ef43c14eca56385865c52",
  graphId: "worang-mother-graph",
  graphStanding: "workbench-candidate",
  expectedEmbeddedSourceCommit: "739c8a1d9d1fe82ea977449546fe52ce39d4d332",
});

export function gitBlobOid(bytes) {
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return createHash("sha1").update(Buffer.from("blob " + buffer.length + "\0")).update(buffer).digest("hex");
}

export function inspectNativeSource(bytes, descriptor=WORANG_NATIVE_SOURCE) {
  if(!descriptor || typeof descriptor.blobOid!=="string" || !/^[0-9a-f]{40}$/.test(descriptor.blobOid))
    throw new Error("invalid_native_source_descriptor");
  const actual=gitBlobOid(bytes);
  if(actual!==descriptor.blobOid)throw new Error("native_source_blob_mismatch:"+actual);
  let graph;
  try {graph=JSON.parse(Buffer.isBuffer(bytes)?bytes.toString("utf8"):String(bytes))}
  catch {throw new Error("invalid_native_graph_json")}
  if(graph.contract!=="worang.semantic-graph-ir"||graph.version!=="0.2")
    throw new Error("unsupported_native_graph_contract");
  if(graph.graph?.id!==descriptor.graphId)throw new Error("native_graph_identity_mismatch");
  if(graph.graph?.sourceSnapshot?.value!==descriptor.expectedEmbeddedSourceCommit)
    throw new Error("embedded_source_snapshot_mismatch");
  if(descriptor.graphStanding!=="workbench-candidate" || !graph.graph.notes?.includes("语义母图候选"))
    throw new Error("graph_standing_not_established");
  if(!Array.isArray(graph.nodes)||!Array.isArray(graph.relations)||!Array.isArray(graph.groups))
    throw new Error("incomplete_native_graph");
  const nodeIds=new Set(),relationIds=new Set();
  for(const n of graph.nodes){
    if(!n.id||nodeIds.has(n.id))throw new Error("duplicate_or_empty_native_node");
    nodeIds.add(n.id);
    if(!n.standing?.semantic||!n.sourceRefs?.length)throw new Error("native_node_without_standing_or_source:"+n.id);
  }
  for(const r of graph.relations){
    if(!r.id||relationIds.has(r.id))throw new Error("duplicate_or_empty_native_relation");
    relationIds.add(r.id);
    if(!r.standing?.semantic||!r.sourceRefs?.length)throw new Error("native_relation_without_standing_or_source:"+r.id);
    if(!Array.isArray(r.participants)||r.participants.length<2)throw new Error("invalid_native_relation_arity:"+r.id);
    for(const p of r.participants)if(!nodeIds.has(p.nodeId))throw new Error("native_relation_unknown_participant:"+r.id);
    if(r.participants.length!==2&&r.renderHint?.mode!=="reified_node")throw new Error("nary_relation_requires_reification:"+r.id);
    if(r.renderHint?.mode==="direct_edge"&&r.participants.length!==2)throw new Error("invalid_native_direct_edge:"+r.id);
  }
  for(const g of graph.groups)for(const id of g.memberIds||[])
    if(!nodeIds.has(id))throw new Error("native_group_unknown_node:"+g.id);
  return {
    source:{
      repository:descriptor.repository,
      containerCommit:descriptor.containerCommit,
      path:descriptor.path,
      blobOid:actual,
      embeddedSourceCommit:graph.graph.sourceSnapshot.value,
      graphId:graph.graph.id,
      graphStanding:descriptor.graphStanding,
      url:"https://github.com/"+descriptor.repository+"/blob/"+descriptor.containerCommit+"/"+descriptor.path
    },
    counts:{nodes:graph.nodes.length,relations:graph.relations.length,groups:graph.groups.length},
    // No promotion: graph-level status and each node/relation standing stay separate.
    graph
  };
}

// A native N-ary relation MUST remain N-ary in the read model.
// Rendering a relation-as-node is a VIEW operation, not a new domain object.
export function inspectNativeRelation(native,id) {
  const r=native.graph.relations.find(x=>x.id===id);
  if(!r)throw new Error("unknown_native_relation:"+id);
  const nodes=new Map(native.graph.nodes.map(x=>[x.id,x]));
  const participants=r.participants.map(p=>{
    const node=nodes.get(p.nodeId);
    return {nodeId:p.nodeId,label:node.label,role:p.role,
      direction:p.direction??null,required:p.required??null,
      sourceNodeStanding:node.standing.semantic,sourceRefs:node.sourceRefs};
  });
  const nary=participants.length>2;
  return {
    relationId:r.id,predicate:r.predicate,label:r.label,
    relationStanding:r.standing.semantic,graphStanding:native.source.graphStanding,
    participants,
    sourceRefs:r.sourceRefs,
    source:native.source,
    view:{
      kind:nary?"reified-relation-node":"direct-relation-edge",
      syntheticViewId:"view:"+r.id,
      // Display legs do not assert independent causal binary domain edges.
      legs:nary?participants.map(p=>({relationViewId:"view:"+r.id,participantId:p.nodeId,role:p.role,direction:p.direction,required:p.required})):[],
      mayEstablishNewDomainRelations:false
    }
  };
}

export function readNativeSourceFromCheckout(root,descriptor=WORANG_NATIVE_SOURCE) {
  if(typeof root!=="string"||!root.trim())throw new Error("missing_checkout_root");
  const pathSpec=descriptor.containerCommit+":"+descriptor.path;
  const oid=execFileSync("git",["-C",root,"rev-parse",pathSpec],{encoding:"utf8",timeout:15000}).trim();
  if(oid!==descriptor.blobOid)throw new Error("git_blob_oid_mismatch:"+oid);
  // Reads the fixed Git commit object, never mutable worktree content.
  const bytes=execFileSync("git",["-C",root,"show",pathSpec],{timeout:15000,maxBuffer:1024*1024*5});
  return inspectNativeSource(bytes,descriptor);
}
