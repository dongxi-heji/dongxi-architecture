// Explicit, version-tolerant parsing of the Node TAP summary, not just a
// zero process exit. The public fictional behavior suite requires 2 actual
// tests, both passed, no skipped/cancelled/todo or unknown summary.
const SUMMARY=/^(?:#|ℹ)\s+(tests|pass|fail|skipped|cancelled|todo)\s+(\d+)\s*$/gm;

export function verifySyntheticBehaviorReport(raw){
 if(typeof raw!=="string"||!raw.trim())throw Error("missing_behavior_report");
 const pairs=[...raw.matchAll(SUMMARY)];
 const numbers={};
 for(const [,key,amount] of pairs){
  if(Object.hasOwn(numbers,key))throw Error("duplicate_test_summary:"+key);
  numbers[key]=Number(amount);
 }
 if(numbers.tests!==2||numbers.pass!==2||numbers.fail!==0||
    (numbers.skipped??0)!==0||(numbers.cancelled??0)!==0||
    (numbers.todo??0)!==0)throw Error("incomplete_or_untrusted_behavior_result");
 return Object.freeze({tests:2,passed:2,failed:0,skipped:0});
}
