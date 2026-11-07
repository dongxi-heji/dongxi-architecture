import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,statSync,existsSync,chmodSync} from "node:fs";
import {resolve} from "node:path";
import {createFrozenSyntheticScope,gitBlobDigest,guardAssessedFrozenSource} from "./frozen-source.mjs";
import {PUBLIC_SOURCE_FILES} from "../src/reality-links.mjs";

test("frozen execution tree is built from verified immutable Git blob objects",()=>{
 const snapshot=createFrozenSyntheticScope();
 try{
  assert.equal(snapshot.contract,"dongxi.synthetic-git-blob-snapshot/v0");
  assert.equal(snapshot.sourceCount,5);
  assert.equal(snapshot.verify().status,"verified");
  for(const [id,resource] of Object.entries(PUBLIC_SOURCE_FILES)){
   const bytes=readFileSync(resolve(snapshot.root,resource.path));
   assert.equal(gitBlobDigest(bytes),resource.digest,id);
   assert.equal(snapshot.fingerprints[id],resource.digest);
   assert.equal(statSync(resolve(snapshot.root,resource.path)).mode & 0o222,0);
  }
 }finally{const loc=snapshot.root;snapshot.cleanup();assert.equal(existsSync(loc),false)}
});
test("an in-memory edited source has a different content address from the pinned object",()=>{
 const source=readFileSync(new URL("../src/sample-domain/ledger.mjs",import.meta.url));
 const changed=Buffer.concat([source,Buffer.from("\n// hypothetical local edit\n")]);
 assert.notEqual(gitBlobDigest(source),gitBlobDigest(changed));
 assert.equal(gitBlobDigest(source),PUBLIC_SOURCE_FILES.ledger.digest);
 const snapshot=createFrozenSyntheticScope();
 try{
  assert.equal(gitBlobDigest(readFileSync(resolve(snapshot.root,PUBLIC_SOURCE_FILES.ledger.path))),
    PUBLIC_SOURCE_FILES.ledger.digest);
 }finally{snapshot.cleanup()}
});
test("stage integrity is re-read and a missing or modified snapshot refuses proof",()=>{
 const snapshot=createFrozenSyntheticScope();
 const path=resolve(snapshot.root,PUBLIC_SOURCE_FILES.ledger.path);
 try{
  // Tests mutate only their own isolated public staging directory, never the checkout.
  chmodSync(path,0o644);
  writeFileSync(path,"// tampered staged copy\n");
  const r=snapshot.verify();
  assert.equal(r.status,"changed");
  assert.deepEqual(r.changedIds,["ledger"]);
 }finally{snapshot.cleanup()}
 assert.equal(snapshot.verify().status,"unavailable");
});
test("cleanup is idempotent and does not remove the source worktree",()=>{
 const snapshot=createFrozenSyntheticScope(),name=snapshot.root;
 snapshot.cleanup();snapshot.cleanup();
 assert.equal(existsSync(name),false);
 assert.equal(existsSync(new URL("../src/sample-domain/api.mjs",import.meta.url)),true);
});

test("a corrupted staged tool input cannot be called newly supported",()=>{
 const prior={result:"supported-in-scope",reason:"checks_passed",sourceStanding:"synthetic_code_checked"};
 const result=guardAssessedFrozenSource(prior,[{status:"verified"},{status:"changed"}]);
 assert.equal(result.result,"open");
 assert.equal(result.reason,"frozen_source_input_integrity_unverified");
 assert.equal(result.frozenSource.status,"unverified");
 assert.equal(result.sourceStanding,"synthetic_code_checked");
});
test("verified snapshot preserves an existing source-bound reading",()=>{
 const given={result:"supported-in-scope",reason:"checks_passed"};
 const ok=guardAssessedFrozenSource(given,[{status:"verified"},{status:"verified"},{status:"verified"}]);
 assert.equal(ok.result,"supported-in-scope");
 assert.equal(ok.frozenSource.verifyCount,3);
 const stale=guardAssessedFrozenSource({result:"stale"},[{status:"changed"},{status:"verified"}]);
 assert.equal(stale.result,"stale");
 assert.throws(()=>guardAssessedFrozenSource(given,[{status:"verified"}]),/multiple_checks/);
});
