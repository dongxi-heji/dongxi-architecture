// Versioned, source-agnostic reality/evidence *transport contract*.
// NOT a new ontology, design authority, Claim owner, or permission to publish.
// Inputs are explicitly passed by adapters; no I/O, network or hidden state.
export const REALITY_LINK_CONTRACT="dongxi.reality-link/v0";
export const CHECK_RESULT_VALUES=Object.freeze(["passed","failed","unknown"]);
export const LINK_OUTCOMES=Object.freeze([
 "supported-in-scope","contradicted-in-scope","open","stale","illustrative-only","unbound"
]);
const id=/^[a-z][a-z0-9_-]*$/;
const digest=/^git-blob-sha1:[0-9a-f]{40}$/;

export function validateRealityLink(link) {
 const errors=[];
 if(link?.contract!==REALITY_LINK_CONTRACT)errors.push("invalid_contract");
 if(!id.test(link?.id??""))errors.push("invalid_link_id");
 if(!id.test(link?.subject?.id??"")||link?.subject?.type!=="relation")
  errors.push("invalid_relation_subject");
 if(!["illustrative_only","synthetic_code_checked","candidate"].includes(link?.subject?.standing))
  errors.push("unsupported_subject_standing");
 if(!id.test(link?.source?.id??"")||!id.test(link?.source?.revision??""))
  errors.push("unbound_source_identity");
 if(!["synthetic","local_private"].includes(link?.source?.kind))
  errors.push("invalid_source_kind");
 if(!Array.isArray(link?.scope)||link.scope.length===0)errors.push("empty_scope");
 const resourceIds=new Set();
 for(const resource of link?.scope??[]){
  if(!id.test(resource?.id??"")||resourceIds.has(resource.id))
   errors.push("duplicate_or_invalid_scope_id");
  resourceIds.add(resource.id);
  if(!digest.test(resource?.digest??""))errors.push("invalid_source_fingerprint:"+resource.id);
 }
 const criterionIds=new Set();
 if(!Array.isArray(link?.criteria)||link.criteria.length===0)errors.push("empty_criteria");
 for(const criterion of link?.criteria??[]){
  if(!id.test(criterion?.id??"")||criterionIds.has(criterion.id))errors.push("duplicate_or_invalid_criterion");
  criterionIds.add(criterion.id);
  if(typeof criterion.method!=="string"||!criterion.method.trim()||
     typeof criterion.criterion!=="string"||!criterion.criterion.trim())
    errors.push("incomplete_criterion:"+criterion.id);
  if(!Array.isArray(criterion.resourceIds)||!criterion.resourceIds.length||
     criterion.resourceIds.some(x=>!resourceIds.has(x)))
    errors.push("criterion_outside_scope:"+criterion.id);
  if(typeof criterion.decisive!=="boolean")errors.push("missing_decisiveness:"+criterion.id);
 }
 return errors;
}

export function assessRealityLink(link,observation){
 const contractErrors=validateRealityLink(link);
 if(contractErrors.length)throw Error("invalid_reality_link:"+contractErrors.join(","));
 const facts={
  contract:"dongxi.reality-assessment/v0",
  linkId:link.id,
  subjectId:link.subject.id,
  sourceId:link.source.id,
  sourceRevision:link.source.revision,
  sourceStanding:link.subject.standing,
  result:"open",
  reason:"no observation",
  changedScope:[],
  unknownScope:[],
  checkReadings:[],
  observedRevision:typeof observation?.revision==="string"?observation.revision:null,
  sameRevision:observation?.revision===link.source.revision,
  scopeEquivalence:"unverified",
  authorityUnchanged:true,
  boundary:"A bounded evidence reading of one source relation; not a global design approval, production runtime proof, or a permission to publish."
 };
 if(!observation||observation.sourceId!==link.source.id){
  facts.result="unbound";facts.reason="observation_source_identity_mismatch";return facts;
 }
 const fingerprints=observation.fingerprints??{};
 for(const resource of link.scope){
  if(!Object.hasOwn(fingerprints,resource.id)||!digest.test(fingerprints[resource.id]??"")){
   facts.unknownScope.push(resource.id);
  }else if(fingerprints[resource.id]!==resource.digest){
   facts.changedScope.push(resource.id);
  }
 }
 if(facts.unknownScope.length){
  facts.reason="required_source_content_not_observed";
  facts.scopeEquivalence="unknown";
  return facts;
 }
 if(facts.changedScope.length){
  facts.result="stale";facts.reason="source_content_changed";
  facts.scopeEquivalence="changed";
  return facts;
 }
 facts.scopeEquivalence="equal-content-in-scope";
 // Different revisions are acceptable ONLY for the exact explicitly checked
 // scoped bytes. Whole-repository equivalence is never inferred.
 const checks=observation.checks??[];
 for(const criterion of link.criteria){
  const entries=checks.filter(c=>c?.id===criterion.id);
  const c=entries.length===1?entries[0]:null;
  const valid=c&&c.method===criterion.method&&CHECK_RESULT_VALUES.includes(c.status)&&
    typeof c.command==="string"&&c.command.trim()&&
    (c.status==="unknown"||(typeof c.evidenceRef==="string"&&c.evidenceRef.trim()))&&
    c.resourceIds?.length===criterion.resourceIds.length&&
    criterion.resourceIds.every(x=>c.resourceIds.includes(x));
  facts.checkReadings.push({
   criterionId:criterion.id,
   status:valid?c.status:"unknown",
   method:criterion.method,
   decisive:criterion.decisive,
   evidenceRef:valid&&typeof c.evidenceRef==="string"?c.evidenceRef:null
  });
 }
 if(link.subject.standing==="illustrative_only"||link.subject.standing==="candidate"){
  facts.result="illustrative-only";facts.reason="source_standing_does_not_authorize_validation";
  return facts;
 }
 const failedDecisive=facts.checkReadings.find(c=>c.status==="failed"&&c.decisive);
 if(failedDecisive){
  facts.result="contradicted-in-scope";
  facts.reason="decisive_criterion_failed:"+failedDecisive.criterionId;
  return facts;
 }
 if(facts.checkReadings.some(c=>c.status!=="passed")){
  facts.reason="required_evidence_missing_or_nondecisive_failure";return facts;
 }
 facts.result="supported-in-scope";
 facts.reason=facts.sameRevision?"required_checks_passed_at_bound_revision":
   "required_checks_passed_for_equivalent_scoped_content_on_different_revision";
 return facts;
}
