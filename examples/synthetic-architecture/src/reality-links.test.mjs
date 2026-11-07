import test from "node:test";
import assert from "node:assert/strict";
import {fixture} from "./fixture.mjs";
import {PUBLIC_SOURCE_FILES,publicRealityLinks} from "./reality-links.mjs";
import {validateRealityLink,assessRealityLink} from "./reality-link.mjs";

test("explicit reality links bind only the fictional locally-checked relations",()=>{
 assert.deepEqual(Object.keys(publicRealityLinks).sort(),["demo_lookup","demo_reserve"]);
 assert.equal(Object.keys(PUBLIC_SOURCE_FILES).length,5);
 for(const [id,link] of Object.entries(publicRealityLinks)){
  assert.equal(link.subject.id,id);
  assert.deepEqual(validateRealityLink(link),[]);
  assert.equal(fixture.relationContracts[id].standing,link.subject.standing);
  assert.equal(link.source.kind,"synthetic");
 }
});
test("a legitimate static check on an illustrative diagram does not upgrade standing",()=>{
 const link=structuredClone(publicRealityLinks.demo_reserve);
 link.subject.standing="illustrative_only";
 const observation={
  sourceId:link.source.id,revision:link.source.revision,
  fingerprints:Object.fromEntries(link.scope.map(x=>[x.id,x.digest])),
  checks:link.criteria.map(x=>({id:x.id,method:x.method,status:"passed",resourceIds:x.resourceIds,
   command:"verified command",evidenceRef:"test"}))
 };
 assert.equal(assessRealityLink(link,observation).result,"illustrative-only");
});
