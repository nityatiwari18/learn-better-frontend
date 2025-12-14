import { useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'
import { contentApi } from '../api/content'
import UploadModal from '../components/UploadModal'
import ContentCard from '../components/ContentCard'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [contentList, setContentList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const user = storage.getUser()
  const firstName = user?.first_name || 'User'

  // Fetch content list
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await contentApi.list({ limit: 50 })
      setContentList(response.content || [])
    } catch (err) {
      console.error('Failed to fetch content:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleLogout = () => {
    storage.clearAuth()
    if (onLogout) {
      onLogout()
    }
  }

  // Handle successful upload
  const handleUploadSuccess = (newContent) => {
    setContentList(prev => [newContent, ...prev])
  }

  // Handle content deletion
  const handleDelete = (contentId) => {
    setContentList(prev => prev.filter(c => c.id !== contentId))
  }

  const hasContent = contentList.length > 0

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
            {hasContent 
              ? 'Your learning materials are ready. Click on any content to see its summary and key concepts.'
              : 'Ready to enhance your learning? Upload your content to get started.'
            }
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

        {/* Content List */}
        {isLoading ? (
          <div className="content-loading">
            <span className="loading-spinner"></span>
            <p>Loading your content...</p>
          </div>
        ) : hasContent ? (
          <div className="content-list">
            <h2 className="content-list-title">Your Learning Materials</h2>
            <div className="content-list-items">
              {contentList.map(content => (
                <ContentCard 
                  key={content.id} 
                  content={content} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <p className="empty-state-text">No content yet. Upload something to get started!</p>
          </div>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}

export default Dashboard

