// Executes a REAL local analyzer against only the self-contained fictional modules.
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
import {expectedAnalysis} from "../src/analysis-readout.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const bin=resolve(root,"node_modules/.bin/depcruise");
const version=execFileSync(bin,["--version"],{cwd:root,encoding:"utf8",timeout:30000}).trim();
if(version!=="18.7.2")throw Error("untrusted_analyzer_version:"+version);
const argv=["--no-config","--include-only","^src/sample-domain","--output-type","json",expectedAnalysis.entry];
const raw=execFileSync(bin,argv,{cwd:root,encoding:"utf8",timeout:60000,maxBuffer:4*1024*1024});
const report=JSON.parse(raw);
const allowed=new Set(expectedAnalysis.modules);
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
 createHash("sha256").update(readFileSync(resolve(root,path))).digest("hex")]));
console.log(JSON.stringify({
  status:"checked",tool:"dependency-cruiser",version,
  contract:"dongxi.synthetic-analyzer-reading/v1",source:"original_synthetic_only",
  modules:actualModules.length,imports:actualEdges.length,
  fileSha256:fileSha,limitations:expectedAnalysis.limitation
},null,2));
