# Synthetic architecture integration fixture

A self-contained, **independently invented** example used to validate visual identity, projection and code-analysis boundaries in the public repository. No hidden workspace, private source material, outside Git repository, proprietary diagram or production credential is needed. Its fictional library services are **not** a real deployed system.

## Reproduce

Requires Node.js 22 or 26:

```sh
cd examples/synthetic-architecture
npm install
npm run check:model
npm run analyze
npm test
npm run build
npm run dev
```

Open the Vite development server shown in the terminal. For browser E2E, install Chromium with `npx playwright install chromium` and execute `npm run test:e2e`.

## Deliberate boundaries

- `src/fixture.mjs` is the only source of the invented node/relationship identities and public source refs.
- `npm run generate:model` deterministically rewrites `src/model.c4`; `npm run check:model` fails if a source change was not carried into the derived diagram.
- `src/bridge.mjs` maps a LikeC4 node or visual edge back to its fictional source ID only when identity is unambiguous. Rendered edges do not establish facts. Missing, merged and ambiguous mappings fail closed.
- `scripts/check-analysis.mjs` **runs the real** dependency-cruiser executable on the four local synthetic modules and rejects changed imports. It reports the exact included file SHA-256 hashes and version; no external source files are analyzed.
- The client imports only a public *expected readout*, accurately labeled as build-checkable. Opening a browser does not itself run source analysis and never establishes correctness of an actual service.
- LikeC4 is loaded through React.lazy. `check-bundle.mjs` checks the initial-shell chunk budget, not a runtime performance SLA.
- The five reading tabs are ordinary prompts to review a diagram; they are not new relation owners, additional source claims or substitutes for evidence.

## Publication and recovery rule

Do not commit real local project artifacts, internal paths, Git object IDs, proprietary documents, private issue content or genuine test reports to this folder. The prior experiment was withdrawn because it used a non-public upstream case; it remains a separate, local-only recovery object and has no place in this public fixture.

This example and CI are a deliberately limited proof of the technical interface, not approval to publish material obtained from private checkouts.
