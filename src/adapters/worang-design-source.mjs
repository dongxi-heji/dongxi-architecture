// Worang design authority is the DESIGN REQUIREMENTS document, not the
// emerging native graph. This read-only locator checks the pinned source bytes.
import {execFileSync} from "node:child_process";
import {gitBlobOid} from "./worang-native-source.mjs";

export const WORANG_DESIGN_MOTHER = Object.freeze({
  repository:"dongxi-heji/worang",
  commit:"a6b0b93be046f2aeb20e33365fec889e93ae6b2b",
  path:"设计要求.md",
  blobOid:"9926f5b84737fbfeef74e616e88906291131d529",
  authorityRole:"software-design-mother",
});
export const SIX_SOFTWARE_DESIGN_ROLES = Object.freeze([
  "Concern","Design Commitment","Representation","Realization","Claim","Evidence"
]);

export function inspectPinnedDesignMother(bytes, descriptor=WORANG_DESIGN_MOTHER) {
  if(gitBlobOid(bytes)!==descriptor.blobOid)throw new Error("design_mother_blob_mismatch");
  const text=Buffer.isBuffer(bytes)?bytes.toString("utf8"):String(bytes);
  const lines=text.split(/\r?\n/);
  const resolved=SIX_SOFTWARE_DESIGN_ROLES.map(role=>{
    const line=lines.findIndex(x=>x.includes(role));
    if(line===-1)throw new Error("design_role_not_found:"+role);
    return {role,line:line+1,url:"https://github.com/"+descriptor.repository+"/blob/"+
      descriptor.commit+"/"+descriptor.path+"#L"+(line+1)};
  });
  return {
    source:{repository:descriptor.repository,path:descriptor.path,commit:descriptor.commit,
      blobOid:descriptor.blobOid,authorityRole:descriptor.authorityRole},
    roles:resolved,
    boundary:"只定位源文本中出现的六个角色，不自动判定任一 #1403 关系已经成立或获得设计承诺。"
  };
}

export function readPinnedDesignMother(repoRoot,descriptor=WORANG_DESIGN_MOTHER){
  if(typeof repoRoot!=="string"||!repoRoot.trim())throw new Error("missing_repo_root");
  const ref=descriptor.commit+":"+descriptor.path;
  const oid=execFileSync("git",["-C",repoRoot,"rev-parse",ref],
    {encoding:"utf8",timeout:15000}).trim();
  if(oid!==descriptor.blobOid)throw new Error("design_mother_git_blob_mismatch");
  const bytes=execFileSync("git",["-C",repoRoot,"show",ref],
    {timeout:15000,maxBuffer:5*1024*1024});
  return inspectPinnedDesignMother(bytes,descriptor);
}
