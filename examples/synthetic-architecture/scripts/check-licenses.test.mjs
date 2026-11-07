import test from "node:test";
import assert from "node:assert/strict";
import {auditLock} from "./check-licenses.mjs";

const manifest={dependencies:{demo:"1.0.0"},devDependencies:{}};
const lock={
 lockfileVersion:3,packages:{
  "":{dependencies:{demo:"1.0.0"},devDependencies:{}},
  "node_modules/demo":{version:"1.0.0",resolved:"https://registry.npmjs.org/demo/-/demo-1.0.0.tgz",
    integrity:"sha512-abc",license:"MIT"}
 }
};
test("approves only known declared license metadata and official integrity-bound packages",()=>{
 const r=auditLock(lock,manifest);
 assert.deepEqual(r.problems,[]);
 assert.equal(r.licenses.MIT,1);
});
test("fails closed for registry substitution, unapproved licenses, and missing integrity",()=>{
 const bad=structuredClone(lock);
 bad.packages["node_modules/demo"].license="GPL-3.0-only";
 bad.packages["node_modules/demo"].resolved="https://mirror.example.org/demo.tgz";
 delete bad.packages["node_modules/demo"].integrity;
 const p=auditLock(bad,manifest).problems;
 assert(p.some(x=>x.startsWith("unreviewed_spdx:")));
 assert(p.some(x=>x.startsWith("unapproved_package_registry:")));
 assert(p.some(x=>x.startsWith("missing_integrity:")));
});
test("manifest/lock drift is a hard failure",()=>{
 const wrong=structuredClone(manifest);
 wrong.dependencies.demo="2.0.0";
 assert(auditLock(lock,wrong).problems.includes("manifest_lock_out_of_sync:dependencies"));
});
test("file-level copyleft cannot silently be treated as unrestricted",()=>{
 const copy=structuredClone(lock);
 copy.packages["node_modules/demo"].license="MPL-2.0";
 const r=auditLock(copy,manifest);
 assert.deepEqual(r.problems,[]);
 assert.deepEqual(r.fileLevelCopyleftReview,["node_modules/demo"]);
 assert(r.nonLegalApproval.includes("release review"));
});
