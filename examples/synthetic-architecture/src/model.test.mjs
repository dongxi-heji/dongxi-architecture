import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fixture} from "./fixture.mjs";
import {renderModel} from "../scripts/generate-model.mjs";
test("the displayed DSL is exactly reproducible from independently authored public data",()=>{
 assert.equal(readFileSync(new URL("./model.c4",import.meta.url),"utf8"),renderModel(fixture));
});
test("renaming a source object changes the generated diagram and catches drift",()=>{
 const changed=structuredClone(fixture);changed.nodes[0].label="New Reader App";
 assert.notEqual(renderModel(changed),renderModel(fixture));
});
test("invalid source names fail instead of being injected into the DSL",()=>{
 const changed=structuredClone(fixture);changed.nodes[0].label="can't inject";
 assert.throws(()=>renderModel(changed),/unsafe_likec4_text/);
});
