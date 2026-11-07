// Replay two real professional checks against a *Git-blob-backed staged copy*
// of five wholly synthetic files. Compare the current worktree to the bound
// source separately, and never treat stale/unknown files as fresh support.
// No arbitrary path from the browser; no private checkout, network upload,
// source modification, production approval or hidden authority promotion.
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join,resolve} from "node:path";
import {publicRealityLinks,PUBLIC_SOURCE_FILES} from "../src/reality-links.mjs";
import {assessRealityLink} from "../src/reality-link.mjs";
import {guardAssessmentForWindow} from "./source-window.mjs";
import {analyzeSyntheticSource} from "./check-analysis.mjs";
import {createFrozenSyntheticScope,gitBlobDigest,guardAssessedFrozenSource} from "./frozen-source.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const evidenceOut=join(root,"public","reality-readout.json");

export function currentScopeFingerprints() {
 const records={};
 for(const [id,resource] of Object.entries(PUBLIC_SOURCE_FILES)) {
  try {records[id]=gitBlobDigest(readFileSync(join(root,resource.path)))}
  catch (error){if(error?.code!=="ENOENT")throw error;records[id]=null}
 }
 return records;
}
function runFrozenAnalyzer(snapshotRoot){
 try{
  const report=analyzeSyntheticSource(snapshotRoot);
  if(report.status!=="checked"||report.version!=="18.7.2"||
     report.modules!==4||report.imports!==3)throw Error("static_readout_mismatch");
  const normalized=JSON.stringify({
   modules:report.modules,imports:report.imports,
   fileSha256:report.fileSha256,version:report.version
  });
  return {status:"passed",evidenceRef:"sha256:"+createHash("sha256")
    .update(normalized).digest("hex")};
 }catch{
  return {status:"failed",evidenceRef:"tool_execution_failed:dependency-cruiser@18.7.2"};
 }
}
function runFrozenBehavior(snapshotRoot){
 try{
  const env={...process.env};
  delete env.NODE_TEST_CONTEXT;
  const output=execFileSync(process.execPath,[
    "--test","--test-reporter=tap",
    resolve(snapshotRoot,"src/sample-domain/behavior.test.mjs")
   ],{cwd:snapshotRoot,encoding:"utf8",timeout:90000,
      maxBuffer:3*1024*1024,env});
  if(!output.trim())throw Error("missing_behavior_tool_report");
  return {status:"passed",evidenceRef:
    "sha256:"+createHash("sha256").update(output).digest("hex")};
 }catch{
  return {status:"failed",evidenceRef:"tool_execution_failed:node:test"};
 }
}
export function replayPublicReality() {
 const observed=currentScopeFingerprints();
 const snapshot=createFrozenSyntheticScope();
 try{
  const initialSnapshotCheck=snapshot.verify();
  const staticResult=runFrozenAnalyzer(snapshot.root);
  const afterStatic=currentScopeFingerprints();
  const afterStaticSnapshotCheck=snapshot.verify();
  const behaviorResult=runFrozenBehavior(snapshot.root);
  const afterBehavior=currentScopeFingerprints();
  const afterBehaviorSnapshotCheck=snapshot.verify();
  const observedPhases=[observed,afterStatic,afterBehavior];
  const stagedVerifications=[
    initialSnapshotCheck,afterStaticSnapshotCheck,afterBehaviorSnapshotCheck
  ];
  const metadata={
   contract:"dongxi.reality-replay/v0",
   sourceKind:"original_synthetic",
   sourceRevision:"library_demo_v1",
   mode:"tools_executed_on_staged_immutable_git_blob_content_at_build_or_dev_start",
   fingerprints:afterBehavior,
   sourceSnapshot:{
    contract:"dongxi.synthetic-git-blob-snapshot/v0",
    kind:"git_object_backed_staged_execution",
    sourceCount:snapshot.sourceCount,
    verifiedBeforeBetweenAfterTools:stagedVerifications.every(v=>v.status==="verified"),
    limitations:"Content-addressed Git blob inputs are staged into temporary read-only source files and verified between tool calls; the host filesystem and running process are not a security sandbox."
   },
   sourceObservation:{
    kind:"sampled_before_between_after_tools",
    phaseCount:observedPhases.length,
    limit:"Worktree fingerprint samples are not an atomic snapshot. Executed code and tests instead use pinned Git-blob-backed staged files."
   },
   toolRuns:[
    {method:"dependency-cruiser@18.7.2",
     command:"pinned local depcruise of verified staged synthetic source",
     status:staticResult.status,evidenceRef:staticResult.evidenceRef},
    {method:"node:test",command:"node --test on staged synthetic behavior fixtures",
     status:behaviorResult.status,evidenceRef:behaviorResult.evidenceRef}
   ],
   assessments:{}
  };
  for(const [id,link] of Object.entries(publicRealityLinks)){
   const checks=link.criteria.map(criterion=>{
    const tool=criterion.id==="imports"?metadata.toolRuns[0]:metadata.toolRuns[1];
    return {id:criterion.id,method:criterion.method,command:tool.command,
      status:tool.status,resourceIds:[...criterion.resourceIds],
      evidenceRef:tool.evidenceRef};
   });
   const assessed=assessRealityLink(link,{
    sourceId:link.source.id,revision:link.source.revision,
    fingerprints:afterBehavior,checks
   });
   const sourceWindowGuarded=guardAssessmentForWindow(link,assessed,observedPhases);
   metadata.assessments[id]=guardAssessedFrozenSource(
    sourceWindowGuarded,stagedVerifications
   );
  }
  return metadata;
 }finally{
  snapshot.cleanup();
 }
}
function healthy(report){
 return report.sourceKind==="original_synthetic"&&
   report.sourceSnapshot?.verifiedBeforeBetweenAfterTools===true&&
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
   console.error(JSON.stringify({
    status:"NOT_VALIDATED_FOR_BOUND_SOURCE",
    assessments:report.assessments
   },null,2));
   process.exitCode=1;
  }else if(mode==="--check"){
   console.log(JSON.stringify({
    status:"PASS",
    frozenSource:report.sourceSnapshot.kind,
    assessments:Object.fromEntries(
     Object.entries(report.assessments).map(([id,x])=>[id,x.result])
    )
   },null,2));
  }else{
   mkdirSync(dirname(evidenceOut),{recursive:true});
   writeFileSync(evidenceOut,JSON.stringify(report,null,2)+"\n",{encoding:"utf8"});
   console.log("Generated source-bound synthetic evidence from pinned Git blobs.");
  }
 }
}
