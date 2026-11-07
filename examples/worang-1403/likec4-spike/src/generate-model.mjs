// Read-only LikeC4 projection generator for the Worang #1403 case.
// The case remains the input; generated .c4 is never a new design authority.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { caseData, validateCase } from '../../case.mjs'

const OUTPUT = new URL('./model.c4', import.meta.url)
const IDENT = /^[a-z][a-z0-9_]*$/

function quoteLabel(label) {
  if (typeof label !== 'string' || !label.trim() || /['\\\r\n]/.test(label)) {
    throw new Error('unsupported_likec4_label: ' + JSON.stringify(label))
  }
  return "'" + label + "'"
}

export function renderLikeC4Model(data) {
  const errors = validateCase(data)
  if (errors.length) throw new Error('invalid_source_case: ' + errors.join(','))
  const view = data.views.structure
  if (!view) throw new Error('missing_structure_view')
  const nodes = new Map(data.nodes.map(n => [n.id, n]))
  const relations = new Map(data.relations.map(r => [r.id, r]))
  if (view.nodeIds.length !== new Set(view.nodeIds).size ||
      view.relationIds.length !== new Set(view.relationIds).size) throw new Error('duplicate_view_identity')
  if (view.relationIds.some(id => {
    const r = relations.get(id)
    return !r || !view.nodeIds.includes(r.from) || !view.nodeIds.includes(r.to)
  })) throw new Error('view_relation_endpoints_not_visible')
  const natural = new Set()
  for (const id of view.relationIds) {
    const r = relations.get(id)
    const key = JSON.stringify([r.from, r.to, r.label])
    if (natural.has(key)) throw new Error('ambiguous_relation_without_source_id:' + id)
    natural.add(key)
  }

  const lines = [
    '// GENERATED FILE — do not edit manually.',
    '// Input: ../case.mjs (' + data.snapshot.repository + ' @ ' + data.snapshot.commit + ')',
    '// Projection only: not a Worang design authority or evidence of runtime correctness.',
    '// Regenerate: npm run generate:model',
    'specification {',
    '  element component',
    '}',
    '',
    'model {'
  ]
  for (const id of view.nodeIds) {
    if (!IDENT.test(id)) throw new Error('invalid_node_identifier: ' + id)
    const node = nodes.get(id)
    lines.push('  ' + id + ' = component ' + quoteLabel(node.label))
  }
  lines.push('')
  for (const id of view.relationIds) {
    const r = relations.get(id)
    lines.push('  ' + r.from + ' -> ' + r.to + ' ' + quoteLabel(r.label))
  }
  lines.push('}', '', 'views {', '  view index {')
  lines.push('    title ' + quoteLabel(data.title + ' · 结构与责任'))
  lines.push('    include *', '  }', '}', '')
  return lines.join('\n')
}

const ownPath = resolve(fileURLToPath(import.meta.url))
if (process.argv[1] && resolve(process.argv[1]) === ownPath) {
  const option = process.argv[2]
  const desired = renderLikeC4Model(caseData)
  if (option === '--check') {
    const actual = readFileSync(OUTPUT, 'utf8')
    if (actual !== desired) {
      console.error('LikeC4 projection drift: run npm run generate:model and review the generated diff')
      process.exitCode = 1
    } else {
      console.log('LikeC4 projection matches the pinned source-bound case')
    }
  } else if (option === '--write') {
    writeFileSync(OUTPUT, desired, 'utf8')
    console.log('Regenerated experimental LikeC4 model from case.mjs')
  } else {
    console.error('Usage: node src/generate-model.mjs --check | --write')
    process.exitCode = 2
  }
}
