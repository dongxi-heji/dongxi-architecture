import test from "node:test";
import assert from "node:assert/strict";
import {caseData} from "../../examples/worang-1403/case.mjs";
import {normalizeCruiserResult,compareSourceScope,makeReplayReadout} from "./reanalysis-gate.mjs";
const sha="a".repeat(40);
const other="b".repeat(40);
const json={modules:[
 {source:"scripts/lib/durable-hive-runtime.mjs",dependencies:[{resolved:"scripts/lib/persistence.mjs"}]},
 {source:"scripts/lib/persistence.mjs",dependencies:[]}
]};
const paths=["scripts/lib/durable-hive-runtime.mjs","scripts/lib/persistence.mjs"];
const blobs=Object.fromEntries(paths.map(p=>[p,{baseline:sha,worktree:sha}]));
function replay(opts={}){
 return makeReplayReadout({caseData,cruiserJson:json,blobs,toolVersion:"18.7.2",
 observedCommit:other,toolCommand:"test fixture",...opts});
}
test("normalized analyzer graph only retains bounded local resolved files",()=>{
 const g=normalizeCruiserResult(json);
 assert.equal(g.modules,2);assert.equal(g.dependencies,1);
 assert.deepEqual(g.paths,paths);
 assert.equal(g.edges[0][1],"scripts/lib/persistence.mjs");
});
test("exact worktree blob equality allows a scoped observation, even when HEAD differs",()=>{
 const r=replay();
 assert.equal(r.source.scopeEquivalence,"verified_equal");
 assert.equal(r.interpretation.status,"scoped-observation");
 assert.equal(r.source.observedCommit,other);
 assert.notEqual(r.source.observedCommit,r.source.caseCommit);
 assert(r.interpretation.notEstablished.includes("并发唯一性"));
});
test("modified imported module invalidates old case support",()=>{
 const changed=structuredClone(blobs);changed[paths[1]].worktree=other;
 const r=replay({blobs:changed});
 assert.equal(r.source.scopeEquivalence,"changed");
 assert.deepEqual(r.source.changedPaths,[paths[1]]);
 assert.equal(r.interpretation.status,"open-for-current-case");
});
test("missing or untracked imported module yields unknown, not success",()=>{
 const missing=structuredClone(blobs);missing[paths[1]].baseline=null;
 const r=replay({blobs:missing});
 assert.equal(r.source.scopeEquivalence,"unknown");
 assert.deepEqual(r.source.missingPaths,[paths[1]]);
});
test("rejects changed tool versions and unbounded paths / incomplete graph",()=>{
 assert.throws(()=>replay({toolVersion:"18.8.0"}),/analyzer_version_mismatch/);
 const bad={modules:[{source:ANALYZER_ENTRY,dependencies:[{resolved:"scripts/../../secret.txt"}]},
 {source:"scripts/lib/persistence.mjs",dependencies:[]}]};
 // Path traversal must fail *before* using results to claim an observation.
 assert.throws(()=>normalizeCruiserResult(bad),/analyzer_edge_outside_scope/);
 assert.throws(()=>normalizeCruiserResult({modules:[{source:"scripts/lib/durable-hive-runtime.mjs",
 dependencies:[{resolved:"scripts/lib/missing.mjs"}]}]}),/incomplete_local_dependency_scope/);
});
const ANALYZER_ENTRY="scripts/lib/durable-hive-runtime.mjs";
