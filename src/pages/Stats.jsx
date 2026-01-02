import './Stats.css'

function Stats() {
  return (
    <div className="container stats">
      <main className="stats-main">
        <div className="stats-header">
          <h1 className="stats-title">Stats</h1>
          <p className="stats-subtitle">Track your learning progress and insights</p>
        </div>
        <div className="stats-content">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-text">Stats coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Stats

