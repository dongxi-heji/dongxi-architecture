import test from "node:test";
import assert from "node:assert/strict";
import {fixture} from "./fixture.mjs";
import {resolveNode,resolveEdge} from "./bridge.mjs";
test("node display title changes do not change source identity",()=>{
 assert.deepEqual(resolveNode({modelRef:"api",title:"different"},fixture),{kind:"resolved",type:"node",id:"api"});
 assert.equal(resolveNode({id:"missing"},fixture).kind,"unbound");
});
test("one attributed visual edge resolves exactly one fictional domain relation",()=>{
 const r=fixture.relations[2];
 assert.deepEqual(resolveEdge({source:r.from,target:r.to,label:r.label,relations:["a"]},fixture),
 {kind:"resolved",type:"relation",id:r.id});
});
test("merged/unattributed/renamed edges fail closed",()=>{
 const r=fixture.relations[0],base={source:r.from,target:r.to,label:r.label};
 for(const attrs of [{relations:[]},{relations:["a","b"]},{relations:["a"],label:"wrong"}])
  assert.equal(resolveEdge({...base,...attrs},fixture).kind,"unbound");
});
test("reading a view never mutates the source fixture",()=>{
 const original=JSON.stringify(fixture);
 resolveEdge({source:"api",target:"ledger",label:"records an imaginary reservation",relations:["a"]},fixture);
 assert.equal(JSON.stringify(fixture),original);
});
