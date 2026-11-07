#!/usr/bin/env node
// Reads Worang's native mother-graph IR from a specified local Git checkout.
// No project mutation, no fetch/network, no implicit mapping into #1403 case.
import {readNativeSourceFromCheckout,inspectNativeRelation} from "../../src/adapters/worang-native-source.mjs";
import {readPinnedDesignMother} from "../../src/adapters/worang-design-source.mjs";
const args=process.argv.slice(2);
function flag(name){const i=args.indexOf(name);return i>=0?args[i+1]:undefined}
if(args.length===0 || args.includes("--help")){
  console.error("Usage: node examples/worang-1403/inspect-native-ir.mjs --repo-root /local/path/to/worang [--relation r-verify]");
  process.exitCode=args.length?0:2;
}else{
  try{
    const root=flag("--repo-root");
    const designMother=readPinnedDesignMother(root);
    const native=readNativeSourceFromCheckout(root);
    const selected=inspectNativeRelation(native,flag("--relation")||"r-verify");
    process.stdout.write(JSON.stringify({
      contract:"dongxi-architecture.native-ir-inspection/v0",
      designMother,counts:native.counts,selection:selected,
      boundary:"从 Worang 固定 Git blob 只读取得的原生语义母图候选；不等于 #1403 的 Claim / Work 专属模型，也不会改写 Worang 的 authority 或源文件。"
    },null,2)+"\n");
  }catch(e){console.error("native-ir-inspection-failed:",e.message);process.exitCode=1}
}
