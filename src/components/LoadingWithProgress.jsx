import './LoadingWithProgress.css'

function LoadingWithProgress({ title, subtitle, progress }) {
  return (
    <div className="loading-with-progress">
      <div className="loading-with-progress-header">
        <div className="loading-with-progress-spinner"></div>
        <h2 className="loading-with-progress-title">{title}</h2>
        <p className="loading-with-progress-subtitle">{subtitle}</p>
      </div>
      
      <div className="loading-with-progress-progress-container">
        <div className="loading-with-progress-progress-bar">
          <div 
            className="loading-with-progress-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="loading-with-progress-progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default LoadingWithProgress
