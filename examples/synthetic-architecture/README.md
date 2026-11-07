# Synthetic architecture integration fixture

A self-contained, **independently invented** example used to validate visual identity, projection and code-analysis boundaries in the public repository. No hidden workspace, private source material, outside Git repository, proprietary diagram or production credential is needed. Its fictional library services are **not** a real deployed system.

## Reproduce

Requires Node.js 22 or 26:

```sh
cd examples/synthetic-architecture
npm ci --registry=https://registry.npmjs.org
npm run check:licenses
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
- The five lenses are **Causation, Meaning, Association, Constitution, Implication**. They are five ways of reading the **same selected source relation**, not five workflow steps or five owners. Every invented relation has a distinct contextual reading under each lens, a stated establishment condition, a bounded effect, and an explicit source standing. Switching the lens never changes the domain relation ID.
- The fictional API/catalog/ledger behavior is actually executed by local tests; the other drawn handoffs remain `illustrative_only`. A unit test of one in-memory function cannot establish a real production behavior, causal history, privacy claim or deployment.
- Complete `package-lock.json` uses the official npm registry with integrity hashes. CI uses clean `npm ci` installs, and `npm run check:licenses` rejects missing licenses, unapproved license expressions, alternate registries and missing integrity metadata. **This is metadata/integrity verification, not legal approval**.

## Publication and recovery rule

Do not commit real local project artifacts, internal paths, Git object IDs, proprietary documents, private issue content or genuine test reports to this folder. The prior experiment was withdrawn because it used a non-public upstream case; it remains a separate, local-only recovery object and has no place in this public fixture.

This example and CI are a deliberately limited proof of the technical interface, not approval to publish material obtained from private checkouts.

## Dependency inventory and release limits

A clean Node 22 installation against the fixed public lockfile succeeded, followed by a successful local build. The declared SPDX inventory currently contains **120 MIT, 8 Apache-2.0, 8 ISC, 12 MPL-2.0, 1 BSD-3-Clause and 1 (MIT OR CC0-1.0)** package entries. All 150 registry-resolved entries carry integrity metadata. MPL-2.0 is file-level copyleft: notices, source obligations for modifications, and other redistribution conditions require an independent release review. The lockfile audit does not rule out vulnerabilities, license metadata errors, or transitive runtime behavior.

The bundle retains an approximately 2.38 MB LikeC4 asynchronous chunk; splitting it from the initial shell improves entry loading but does **not** prove that the total transfer cost or actual device performance is acceptable. The public example is still a Draft PR, not a packaged product.

## Browser privacy / fonts (LikeC4 1.60.0)

The upstream embeddable LikeC4 React module contains six IBM Plex Sans `@font-face` declarations that use a third-party jsDelivr URL, which the initial Chromium network test caught. This public demo is intended to use **system-font fallback, not any remote CDN font**. The bounded `scripts/offline-fonts.mjs` Vite plugin removes exactly those six declarations at build/development transform time; both an upstream-shape mismatch and a remaining matching CDN URL in generated chunks fail the build. `optimizeDeps.exclude` keeps that dependency from bypassing the transform in development. A Playwright browser test checks all requested HTTP resources are same-origin.

This is a pinned, upstream-internal compatibility workaround—not a universal guarantee for future LikeC4 versions or a standalone security policy. A LikeC4 upgrade requires deliberately reviewing the font-loading behavior and refreshing both the plugin and browser tests. A later product implementation should prefer a supported font override or locally bundled fonts under their license rather than a permanent internal patch.
