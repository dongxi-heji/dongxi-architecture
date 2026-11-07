// Create an isolated, bounded execution tree from *immutable Git blob objects*
// of the independently invented public fixture. Unlike worktree sampling,
// tools execute the exact pinned bytes even if a source file changes mid-run.
// No private checkout, network operation, arbitrary browser path or command.
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,chmodSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {PUBLIC_SOURCE_FILES} from "../src/reality-links.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const GIT_BLOB=/^git-blob-sha1:([0-9a-f]{40})$/;
const FIXTURE_PATH=/^src\/sample-domain\/[a-z][a-z0-9-]*\.(?:test\.)?mjs$/;
export function gitBlobDigest(bytes){
 return "git-blob-sha1:"+createHash("sha1")
  .update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
}

export function createFrozenSyntheticScope() {
 const stagedRoot=mkdtempSync(join(tmpdir(),"dongxi-synthetic-source-"));
 const files={},resources=Object.entries(PUBLIC_SOURCE_FILES);
 let cleaned=false;
 try {
  for(const [id,resource] of resources){
   const match=GIT_BLOB.exec(resource.digest);
   if(!/^[a-z][a-z0-9_]*$/.test(id)||!match||
      !FIXTURE_PATH.test(resource.path))throw Error("unapproved_synthetic_snapshot_resource");
   // The Git object ID identifies immutable content, not the current worktree.
   // A worktree edit can never change the bytes used by the analyzer/tests.
   const bytes=execFileSync("git",["-C",root,"cat-file","blob",match[1]],{
    timeout:20000,maxBuffer:512*1024
   });
   if(gitBlobDigest(bytes)!==resource.digest)throw Error("git_object_content_mismatch:"+id);
   const path=resolve(stagedRoot,resource.path);
   if(!path.startsWith(stagedRoot+"/"))throw Error("untrusted_stage_path");
   mkdirSync(dirname(path),{recursive:true});
   writeFileSync(path,bytes,{flag:"wx",mode:0o444});
   chmodSync(path,0o444);
   files[id]={path:resource.path,digest:resource.digest};
  }
  const fingerprints=Object.fromEntries(resources.map(([id,value])=>[id,value.digest]));
  const verify=()=>{
   if(cleaned)return {status:"unavailable",unknownIds:resources.map(([id])=>id)};
   const changedIds=[],unknownIds=[];
   for(const [id,resource] of resources){
    try{
     const actual=gitBlobDigest(readFileSync(resolve(stagedRoot,resource.path)));
     if(actual!==resource.digest)changedIds.push(id);
    }catch{unknownIds.push(id)}
   }
   return {status:changedIds.length?"changed":
     unknownIds.length?"unknown":"verified",changedIds,unknownIds};
  };
  if(verify().status!=="verified")throw Error("staged_snapshot_not_verified");
  return {
   contract:"dongxi.synthetic-git-blob-snapshot/v0",
   root:stagedRoot,
   fingerprints,
   sourceCount:resources.length,
   verify,
   cleanup(){if(cleaned)return;cleaned=true;rmSync(stagedRoot,{recursive:true,force:true})}
  };
 }catch(error){
  rmSync(stagedRoot,{recursive:true,force:true});
  throw error;
 }
}


export function guardAssessedFrozenSource(assessment,verifications) {
 if(!Array.isArray(verifications)||verifications.length<2)
  throw Error("frozen_snapshot_requires_multiple_checks");
 const bad=verifications.filter(x=>x?.status!=="verified");
 const evidence={
  contract:"dongxi.frozen-source-verification/v0",
  origin:"allowlisted_immutable_git_blobs",
  stagedFileCount:Object.keys(PUBLIC_SOURCE_FILES).length,
  verifyCount:verifications.length,
  status:bad.length?"unverified":"verified",
  limitation:"Git blob inputs are immutable; staged copies are rechecked after each tool. This does not make arbitrary outside processes or the host filesystem a trusted security boundary."
 };
 if(assessment.result!=="supported-in-scope"||!bad.length)
  return {...assessment,frozenSource:evidence};
 return {...assessment,
  result:"open",
  reason:"frozen_source_input_integrity_unverified",
  scopeEquivalence:"unverified_execution_inputs",
  frozenSource:evidence
 };
}
