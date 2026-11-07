import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { caseData } from '../../case.mjs'
import { renderLikeC4Model } from './generate-model.mjs'
import { auditLikeC4DSL } from './bridge.mjs'

test('model.c4 is byte-for-byte generated from the source-bound case', () => {
  const generated = renderLikeC4Model(caseData)
  assert.equal(readFileSync(new URL('./model.c4', import.meta.url), 'utf8'), generated)
  assert.deepEqual(auditLikeC4DSL(caseData, generated), [])
})
test('case changes never silently produce a different identity graph', () => {
  const data = structuredClone(caseData)
  data.nodes.find(n => n.id === 'hive').label = 'Renamed via original case'
  assert.notEqual(renderLikeC4Model(data), renderLikeC4Model(caseData))
})
test('view identity ambiguity and dangling edges are rejected', () => {
  const duplicate = structuredClone(caseData)
  duplicate.views.structure.relationIds.push('r-ownership')
  assert.throws(() => renderLikeC4Model(duplicate), /duplicate_view_identity/)
  const missing = structuredClone(caseData)
  missing.views.structure.nodeIds = missing.views.structure.nodeIds.filter(x => x !== 'hive')
  assert.throws(() => renderLikeC4Model(missing), /view_relation_endpoints_not_visible/)
})
test('ambiguous relation triples cannot be mapped by visual edge labels', () => {
  const bad = structuredClone(caseData)
  bad.relations.push({...bad.relations[3], id:'r-second-ownership'})
  bad.views.structure.relationIds.push('r-second-ownership')
  assert.throws(() => renderLikeC4Model(bad), /ambiguous_relation_without_source_id/)
})
test('unsafe LikeC4 identifiers and labels fail without emitting a malformed DSL', () => {
  const bad = structuredClone(caseData)
  bad.nodes.find(n => n.id === 'hive').label = "Can't be safely quoted"
  assert.throws(() => renderLikeC4Model(bad), /unsupported_likec4_label/)
  const badId = structuredClone(caseData)
  badId.nodes[0].id = 'project/escaped'
  badId.views.structure.nodeIds[0] = 'project/escaped'
  badId.views.behavior.nodeIds[0] = 'project/escaped'
  badId.relations[0].from = 'project/escaped'
  assert.throws(() => renderLikeC4Model(badId), /invalid_node_identifier/)
})
