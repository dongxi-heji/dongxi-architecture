// Faithful, fail-closed lookup between LikeC4's computed view and the
// source-bound case. Does not treat visual edge ids as domain relation ids.
export function resolveLikeC4Node(node, caseData) {
  const key = node?.modelRef ?? node?.id;
  if (typeof key !== 'string') return {kind:'unbound',reason:'missing_model_reference'};
  const found = caseData.nodes.filter(n => n.id === key);
  if (found.length !== 1) return {kind:'unbound',reason:found.length ? 'ambiguous_node' : 'node_not_in_case',value:key};
  return {kind:'resolved',id:found[0].id,type:'node'};
}

export function resolveLikeC4Edge(edge, caseData) {
  if (!edge || typeof edge.source !== 'string' || typeof edge.target !== 'string') {
    return {kind:'unbound',reason:'missing_edge_endpoints'};
  }
  // LikeC4 views can MERGE direct/derived relationships. A merged edge
  // is never asserted to represent one domain relation, even if its label matches.
  if (!Array.isArray(edge.relations) || edge.relations.length !== 1) {
    return {kind:'unbound',reason:'merged_or_unattributed_visual_edge',count:edge.relations?.length ?? null};
  }
  const found=caseData.relations.filter(r=>r.from===edge.source && r.to===edge.target && r.label===edge.label);
  if(found.length!==1) return {kind:'unbound',reason:found.length?'ambiguous_case_relation':'relation_not_in_case'};
  return {kind:'resolved',id:found[0].id,type:'relation'};
}

export function auditLikeC4DSL(caseData, modelSource) {
  const errors=[];
  const nodes=new Map([...modelSource.matchAll(/^\s*([a-z][a-z0-9]*)\s*=\s*component\s+'([^']+)'/gm)]
    .map(([,id,label])=>[id,label]));
  const edges=[...modelSource.matchAll(/^\s*([a-z][a-z0-9]*)\s*->\s*([a-z][a-z0-9]*)\s+'([^']+)'/gm)]
    .map(([,from,to,label])=>({from,to,label}));
  for(const n of caseData.nodes) {
    if(nodes.get(n.id)!==n.label)errors.push('node_mapping_changed:'+n.id);
  }
  for(const r of caseData.relations){
    const matches=edges.filter(e=>e.from===r.from&&e.to===r.to&&e.label===r.label);
    if(matches.length!==1)errors.push('relation_mapping_not_unique:'+r.id);
  }
  if(nodes.size!==caseData.nodes.length)errors.push('unexpected_likec4_node');
  if(edges.length!==caseData.relations.length)errors.push('unexpected_likec4_relation');
  return errors;
}
