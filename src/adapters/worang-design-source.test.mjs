import test from "node:test";
import assert from "node:assert/strict";
import {gitBlobOid} from "./worang-native-source.mjs";
import {inspectPinnedDesignMother,WORANG_DESIGN_MOTHER,SIX_SOFTWARE_DESIGN_ROLES} from "./worang-design-source.mjs";

test("pinned official design mother resolves all six roles with source line references",()=>{
 const doc=SIX_SOFTWARE_DESIGN_ROLES.map((s,i)=>"Section "+(i+1)+" "+s).join("\n");
 const descriptor={...WORANG_DESIGN_MOTHER,blobOid:gitBlobOid(doc)};
 const result=inspectPinnedDesignMother(doc,descriptor);
 assert.equal(result.source.authorityRole,"software-design-mother");
 assert.equal(result.roles.length,6);
 assert.deepEqual(result.roles.map(x=>x.role),[...SIX_SOFTWARE_DESIGN_ROLES]);
 assert(result.roles.every(x=>x.url.includes("/blob/"+descriptor.commit+"/")));
});
test("changes to design mother or missing roles fail closed, never infer authority",()=>{
 const doc=SIX_SOFTWARE_DESIGN_ROLES.join("\n");
 const descriptor={...WORANG_DESIGN_MOTHER,blobOid:gitBlobOid(doc)};
 assert.throws(()=>inspectPinnedDesignMother(doc+" changed",descriptor),/design_mother_blob_mismatch/);
 const missing=SIX_SOFTWARE_DESIGN_ROLES.slice(0,-1).join("\n");
 assert.throws(()=>inspectPinnedDesignMother(missing,{...descriptor,blobOid:gitBlobOid(missing)}),/design_role_not_found:Evidence/);
});
