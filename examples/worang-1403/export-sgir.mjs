#!/usr/bin/env node
// Exports a standalone *experimental* Worang SGIR v0.2 projection to stdout.
// Usage: node examples/worang-1403/export-sgir.mjs > /tmp/worang-case.ir.json
import {caseData} from "./case.mjs";
import {toWorangSGIRV02,identityAudit} from "../../src/adapters/worang-sgir-v02.mjs";
const graph=toWorangSGIRV02(caseData);
const errors=identityAudit(caseData,graph);
if(errors.length)throw new Error("identity_audit_failed:"+errors.join(","));
process.stdout.write(JSON.stringify(graph,null,2)+"\n");
