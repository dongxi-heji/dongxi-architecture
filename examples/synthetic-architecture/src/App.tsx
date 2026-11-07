import {lazy,Suspense,useEffect,useRef,useState} from 'react'
import {fixture,selectItem,readRelationLens,readRelationContract} from './fixture.mjs'
import {expectedAnalysis} from './analysis-readout.mjs'
import {listPublicSources} from './source-reading.mjs'
import {publicSourceSnapshots} from './source-snapshots'

const Diagram = lazy(()=>import('./LikeC4Canvas').then(mod=>({default:mod.LikeC4Canvas})))
type Selection={kind:'resolved';type:'node'|'relation';id:string}|{kind:'unbound';reason:string}
type ScopedAssessment = {
 result:string;reason:string;sourceStanding:string;scopeEquivalence:string;
 sameRevision:boolean;authorityUnchanged:boolean;changedScope:string[];
 unknownScope:string[];boundary:string;checkReadings:Array<{criterionId:string;status:string;method:string;evidenceRef:string|null}>;
}
type RealityReadout = {
 contract:string;sourceKind:string;sourceRevision:string;mode:string;
 assessments:Record<string,ScopedAssessment>;
 toolRuns:Array<{method:string;status:string;command:string;evidenceRef:string|null}>;
}
type PublicSourceChoice=Readonly<{id:string;path:string;digest:string;kind:string}>
type Lens='causation'|'meaning'|'association'|'constitution'|'implication'
const modes:[Lens,string][]=[
 ['causation','Causation'],['meaning','Meaning'],['association','Association'],
 ['constitution','Constitution'],['implication','Implication']
]
export function App() {
 const [selected,setSelected]=useState('demo_reserve')
 const [reading,setReading]=useState<Lens>('association')
 const [warning,setWarning]=useState('')
 const [reality,setReality]=useState<RealityReadout|null>(null)
 const [realityError,setRealityError]=useState<string|null>(null)
 const initialReadoutRequest=useRef<AbortController|null>(null)
 const [sourceSelection,setSourceSelection]=useState<string|null>(null)
 const [recheckPhase,setRecheckPhase]=useState<'idle'|'checking'|'rechecked'|'open'>('idle')
 const [recheckedAt,setRecheckedAt]=useState<string|null>(null)
 useEffect(()=>{
  let mounted=true
  const controller=new AbortController()
  initialReadoutRequest.current=controller
  fetch('/reality-readout.json',{cache:'no-store',signal:controller.signal})
   .then(response=>{if(!response.ok)throw Error('evidence_not_generated');return response.json()})
   .then((data:RealityReadout)=>{
    if(data.contract!=='dongxi.reality-replay/v0'||data.sourceKind!=='original_synthetic')
      throw Error('unbound_evidence_contract')
    if(mounted&&!controller.signal.aborted)setReality(data)
   })
   .catch(error=>{
     if(mounted&&!controller.signal.aborted)
       setRealityError(error instanceof Error?error.message:'unavailable')
   })
  return ()=>{mounted=false;controller.abort()}
 },[])
 const item=selectItem(selected)
 const isRelation=fixture.relations.some(x=>x.id===selected)
 const contract=isRelation?readRelationContract(selected):null
 const lensText=isRelation?readRelationLens(selected,reading):null
 const scopedReading=reality?.assessments?.[selected]??null
 const sourceChoices:PublicSourceChoice[]=listPublicSources(selected)
 const chosenSource=sourceChoices.find(source=>source.id===sourceSelection)??null
 async function recheckSource() {
  if(recheckPhase==='checking')return
  initialReadoutRequest.current?.abort()
  setRecheckPhase('checking')
  // Never present cached success as the current result while a new test runs.
  setReality(null)
  setRealityError(null)
  setRecheckedAt(null)
  try{
    const response=await fetch('/api/reality/recheck',{method:'POST',cache:'no-store'})
    if(!response.ok)throw Error('local_recheck_unavailable')
    const data=await response.json()
    if(data.contract!=='dongxi.reality-refresh/v0'||data.status!=='rechecked'||
       data.readout?.contract!=='dongxi.reality-replay/v0'||
       data.readout?.sourceKind!=='original_synthetic'||
       typeof data.recheckedAt!=='string')
      throw Error('unbound_recheck_response')
    setReality(data.readout as RealityReadout)
    setRecheckedAt(data.recheckedAt)
    setRecheckPhase('rechecked')
  }catch{
    setReality(null)
    setRealityError('local_reanalysis_unavailable; previous evidence cleared')
    setRecheckPhase('open')
  }
 }
 function accept(result:Selection){
  if(result.kind==='resolved'){setSelected(result.id);setWarning('');setSourceSelection(null)}
  else setWarning('This visual shape does not uniquely identify a source relation: '+result.reason)
 }
 return <div className="app">
  <header className="header">
   <div><p className="kicker">ARCHITECTURE / OPEN DEMO / SYNTHETIC DATA</p>
   <h1>Neighborhood library — invented system</h1>
   <p className="sub">Explore a fictional software architecture without accessing any private project.</p></div>
   <span className="tag">No external source access</span>
  </header>
  <div className="layout">
   <main className="graph card">
    <div className="card-head"><h2>Interactive model</h2><span className="label">LikeC4 view</span></div>
    <p className="hint">Select a diagram node or edge to navigate back to the original synthetic identity.</p>
    <div className="diagram" data-testid="diagram">
     <Suspense fallback={<p className="loading">Loading the optional diagram engine… the reading panel is available separately.</p>}>
      <Diagram onSelect={accept}/>
     </Suspense>
    </div>
    {warning&&<p role="status" className="alert">{warning}. The previous confirmed selection is retained.</p>}
    <p className="footnote">A rendered line is a view; merged or unattributed lines are not promoted into domain facts.</p>
   </main>
   <aside className="inspector">
    <section className="card">
     <p className="kicker">{isRelation?'RELATION':'COMPONENT'} · SOURCE-BOUND ID</p>
     <h2 data-testid="selected-label">{item?.label??'No source item'}</h2>
     <code data-testid="selected-id">{selected}</code>
     <p>{item?.detail??'The selected element has no modeled source.'}</p>
     <p className="tag muted">invented illustration, no production standing</p>
     {contract&&<div data-testid="relation-contract" className="relation-contract">
       <p><strong>Establishment:</strong> {contract.establishment}</p>
       <p><strong>Effect (limited):</strong> {contract.effect}</p>
       <p><strong>Standing:</strong> {contract.standing==='synthetic_code_checked'?'source-and-local-test in fictional sample':'diagram-only intention'}</p>
     </div>}
    </section>
    <section className="card" aria-label="Selected source locator">
     <h2>Source locator · public sample only</h2>
     {sourceChoices.length
       ? <>
           <p className="hint">These files are independently invented and were bundled with this demo. Select a file to inspect its actual source snapshot; press Re-check to compare the current checkout.</p>
           <div className="source-options">
             {sourceChoices.map(source=>
               <button type="button" key={source.id} data-testid={'inspect-source-'+source.id}
                 aria-pressed={sourceSelection===source.id}
                 onClick={()=>setSourceSelection(source.id)}>
                 {source.id}
               </button>)}
           </div>
           {chosenSource&&<div className="source-view">
             <p data-testid="source-locator"><strong>{chosenSource.path}</strong></p>
             <p className="hint">Bundled public source snapshot · not a live file read and not a private source</p>
             <pre data-testid="source-text"><code>{publicSourceSnapshots[chosenSource.id]??'Source snapshot not available'}</code></pre>
           </div>}
         </>
       : <p className="hint">No checked source-file binding exists for this illustrated relation. A diagram edge is not sufficient evidence.</p>}
    </section>
    <section className="card">
     <h2>Five lenses · same relation</h2>
     <div className="tabs" aria-label="Reading mode">
       {modes.map(([key,name])=><button key={key} type="button" aria-pressed={reading===key} onClick={()=>setReading(key)}>{name}</button>)}
     </div>
     <h3 data-testid="lens-question">{fixture.lensQuestions[reading]}</h3>
     <p data-testid="reading">{lensText??'Select a relation in the diagram to read this lens in its own context. A node has no automatic relation claim.'}</p>
     <p className="hint">Changing the reading does not change the selected source identity or create evidence.</p>
    </section>
    <section className="card">
     <h2>Professional analysis boundary</h2>
     <p className="tool" data-testid="analysis">{expectedAnalysis.tool}</p>
     <p>Expected synthetic import graph: {expectedAnalysis.modules.length} modules, {expectedAnalysis.edges.length} local imports.</p>
     <p>Run <code>npm run analyze</code> to actually check this checkout with dependency-cruiser; CI executes it during every build.</p>
     <p className="alert">{expectedAnalysis.limitation}</p>
    </section>
    <section className="card" aria-label="Source-bound verification">
     <h2>Reality connection · bounded evidence</h2>
     {import.meta.env.DEV&&<div className="recheck-controls">
       <button type="button" data-testid="recheck-source" disabled={recheckPhase==='checking'}
         onClick={recheckSource}>
         {recheckPhase==='checking'?'Checking local source…':'Re-check source and evidence'}
       </button>
       <p role="status" data-testid="recheck-phase">
         {recheckPhase==='checking'
           ? 'Previous result cleared. Running pinned local tools for this synthetic checkout.'
           :recheckPhase==='rechecked'
             ? 'Freshly rechecked at '+recheckedAt+'. Original relation identity and standing retained.'
             :recheckPhase==='open'
               ? 'Open: fresh check unavailable. Previous support is not reused.'
               :'Use this action to rerun the bounded source checks without changing the selected relation.'}
       </p>
     </div>}
     {scopedReading
       ? <div data-testid="reality-assessment">
           <p><strong data-testid="reality-status">{scopedReading.result}</strong> — {scopedReading.reason}</p>
           <p>Content comparison: {scopedReading.scopeEquivalence}. Original relation standing: {scopedReading.sourceStanding}.</p>
           {scopedReading.checkReadings.map(check=>
             <p key={check.criterionId}>{check.criterionId}: <strong>{check.status}</strong> via {check.method}</p>)}
           <p className="hint">Source revision: {reality?.sourceRevision}. The reading was last captured at {recheckedAt?'the explicitly requested recheck':'build / dev-server start'}; it is not continuously monitored.</p>
           <p className="alert">{scopedReading.boundary}</p>
         </div>
       : <p data-testid="reality-assessment">{realityError
            ? 'Open: '+realityError+'. Run npm run reality:write against this synthetic checkout.'
            : reality?'No check exists for this illustrative relation; no verification is inferred.'
              :'Awaiting bounded local source evidence…'}</p>}
    </section>
    <section className="card">
     <h2>Only synthetic sources</h2>
     <p data-testid="source-kind">{fixture.source.kind} · {fixture.source.revision}</p>
     <p className="hint">Source: <code>src/fixture.mjs</code> and <code>src/sample-domain/</code>. No private project reference or external runtime data.</p>
    </section>
   </aside>
  </div>
  <footer>All project names, components, relationships and examples on this page are fictional. It is a technical integration fixture, not a statement about any operational system.</footer>
 </div>
}
