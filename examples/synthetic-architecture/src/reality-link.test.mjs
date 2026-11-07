import test from "node:test";
import assert from "node:assert/strict";
import {validateRealityLink,assessRealityLink} from "./reality-link.mjs";
const sha1="git-blob-sha1:"+"a".repeat(40),sha2="git-blob-sha1:"+"b".repeat(40);
const link={
 contract:"dongxi.reality-link/v0",id:"sample_loan",subject:{id:"demo_reserve",type:"relation",standing:"synthetic_code_checked"},
 source:{id:"fictional_demo",revision:"library_demo_v1",kind:"synthetic"},
 scope:[{id:"api",digest:sha1},{id:"ledger",digest:sha2}],
 criteria:[{id:"static",method:"dependency-cruiser@18.7.2",criterion:"Expected local imports",resourceIds:["api","ledger"],decisive:false},
 {id:"behavior",method:"node:test",criterion:"Simulation returns specified output",resourceIds:["api","ledger"],decisive:true}]
};
const observed=()=>({sourceId:"fictional_demo",revision:"library_demo_v1",
 fingerprints:{api:sha1,ledger:sha2},
 checks:[
 {id:"static",method:"dependency-cruiser@18.7.2",status:"passed",resourceIds:["api","ledger"],command:"depcruise...",evidenceRef:"static-git-blob-verified"},
 {id:"behavior",method:"node:test",status:"passed",resourceIds:["api","ledger"],command:"node --test ...",evidenceRef:"fixture-test-verified"}
]});

test("unchanged source plus both checked criteria supports only in scope",()=>{
 assert.deepEqual(validateRealityLink(link),[]);
 const result=assessRealityLink(link,observed());
 assert.equal(result.result,"supported-in-scope");
 assert.equal(result.scopeEquivalence,"equal-content-in-scope");
 assert.equal(result.sourceStanding,"synthetic_code_checked");
 assert.equal(result.authorityUnchanged,true);
});
test("new revision with byte-identical checked files remains only scoped support",()=>{
 const o=observed();o.revision="library_demo_v2";
 const result=assessRealityLink(link,o);
 assert.equal(result.result,"supported-in-scope");
 assert.equal(result.sameRevision,false);
 assert(result.reason.includes("different_revision"));
});
test("changed file invalidates old evidence despite passing prior checks",()=>{
 const o=observed();o.fingerprints.ledger="git-blob-sha1:"+"c".repeat(40);
 const result=assessRealityLink(link,o);
 assert.equal(result.result,"stale");
 assert.deepEqual(result.changedScope,["ledger"]);
});
test("missing file evidence remains Open, not stale or contradiction",()=>{
 const o=observed();delete o.fingerprints.api;
 const result=assessRealityLink(link,o);
 assert.equal(result.result,"open");
 assert.deepEqual(result.unknownScope,["api"]);
});
test("wrong source identity is unbound",()=>{
 const o=observed();o.sourceId="a_different_repo";
 assert.equal(assessRealityLink(link,o).result,"unbound");
});
test("required check not run is Open; decisive failure can contradict only in scope",()=>{
 const o=observed();o.checks=o.checks.filter(x=>x.id!=="behavior");
 assert.equal(assessRealityLink(link,o).result,"open");
 o.checks.push({...observed().checks[1],status:"failed"});
 assert.equal(assessRealityLink(link,o).result,"contradicted-in-scope");
});
test("a failing nondecisive static check is not a refuted design",()=>{
 const o=observed();o.checks[0].status="failed";
 assert.equal(assessRealityLink(link,o).result,"open");
});
test("merely illustrative source can never become supported via tool pass",()=>{
 const sample=structuredClone(link);sample.subject.standing="illustrative_only";
 assert.equal(assessRealityLink(sample,observed()).result,"illustrative-only");
});
test("wrong method, criteria outside verified scope, or duplicate ID fails closed",()=>{
 const o=observed();o.checks[0].method="shell echo PASS";
 assert.equal(assessRealityLink(link,o).result,"open");
 const bad=structuredClone(link);bad.criteria[0].resourceIds=["other_source"];
 assert(validateRealityLink(bad).includes("criterion_outside_scope:static"));
 const bad2=structuredClone(link);bad2.scope[1].id="api";
 assert(validateRealityLink(bad2).some(e=>e.startsWith("duplicate_or_invalid_scope_id")));
});

test("success or contradiction without an attributable evidence reference stays Open",()=>{
 const o=observed();delete o.checks[0].evidenceRef;
 assert.equal(assessRealityLink(link,o).result,"open");
 const f=observed();f.checks[1].status="failed";f.checks[1].evidenceRef="";
 assert.equal(assessRealityLink(link,f).result,"open");
});


test("source-owned local standing is preserved verbatim, not reclassified as synthetic",()=>{
 const local=structuredClone(link);
 local.subject.standing="source_implemented";
 local.source.kind="local_private";
 const result=assessRealityLink(local,observed());
 assert.equal(result.result,"supported-in-scope");
 assert.equal(result.sourceStanding,"source_implemented");
 assert.equal(result.authorityUnchanged,true);
});
test("opaque source standing remains syntactically bounded without accepting empty or unsafe tokens",()=>{
 const local=structuredClone(link);
 local.subject.standing="";
 assert(validateRealityLink(local).includes("invalid_source_owned_standing"));
 local.subject.standing="private authority promoted!";
 assert(validateRealityLink(local).includes("invalid_source_owned_standing"));
});


test("an observed changed file invalidates previous evidence even when another scope entry is missing",()=>{
 const o=observed();
 o.fingerprints.ledger="git-blob-sha1:"+"c".repeat(40);
 delete o.fingerprints.api;
 const result=assessRealityLink(link,o);
 assert.equal(result.result,"stale");
 assert.deepEqual(result.changedScope,["ledger"]);
 assert.deepEqual(result.unknownScope,["api"]);
});
test("missing or invalid observed source revision cannot inherit bounded support",()=>{
 const o=observed();
 delete o.revision;
 assert.equal(assessRealityLink(link,o).result,"unbound");
 assert.equal(assessRealityLink(link,o).reason,"observation_revision_missing_or_invalid");
 o.revision="wrong revision token with spaces";
 assert.equal(assessRealityLink(link,o).result,"unbound");
});
