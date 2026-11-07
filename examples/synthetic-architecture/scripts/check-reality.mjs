// Executes both professional/static and behavior checks against local ORIGINAL
// SYNTHETIC files, then observes the actual bytes at a bounded source snapshot.
// The same contract may be consumed by a local private adapter, but this runner
// does NOT accept arbitrary repository paths, filenames, commands or uploads.
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
import {publicRealityLinks,PUBLIC_SOURCE_FILES} from "../src/reality-links.mjs";
import {assessRealityLink} from "../src/reality-link.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const evidenceOut=join(root,"public","reality-readout.json");

function gitBlobDigest(bytes){
 return "git-blob-sha1:"+createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
}
export function currentScopeFingerprints() {
 const records={};
 for(const [id,resource] of Object.entries(PUBLIC_SOURCE_FILES)) {
  try {records[id]=gitBlobDigest(readFileSync(join(root,resource.path)))}
  catch (error){if(error?.code!=="ENOENT")throw error;records[id]=null}
 }
 return records;
}
function execute(method,command,args,parseEvidence){
 let raw="",status="unknown",evidenceRef=null;
 try {
  raw=execFileSync(command,args,{cwd:root,encoding:"utf8",timeout:90000,maxBuffer:3*1024*1024});
  const result=parseEvidence(raw);
  status="passed";
  evidenceRef=result;
 }catch(error) {
  status="failed";
  evidenceRef="tool_execution_failed:"+method;
 }
 return {status,evidenceRef};
}
export function replayPublicReality() {
 const observed=currentScopeFingerprints();
 const staticResult=execute("dependency-cruiser@18.7.2",process.execPath,
   ["scripts/check-analysis.mjs"],raw=>{
    const result=JSON.parse(raw);
    if(result.status!=="checked"||result.version!=="18.7.2"||result.modules!==4||result.imports!==3)
      throw Error("static_readout_mismatch");
    const normalized=JSON.stringify({
      modules:result.modules,imports:result.imports,fileSha256:result.fileSha256,
      version:result.version
    });
    return "sha256:"+createHash("sha256").update(normalized).digest("hex");
   });
 const behaviorResult=execute("node:test",process.execPath,
   ["--test","src/sample-domain/behavior.test.mjs"],raw=>{
    const count=/# tests\s+(\d+)/.exec(raw)?.[1];
    const passed=/# pass\s+(\d+)/.exec(raw)?.[1];
    const failed=/# fail\s+(\d+)/.exec(raw)?.[1];
    if(count!=="2"||passed!=="2"||failed!=="0")throw Error("incomplete_behavior_check");
    return "git-blob-sha1:"+observed.behavior_test?.split(":")[1];
   });
 const metadata={
  contract:"dongxi.reality-replay/v0",
  sourceKind:"original_synthetic",
  sourceRevision:"library_demo_v1",
  mode:"locally_executed_at_build_or_dev_start_not_continuous_runtime",
  fingerprints:observed,
  toolRuns:[
   {method:"dependency-cruiser@18.7.2",command:"node scripts/check-analysis.mjs",
    status:staticResult.status,evidenceRef:staticResult.evidenceRef},
   {method:"node:test",command:"node --test src/sample-domain/behavior.test.mjs",
    status:behaviorResult.status,evidenceRef:behaviorResult.evidenceRef}
  ],
  assessments:{}
 };
 for(const [id,link] of Object.entries(publicRealityLinks)){
  const checks=link.criteria.map(criterion=>{
   const tool=criterion.id==="imports"?metadata.toolRuns[0]:metadata.toolRuns[1];
   return {id:criterion.id,method:criterion.method,command:tool.command,
     status:tool.status,resourceIds:[...criterion.resourceIds],evidenceRef:tool.evidenceRef};
  });
  metadata.assessments[id]=assessRealityLink(link,{
   sourceId:link.source.id,revision:link.source.revision,fingerprints:observed,checks
  });
 }
 return metadata;
}
function healthy(report){
 return report.sourceKind==="original_synthetic"&&
   Object.values(report.assessments).length===2 &&
   Object.values(report.assessments).every(x=>x.result==="supported-in-scope");
}
const own=resolve(fileURLToPath(import.meta.url));
if(process.argv[1]&&resolve(process.argv[1])===own){
 const mode=process.argv[2]??"--check";
 if(!["--check","--write","--show"].includes(mode)){
  console.error("Usage: node scripts/check-reality.mjs --check|--write|--show");process.exitCode=2;
 }else{
  const report=replayPublicReality();
  if(mode==="--show")console.log(JSON.stringify(report,null,2));
  else if(!healthy(report)){
   console.error(JSON.stringify({status:"NOT_VALIDATED_FOR_BOUND_SOURCE",assessments:report.assessments},null,2));
   process.exitCode=1;
  }else if(mode==="--check"){
   console.log(JSON.stringify({status:"PASS",assessments:Object.fromEntries(
    Object.entries(report.assessments).map(([id,x])=>[id,x.result]))},null,2));
  }else{
   mkdirSync(dirname(evidenceOut),{recursive:true});
   writeFileSync(evidenceOut,JSON.stringify(report,null,2)+"\n",{encoding:"utf8"});
   console.log("Generated read-only synthetic source evidence for the current build.");
  }
 }
}
