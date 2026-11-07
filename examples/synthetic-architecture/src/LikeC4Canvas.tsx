import {ReactLikeC4} from 'likec4:react'
import {fixture} from './fixture.mjs'
import {resolveNode,resolveEdge} from './bridge.mjs'

type Selection =
  | {kind:'resolved';type:'node'|'relation';id:string}
  | {kind:'unbound';reason:string};

export function LikeC4Canvas({onSelect}:{onSelect:(selection:Selection)=>void}) {
 return <ReactLikeC4
   viewId="index"
   background="dots"
   zoomable pannable fitView
   keepAspectRatio={false}
   enableElementDetails={false}
   enableRelationshipDetails={false}
   enableRelationshipBrowser={false}
   enableFocusMode={false}
   onNodeClick={node=>onSelect(resolveNode(node,fixture) as Selection)}
   onEdgeClick={edge=>onSelect(resolveEdge(edge,fixture) as Selection)}
 />
}
