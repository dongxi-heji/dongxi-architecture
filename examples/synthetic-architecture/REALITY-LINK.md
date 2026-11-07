# Reality Link v0 — bounded source and evidence handoff

Status: experimental integration contract, **not a new ontology, design authority, IAM system or canonical graph store**.

This contract carries one selected software relation into a professional check and back to an intelligible reading, without changing the original relation's standing. Drawing an edge or choosing a lens creates no fact.

## What is bound

- Subject: an existing source relation ID, type and unchanged standing.
- Source: explicit identity, revision and source kind. The public fixture is synthetic. Private connectors must stay outside the public repository.
- Scope: a finite set of opaque resource IDs and Git blob fingerprints. A matching subset does not mean the entire repository is unchanged.
- Criteria: what has to be checked, the method, explicitly required resources and whether a failed check would decisively contradict the bounded claim.
- Observation: actual resource fingerprints, actual tool results and the observed source identity. The browser cannot invent this evidence.

The assessment is a bounded reading of Claim + Evidence + Criterion + Method + Context, not a replacement for existing semantic roles. The five lenses — Causation, Meaning, Association, Constitution and Implication — read the **same source relation** and do not own the relation.

## Outcomes

| Outcome | When | Never infer |
| --- | --- | --- |
| supported-in-scope | All bound resource content matches and required checks passed | Whole-repo equivalence, production truth or promotion of authority |
| stale | At least one checked resource has changed | That the original claim is false |
| open | Required resource/check missing or failed without decisive falsification | Automatic success or failure |
| contradicted-in-scope | A method explicitly declared decisive fails on verified source content | Universal falsity outside the stated criterion |
| illustrative-only | Original relation is merely proposed or illustrative | An implementation or canonical claim |
| unbound | Source identity differs | Source or identity continuity |

Different Git revisions can retain support **only for matching checked resource bytes** with fresh passing checks. The revision difference is reported; other repository content remains outside scope. Git blob SHA-1 is used for content identity inside this example, not as a publisher signature or access-control mechanism.

## Reproduce on the self-contained public example

Within examples/synthetic-architecture, execute these commands in sequence:

    npm ci --registry=https://registry.npmjs.org
    npm run reality:show
    npm run reality:check
    npm run reality:write
    npm run build
    npm run dev

The check-reality runner invokes the actual dependency-cruiser 18.7.2 on four fictional JavaScript modules and invokes Node's test runner on the fictional behavior tests. It checks Git-blob content fingerprints for the source/test files, then evaluates the protocol. It never takes an arbitrary repo path or command from the browser, nor sends local source files to an external service.

The app reads only a locally generated, same-origin readout. That readout is captured at **build or dev-server startup**, not monitored continuously. After any source edit, explicitly rerun the check or restart the dev server. A stale or missing source must not reuse the previous bounded support.

The tests cover unchanged, changed, missing and wrong source identities, inconclusive and decisive failures, and unchanged scoped content across different source revisions. CI additionally tests real LikeC4 node/edge clicks, lens continuity and no external HTTP requests.

## Private source and public boundary

The generic transport logic is pure and source-agnostic. Only independently invented names, source fingerprints and analysis data are committed in the public fixture. A private adapter must run in an authorized local workspace and explicitly decide which small, potentially sensitive reading can be shown; never publish raw project files, Git object identifiers, private paths, tool stdout or private test artifacts merely because the interface supports them.

This contract does not grant permission to redistribute private data, does not create authorization/IAM infrastructure, and does not convert the still-open historical exposure of the withdrawn PR into a resolved incident.

## Not yet established

No lossless universal architecture representation, live operating system inspection, runtime concurrency proof, continuous source change monitoring, production UX performance, legal clearance for all third-party licenses or historical PR purge is claimed.

## Source-owned standing and conflicting observations

The transport validates a bounded, opaque standing token but **does not define the source's standing vocabulary**. A local source may have a different owner-defined standing than a synthetic fixture. Assessment results never replace or promote that token. The `illustrative_only` / `candidate` states remain explicitly non-authorizing.

An observation must identify its source **and** provide a valid observed revision. If that identity is missing or malformed, the reading is `unbound` even when apparently matching digests or passing tool checks are present. If a necessary source file is positively known to have changed **and** another required file cannot be observed, the result is `stale`, with **both** changed and unknown items retained. A known byte difference is sufficient to invalidate old evidence; missing observations cannot erase that known fact. Unit tests cover these conditions.
