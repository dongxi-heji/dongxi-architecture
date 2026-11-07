import test from "node:test";
import assert from "node:assert/strict";
import {caseData} from "../../examples/worang-1403/case.mjs";
import {toWorangSGIRV02,identityAudit,toLegacyLens,toCurrentLens} from "./worang-sgir-v02.mjs";

test("adapter keeps the v0.2 carrier contract and snapshot",()=>{
 const graph=toWorangSGIRV02(caseData);
 assert.equal(graph.contract,"worang.semantic-graph-ir");
 assert.equal(graph.version,"0.2");
 assert.deepEqual(identityAudit(caseData,graph),[]);
 assert.equal(graph.graph.sourceSnapshot.value,caseData.snapshot.commit);
 assert(graph.graph.sourceSnapshot.paths.includes("scripts/lib/durable-hive-runtime.mjs"));
 assert.equal(graph.relations.length,caseData.relations.length);
});
test("a designed-but-unrealized relation remains candidate, not a fact",()=>{
 const graph=toWorangSGIRV02(caseData);
 const planned=graph.relations.find(x=>x.id==="r-refill");
 assert.equal(planned.standing.semantic,"candidate");
 assert.equal(planned.modality,"candidate");
 assert(!graph.relations.some(x=>x.standing.semantic==="canonical"));
 assert(!graph.nodes.some(x=>x.standing.semantic==="canonical"));
});
test("all graph relations preserve both endpoints and source provenance",()=>{
 const graph=toWorangSGIRV02(caseData);
 for(const relation of graph.relations){
  assert(relation.sourceRefs.length>0);
  assert.equal(relation.participants.length,2);
  assert(relation.sourceRefs.every(ref=>ref.path));
  assert(graph.nodes.some(n=>n.id===relation.participants[0].nodeId));
  assert(graph.nodes.some(n=>n.id===relation.participants[1].nodeId));
 }
});
test("five current lenses map explicitly into legacy v0.2 values",()=>{
 const pairs={causation:"causality",meaning:"meaning",association:"association",constitution:"constitution",implication:"entailment"};
 for(const [current,older] of Object.entries(pairs)){
  assert.equal(toLegacyLens(current),older);
  assert.equal(toCurrentLens(older),current);
 }
 assert.throws(()=>toLegacyLens("entailment"),/unmapped_current_lens/);
 assert.throws(()=>toCurrentLens("implication"),/unmapped_v02_lens/);
});
test("wrong source version, authority escalation and broken identities fail",()=>{
 const wrong=structuredClone(caseData);wrong.nodes[0].refs=["https://github.com/dongxi-heji/worang/blob/main/设计要求.md"];
 assert.throws(()=>toWorangSGIRV02(wrong),/unbound_or_unpinned_source/);
 const graph=toWorangSGIRV02(caseData);
 graph.relations[0].standing.semantic="canonical";
 assert(identityAudit(caseData,graph).includes("unauthorized_promotion"));
 graph.relations[0].id="fake";
 assert(identityAudit(caseData,graph).includes("relation_identity_lost:r-candidates"));
});
