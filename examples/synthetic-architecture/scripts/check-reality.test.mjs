import test from "node:test";
import assert from "node:assert/strict";
import {PUBLIC_SOURCE_FILES,publicRealityLinks} from "../src/reality-links.mjs";
import {assessRealityLink} from "../src/reality-link.mjs";
import {currentScopeFingerprints,replayPublicReality} from "./check-reality.mjs";

test("the checked-in fictional files match the exact source fingerprint contract",()=>{
 const current=currentScopeFingerprints();
 for(const [id,resource] of Object.entries(PUBLIC_SOURCE_FILES))
  assert.equal(current[id],resource.digest,id);
});
test("a real analyzer + behavior subprocess creates only limited supported readings",()=>{
 const report=replayPublicReality();
 assert.equal(report.contract,"dongxi.reality-replay/v0");
 assert.equal(report.sourceKind,"original_synthetic");
 assert.equal(report.toolRuns.length,2);
 assert(report.toolRuns.every(x=>x.status==="passed"&&x.evidenceRef));
 assert.equal(report.assessments.demo_lookup.result,"supported-in-scope");
 assert.equal(report.assessments.demo_reserve.result,"supported-in-scope");
 assert(report.assessments.demo_reserve.authorityUnchanged);
});
test("replayed evidence is invalidated by changed and missing content without modifying files",()=>{
 const report=replayPublicReality();
 const link=publicRealityLinks.demo_reserve;
 const o={sourceId:link.source.id,revision:link.source.revision,
  fingerprints:{...report.fingerprints},
  checks:link.criteria.map(c=>{
   const run=report.toolRuns.find(x=>x.method===c.method);
   return {id:c.id,method:c.method,resourceIds:c.resourceIds,command:run.command,
    status:run.status,evidenceRef:run.evidenceRef};
  })};
 o.fingerprints.ledger="git-blob-sha1:"+"f".repeat(40);
 const changed=assessRealityLink(link,o);
 assert.equal(changed.result,"stale");
 assert.deepEqual(changed.changedScope,["ledger"]);
 delete o.fingerprints.ledger;
 const missing=assessRealityLink(link,o);
 assert.equal(missing.result,"open");
 assert.deepEqual(missing.unknownScope,["ledger"]);
});
test("private identifiers are not present in the published synthetic replay",()=>{
 const report=JSON.stringify(replayPublicReality());
 assert(!/\/Users\/[^/]+\/|private-key|github_pat_|ghp_|dongxi-heji\/worang/i.test(report));
});
