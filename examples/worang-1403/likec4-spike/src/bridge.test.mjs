import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { caseData } from '../../case.mjs'
import { resolveLikeC4Node, resolveLikeC4Edge, auditLikeC4DSL } from './bridge.mjs'

const source=readFileSync(new URL('./model.c4',import.meta.url),'utf8')
test('LikeC4 model is an exact, uniquely mapped projection of the existing case',()=>{
  assert.deepEqual(auditLikeC4DSL(caseData,source),[])
})
test('node selection recovers source-bound identity, not display title',()=>{
  assert.deepEqual(resolveLikeC4Node({id:'claim',modelRef:'claim',title:'Renamed display title'},caseData),{
    kind:'resolved',id:'claim',type:'node'
  })
  assert.equal(resolveLikeC4Node({id:'phantom',modelRef:'phantom'},caseData).kind,'unbound')
})
test('single visual relationship can map by exact endpoints and label',()=>{
  const rel=caseData.relations.find(x=>x.id==='r-ownership')
  const result=resolveLikeC4Edge({source:rel.from,target:rel.to,label:rel.label,relations:['likec4-generated-id']},caseData)
  assert.deepEqual(result,{kind:'resolved',id:'r-ownership',type:'relation'})
})
test('merged, unattributed or changed visual edges fail closed',()=>{
  const rel=caseData.relations.find(x=>x.id==='r-ownership')
  const base={source:rel.from,target:rel.to,label:rel.label}
  assert.equal(resolveLikeC4Edge({...base,relations:['a','b']},caseData).kind,'unbound')
  assert.equal(resolveLikeC4Edge({...base,relations:[]},caseData).kind,'unbound')
  assert.equal(resolveLikeC4Edge({...base,relations:['x'],label:'renamed'},caseData).kind,'unbound')
})
test('underlying case relation stays unchanged regardless of how diagram renders',()=>{
  const initial=JSON.stringify(caseData.relations)
  resolveLikeC4Edge({source:'hive',target:'claim',label:'事务性建立 Claim',relations:['x']},caseData)
  assert.equal(JSON.stringify(caseData.relations),initial)
})
