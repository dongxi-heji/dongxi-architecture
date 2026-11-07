// Explicit, independently invented source/evidence bindings for the public demo.
// These are WORKBENCH READINGS, not new owners of the design or of the relation.
export const PUBLIC_SOURCE_FILES=Object.freeze({
 api:{path:"src/sample-domain/api.mjs",digest:"git-blob-sha1:cbd05868f0c31c2d094a4a5e2912729cf9dc7e34"},
 catalog:{path:"src/sample-domain/catalog.mjs",digest:"git-blob-sha1:1209248d1e54d3b88a818a06fba329f87848cd47"},
 ledger:{path:"src/sample-domain/ledger.mjs",digest:"git-blob-sha1:409b8bbc27e163602645f583841ad2180e2f8a15"},
 notice:{path:"src/sample-domain/notice.mjs",digest:"git-blob-sha1:8361f5b184edea8cdeeada78e609fd30099ad571"},
 behavior_test:{path:"src/sample-domain/behavior.test.mjs",digest:"git-blob-sha1:446693565aa7ad54d234741fb52aa21f59b8abc2"}
});
const ids=Object.keys(PUBLIC_SOURCE_FILES);
function scope(...keys) {return keys.map(key=>({id:key,digest:PUBLIC_SOURCE_FILES[key].digest}));}
function criterion(id,method,criterion,resourceIds,decisive){
 return {id,method,criterion,resourceIds,decisive};
}
const root={contract:"dongxi.reality-link/v0",
 source:{id:"fictional_library_demo",revision:"library_demo_v1",kind:"synthetic"}};
export const publicRealityLinks=Object.freeze({
 demo_lookup:{
  ...root,id:"lookup_link",
  subject:{id:"demo_lookup",type:"relation",standing:"synthetic_code_checked"},
  scope:scope("api","catalog","behavior_test"),
  criteria:[
   criterion("imports","dependency-cruiser@18.7.2",
    "A real bounded analyzer verifies the sample API imports a catalog helper",
    ["api","catalog"],false),
   criterion("behavior","node:test",
    "A real local behavior test checks available and absent fictional identifiers",
    ["api","catalog","behavior_test"],true)
  ]
 },
 demo_reserve:{
  ...root,id:"reserve_link",
  subject:{id:"demo_reserve",type:"relation",standing:"synthetic_code_checked"},
  scope:scope(...ids),
  criteria:[
   criterion("imports","dependency-cruiser@18.7.2",
    "The bounded import graph contains API-to-ledger and ledger-to-notice edges",
    ["api","catalog","ledger","notice"],false),
   criterion("behavior","node:test",
    "A behavior test checks a simulated in-memory result and mock notice",
    ["api","catalog","ledger","notice","behavior_test"],true)
  ]
 }
});
