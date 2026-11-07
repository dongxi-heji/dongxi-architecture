// Registry integrity and declared SPDX inventory for this *public synthetic* build.
// A metadata gate, NOT a full license legal review or security vulnerability audit.
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";

const ACCEPTED=new Set(["MIT","Apache-2.0","ISC","BSD-3-Clause","(MIT OR CC0-1.0)","MPL-2.0"]);

export function auditLock(lock,packageManifest) {
 const problems=[],licenses=new Map(),review=[];
 if(lock.lockfileVersion!==3||!lock.packages?.[""])problems.push("invalid_lockfile");
 const root=lock.packages?.[""]||{};
 for(const depType of ["dependencies","devDependencies"]){
  const fromPkg=packageManifest[depType]||{},fromLock=root[depType]||{};
  if(JSON.stringify(Object.keys(fromPkg).sort().map(k=>[k,fromPkg[k]]))!==
     JSON.stringify(Object.keys(fromLock).sort().map(k=>[k,fromLock[k]])))
    problems.push("manifest_lock_out_of_sync:"+depType);
 }
 for(const [name,item] of Object.entries(lock.packages||{})){
  if(!name)continue;
  const license=item.license??"(missing)";
  licenses.set(license,(licenses.get(license)||0)+1);
  if(!ACCEPTED.has(license))problems.push("unreviewed_spdx:"+name+":"+license);
  if(license==="MPL-2.0")review.push(name);
  if(typeof item.resolved!=="string"||
     !item.resolved.startsWith("https://registry.npmjs.org/"))
    problems.push("unapproved_package_registry:"+name);
  if(typeof item.integrity!=="string"||
     !/^sha(256|384|512)-/.test(item.integrity))
    problems.push("missing_integrity:"+name);
 }
 return {
  totalEntries:Math.max(0,Object.keys(lock.packages||{}).length-1),
  licenses:Object.fromEntries([...licenses.entries()].sort(([a],[b])=>a.localeCompare(b))),
  fileLevelCopyleftReview:review.sort(),
  nonLegalApproval:"The lockfile licenses are metadata. MPL-2.0 terms and required notices/source obligations still need release review.",
  problems
 };
}
const own=resolve(fileURLToPath(import.meta.url));
if(process.argv[1]&&resolve(process.argv[1])===own){
 const manifest=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));
 const lock=JSON.parse(readFileSync(new URL("../package-lock.json",import.meta.url),"utf8"));
 const result=auditLock(lock,manifest);
 console.log(JSON.stringify(result,null,2));
 if(result.problems.length)process.exitCode=1;
}
