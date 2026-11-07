import test from "node:test";
import assert from "node:assert/strict";
import {caseData} from "./case.mjs";
import {analyzerReadout,auditReadoutAgainstCase,toolReadingFor} from "./analysis-readout.mjs";

test("a recorded analyzer result belongs to the pinned source snapshot only",()=>{
 assert.deepEqual(auditReadoutAgainstCase(analyzerReadout,caseData),[]);
 const wrong=structuredClone(caseData);wrong.snapshot.commit="0".repeat(40);
 assert(auditReadoutAgainstCase(analyzerReadout,wrong).includes("snapshot_mismatch"));
});
test("the actual local static graph has 8 modules, 7 edges and 4 direct imports",()=>{
 assert.equal(analyzerReadout.coverage.totalModules,8);
 assert.equal(analyzerReadout.coverage.totalEdges,7);
 const x=toolReadingFor("hive",caseData);
 assert.equal(x.status,"scoped-observation");
 assert.equal(x.directImports.length,4);
});
test("static graph cannot upgrade Claim invariant or production result",()=>{
 const x=toolReadingFor("r-ownership",caseData);
 assert(x.boundary.includes("并发唯一性"));
 assert(!x.text.includes("已证明 Claim"));
 assert.equal(toolReadingFor("r-refill",caseData),null);
});
test("report becomes Open if file equivalence is not known",()=>{
 const report=structuredClone(analyzerReadout);
 report.source.scopeEquivalence="unknown";
 const x=toolReadingFor("hive",caseData,report);
 assert.equal(x.status,"open");
});
