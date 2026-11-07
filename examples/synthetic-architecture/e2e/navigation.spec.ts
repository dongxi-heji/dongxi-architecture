import {test,expect} from '@playwright/test'

test('fictional LikeC4 node selection preserves source identity across reading modes',async({page})=>{
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto('/')
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope',{timeout:20000})
 await expect(page.getByTestId('reality-assessment')).toContainText('equal-content-in-scope')
 await expect(page.getByTestId('source-check-window')).toContainText('equal-at-observation-points')
 await expect(page.getByTestId('source-check-window')).toContainText('not an atomic snapshot')
 const node=page.locator('.react-flow__node').filter({hasText:'Loan API'}).first()
 await expect(node).toBeVisible({timeout:30000})
 await node.click()
 await expect(page.getByTestId('selected-id')).toHaveText('api')
 await page.getByRole('button',{name:'Meaning',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText('api')
 await page.getByRole('button',{name:'Constitution',exact:true}).click()
 await expect(page.getByTestId('source-kind')).toContainText('original_synthetic')
 expect(errors).toEqual([])
})

test('real visual edge click resolves an invented relation and remains stable across readings',async({page})=>{
 await page.setViewportSize({width:1600,height:1100})
 await page.goto('/')
 const diagram=page.locator('.diagram')
 await diagram.scrollIntoViewIfNeeded()
 const paths=page.locator('.react-flow__edge .react-flow__edge-interaction')
 await expect(paths.first()).toBeAttached({timeout:30000})
 // Inspect ALL displayed SVG edges rather than assuming the first generated
 // edge is inside the visible clipped canvas. This remains an actual mouse click.
 const candidates=await paths.evaluateAll(elements=>{
  const hits:Array<{x:number;y:number;hit:boolean;index:number}>=[]
  for(const [index,item] of elements.entries()){
   const element=item as SVGPathElement
   const m=element.getScreenCTM()
   if(!m)continue
   const own=element.closest('.react-flow__edge')
   const root=element.getRootNode() as ShadowRoot|Document
   const len=element.getTotalLength()
   for(const f of [0.1,0.18,0.26,0.38,0.5,0.62,0.74,0.82,0.9]){
    const p=element.getPointAtLength(len*f)
    const x=m.a*p.x+m.c*p.y+m.e,y=m.b*p.x+m.d*p.y+m.f
    if(x<0||y<0||x>=innerWidth||y>=innerHeight)continue
    const target=root.elementFromPoint(x,y)
    if(target?.closest('.react-flow__edge')===own){
     hits.push({x,y,hit:true,index})
     break
    }
   }
  }
  return hits
 })
 const point=candidates.find(c=>c.hit)
 if(!point)throw Error('No visible edge interaction surface: '+JSON.stringify(candidates))
 await page.mouse.click(point.x,point.y)
 await expect(page.getByTestId('selected-id')).toHaveText(/^demo_/)
 const sourceId=await page.getByTestId('selected-id').textContent()
 await page.getByRole('button',{name:'Implication',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText(sourceId??'')
 if(sourceId==='demo_lookup'||sourceId==='demo_reserve')
   await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope')
 else await expect(page.getByTestId('reality-assessment')).toContainText('No check exists')
 await expect(page.getByTestId('relation-contract')).toBeVisible()
 await expect(page.getByTestId('reading')).not.toContainText('Select a relation')
 await page.getByRole('button',{name:'Causation',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText(sourceId??'')
 await expect(page.getByTestId('reading')).not.toContainText('Select a relation')
 await expect(page.getByTestId('source-kind')).toContainText('original_synthetic')
})


test('public demo does not fetch code or assets from an external origin',async({page})=>{
 const external:string[]=[]
 page.on('request',request=>{
  const url=request.url()
  if(/^https?:\/\//.test(url) && !url.startsWith('http://127.0.0.1:5173/'))external.push(url)
 })
 await page.goto('/')
 await expect(page.getByTestId('source-kind')).toContainText('original_synthetic')
 await expect(page.locator('.react-flow__node').first()).toBeVisible({timeout:30000})
 await page.getByRole('button',{name:'Association',exact:true}).click()
 await expect(page.getByTestId('lens-question')).toContainText('Which things')
 expect(external).toEqual([])
})


test('a real same-origin UI click reruns both pinned tools and rebinds the same relation',async({page})=>{
 const external:string[]=[]
 page.on('request',request=>{
  const url=request.url()
  if(/^https?:\/\//.test(url)&&!url.startsWith('http://127.0.0.1:5173/'))external.push(url)
 })
 await page.goto('/')
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope')
 const promise=page.waitForResponse(response=>
   response.url().endsWith('/api/reality/recheck')&&response.request().method()==='POST'
 )
 await page.getByTestId('recheck-source').click()
 await expect(page.getByTestId('recheck-phase')).toContainText('Previous result cleared.')
 const response=await promise
 expect(response.status()).toBe(200)
 const data=await response.json()
 expect(data.contract).toBe('dongxi.reality-refresh/v0')
 expect(data.status).toBe('rechecked')
 expect(data.readout.toolRuns).toHaveLength(2)
 expect(data.readout.toolRuns.map((run:{status:string})=>run.status)).toEqual(['passed','passed'])
 await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope')
 await expect(page.getByTestId('recheck-phase')).toContainText('Freshly rechecked')
 await page.getByRole('button',{name:'Meaning',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 expect(external).toEqual([])
})

test('failed recheck clears prior support and reports Open without changing source identity',async({page})=>{
 await page.goto('/')
 await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope')
 await page.route('**/api/reality/recheck',async route=>{
  await route.fulfill({
   status:503,contentType:'application/json',
   body:JSON.stringify({contract:'dongxi.reality-refresh/v0',status:'open',reason:'reanalysis_unavailable'})
  })
 })
 await page.getByTestId('recheck-source').click()
 await expect(page.getByTestId('recheck-phase')).toContainText('Open: fresh check unavailable')
 await expect(page.getByTestId('reality-assessment')).toContainText('Open: local_reanalysis_unavailable')
 await expect(page.getByTestId('reality-status')).toHaveCount(0)
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
});


test('source selection shows original fictional code without changing relation or lens identity',async({page})=>{
 const external:string[]=[]
 page.on('request',request=>{
  if(/^https?:\/\//.test(request.url())&&!request.url().startsWith('http://127.0.0.1:5173/'))
   external.push(request.url())
 })
 await page.goto('/')
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 await page.getByTestId('inspect-source-ledger').click()
 await expect(page.getByTestId('source-locator')).toContainText('src/sample-domain/ledger.mjs')
 await expect(page.getByTestId('source-text')).toContainText('export function recordLoan')
 await page.getByRole('button',{name:'Constitution',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 await expect(page.getByTestId('source-text')).toContainText('createNotice')
 const actual=page.waitForResponse(res=>res.url().endsWith('/api/reality/recheck')&&res.status()===200)
 await page.getByTestId('recheck-source').click()
 await actual
 await expect(page.getByTestId('reality-status')).toHaveText('supported-in-scope')
 await expect(page.getByTestId('source-locator')).toContainText('ledger.mjs')
 expect(external).toEqual([])
})
