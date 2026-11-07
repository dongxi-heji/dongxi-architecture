// Pure, conservative source-window guard. A before/after comparison is NOT
// atomic filesystem isolation: it detects observed drift, but cannot rule out
// a file being changed and restored between fingerprint observations.
// Keep every observation scoped to the source relation's declared resources.
const BLOB=/^git-blob-sha1:[0-9a-f]{40}$/;

export function inspectSourceWindow(link,phases) {
 if(!Array.isArray(phases)||phases.length<2)throw Error("source_window_requires_multiple_phases");
 const unstableIds=[],unknownIds=[];
 for(const resource of link.scope){
  const observed=phases.map(phase=>phase?.[resource.id]);
  if(observed.some(value=>typeof value!=="string"||!BLOB.test(value)))
   unknownIds.push(resource.id);
  // Preserve a known change even if another observation is missing.
  const known=observed.filter(value=>typeof value==="string"&&BLOB.test(value));
  if(new Set(known).size>1)unstableIds.push(resource.id);
 }
 return {
  contract:"dongxi.source-check-window/v0",
  status:unstableIds.length?"changed-during-check":
   unknownIds.length?"incomplete":"equal-at-observation-points",
  phases:phases.length,
  unstableIds,
  unknownIds,
  limitation:"Fingerprint samples before/between/after local tools are not an atomic filesystem snapshot; a transient change restored between samples may be undetected."
 };
}
export function guardAssessmentForWindow(link,assessment,phases) {
 const window=inspectSourceWindow(link,phases);
 // A known changed source already makes prior evidence stale; do not erase
 // that stronger fact. Only newly supported results require downgrading.
 if(assessment.result!=="supported-in-scope"||window.status==="equal-at-observation-points")
  return {...assessment,sourceWindow:window};
 return {...assessment,
  result:"open",
  reason:"source_changed_or_unobserved_during_check",
  scopeEquivalence:"not_stable_during_observed_check_window",
  sourceWindow:window
 };
}
