// Keep the semantic workface independently renderable from the heavy diagram.
// This is a regression guard for the initial entry chunk, NOT a total
// transferred-bytes or runtime-performance benchmark.
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const assets = fileURLToPath(new URL('../dist/assets/', import.meta.url))
const outputs = readdirSync(assets).filter(n => n.endsWith('.js'))
const initial = outputs.filter(n => /^index-[A-Za-z0-9_-]+\.js$/.test(n))
const diagrams = outputs.filter(n => /^LikeC4Canvas-[A-Za-z0-9_-]+\.js$/.test(n))
if (initial.length !== 1 || diagrams.length !== 1) {
  throw new Error('expected_one_shell_and_one_async_diagram_chunk: '+JSON.stringify(outputs))
}

const bytes = file => statSync(join(assets, file)).size
const shellBytes = bytes(initial[0])
const diagramBytes = bytes(diagrams[0])
const kB = size => (size/1000).toFixed(2)
console.log('initial shell JS: '+kB(shellBytes)+' kB')
console.log('async LikeC4 JS: '+kB(diagramBytes)+' kB')

// The last measured entry (Vite 8 / LikeC4 1.60) was ~239 kB.
// Fail if the heavy diagram is inadvertently imported into the entrypoint.
if (shellBytes > 350_000) {
  throw new Error('initial_shell_budget_exceeded: '+shellBytes+' > 350000')
}
if (diagramBytes > 3_000_000) {
  console.warn('WARNING: oversized async diagram chunk; optimize before shipping')
}
console.log('bundle split regression gate: PASS (not a release-size or performance approval)')
