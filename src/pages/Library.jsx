import './Library.css'

function Library() {
  return (
    <div className="container library">
      <main className="library-main">
        <div className="library-header">
          <h1 className="library-title">Library</h1>
          <p className="library-subtitle">Your saved learning materials and resources</p>
        </div>
        <div className="library-content">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p className="empty-state-text">Library content coming soon</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Library

