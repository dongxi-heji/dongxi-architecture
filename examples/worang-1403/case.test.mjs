import test from "node:test";
import assert from "node:assert/strict";
import {caseData,validateCase,findItem,lensReading} from "./case.mjs";

test("case validates and keeps a pinned source snapshot",()=>{
 assert.deepEqual(validateCase(caseData),[]);
 assert.match(caseData.snapshot.commit,/^[0-9a-f]{40}$/);
});
test("all displayed relations carry source and explicit standing",()=>{
 for(const relation of caseData.relations){
  assert(relation.refs.length>0);
  assert(["planned","source-implemented","tested-locally","unknown"].includes(relation.standing));
 }
 assert.equal(findItem("r-refill").standing,"planned");
 assert.equal(findItem("r-claim").standing,"source-implemented");
});
test("views refer to the same selected object instead of cloning semantic identity",()=>{
 for(const view of Object.values(caseData.views)){
  assert(view.relationIds.includes("r-ownership"));
  assert(view.nodeIds.includes("work"));
 }
 assert.strictEqual(findItem("r-ownership"),caseData.relations.find(r=>r.id==="r-ownership"));
});
test("five lenses read the same relation without changing its standing",()=>{
 const relation=findItem("r-ownership");
 const standing=relation.standing;
 for(const key of Object.keys(caseData.lensQuestions))assert(lensReading(relation.id,key).length>15);
 assert.equal(relation.standing,standing);
});
test("no production completion is inferred from source and local tests",()=>{
 assert.equal(caseData.assessments.find(x=>x.target==="r-refill").status,"open");
 assert(caseData.assessments.every(x=>x.boundary.length>0));
});
test("negative fixture catches ungrounded or dangling relation",()=>{
 const bad=structuredClone(caseData);
 bad.relations[0].refs=[];
 bad.relations[1].to="missing";
 assert(validateCase(bad).includes("relation_missing_source:r-candidates"));
 assert(validateCase(bad).includes("dangling_relation:r-dispatch"));
});
