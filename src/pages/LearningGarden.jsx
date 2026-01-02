import './LearningGarden.css'

function LearningGarden() {
  return (
    <div className="container learning-garden">
      <main className="learning-garden-main">
        <div className="learning-garden-header">
          <h1 className="learning-garden-title">Learning Garden</h1>
          <p className="learning-garden-subtitle">Nurture your knowledge and watch it grow</p>
        </div>
        <div className="learning-garden-content">
          <div className="empty-state">
            <div className="empty-state-icon">🌱</div>
            <p className="empty-state-text">Learning Garden coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LearningGarden

