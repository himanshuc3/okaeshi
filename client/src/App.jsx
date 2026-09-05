import { useState } from 'react'
import { Alert, Avatar, Badge, Button, Card, Col, ConfigProvider, Input, Layout, List, Progress, Row, Segmented, Space, Statistic, Tag, Tooltip } from 'antd'
import { ArrowRight, ArrowUpRight, Bot, CheckCircle2, CircleDollarSign, Code2, GitBranch, HeartHandshake, Layers3, LayoutDashboard, Moon, Search, Settings2, ShieldCheck, Sparkles, Star, Sun, WalletCards, Zap } from 'lucide-react'
import './App.css'

const repositories = [
  { name: 'orbitkit', description: 'Developer tooling for distributed teams', lang: 'TypeScript', color: '#3178c6', deps: 18, health: 92, initials: 'O' },
  { name: 'starlight-ui', description: 'Accessible components for the web', lang: 'TypeScript', color: '#3178c6', deps: 11, health: 84, initials: 'S' },
  { name: 'papertrail', description: 'A tiny, thoughtful markdown engine', lang: 'Rust', color: '#dea584', deps: 7, health: 77, initials: 'P' },
]
const recommendations = [
  { rank: '01', name: 'openstatusHQ / openstatus', reason: 'Critical path dependency in 2 repositories', signal: 'High leverage', amount: '$500', icon: Layers3, tone: 'lime' },
  { rank: '02', name: 'sindresorhus / p-map', reason: 'Maintainer activity dropped 64% this year', signal: 'Maintenance gap', amount: '$250', icon: HeartHandshake, tone: 'peach' },
  { rank: '03', name: 'unjs / defu', reason: 'Small package, high weekly download velocity', signal: 'Ecosystem impact', amount: '$150', icon: Zap, tone: 'blue' },
]

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [activeView, setActiveView] = useState('Overview')
  const [selectedRepo, setSelectedRepo] = useState('orbitkit')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(false)

  return (
    <ConfigProvider theme={{ token: { colorPrimary: darkMode ? '#8bc6a7' : '#1f6b55', borderRadius: 8, fontFamily: 'DM Sans, sans-serif' } }}>
      {!hasStarted ? <main className={`welcome-shell ${darkMode ? 'theme-dark' : ''}`}>
        <section className="welcome-content">
          <div className="welcome-header">
            <div className="brand welcome-brand">okaeshi</div>
            <div className="welcome-actions">
              <Button className="star-button" href="https://github.com/entropea/okaeshi" target="_blank" icon={<Star size={15} />}>Star on GitHub</Button>
              <Tooltip title={darkMode ? 'Use light mode' : 'Use dark mode'}><Button className="theme-button" aria-label="Change color scheme" onClick={() => setDarkMode((value) => !value)} icon={darkMode ? <Sun size={17} /> : <Moon size={17} />} /></Tooltip>
            </div>
          </div>
          <h1>See where your code<br /><em>can give back.</em></h1>
          <form className="username-form" onSubmit={(event) => { event.preventDefault(); if (username.trim()) setHasStarted(true) }}>
            <div className="username-input-row"><Input id="github-username" size="large" prefix={<span className="input-prefix">github.com/</span>} placeholder="your-username" value={username} onChange={(event) => setUsername(event.target.value)} /><Button className="start-button" type="primary" size="large" htmlType="submit" disabled={!username.trim()} icon={<ArrowRight size={17} />} iconPosition="end">Analyze profile</Button></div>
            <div className="form-meta"><span className="form-note"><ShieldCheck size={13} /> Read-only analysis of public repositories</span><Button className="sample-button" type="link" onClick={() => { setUsername('entropea'); setHasStarted(true) }}>Try a sample</Button></div>
          </form>
        </section>
        <footer className="welcome-footer"><span>Built for maintainers and supporters</span><span className="footer-dot" /><span>Powered by GitHub data</span></footer>
      </main> : <Layout className={`app-shell ${darkMode ? 'theme-dark' : ''}`}>
        <Layout.Sider width={224} className="sidebar" breakpoint="lg" collapsedWidth="0">
          <div className="brand"><div className="brand-mark">o</div><span>okaeshi</span></div>
          <div className="workspace-label">WORKSPACE</div>
          <div className="workspace-switcher"><Code2 size={17} /><span>entropea</span><span className="chevron">⌄</span></div>
          <nav className="side-nav">{[[LayoutDashboard, 'Overview'], [GitBranch, 'Dependency map'], [CircleDollarSign, 'Support queue']].map(([Icon, label]) => <button className={activeView === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => setActiveView(label)}><Icon size={17} />{label}{label === 'Support queue' && <Badge count={3} size="small" />}</button>)}</nav>
          <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} />Settings</button><div className="connection"><span className="live-dot" />GitHub connected<div>Synced 8 min ago</div></div></div>
        </Layout.Sider>
        <Layout>
          <header className="topbar"><div><div className="eyebrow">{activeView === 'Overview' ? 'PORTFOLIO PULSE' : activeView.toUpperCase()}</div><h1>{activeView === 'Overview' ? `Good afternoon, ${username}` : activeView}</h1></div><Space size={12}><Input className="search" prefix={<Search size={16} />} placeholder="Search repos or packages" value={search} onChange={(event) => setSearch(event.target.value)} /><Tooltip title={darkMode ? 'Use light mode' : 'Use dark mode'}><Button className="theme-button dashboard-theme-button" type="text" aria-label="Change color scheme" onClick={() => setDarkMode((value) => !value)} icon={darkMode ? <Sun size={17} /> : <Moon size={17} />} /></Tooltip><Button className="avatar-button" type="text"><Avatar size={34} style={{ backgroundColor: '#c8e3d1', color: '#1f6b55' }}>{username.slice(0, 2).toUpperCase() || 'JD'}</Avatar></Button></Space></header>
          <main className="content">
            <Alert className="sync-alert" message={<span><strong>AI analysis is ready.</strong> We found 36 opportunities across your dependency graph.</span>} type="success" showIcon icon={<Sparkles size={16} />} action={<Button type="link" onClick={() => setToast(true)}>Review findings <ArrowUpRight size={14} /></Button>} />
            <Row gutter={[20, 20]} className="metric-row"><Col xs={24} sm={12} lg={6}><Card className="metric-card"><Statistic title="Repositories scanned" value={12} suffix="/ 12" /><div className="stat-note positive"><ArrowUpRight size={13} /> 100% coverage</div></Card></Col><Col xs={24} sm={12} lg={6}><Card className="metric-card"><Statistic title="Dependencies mapped" value={247} /><div className="stat-note positive"><ArrowUpRight size={13} /> 18 new this week</div></Card></Col><Col xs={24} sm={12} lg={6}><Card className="metric-card"><Statistic title="Potential impact" value="$4,850" /><div className="stat-note neutral"><Sparkles size={13} /> AI suggested support</div></Card></Col><Col xs={24} sm={12} lg={6}><Card className="metric-card highlight"><Statistic title="Ecosystem health" value={78} suffix="/100" /><Progress percent={78} showInfo={false} strokeColor="#e4a94b" trailColor="#f3e8d5" size="small" /></Card></Col></Row>
            <Row gutter={[20, 20]}><Col xs={24} xl={15}><Card className="panel dependency-panel" title={<div><div className="panel-title">Dependency landscape</div><div className="panel-subtitle">How your repositories connect to the open source ecosystem</div></div>} extra={<Segmented size="small" options={['Graph', 'Table']} defaultValue="Graph" />}><div className="graph-stage"><div className="graph-lines"><i /><i /><i /><i /><i /></div><div className="graph-node root-node"><Code2 size={20} /><strong>entropea</strong><small>12 repositories</small></div><div className="graph-node node-a"><span className="node-icon purple"><Code2 size={15} /></span><strong>orbitkit</strong><small>18 deps</small></div><div className="graph-node node-b"><span className="node-icon gold"><Layers3 size={15} /></span><strong>starlight-ui</strong><small>11 deps</small></div><div className="graph-node node-c"><span className="node-icon blue"><Zap size={15} /></span><strong>papertrail</strong><small>7 deps</small></div><div className="graph-node node-d"><span className="node-icon pink"><Bot size={15} /></span><strong>p-map</strong><small>used 3x</small></div><div className="graph-node node-e"><span className="node-icon green"><ShieldCheck size={15} /></span><strong>defu</strong><small>used 2x</small></div><div className="graph-legend"><span><i className="legend-dot repo" />Your repos</span><span><i className="legend-dot package" />Open source packages</span><span><i className="legend-dot signal" />Support signal</span></div></div></Card></Col><Col xs={24} xl={9}><Card className="panel" title={<div><div className="panel-title">AI support queue</div><div className="panel-subtitle">Ranked by reach, need, and actionability</div></div>} extra={<Tooltip title="Recommendations are recalculated daily"><Sparkles size={17} color="#d6922e" /></Tooltip>}><List className="recommendation-list" dataSource={recommendations} renderItem={(item) => { const Icon = item.icon; return <List.Item><div className={`recommendation-icon ${item.tone}`}><Icon size={17} /></div><div className="recommendation-copy"><div className="recommendation-name"><span>{item.rank}</span>{item.name}</div><div className="recommendation-reason">{item.reason}</div><Tag>{item.signal}</Tag></div><strong className="recommendation-amount">{item.amount}</strong></List.Item> }} /><Button block className="queue-button" onClick={() => setActiveView('Support queue')}>Open support queue <ArrowUpRight size={15} /></Button></Card></Col></Row>
            <Row gutter={[20, 20]} className="lower-row"><Col xs={24} xl={15}><Card className="panel repo-panel" title={<div><div className="panel-title">Your repositories</div><div className="panel-subtitle">Select a repository to inspect its support surface</div></div>} extra={<Button type="link">View all <ArrowUpRight size={14} /></Button>}><div className="repo-list">{repositories.filter((repo) => repo.name.includes(search.toLowerCase()) || !search).map((repo) => <button className={selectedRepo === repo.name ? 'repo-row selected' : 'repo-row'} key={repo.name} onClick={() => setSelectedRepo(repo.name)}><Avatar shape="square" size={38} style={{ backgroundColor: '#edf0eb', color: '#39735c' }}>{repo.initials}</Avatar><div className="repo-info"><strong>{repo.name}</strong><span>{repo.description}</span></div><span className="repo-lang"><i style={{ background: repo.color }} />{repo.lang}</span><span className="repo-deps">{repo.deps} deps</span><div className="health"><Progress percent={repo.health} showInfo={false} strokeColor={repo.health > 85 ? '#4b9875' : '#e4a94b'} size="small" /><small>{repo.health}%</small></div></button>)}</div></Card></Col><Col xs={24} xl={9}><Card className="panel wallet-panel" title={<div><div className="panel-title">Support wallet</div><div className="panel-subtitle">Verifiable on Solana</div></div>} extra={<WalletCards size={19} color="#39735c" />}><div className="wallet-balance"><span>Available to support</span><strong>◎ 1,240.00</strong><small>~ $185.60 USD</small></div><div className="wallet-footer"><span><CheckCircle2 size={15} /> Wallet verified</span><Button type="primary" size="small" onClick={() => setToast(true)}>Manage wallet</Button></div></Card><div className="privacy-note"><ShieldCheck size={15} /> Impact signals are sourced from public GitHub activity.</div></Col></Row>
            {toast && <div className="toast"><CheckCircle2 size={16} /> Findings marked for review <button onClick={() => setToast(false)}>Dismiss</button></div>}
          </main>
        </Layout>
      </Layout>}
    </ConfigProvider>
  )
}

export default App
