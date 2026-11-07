import test from "node:test";
import assert from "node:assert/strict";
import {listPublicSources} from "./source-reading.mjs";
test("two evidence-backed synthetic relations have fixed public source locations",()=>{
 const reserve=listPublicSources("demo_reserve");
 assert.equal(reserve.length,5);
 assert(reserve.some(x=>x.id==="ledger"&&x.path==="src/sample-domain/ledger.mjs"));
 assert(reserve.every(x=>x.path.startsWith("src/sample-domain/")&&x.kind==="synthetic_public_snapshot"));
 assert.equal(listPublicSources("demo_lookup").length,3);
});
test("unbound/private-looking references can never pick a source path",()=>{
 for(const key of ["not-a-relation","../private","/Users/secret","","demo_request"])
  assert.deepEqual(listPublicSources(key),[]);
});
test("the locator preserves source identity instead of changing evidence standing",()=>{
 const first=listPublicSources("demo_reserve");
 const second=listPublicSources("demo_reserve");
 assert.deepEqual(first,second);
 assert(Object.isFrozen(first[0]));
 assert(first[0].digest.startsWith("git-blob-sha1:"));
});
