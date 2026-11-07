// Public expected readout of a wholly synthetic four-module source graph.
// Actual dependency-cruiser execution is required by "npm run analyze" and CI.
// This module is not runtime telemetry or real-world evidence.
export const expectedAnalysis={
  kind:"synthetic_static_imports",
  tool:"dependency-cruiser@18.7.2",
  entry:"src/sample-domain/api.mjs",
  modules:[
    "src/sample-domain/api.mjs",
    "src/sample-domain/catalog.mjs",
    "src/sample-domain/ledger.mjs",
    "src/sample-domain/notice.mjs"
  ],
  edges:[
    ["src/sample-domain/api.mjs","src/sample-domain/catalog.mjs"],
    ["src/sample-domain/api.mjs","src/sample-domain/ledger.mjs"],
    ["src/sample-domain/ledger.mjs","src/sample-domain/notice.mjs"]
  ],
  limitation:"A static import dependency is not proof of correctness, deployed behavior, data safety or real-world causation.",
  status:"example_expectation_build_checked"
}
