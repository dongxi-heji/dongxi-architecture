#!/usr/bin/env node
// Read-only local rerun. Requires an explicitly installed dependency-cruiser 18.7.2 executable.
// It does not send local source to a web service or modify Worang files.
// Do NOT expose this command as arbitrary execution in a browser.
import {caseData} from "./case.mjs";
import {replayOnCheckout} from "../../src/adapters/reanalysis-gate.mjs";
const args=process.argv.slice(2);
const flag=name=>{const i=args.indexOf(name);return i>=0?args[i+1]:undefined};
if(args.includes("--help")||!args.length){
  console.error("Usage: node examples/worang-1403/reanalyze.mjs --repo-root /local/worang --analyzer-bin /absolute/path/to/depcruise");
  process.exitCode=args.length?0:2;
}else try{
 const out=replayOnCheckout({caseData,repoRoot:flag("--repo-root"),analyzerBin:flag("--analyzer-bin")});
 process.stdout.write(JSON.stringify(out,null,2)+"\n");
}catch(e){console.error("read-only-reanalysis-failed:",e.message);process.exitCode=1}
