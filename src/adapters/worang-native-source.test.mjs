import test from "node:test";
import assert from "node:assert/strict";
import {WORANG_NATIVE_SOURCE,gitBlobOid,inspectNativeSource,inspectNativeRelation} from "./worang-native-source.mjs";

function sample() {
  const ids=["claim","evidence","criteria","standing"];
  return {
    contract:"worang.semantic-graph-ir",version:"0.2",
    graph:{id:"worang-mother-graph",notes:"语义母图候选。真人阅读测试前不冻结。",
      sourceSnapshot:{value:WORANG_NATIVE_SOURCE.expectedEmbeddedSourceCommit}},
    nodes:ids.map(id=>({id,label:id,standing:{semantic:id==="claim"?"accepted_workbench":"canonical"},sourceRefs:[{path:"test-source.md"}]})),
    relations:[{
      id:"r-verify",label:"主张核验",predicate:"核验主张",
      standing:{semantic:"accepted_workbench"},sourceRefs:[{path:"test-source.md"}],
      renderHint:{mode:"reified_node"},
      participants:ids.map(nodeId=>({nodeId,role:nodeId,direction:nodeId==="standing"?"out":"in",required:true}))
    }],
    groups:[{id:"scope",memberIds:ids}]
  };
}
function fixture(doc=sample()){
  const bytes=Buffer.from(JSON.stringify(doc));
  const descriptor={...WORANG_NATIVE_SOURCE,blobOid:gitBlobOid(bytes)};
  return {bytes,descriptor};
}
test("native blob hashing matches Git's raw blob format and cannot be bypassed",()=>{
 assert.equal(gitBlobOid("hello\n"),"ce013625030ba8dba906f756967f9e9ca394464a");
 const x=fixture();
 assert.equal(inspectNativeSource(x.bytes,x.descriptor).source.blobOid,x.descriptor.blobOid);
 assert.throws(()=>inspectNativeSource(Buffer.from(x.bytes.toString()+" "),x.descriptor),/native_source_blob_mismatch/);
});
test("preserves all N-ary participants and standing without inventing binary domain edges",()=>{
 const x=fixture();const native=inspectNativeSource(x.bytes,x.descriptor);
 const relation=inspectNativeRelation(native,"r-verify");
 assert.equal(relation.view.kind,"reified-relation-node");
 assert.equal(relation.participants.length,4);
 assert.deepEqual(relation.participants.map(x=>x.role),["claim","evidence","criteria","standing"]);
 assert.equal(relation.view.legs.length,4);
 assert.equal(relation.view.mayEstablishNewDomainRelations,false);
 assert.equal(relation.relationStanding,"accepted_workbench");
 assert.equal(relation.graphStanding,"workbench-candidate");
 assert.equal(relation.participants[0].sourceNodeStanding,"accepted_workbench");
});
test("embedded snapshot is not confused with the file container commit",()=>{
 const x=fixture(); const native=inspectNativeSource(x.bytes,x.descriptor);
 assert.notEqual(native.source.containerCommit,native.source.embeddedSourceCommit);
 const bad=sample();bad.graph.sourceSnapshot.value="1".repeat(40);
 const changed=fixture(bad);
 assert.throws(()=>inspectNativeSource(changed.bytes,changed.descriptor),/embedded_source_snapshot_mismatch/);
});
test("source status cannot be silently promoted and N-ary edges require reification",()=>{
 const d=sample(); const x=fixture(d);
 assert.throws(()=>inspectNativeSource(x.bytes,{...x.descriptor,graphStanding:"canonical"}),/graph_standing_not_established/);
 d.relations[0].renderHint={mode:"direct_edge"};
 const y=fixture(d);
 assert.throws(()=>inspectNativeSource(y.bytes,y.descriptor),/nary_relation_requires_reification/);
});
test("dangling sources and unknown relation ids fail closed",()=>{
 const d=sample();d.relations[0].participants[1].nodeId="vanished";
 const x=fixture(d);
 assert.throws(()=>inspectNativeSource(x.bytes,x.descriptor),/native_relation_unknown_participant/);
 const good=fixture(); const native=inspectNativeSource(good.bytes,good.descriptor);
 assert.throws(()=>inspectNativeRelation(native,"r-missing"),/unknown_native_relation/);
});
