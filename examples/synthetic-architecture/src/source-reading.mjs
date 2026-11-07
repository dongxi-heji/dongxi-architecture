// A fixed locator for public fictional files ONLY. Never accept arbitrary
// filenames from a browser, and never point to an authorized private checkout.
import {PUBLIC_SOURCE_FILES,publicRealityLinks} from "./reality-links.mjs";

export function listPublicSources(relationId) {
 if(typeof relationId!=="string"||!Object.hasOwn(publicRealityLinks,relationId))
  return [];
 const link=publicRealityLinks[relationId];
 return link.scope.map(entry=>{
   const known=PUBLIC_SOURCE_FILES[entry.id];
   if(!known||known.digest!==entry.digest||
      !known.path.startsWith("src/sample-domain/"))
     throw Error("source_locator_outside_public_fixture");
   return Object.freeze({id:entry.id,path:known.path,
     digest:entry.digest,kind:"synthetic_public_snapshot"});
 });
}
