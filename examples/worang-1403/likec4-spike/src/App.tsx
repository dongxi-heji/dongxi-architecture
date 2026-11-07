import { useState } from 'react'
import { ReactLikeC4 } from 'likec4:react'
import { caseData, findItem, lensReading } from '../../case.mjs'
import { analyzerReadout, toolReadingFor } from '../../analysis-readout.mjs'
import { resolveLikeC4Node, resolveLikeC4Edge } from './bridge.mjs'

const lenses = [
  { id: 'causation', name: '因果', question: '什么真实作用改变了什么？' },
  { id: 'meaning', name: '意义', question: '对谁、在什么处境中成为什么？' },
  { id: 'association', name: '关联', question: '哪些对象建立了什么联系？' },
  { id: 'constitution', name: '构成', question: '哪些部分与关系共同构成整体？' },
  { id: 'implication', name: '蕴含', question: '前提能推出什么、不能推出什么？' },
] as const

type Lens = (typeof lenses)[number]['id']
type Resolved = { kind: 'resolved'; id: string; type: 'node' | 'relation' }
type Unbound = { kind: 'unbound'; reason: string; value?: string; count?: number | null }
type Resolution = Resolved | Unbound
type CaseItem = { id: string; label: string; detail: string; refs: string[]; standing?: string }
type Assessment = { target: string; claim: string; status: string; criterion: string; method: string; boundary: string }
type ToolReading = {
  status: string; text: string; boundary?: string; tool?: string; scope?: string; directImports?: string[];
}

const standingLabels: Record<string,string> = {
  planned: '设计目标／未证实实现',
  'source-implemented': '源码中可定位',
  'tested-locally': '已有局部测试（非生产验收）',
}

export function App() {
  const [selected, setSelected] = useState<string>('r-ownership')
  const [lens, setLens] = useState<Lens>('association')
  const [unbound, setUnbound] = useState<string | null>(null)

  function accept(resolution: Resolution) {
    if (resolution.kind === 'resolved') {
      setSelected(resolution.id)
      setUnbound(null)
    } else {
      setUnbound('当前图形无法唯一对应原始软件对象：' + resolution.reason)
    }
  }

  const item = findItem(selected) as CaseItem | null
  const assessment = caseData.assessments.find((x: Assessment) => x.target === selected) as Assessment | undefined
  const tool = toolReadingFor(selected, caseData) as ToolReading | null
  const isRelation = selected.startsWith('r-')
  const lensText = isRelation
    ? lensReading(selected, lens)
    : '当前选择的是对象，而非特定关系。请选择关系连线以审问其因果、意义、关联、构成与蕴含。'

  return <div className="page">
    <header className="topbar">
      <div>
        <p className="eyebrow">东西 Architecture / 集成验收 / 只读</p>
        <h1>沃壤 #1403 · Work 与 Claim</h1>
        <p className="subtitle">用 LikeC4 操作真实架构投影，以现有关系 ID、来源和证据限定返回原对象</p>
      </div>
      <a href="https://github.com/dongxi-heji/dongxi-architecture/issues/3" target="_blank" rel="noopener noreferrer">工程 Issue #3</a>
    </header>
    <main className="workspace">
      <section className="canvas-panel" aria-label="交互式架构关系图">
        <div className="panel-head">
          <div>
            <h2>结构与责任</h2>
            <p>点击节点或关系查看依据；缩放和布局不改变设计 standing</p>
          </div>
          <span className="readonly">● 只读投影</span>
        </div>
        <div className="likec4-view" data-testid="likec4-view">
          <ReactLikeC4
            viewId="index"
            background="dots"
            pannable
            zoomable
            fitView
            keepAspectRatio={false}
            enableElementDetails={false}
            enableRelationshipDetails={false}
            enableRelationshipBrowser={false}
            enableFocusMode={false}
            onNodeClick={(node) => accept(resolveLikeC4Node(node, caseData) as Resolution)}
            onEdgeClick={(edge) => accept(resolveLikeC4Edge(edge, caseData) as Resolution)}
          />
        </div>
        {unbound && <p className="warning" role="status">{unbound}。保留上一个已确认对象，不提升事实强度。</p>}
        <div className="canvas-foot">
          <span>图形模型：LikeC4 1.60.0（试验依赖）</span>
          <span>事实来源：Worang @ {caseData.snapshot.commit.slice(0,12)}</span>
        </div>
      </section>
      <aside className="inspector" aria-label="对象、五镜与证据">
        <section className="panel">
          <p className="eyebrow">当前所指 · {isRelation ? '具名关系' : '对象'}</p>
          <h2 data-testid="selected-item">{item?.label ?? '未绑定对象'}</h2>
          <p className="identity" data-testid="selected-id">{selected}</p>
          <p>{item?.detail ?? '当前对象尚无来源事实。'}</p>
          {item?.standing && <span className={'standing ' + (item.standing === 'planned' ? 'is-planned' : '')}>{standingLabels[item.standing] ?? item.standing}</span>}
        </section>
        <section className="panel">
          <h2>五镜 · 读取同一条关系</h2>
          <div className="lens-tabs" role="group" aria-label="选择关系读取镜头">
            {lenses.map(x => <button
              key={x.id}
              type="button"
              aria-pressed={lens === x.id}
              onClick={() => setLens(x.id)}>
              {x.name}
            </button>)}
          </div>
          <h3>{lenses.find(x => x.id === lens)?.question}</h3>
          <p data-testid="lens-reading">{lensText}</p>
        </section>
        <section className="panel">
          <h2>专业检查与适用范围</h2>
          {tool
            ? <div data-testid="tool-reading">
                <p className="tool-version">{tool.tool ?? '检查结果不可用于本快照'}</p>
                <p>{tool.scope}</p>
                <p>{tool.text}</p>
                {tool.directImports?.length ? <ul>{tool.directImports.map(x=><li key={x}>{x}</li>)}</ul> : null}
                <p className="warning compact">{tool.boundary ?? '当前来源不符合核验条件。'}</p>
                <details><summary>复现命令</summary><code>{analyzerReadout.invocation}</code></details>
              </div>
            : <p>该对象没有对应的分析读数，不能推定通过或失败。</p>
          }
          {assessment && <div className="assessment">
              <h3>Claim / Assessment · {assessment.status}</h3>
              <p>{assessment.claim}</p>
              <p>判据：{assessment.criterion}</p>
              <p>方法：{assessment.method}</p>
              <p>边界：{assessment.boundary}</p>
          </div>}
        </section>
        <section className="panel">
          <h2>可追溯来源</h2>
          <div className="sources">
            {(item?.refs ?? []).filter((url: string)=>url.startsWith('https://github.com/dongxi-heji/')).map((url: string)=>
              <a key={url} href={url} target="_blank" rel="noopener noreferrer">{url}</a>)}
          </div>
        </section>
      </aside>
    </main>
    <footer>
      <span>⚠️ 当前视图不提供六角色 / Claim / Evidence 的无损承载；这些信息保留在案例侧栏。</span>
      <a href="../index.html">返回无依赖实验原型</a>
    </footer>
  </div>
}
