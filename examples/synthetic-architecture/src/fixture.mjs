// Independently invented fictional demo. No private upstream source files,
// issue IDs, code symbols, deployment details or undisclosed provenance.
const ref = {kind:"synthetic",path:"src/fixture.mjs",revision:"library_demo_v1"}
export const fixture={
  contract:"dongxi.synthetic-architecture/v1",
  source:{kind:"original_synthetic",revision:"library_demo_v1",
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
  lensQuestions:{
    causation:"What actually changes what? Which counterfactual test is still needed?",
    meaning:"For which actor, relationship and situation does this example matter?",
    association:"Which things are connected, and how strong is the available evidence?",
    constitution:"Which parts and relationships make this illustrative whole possible?",
    implication:"What follows from the stated premises, and what remains unproven?"
  },
  relationContracts:{
    demo_request:{standing:"illustrative_only",establishment:"A fictional request is defined in the picture; no browser-to-API request is implemented.",effect:"Would deliver a request to the fictional API if realized."},
    demo_lookup:{standing:"synthetic_code_checked",establishment:"The sample API imports the catalog helper; source analysis checks the import and a test executes the available/unavailable branches.",effect:"Selects the invented availability branch of requestBook."},
    demo_reserve:{standing:"synthetic_code_checked",establishment:"The sample API calls the ledger helper for an available fictional book; a local test checks the returned in-memory record.",effect:"Creates a simulated loan result and mock notice, never a real loan."},
    demo_fulfill:{standing:"illustrative_only",establishment:"The diagram declares a ledger-to-delivery link; the example code contains no delivery dispatch implementation.",effect:"Would enqueue a mock delivery step if separately implemented."},
    demo_notify:{standing:"illustrative_only",establishment:"The diagram declares a sandbox-to-notice handoff; the sample code does not implement that handoff.",effect:"Would request a made-up message, not an email."},
    demo_confirm:{standing:"illustrative_only",establishment:"The diagram declares a notice-to-reader return; no UI message transport is implemented.",effect:"Would display a simulated confirmation if realized."}
  },
  relationReadings:{
    demo_request:{
      causation:"No running reader-to-API call has been observed. To test causation, send a mock request and compare the API event trace with a no-request control.",
      meaning:"For a fictional reader, the request represents an attempt to borrow a book. No real person or library is involved.",
      association:"Reader App and Loan API are linked by this declared example relation only; no implemented frontend transport has been checked.",
      constitution:"A request sender, API receiver and a transfer contract would be needed to constitute this interaction; the drawing supplies only a view.",
      implication:"The diagram says a request could be submitted. It does not imply that the fictional API is reachable or that any loan exists."
    },
    demo_lookup:{
      causation:"In the executable sample, the supplied book ID influences the availability branch. The test checks both a listed and an absent ID; it does not test a deployed service.",
      meaning:"For an imaginary reader, an availability check distinguishes an available sample title from an unavailable one.",
      association:"The sample API imports the catalog module. dependency-cruiser confirms that static import, and a local behavior test checks two inputs.",
      constitution:"The API, in-memory catalog list and availability function together form this bounded sample lookup, without a real inventory backend.",
      implication:"Given the two hard-coded sample IDs, an absent ID returns an unavailable result. This does not establish stock levels in any actual library."
    },
    demo_reserve:{
      causation:"For a listed sample ID, the API invokes an in-memory ledger helper and gets a simulated result. A test demonstrates the output; nothing is persisted.",
      meaning:"Within the invented borrower's scenario, recording a sample loan means the request can be treated as simulated rather than unavailable.",
      association:"The API imports the ledger module, and the behavior test checks a simulated loan result. This is evidence for the local sample only.",
      constitution:"The sample availability check, ledger helper and mock-notice function jointly produce the returned object.",
      implication:"If the ID is listed, the sample returns status simulated. This does not imply a durable reservation, a delivery job or production correctness."
    },
    demo_fulfill:{
      causation:"No dispatch code runs here, so no delivery effect has been established. A future test would compare ledger updates with and without a queued job.",
      meaning:"For a fictional librarian, this would mean moving a loan record toward a hypothetical delivery step.",
      association:"Loan Ledger and Delivery Sandbox are connected in the diagram, but the current sample source has no such import or call.",
      constitution:"A ledger event, an enqueue operation and a sandbox consumer would all be required; only the intended relation is represented.",
      implication:"Drawing a ledger-to-dispatch edge does not imply a queue exists, a job ran or a book was delivered."
    },
    demo_notify:{
      causation:"There is no running dispatch-to-notice call. An observable effect would require a recorded sandbox invocation and controlled no-call comparison.",
      meaning:"A pretend delivery operator might want a mock notice once a simulated step ends.",
      association:"The dispatch and notice boxes are visually connected; no source-code dependency between them was found in this synthetic implementation.",
      constitution:"A sandbox producer, notice consumer and message contract would be needed for this handoff to exist operationally.",
      implication:"The proposed handoff does not prove the notice worker was invoked or any outbound message was sent."
    },
    demo_confirm:{
      causation:"No notification reaches the Reader App in the running sample. A local UI delivery test would be needed to show such an effect.",
      meaning:"For an imaginary reader, a confirmation would make a sample request visibly complete.",
      association:"The diagram connects a mock Notice Worker back to Reader App; there is no verified frontend return channel.",
      constitution:"A worker response, UI handler and message presentation would be needed; this is currently only a proposed view.",
      implication:"A drawn return edge does not imply an actual UI notification, email or real borrower acknowledgment."
    }
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
 for(const l of ["causation","meaning","association","constitution","implication"]){
   if(!data.lensQuestions?.[l])errors.push("missing_lens_question:"+l);
 }
 for(const r of data.relations||[]){
   const contract=data.relationContracts?.[r.id];
   if(!contract?.establishment||!contract.effect||
      !["illustrative_only","synthetic_code_checked"].includes(contract.standing))
     errors.push("missing_or_invalid_relation_contract:"+r.id);
   const readings=data.relationReadings?.[r.id];
   if(!readings)errors.push("missing_relation_readings:"+r.id);
   else for(const l of ["causation","meaning","association","constitution","implication"])
     if(typeof readings[l]!=="string"||readings[l].length<20)
       errors.push("missing_lens_reading:"+r.id+":"+l);
 }
 return errors;
}
export function selectItem(id){return fixture.nodes.find(n=>n.id===id)||fixture.relations.find(r=>r.id===id)||null}

export function readRelationLens(id,lens,data=fixture){
 if(!["causation","meaning","association","constitution","implication"].includes(lens))
   throw Error("unrecognized_lens:"+lens);
 const reading=data.relationReadings?.[id]?.[lens];
 return typeof reading==="string"&&reading.trim()?reading:null;
}
