// A bounded, read-only analyzer replay gate.
// A new run cannot silently inherit a previous Git snapshot's evidence standing.
// No UI endpoint or arbitrary user command string is involved.
import {execFileSync} from "node:child_process";
import {posix} from "node:path";
import {analyzerReadout} from "../../examples/worang-1403/analysis-readout.mjs";

export const ANALYZER_VERSION = "18.7.2";
export const ANALYZER_ENTRY = "scripts/lib/durable-hive-runtime.mjs";
export const ANALYZER_INCLUDE = "^scripts";

function validRepoPath(path) {
  return typeof path==="string" && path.startsWith("scripts/") &&
    !path.includes("\\") && !path.includes("\0") &&
    posix.normalize(path)===path && !path.split("/").includes("..");
}

export function normalizeCruiserResult(cruiserJson) {
  if(!cruiserJson||!Array.isArray(cruiserJson.modules))throw new Error("unsupported_dependency_cruiser_output");
  const paths=new Set(),edges=[];
  for(const module of cruiserJson.modules){
    if(!validRepoPath(module.source))throw new Error("analyzer_module_outside_scope:"+module.source);
    if(paths.has(module.source))throw new Error("duplicate_analyzer_module:"+module.source);
    paths.add(module.source);
    for(const d of module.dependencies||[]){
      // dependency-cruiser may classify built-in/external/unresolved dependencies.
      // Only resolved local imports within ^scripts are part of the bounded graph.
      if(typeof d.resolved==="string" && d.resolved.startsWith("scripts/")){
        if(!validRepoPath(d.resolved))throw new Error("analyzer_edge_outside_scope:"+d.resolved);
        edges.push([module.source,d.resolved]);
      }
    }
  }
  if(!paths.has(ANALYZER_ENTRY))throw new Error("missing_analyzer_entrypoint");
  for(const [,target] of edges)if(!paths.has(target))throw new Error("incomplete_local_dependency_scope:"+target);
  return {paths:[...paths].sort(),edges:edges.sort((a,b)=>a.join("\0").localeCompare(b.join("\0"))),
    entrypoint:ANALYZER_ENTRY,modules:paths.size,dependencies:edges.length};
}

export function compareSourceScope(paths,blobLookup,baseRevision) {
  if(!/^[0-9a-f]{40}$/.test(baseRevision))throw new Error("invalid_source_revision");
  const changed=[],missing=[],baseline={},observed={};
  for(const p of paths){
    if(!validRepoPath(p))throw new Error("untrusted_path:"+p);
    const value=blobLookup(p,baseRevision);
    if(!value||!/^[0-9a-f]{40}$/.test(value.baseline??"")||!/^[0-9a-f]{40}$/.test(value.worktree??"")){
      missing.push(p);continue;
    }
    baseline[p]=value.baseline;observed[p]=value.worktree;
    if(value.baseline!==value.worktree)changed.push(p);
  }
  return {status:missing.length?"unknown":changed.length?"changed":"verified_equal",changed,missing,baseline,observed};
}

export function makeReplayReadout({caseData,cruiserJson,blobs,observedCommit,toolVersion,toolCommand}) {
  if(toolVersion!==ANALYZER_VERSION)throw new Error("analyzer_version_mismatch");
  if(!/^[0-9a-f]{40}$/.test(observedCommit))throw new Error("invalid_observed_commit");
  const graph=normalizeCruiserResult(cruiserJson);
  const comparison=compareSourceScope(graph.paths,p=>blobs[p]??null,caseData.snapshot.commit);
  // This is a newly computed observation. Not a Claim proof or a source rewrite.
  const readout={
    contract:"dongxi-architecture.reanalysis/v1",
    tool:{name:"dependency-cruiser",version:toolVersion},
    source:{repository:caseData.snapshot.repository,observedCommit,
      caseCommit:caseData.snapshot.commit,entrypoint:ANALYZER_ENTRY,
      scopeEquivalence:comparison.status,changedPaths:comparison.changed,
      missingPaths:comparison.missing,baselineBlobs:comparison.baseline,
      observedBlobs:comparison.observed},
    graph,
    interpretation:{
      kind:"static-dependency-observation",
      status:comparison.status==="verified_equal"?"scoped-observation":"open-for-current-case",
      statement:comparison.status==="verified_equal"?"当前工作文件与案例快照在本次分析涉及的全部本地模块上逐 blob 相同；静态依赖读数可作为此有限范围的分析材料。":
        "本次分析的源码与原案例快照不相同，或仍有不能比对的文件；结果只适用于新观察，不自动支持原案例。",
      notEstablished:analyzerReadout.interpretation.notEstablished,
      command:toolCommand
    }
  };
  return readout;
}

function readGitBlob(root,rev,path) {
  try{
    return execFileSync("git",["-C",root,"rev-parse","--verify",rev+":"+path],
      {encoding:"utf8",timeout:15000}).trim();
  }catch{return null}
}
function readWorktreeBlob(root,path) {
  try{
    return execFileSync("git",["-C",root,"hash-object","--",path],
      {encoding:"utf8",timeout:15000}).trim();
  }catch{return null}
}

export function replayOnCheckout({repoRoot,analyzerBin,caseData}) {
  if(typeof repoRoot!=="string"||!repoRoot.trim())throw new Error("missing_repo_root");
  if(typeof analyzerBin!=="string"||!analyzerBin.trim())throw new Error("analyzer_bin_required");
  const version=execFileSync(analyzerBin,["--version"],{encoding:"utf8",timeout:15000}).trim();
  if(version!==ANALYZER_VERSION)throw new Error("analyzer_version_mismatch:"+version);
  const commit=execFileSync("git",["-C",repoRoot,"rev-parse","HEAD"],
    {encoding:"utf8",timeout:15000}).trim();
  const argv=["--no-config","--include-only",ANALYZER_INCLUDE,"--output-type","json",ANALYZER_ENTRY];
  const command="dependency-cruiser@"+version+" "+argv.join(" ");
  const raw=execFileSync(analyzerBin,argv,
    {cwd:repoRoot,encoding:"utf8",timeout:120000,maxBuffer:15*1024*1024});
  let json;
  try{json=JSON.parse(raw)}catch{throw new Error("invalid_analyzer_json")}
  const parsed=normalizeCruiserResult(json);
  const blobs=Object.fromEntries(parsed.paths.map(path=>[path,{
    baseline:readGitBlob(repoRoot,caseData.snapshot.commit,path),
    worktree:readWorktreeBlob(repoRoot,path)
  }]));
  return makeReplayReadout({caseData,cruiserJson:json,blobs,
    observedCommit:commit,toolVersion:version,toolCommand:command});
}
