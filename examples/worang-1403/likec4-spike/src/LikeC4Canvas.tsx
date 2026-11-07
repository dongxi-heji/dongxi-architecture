import { ReactLikeC4 } from 'likec4:react'
import { caseData } from '../../case.mjs'
import { resolveLikeC4Node, resolveLikeC4Edge } from './bridge.mjs'

type Resolution =
  | { kind: 'resolved'; id: string; type: 'node' | 'relation' }
  | { kind: 'unbound'; reason: string; value?: string; count?: number | null }

// This is a replaceable renderer. It does not own selected identity,
// source standing, lens readings, or analyzer/evidence interpretation.
export function LikeC4Canvas({ onSelection }: { onSelection: (result: Resolution) => void }) {
  return <ReactLikeC4
    viewId="index"
    background="dots"
    pannable
    zoomable
    fitView
    keepAspectRatio={false}
    enableElementDetails={false}
    enableRelationshipDetails={false}
    enableRelationshipBrowser={false}
    enableFocusMode={false}
    onNodeClick={node => onSelection(resolveLikeC4Node(node, caseData) as Resolution)}
    onEdgeClick={edge => onSelection(resolveLikeC4Edge(edge, caseData) as Resolution)}
  />
}
