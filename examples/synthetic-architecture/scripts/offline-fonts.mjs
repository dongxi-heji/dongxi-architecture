// LikeC4 1.60.0's embeddable React bundle injects six @font-face rules
// that point to a third-party CDN. Remove ONLY those known declarations.
// The browser then uses system font fallback instead of making font requests.
// This pinned upstream-internal transform deliberately FAILS on upstream drift.
const TARGET="/node_modules/likec4/react/index.mjs";
const FONT_RULE=/@font-face\{font-family:IBM Plex Sans Variable;[^}]*\}/g;
const REMOTE="https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans";

export function stripKnownRemoteFontRules(source) {
 const matches=[...source.matchAll(FONT_RULE)];
 if(matches.length!==6||matches.some(x=>!x[0].includes(REMOTE)))
  throw Error("unexpected_likec4_remote_font_contract: "+matches.length);
 const next=source.replace(FONT_RULE,"");
 if(next.includes(REMOTE))throw Error("unhandled_external_font_reference");
 return next;
}
export function offlineLikeC4Fonts(){
 let seen=false;
 return {
  name:"likec4-offline-font-boundary",
  enforce:"pre",
  transform(code,id){
   const path=id.replaceAll("\\","/").split("?")[0];
   if(!path.endsWith(TARGET))return null;
   seen=true;
   return {code:stripKnownRemoteFontRules(code),map:null};
  },
  generateBundle(_options,bundle) {
   if(!seen)throw Error("likec4_font_source_not_transformed");
   for(const file of Object.values(bundle)){
    if(file.type==="chunk"&&file.code.includes(REMOTE))
     throw Error("remote_font_reference_in_output:"+file.fileName);
   }
  }
 }
}
