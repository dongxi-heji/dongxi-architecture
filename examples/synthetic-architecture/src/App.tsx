import {lazy,Suspense,useState} from 'react'
import {fixture,selectItem,readRelationLens,readRelationContract} from './fixture.mjs'
import {expectedAnalysis} from './analysis-readout.mjs'

const Diagram = lazy(()=>import('./LikeC4Canvas').then(mod=>({default:mod.LikeC4Canvas})))
type Selection={kind:'resolved';type:'node'|'relation';id:string}|{kind:'unbound';reason:string}
type Lens='causation'|'meaning'|'association'|'constitution'|'implication'
const modes:[Lens,string][]=[
 ['causation','Causation'],['meaning','Meaning'],['association','Association'],
 ['constitution','Constitution'],['implication','Implication']
]
export function App() {
 const [selected,setSelected]=useState('demo_reserve')
 const [reading,setReading]=useState<Lens>('association')
 const [warning,setWarning]=useState('')
 const item=selectItem(selected)
 const isRelation=fixture.relations.some(x=>x.id===selected)
 const contract=isRelation?readRelationContract(selected):null
 const lensText=isRelation?readRelationLens(selected,reading):null
 function accept(result:Selection){
  if(result.kind==='resolved'){setSelected(result.id);setWarning('')}
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
