import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { storage } from '../utils/storage'
import { contentApi } from '../api/content'
import UploadModal from '../components/UploadModal'
import ContentCard from '../components/ContentCard'
import QuizPopup from '../components/QuizPopup'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [contentList, setContentList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizContentId, setQuizContentId] = useState(null)
  const [quizUrl, setQuizUrl] = useState(null)
  const [quizConfig, setQuizConfig] = useState(null)
  const quizLoadingRef = useRef(false) // Prevent multiple simultaneous quiz loads
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

  // Check for quizId in URL params IMMEDIATELY (before contentList loads)
  // This ensures QuizPopup renders immediately to cover dashboard
  useEffect(() => {
    const urlQuizId = searchParams.get('quizId')
    
    // Immediately show QuizPopup if quizId is in URL (don't wait for contentList to load)
    if (urlQuizId && !showQuiz) {
      const config = storage.getProcessingConfig()
      
      // Pass null for contentId - QuizPopup will use quizId from URL instead
      setQuizContentId(null)
      setQuizUrl(null)
      setQuizConfig(config)
      setShowQuiz(true)
    }
  }, [searchParams, showQuiz]) // No isLoading dependency - runs immediately

  // Prevent upload modal from opening when restoring from URL
  useEffect(() => {
    const urlQuizId = searchParams.get('quizId')
    
    // If quizId exists in URL, ensure upload modal stays closed
    if (urlQuizId && isUploadOpen) {
      setIsUploadOpen(false)
    }
  }, [searchParams, isUploadOpen])

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

      {/* Quiz Popup - auto-opens when quizId is in URL */}
      {showQuiz && (
        <QuizPopup
          contentId={quizContentId} // null when restoring from URL, so QuizPopup uses URL params
          url={quizUrl}
          config={quizConfig}
          onClose={() => {
            setShowQuiz(false)
            setQuizContentId(null)
            setQuizUrl(null)
            setQuizConfig(null)
            // URL params will be cleaned up by QuizPopup's handleClose
          }}
        />
      )}
    </div>
  )
}

export default Dashboard

