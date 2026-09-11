import { useState } from 'react'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Dropdown,
  Input,
  Layout,
  List,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Tag,
  Tooltip,
} from 'antd'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Code2,
  GitBranch,
  HeartHandshake,
  Layers3,
  LayoutDashboard,
  Moon,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
} from 'lucide-react'
import './App.css'

const languageColors = {
  JavaScript: '#f1d84b',
  TypeScript: '#3178c6',
  Rust: '#dea584',
  Python: '#3776ab',
  Go: '#00add8',
  Java: '#b07219',
}

function normalizeAnalysis(payload) {
  const repositories = Array.isArray(payload.repositories) ? payload.repositories : []
  const dependencyGraphs = Array.isArray(payload.dependencyGraphs) ? payload.dependencyGraphs : []
  const dependencyCounts = new Map()

  dependencyGraphs.forEach((graph) => {
    ;(graph.manifests || []).forEach((manifest) => {
      ;(manifest.dependencies?.nodes || []).forEach((dependency) => {
        if (!dependency.packageName) return
        const existing = dependencyCounts.get(dependency.packageName) || {
          ...dependency,
          count: 0,
          repositories: new Set(),
        }
        existing.repositories.add(graph.repository)
        existing.count = existing.repositories.size
        dependencyCounts.set(dependency.packageName, existing)
      })
    })
  })

  const dependencies = [...dependencyCounts.values()].sort((a, b) => b.count - a.count)
  const mappedRepositories = repositories.map((repo) => ({
    ...repo,
    deps:
      dependencyGraphs
        .find((graph) => graph.repository === repo.name)
        ?.manifests?.reduce(
          (total, manifest) => total + (manifest.dependencies?.nodes?.length || 0),
          0,
        ) || 0,
    health: repo.archived ? 52 : repo.disabled ? 35 : 78,
    initials: repo.name.slice(0, 1).toUpperCase(),
    color: languageColors[repo.language] || '#7f9b8c',
  }))

  return { user: payload.user || {}, repositories: mappedRepositories, dependencies }
}

