// A REAL local dependency-cruiser run over only the invented sample modules.
// The sourceRoot parameter is for an internally staged, pinned Git-blob
// snapshot; the executable always comes from this example's pinned node_modules.
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {expectedAnalysis} from "../src/analysis-readout.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");

export function analyzeSyntheticSource(sourceRoot=root) {
 const bin=resolve(root,"node_modules/.bin/depcruise");
 const version=execFileSync(bin,["--version"],{cwd:root,encoding:"utf8",timeout:30000}).trim();
 if(version!=="18.7.2")throw Error("untrusted_analyzer_version:"+version);
 const argv=["--no-config","--include-only","^src/sample-domain","--output-type","json",expectedAnalysis.entry];
 const raw=execFileSync(bin,argv,{
  cwd:sourceRoot,encoding:"utf8",timeout:60000,maxBuffer:4*1024*1024
 });
 const report=JSON.parse(raw);
 const actualModules=(report.modules||[]).map(m=>m.source).sort();
 const actualEdges=(report.modules||[]).flatMap(m=>(m.dependencies||[])
   .filter(d=>typeof d.resolved==="string"&&d.resolved.startsWith("src/sample-domain/"))
   .map(d=>[m.source,d.resolved]));
 const sorted=items=>items.map(x=>Array.isArray(x)?x.join(" -> "):x).sort();
 if(JSON.stringify(sorted(actualModules))!==JSON.stringify(sorted(expectedAnalysis.modules)))
  throw Error("synthetic_analyzer_module_drift:"+JSON.stringify(actualModules));
 if(JSON.stringify(sorted(actualEdges))!==JSON.stringify(sorted(expectedAnalysis.edges)))
  throw Error("synthetic_analyzer_relation_drift:"+JSON.stringify(actualEdges));
 const fileSha=Object.fromEntries(actualModules.map(path=>[path,
   createHash("sha256").update(readFileSync(resolve(sourceRoot,path))).digest("hex")]));
 return {
  status:"checked",tool:"dependency-cruiser",version,
  contract:"dongxi.synthetic-analyzer-reading/v1",source:"original_synthetic_only",
  modules:actualModules.length,imports:actualEdges.length,
  fileSha256:fileSha,limitations:expectedAnalysis.limitation
 };
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
 console.log(JSON.stringify(analyzeSyntheticSource(),null,2));
}
