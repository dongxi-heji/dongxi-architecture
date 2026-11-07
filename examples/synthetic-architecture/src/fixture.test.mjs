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

test("every relation has five different contextual readings, establishment and effect",()=>{
 const lenses=["causation","meaning","association","constitution","implication"];
 assert.deepEqual(Object.keys(fixture.lensQuestions),lenses);
 for(const r of fixture.relations){
  const values=lenses.map(l=>fixture.relationReadings[r.id][l]);
  assert(values.every(v=>v.length>25));
  assert.equal(new Set(values).size,5);
  assert(fixture.relationContracts[r.id].establishment.length>25);
  assert(fixture.relationContracts[r.id].effect.length>20);
 }
});
test("an absent lens or upgraded standing is not silently admitted",()=>{
 const bad=structuredClone(fixture);
 delete bad.relationReadings.demo_reserve.implication;
 assert(validateFixture(bad).includes("missing_lens_reading:demo_reserve:implication"));
 const promoted=structuredClone(fixture);
 promoted.relationContracts.demo_reserve.standing="production_verified";
 assert(validateFixture(promoted).includes("missing_or_invalid_relation_contract:demo_reserve"));
});
test("reading a relation does not modify its source claim or authority",async()=>{
 const {readRelationLens,readRelationContract}=await import("./fixture.mjs");
 const old=JSON.stringify(fixture.relationContracts.demo_reserve);
 for(const lens of Object.keys(fixture.lensQuestions))
  assert(readRelationLens("demo_reserve",lens));
 assert.equal(JSON.stringify(readRelationContract("demo_reserve")),old);
 assert.equal(readRelationLens("reader","meaning"),null);
 assert.throws(()=>readRelationLens("demo_reserve","architecture"),/unrecognized_lens/);
});
