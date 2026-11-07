// Independently invented fictional demo. No private upstream source files,
// issue IDs, code symbols, deployment details or undisclosed provenance.
const ref = {kind:"synthetic",path:"src/fixture.mjs",revision:"library-demo-v1"}
export const fixture={
  contract:"dongxi.synthetic-architecture/v1",
  source:{kind:"original_synthetic",revision:"library-demo-v1",
    disclosure:"All names and relationships are made up for this public example."},
  title:"Fictional Neighborhood Library",
  nodes:[
    {id:"reader",label:"Reader App",role:"illustration",detail:"Fictional user-facing request surface.",sources:[ref]},
    {id:"api",label:"Loan API",role:"illustration",detail:"Illustrative request coordination boundary.",sources:[ref]},
    {id:"catalog",label:"Catalog Service",role:"illustration",detail:"Fictional availability lookup.",sources:[ref]},
    {id:"ledger",label:"Loan Ledger",role:"illustration",detail:"Illustrative reservation record.",sources:[ref]},
    {id:"dispatch",label:"Delivery Sandbox",role:"illustration",detail:"Simulated, non-production delivery coordination.",sources:[ref]},
    {id:"notice",label:"Notice Worker",role:"illustration",detail:"Returns a made-up notification to the reader.",sources:[ref]}
  ],
  relations:[
    {id:"demo_request",from:"reader",to:"api",label:"submits a sample request",detail:"A fictional app sends an illustrative loan request.",sources:[ref]},
    {id:"demo_lookup",from:"api",to:"catalog",label:"checks sample availability",detail:"A fictional API reads a sample catalog.",sources:[ref]},
    {id:"demo_reserve",from:"api",to:"ledger",label:"records an imaginary reservation",detail:"The sample API writes a simulated loan ledger record.",sources:[ref]},
    {id:"demo_fulfill",from:"ledger",to:"dispatch",label:"provides a sandbox task",detail:"A fictional ledger starts a simulated delivery.",sources:[ref]},
    {id:"demo_notify",from:"dispatch",to:"notice",label:"requests a mock notice",detail:"The simulated delivery invokes a dummy notice worker.",sources:[ref]},
    {id:"demo_confirm",from:"notice",to:"reader",label:"returns a test notification",detail:"A fictional notification returns to the reader app.",sources:[ref]}
  ],
  readings:{
    structure:"Which components, services and relationships are currently represented?",
    behavior:"What example sequence would these fictional components suggest?",
    change:"Which displayed elements might be affected by a hypothetical change?",
    evidence:"Which facts are independently checked, and which are merely illustrative?",
    uncertainty:"What cannot be inferred from a diagram or static analysis alone?"
  }
}
const ident=/^[a-z][a-z0-9_]*$/
export function validateFixture(data) {
 const errors=[];
 if(data?.contract!=="dongxi.synthetic-architecture/v1"||data?.source?.kind!=="original_synthetic")errors.push("unapproved_fixture_origin");
 if(!ident.test(data?.source?.revision||""))errors.push("invalid_fixture_revision");
 const nodes=new Set(),rels=new Set(),triples=new Set();
 for(const n of data.nodes||[]){
   if(!ident.test(n.id)||nodes.has(n.id))errors.push("invalid_or_duplicate_node:"+n.id);
   nodes.add(n.id);
   if(!n.label||!n.detail||!Array.isArray(n.sources)||!n.sources.length)errors.push("incomplete_node:"+n.id);
   for(const s of n.sources||[])if(s.kind!=="synthetic"||s.path!=="src/fixture.mjs"||s.revision!==data.source.revision)errors.push("non_public_source_ref:"+n.id);
 }
 for(const r of data.relations||[]){
   if(!ident.test(r.id)||rels.has(r.id))errors.push("invalid_or_duplicate_relation:"+r.id);
   rels.add(r.id);
   if(!nodes.has(r.from)||!nodes.has(r.to))errors.push("unknown_endpoint:"+r.id);
   if(!r.label||!r.detail||!Array.isArray(r.sources)||!r.sources.length)errors.push("incomplete_relation:"+r.id);
   const triple=JSON.stringify([r.from,r.to,r.label]);
   if(triples.has(triple))errors.push("ambiguous_visual_relation:"+r.id); triples.add(triple);
   for(const s of r.sources||[])if(s.kind!=="synthetic"||s.path!=="src/fixture.mjs"||s.revision!==data.source.revision)errors.push("non_public_source_ref:"+r.id);
 }
 for(const l of ["structure","behavior","change","evidence","uncertainty"])if(!data.readings?.[l])errors.push("missing_reading:"+l);
 return errors;
}
export function selectItem(id){return fixture.nodes.find(n=>n.id===id)||fixture.relations.find(r=>r.id===id)||null}