function App() {
  const [hasStarted, setHasStarted] = useState(false)
  const [username, setUsername] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [activeView, setActiveView] = useState('Overview')
  const [selectedRepo, setSelectedRepo] = useState('orbitkit')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  console.log('app')

  const runAnalysis = async (value) => {
    const requestedUsername = value.trim()
    if (!requestedUsername) return
    setLoading(true)
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(
        `${apiUrl}/analyze?username=${encodeURIComponent(requestedUsername)}`,
      )
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to analyze this GitHub profile.')
      const normalized = normalizeAnalysis(payload)
      setAnalysis(normalized)
      setUsername(normalized.user.login || requestedUsername)
      setSelectedRepo(normalized.repositories[0]?.name || '')
      setHasStarted(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const user = analysis?.user || {}
  const repositories = analysis?.repositories || []
  const dependencies = analysis?.dependencies || []
  const filteredRepositories = repositories.filter(
    (repo) => repo.name.toLowerCase().includes(search.toLowerCase()) || !search,
  )
  const recommendations = dependencies.slice(0, 5).map((dependency, index) => ({
    ...dependency,
    rank: String(index + 1).padStart(2, '0'),
    name: dependency.repository?.nameWithOwner || dependency.packageName,
    reason: `Used across ${dependency.count} of your repositories`,
    signal: dependency.count > 2 ? 'High leverage' : 'Contribution opportunity',
    icon: dependency.count > 2 ? Layers3 : HeartHandshake,
    tone: index % 3 === 0 ? 'lime' : index % 3 === 1 ? 'peach' : 'blue',
  }))

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: darkMode ? '#8bc6a7' : '#1f6b55',
          borderRadius: 8,
          fontFamily: 'DM Sans, sans-serif',
        },
      }}
    >
      {!hasStarted ? (
        <main className={`welcome-shell ${darkMode ? 'theme-dark' : ''}`}>
          <section className="welcome-content">
            <div className="welcome-header">
              <div className="brand welcome-brand source-code-pro">OKAESHI</div>
              <div className="welcome-actions">
                <Space.Compact className="github-action-group">
                  <Button
                    className="github-star-button"
                    href="https://github.com/entropea/okaeshi"
                    target="_blank"
                    icon={<Star size={15} />}
                  >
                    Star
                  </Button>
                  <Dropdown
                    menu={{
                      className: darkMode
                        ? 'github-actions-menu github-actions-menu-dark'
                        : 'github-actions-menu',
                      items: [
                        {
                          key: 'theme',
                          icon: darkMode ? <Sun size={15} /> : <Moon size={15} />,
                          label: darkMode ? 'Use light mode' : 'Use dark mode',
                          onClick: () => setDarkMode((value) => !value),
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button
                      className="github-menu-button"
                      aria-label="Open more actions"
                      icon={<ChevronDown size={14} />}
                    />
                  </Dropdown>
                </Space.Compact>
              </div>
            </div>
            <h1>
              Find open-source projects where your <em>skills, time, or money</em> can make an
              impact.
            </h1>
            <form
              className="username-form"
              onSubmit={(event) => {
                event.preventDefault()
                runAnalysis(username)
              }}
            >
              <div className="username-input-row">
                <Input
                  id="github-username"
                  size="large"
                  prefix={<span className="input-prefix">github.com/</span>}
                  placeholder="your-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <Button
                  className="start-button"
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  disabled={!username.trim()}
                  icon={<ArrowRight size={17} />}
                  iconPosition="end"
                >
                  Analyze profile
                </Button>
              </div>
              <div className="form-meta">
                <span className="form-note">
                  <ShieldCheck size={13} /> Read-only analysis of public repositories
                </span>
                <Button
                  className="sample-button"
                  type="link"
                  onClick={() => {
                    setUsername('entropea')
                    runAnalysis('entropea')
                  }}
                >
                  Try a sample
                </Button>
              </div>
            </form>
            <section className="discovery-grid" aria-label="Ways to give back">
              <article className="discovery-card discovery-code">
                <div className="discovery-icon">
                  <Code2 size={18} />
                </div>
                <div>
                  <h2>Code</h2>
                  <p>Contribute your skills and time</p>
                </div>
              </article>
              <article className="discovery-card discovery-fund">
                <div className="discovery-icon">
                  <CircleDollarSign size={18} />
                </div>
                <div>
                  <h2>Fund</h2>
                  <p>Support projects with Solana</p>
                </div>
              </article>
              <article className="discovery-card discovery-match">
                <div className="discovery-icon">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h2>Match</h2>
                  <p>Get matched to the right projects</p>
                </div>
              </article>
            </section>
            {error && <Alert className="analysis-error" type="error" showIcon message={error} />}
          </section>
          <footer className="welcome-footer">
            <span>Built for maintainers and supporters</span>
            <span className="footer-dot" />
            <span>Powered by GitHub data</span>
          </footer>
        </main>
      ) : (
        <Layout className={`app-shell ${darkMode ? 'theme-dark' : ''}`}>
          <Layout.Sider width={224} className="sidebar" breakpoint="lg" collapsedWidth="0">
            <div className="brand">
              <span>okaeshi</span>
            </div>
            <div className="workspace-label">WORKSPACE</div>
            <div className="workspace-switcher">
              <Code2 size={17} />
              <span>{user.login || username}</span>
              <span className="chevron">⌄</span>
            </div>
            <nav className="side-nav">
              {[
                [LayoutDashboard, 'Overview'],
                [GitBranch, 'Dependency map'],
                [CircleDollarSign, 'Support queue'],
              ].map(([Icon, label]) => (
                <button
                  className={activeView === label ? 'nav-item active' : 'nav-item'}
                  key={label}
                  onClick={() => setActiveView(label)}
                >
                  <Icon size={17} />
                  {label}
                  {label === 'Support queue' && <Badge count={3} size="small" />}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <button className="nav-item">
                <Settings2 size={17} />
                Settings
              </button>
              <div className="connection">
                <span className="live-dot" />
                GitHub connected<div>Synced 8 min ago</div>
              </div>
            </div>
          </Layout.Sider>
          <Layout>
            <header className="topbar">
              <div>
                <div className="eyebrow">
                  {activeView === 'Overview' ? 'PORTFOLIO PULSE' : activeView.toUpperCase()}
                </div>
                <h1>
                  {activeView === 'Overview'
                    ? `Good afternoon, ${user.name || user.login || username}`
                    : activeView}
                </h1>
              </div>
              <Space size={12}>
                <Input
                  className="search"
                  prefix={<Search size={16} />}
                  placeholder="Search repos or packages"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Space.Compact className="github-action-group">
                  <Button
                    className="github-star-button"
                    href="https://github.com/entropea/okaeshi"
                    target="_blank"
                    icon={<Star size={15} />}
                  >
                    Star
                  </Button>
                  <Dropdown
                    menu={{
                      className: darkMode
                        ? 'github-actions-menu github-actions-menu-dark'
                        : 'github-actions-menu',
                      items: [
                        {
                          key: 'theme',
                          icon: darkMode ? <Sun size={15} /> : <Moon size={15} />,
                          label: darkMode ? 'Use light mode' : 'Use dark mode',
                          onClick: () => setDarkMode((value) => !value),
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <Button
                      className="github-menu-button"
                      aria-label="Open more actions"
                      icon={<ChevronDown size={14} />}
                    />
                  </Dropdown>
                </Space.Compact>
                <Button className="avatar-button" type="text">
                  <Avatar
                    src={user.avatar_url}
                    size={34}
                    style={{ backgroundColor: '#c8e3d1', color: '#1f6b55' }}
                  >
                    {(user.login || username).slice(0, 2).toUpperCase()}
                  </Avatar>
                </Button>
              </Space>
            </header>
            <main className="content">
              <Alert
                className="sync-alert"
                message={
                  <span>
                    <strong>Analysis is ready.</strong> We found {dependencies.length} dependency
                    signals across {repositories.length} repositories.
                  </span>
                }
                type="success"
                showIcon
                icon={<Sparkles size={16} />}
                action={
                  <Button type="link" onClick={() => setToast(true)}>
                    Review findings <ArrowUpRight size={14} />
                  </Button>
                }
              />
              <Row gutter={[20, 20]} className="metric-row">
                <Col xs={24} sm={12} lg={6}>
                  <Card className="metric-card">
                    <Statistic
                      title="Repositories scanned"
                      value={repositories.length}
                      suffix={` / ${user.public_repos || repositories.length}`}
                    />
                    <div className="stat-note positive">
                      <ArrowUpRight size={13} /> Public GitHub repos
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="metric-card">
                    <Statistic title="Dependencies mapped" value={dependencies.length} />
                    <div className="stat-note positive">
                      <ArrowUpRight size={13} /> Unique packages
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="metric-card">
                    <Statistic title="Contribution signals" value={recommendations.length} />
                    <div className="stat-note neutral">
                      <Sparkles size={13} /> Prioritized by usage
                    </div>
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card className="metric-card highlight">
                    <Statistic title="GitHub followers" value={user.followers || 0} />
                    <div className="stat-note neutral">
                      <HeartHandshake size={13} /> Community reach
                    </div>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[20, 20]}>
                <Col xs={24} xl={15}>
                  <Card
                    className="panel dependency-panel"
                    title={
                      <div>
                        <div className="panel-title">Dependency landscape</div>
                        <div className="panel-subtitle">
                          Packages shared across your repositories
                        </div>
                      </div>
                    }
                    extra={
                      <Segmented size="small" options={['Graph', 'Table']} defaultValue="Graph" />
                    }
                  >
                    <div className="graph-stage">
                      <div className="graph-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="graph-node root-node">
                        <Code2 size={20} />
                        <strong>{user.login || username}</strong>
                        <small>{repositories.length} repositories</small>
                      </div>
                      {recommendations.slice(0, 5).map((dependency, index) => (
                        <div
                          className={`graph-node node-${String.fromCharCode(97 + index)}`}
                          key={dependency.packageName}
                        >
                          <span
                            className={`node-icon ${['purple', 'gold', 'blue', 'pink', 'green'][index]}`}
                          >
                            <Layers3 size={15} />
                          </span>
                          <strong>{dependency.packageName}</strong>
                          <small>used {dependency.count}x</small>
                        </div>
                      ))}
                      <div className="graph-legend">
                        <span>
                          <i className="legend-dot repo" />
                          Your repos
                        </span>
                        <span>
                          <i className="legend-dot package" />
                          Open source packages
                        </span>
                        <span>
                          <i className="legend-dot signal" />
                          Contribution signal
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} xl={9}>
                  <Card
                    className="panel"
                    title={
                      <div>
                        <div className="panel-title">What to contribute to</div>
                        <div className="panel-subtitle">
                          Prioritized by how often your repos use them
                        </div>
                      </div>
                    }
                    extra={
                      <Tooltip title="Recommendations are based on dependency frequency">
                        <Sparkles size={17} color="#d6922e" />
                      </Tooltip>
                    }
                  >
                    <List
                      className="recommendation-list"
                      dataSource={recommendations}
                      locale={{ emptyText: 'No dependency signals found' }}
                      renderItem={(item) => {
                        const Icon = item.icon
                        return (
                          <List.Item>
                            <div className={`recommendation-icon ${item.tone}`}>
                              <Icon size={17} />
                            </div>
                            <div className="recommendation-copy">
                              <div className="recommendation-name">
                                <span>{item.rank}</span>
                                {item.name}
                              </div>
                              <div className="recommendation-reason">{item.reason}</div>
                              <Tag>{item.signal}</Tag>
                            </div>
                            <strong className="recommendation-amount">{item.count} repos</strong>
                          </List.Item>
                        )
                      }}
                    />
                    <Button block className="queue-button" onClick={() => setToast(true)}>
                      Mark recommendations for review <ArrowUpRight size={15} />
                    </Button>
                  </Card>
                </Col>
              </Row>
              <Row gutter={[20, 20]} className="lower-row">
                <Col xs={24} xl={15}>
                  <Card
                    className="panel repo-panel"
                    title={
                      <div>
                        <div className="panel-title">Your repositories</div>
                        <div className="panel-subtitle">
                          Select a repository to inspect its support surface
                        </div>
                      </div>
                    }
                    extra={<span className="repo-count">{repositories.length} total</span>}
                  >
                    <div className="repo-list">
                      {filteredRepositories.map((repo) => (
                        <button
                          className={selectedRepo === repo.name ? 'repo-row selected' : 'repo-row'}
                          key={repo.id || repo.name}
                          onClick={() => setSelectedRepo(repo.name)}
                        >
                          <Avatar
                            src={user.avatar_url}
                            shape="square"
                            size={38}
                            style={{ backgroundColor: '#edf0eb', color: '#39735c' }}
                          >
                            {repo.initials}
                          </Avatar>
                          <div className="repo-info">
                            <strong>{repo.name}</strong>
                            <span>{repo.description || 'No description provided'}</span>
                          </div>
                          <span className="repo-lang">
                            <i style={{ background: repo.color }} />
                            {repo.language || 'Unknown'}
                          </span>
                          <span className="repo-deps">{repo.deps} deps</span>
                          <div className="health">
                            <Progress
                              percent={repo.health}
                              showInfo={false}
                              strokeColor={repo.health > 85 ? '#4b9875' : '#e4a94b'}
                              size="small"
                            />
                            <small>{repo.health}%</small>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                </Col>
                <Col xs={24} xl={9}>
                  <Card
                    className="panel wallet-panel"
                    title={
                      <div>
                        <div className="panel-title">GitHub profile</div>
                        <div className="panel-subtitle">Public profile details</div>
                      </div>
                    }
                    extra={
                      <Avatar src={user.avatar_url} size={28}>
                        {(user.login || username).slice(0, 1).toUpperCase()}
                      </Avatar>
                    }
                  >
                    <div className="wallet-balance">
                      <span>{user.company || user.location || 'GitHub contributor'}</span>
                      <strong>{user.followers || 0} followers</strong>
                      <small>
                        {user.bio ||
                          `${user.public_repos || repositories.length} public repositories`}
                      </small>
                    </div>
                    <div className="wallet-footer">
                      <span>
                        <CheckCircle2 size={15} /> Profile analyzed
                      </span>
                      <Button type="primary" size="small" href={user.html_url} target="_blank">
                        View profile
                      </Button>
                    </div>
                  </Card>
                  <div className="privacy-note">
                    <ShieldCheck size={15} /> Signals are calculated from public GitHub activity.
                  </div>
                </Col>
              </Row>
              {toast && (
                <div className="toast">
                  <CheckCircle2 size={16} /> Findings marked for review{' '}
                  <button onClick={() => setToast(false)}>Dismiss</button>
                </div>
              )}
            </main>
          </Layout>
        </Layout>
      )}
    </ConfigProvider>
  )
}

export default App
