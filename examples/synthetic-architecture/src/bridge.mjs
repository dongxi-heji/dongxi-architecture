// Visual identity is not source identity. Fail closed when an edge is merged,
// has no attribution, or cannot be identified uniquely from this fixture.
export function resolveNode(node,data) {
 const id=node?.modelRef??node?.id;
 if(typeof id!=="string")return {kind:"unbound",reason:"missing_node_reference"};
 const matches=data.nodes.filter(x=>x.id===id);
 return matches.length===1?{kind:"resolved",type:"node",id}:{kind:"unbound",reason:"unmatched_node"};
}
export function resolveEdge(edge,data) {
 if(!edge||typeof edge.source!=="string"||typeof edge.target!=="string")return {kind:"unbound",reason:"missing_endpoints"};
 if(!Array.isArray(edge.relations)||edge.relations.length!==1)return {kind:"unbound",reason:"merged_or_unattributed_edge"};
 const matches=data.relations.filter(r=>r.from===edge.source&&r.to===edge.target&&r.label===edge.label);
 return matches.length===1?{kind:"resolved",type:"relation",id:matches[0].id}:{kind:"unbound",reason:"ambiguous_or_unmatched_relation"};
}
