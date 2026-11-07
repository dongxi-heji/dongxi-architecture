import test from "node:test";
import assert from "node:assert/strict";
import {inspectSourceWindow,guardAssessmentForWindow} from "./source-window.mjs";
import {publicRealityLinks} from "../src/reality-links.mjs";
import {assessRealityLink} from "../src/reality-link.mjs";

const link=publicRealityLinks.demo_lookup;
const snap=Object.fromEntries(link.scope.map(x=>[x.id,x.digest]));
const ready={result:"supported-in-scope",reason:"checks_passed",scopeEquivalence:"equal-content-in-scope",authorityUnchanged:true};
const altered="git-blob-sha1:"+"e".repeat(40);

test("unchanged observations across three tool boundaries preserve scoped support",()=>{
 const out=guardAssessmentForWindow(link,ready,[snap,{...snap},{...snap}]);
 assert.equal(out.result,"supported-in-scope");
 assert.equal(out.sourceWindow.status,"equal-at-observation-points");
 assert.equal(out.sourceWindow.phases,3);
 assert.equal(out.authorityUnchanged,true);
});
test("an actual known fingerprint difference during a check prevents fresh support",()=>{
 const middle={...snap,catalog:altered};
 const out=guardAssessmentForWindow(link,ready,[snap,middle,snap]);
 assert.equal(out.result,"open");
 assert.equal(out.reason,"source_changed_or_unobserved_during_check");
 assert.equal(out.sourceWindow.status,"changed-during-check");
 assert.deepEqual(out.sourceWindow.unstableIds,["catalog"]);
 assert(out.sourceWindow.limitation.includes("not an atomic"));
});
test("a missing observation at any boundary cannot silently turn into support",()=>{
 const middle={...snap};delete middle.catalog;
 const out=guardAssessmentForWindow(link,ready,[snap,middle,snap]);
 assert.equal(out.result,"open");
 assert.deepEqual(out.sourceWindow.unknownIds,["catalog"]);
 assert.equal(out.sourceWindow.status,"incomplete");
});
test("known drift remains visible even with a missing observation",()=>{
 const middle={...snap,catalog:altered};
 const last={...snap};delete last.api;
 const out=guardAssessmentForWindow(link,ready,[snap,middle,last]);
 assert.equal(out.result,"open");
 assert.deepEqual(out.sourceWindow.unstableIds,["catalog"]);
 assert.deepEqual(out.sourceWindow.unknownIds,["api"]);
});
test("a drift outside this particular relation's declared scope is irrelevant to it",()=>{
 const unrelated={...snap,unrelated:altered};
 const out=guardAssessmentForWindow(link,ready,[{...snap,unrelated:"git-blob-sha1:"+"f".repeat(40)},unrelated,{...snap}]);
 assert.equal(out.result,"supported-in-scope");
});
test("already stale source remains stale even if tool timing is also uncertain",()=>{
 const previous={...ready,result:"stale",reason:"source_content_changed"};
 const out=guardAssessmentForWindow(link,previous,[snap,{...snap,catalog:altered},snap]);
 assert.equal(out.result,"stale");
 assert.equal(out.reason,"source_content_changed");
});
test("unknown or single source fingerprint phase cannot be treated as coherent",()=>{
 assert.throws(()=>inspectSourceWindow(link,[snap]),/multiple_phases/);
 const out=guardAssessmentForWindow(link,ready,[snap,undefined,snap]);
 assert.equal(out.result,"open");
});
