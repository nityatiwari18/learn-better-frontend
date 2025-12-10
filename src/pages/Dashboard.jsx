import { useState } from 'react'
import { storage } from '../utils/storage'
import UploadModal from '../components/UploadModal'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const user = storage.getUser()
  const firstName = user?.first_name || 'User'

  const handleLogout = () => {
    storage.clearAuth()
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-logo">◈ Learn Better</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome, <span className="user-name">{firstName}</span>
          </h1>
          <p className="welcome-subtitle">
            Ready to enhance your learning? Upload your content to get started.
          </p>
        </div>

        <button className="dashboard-upload-btn" onClick={() => setIsUploadOpen(true)}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Content
        </button>
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  )
}

export default Dashboard

