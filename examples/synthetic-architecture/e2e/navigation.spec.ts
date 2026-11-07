import {test,expect} from '@playwright/test'

test('fictional LikeC4 node selection preserves source identity across reading modes',async({page})=>{
 const errors:string[]=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto('/')
 await expect(page.getByTestId('selected-id')).toHaveText('demo_reserve')
 const node=page.locator('.react-flow__node').filter({hasText:'Loan API'}).first()
 await expect(node).toBeVisible({timeout:30000})
 await node.click()
 await expect(page.getByTestId('selected-id')).toHaveText('api')
 await page.getByRole('button',{name:'Evidence',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText('api')
 await page.getByRole('button',{name:'Change',exact:true}).click()
 await expect(page.getByTestId('source-kind')).toContainText('original_synthetic')
 expect(errors).toEqual([])
})

test('real visual edge click resolves an invented relation and remains stable across readings',async({page})=>{
 await page.goto('/')
 const paths=page.locator('.react-flow__edge .react-flow__edge-interaction')
 await expect(paths.first()).toBeAttached({timeout:30000})
 const candidates=await paths.first().evaluate((element:SVGPathElement)=>{
  const m=element.getScreenCTM()
  if(!m)throw Error('edge missing screen transform')
  const own=element.closest('.react-flow__edge')
  const root=element.getRootNode() as ShadowRoot|Document
  const len=element.getTotalLength()
  return [0.12,0.2,0.28,0.38,0.62,0.72,0.8,0.88].map(f=>{
   const p=element.getPointAtLength(len*f)
   const x=m.a*p.x+m.c*p.y+m.e,y=m.b*p.x+m.d*p.y+m.f
   const hit=root.elementFromPoint(x,y)
   return {x,y,hit:hit?.closest('.react-flow__edge')===own}
  })
 })
 const point=candidates.find(c=>c.hit)
 if(!point)throw Error('No visible edge interaction surface: '+JSON.stringify(candidates))
 await page.mouse.click(point.x,point.y)
 await expect(page.getByTestId('selected-id')).toHaveText(/^demo_/)
 const sourceId=await page.getByTestId('selected-id').textContent()
 await page.getByRole('button',{name:'Uncertainty',exact:true}).click()
 await expect(page.getByTestId('selected-id')).toHaveText(sourceId??'')
 await expect(page.getByTestId('source-kind')).toContainText('original_synthetic')
})
