import test from "node:test";
import assert from "node:assert/strict";
import {verifySyntheticBehaviorReport} from "./verify-test-report.mjs";

test("two complete TAP test outcomes can be used as bounded evidence",()=>{
 const report="TAP version 13\n# tests 2\n# pass 2\n# fail 0\n# skipped 0\n# cancelled 0\n# todo 0\n";
 assert.deepEqual(verifySyntheticBehaviorReport(report),{tests:2,passed:2,failed:0,skipped:0});
});
test("accepts explicit newer information-prefix summaries when encountered",()=>{
 const report="ℹ tests 2\nℹ pass 2\nℹ fail 0\nℹ cancelled 0\n";
 assert.equal(verifySyntheticBehaviorReport(report).passed,2);
});
test("nonempty output or process success alone is not a verified test result",()=>{
 for(const output of ["ok 1 - some test","TAP version 13\n","",
   "# tests 2\n# pass 1\n# fail 0\n","# tests 2\n# pass 2\n# fail 1\n",
   "# tests 2\n# pass 2\n# fail 0\n# skipped 1\n",
   "# tests 2\n# tests 2\n# pass 2\n# fail 0\n"]){
  assert.throws(()=>verifySyntheticBehaviorReport(output));
 }
});
