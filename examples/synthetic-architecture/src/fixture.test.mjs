import test from "node:test";
import assert from "node:assert/strict";
import {fixture,validateFixture} from "./fixture.mjs";
test("all synthetic relationships have unique stable endpoints and source references",()=>{
 assert.deepEqual(validateFixture(fixture),[]);
 assert.equal(fixture.source.kind,"original_synthetic");
 assert(fixture.nodes.every(n=>n.sources.every(s=>s.kind==="synthetic")));
 assert(fixture.relations.every(r=>r.sources.every(s=>s.kind==="synthetic")));
});
test("private-origin references and external source paths fail the disclosure boundary",()=>{
 const copy=structuredClone(fixture);
 copy.nodes[0].sources[0].path="../real-repo/secret.md";
 assert(validateFixture(copy).includes("non_public_source_ref:reader"));
 const copy2=structuredClone(fixture);copy2.source.kind="external_private";
 assert(validateFixture(copy2).includes("unapproved_fixture_origin"));
});
test("duplicate relation triples cannot masquerade as a unique visual edge",()=>{
 const copy=structuredClone(fixture);
 copy.relations.push({...copy.relations[0],id:"second_same_request"});
 assert(validateFixture(copy).includes("ambiguous_visual_relation:second_same_request"));
});
