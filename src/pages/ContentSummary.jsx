import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { contentApi } from '../api/content'
import { storage } from '../utils/storage'
import QuizPopup from '../components/QuizPopup'
import './ContentSummary.css'

const PROCESSING_STATES = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

function ContentSummary({ onLogout }) {
  const { contentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { url: locationUrl, cachedData: locationCachedData } = location.state || {}
  
  const [state, setState] = useState(locationCachedData ? PROCESSING_STATES.COMPLETED : PROCESSING_STATES.PROCESSING)
  const [progress, setProgress] = useState(locationCachedData ? 100 : 0)
  const [title, setTitle] = useState(locationCachedData?.title || '')
  const [summary, setSummary] = useState(locationCachedData?.summary || null)
  const [keyConcepts, setKeyConcepts] = useState(locationCachedData?.key_concepts || [])
  const [error, setError] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizKey, setQuizKey] = useState(0)
  const pollingRef = useRef(null)
  const progressRef = useRef(null)

  // Simulated progress animation
  useEffect(() => {
    if (state === PROCESSING_STATES.PROCESSING) {
      // Animate progress from 0 to 90% over ~30 seconds
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressRef.current)
            return 90
          }
          // Slow down as we approach 90%
          const increment = Math.max(0.5, (90 - prev) / 20)
          return Math.min(90, prev + increment)
        })
      }, 500)
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current)
      }
    }
  }, [state])

  // Poll processing status (skip if using cached data)
  useEffect(() => {
    if (!contentId || locationCachedData) return

    const checkStatus = async () => {
      try {
        const status = await contentApi.getProcessingStatus(contentId, locationUrl, null)
        
        if (status.processing_status === 'completed') {
          // Stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          if (progressRef.current) {
            clearInterval(progressRef.current)
          }
          
          // Jump to 100%
          setProgress(100)
          setState(PROCESSING_STATES.COMPLETED)
          
          // Set title
          if (status.title) {
            setTitle(status.title)
          }
          
          // Set results
          let summaryText = null
          let concepts = []
          if (status.summary) {
            summaryText = status.summary.summary_text
            setSummary(summaryText)
          }
          if (status.key_concepts && status.key_concepts.length > 0) {
            concepts = status.key_concepts
            setKeyConcepts(concepts)
          }

          // Cache the results if we have a URL (getProcessingStatus already caches, but ensure it's complete)
          if (locationUrl) {
            const existingCache = storage.getContentCache(locationUrl, null) || {}
            storage.setContentCache(locationUrl, {
              ...existingCache,
              title: status.title || '',
              summary: summaryText,
              key_concepts: concepts
            }, null)
          }
        } else if (status.processing_status === 'failed') {
          // Stop polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          if (progressRef.current) {
            clearInterval(progressRef.current)
          }
          
          setState(PROCESSING_STATES.FAILED)
          setError(status.processing_error || 'Processing failed. Please try again.')
        }
      } catch (err) {
        console.error('Failed to check processing status:', err)
      }
    }

    // Initial check
    checkStatus()

    // Start polling every 3 seconds
    pollingRef.current = setInterval(checkStatus, 3000)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [contentId, locationCachedData, locationUrl])

  const handleLogout = () => {
    storage.clearAuth()
    if (onLogout) {
      onLogout()
    }
  }

  const handleDone = () => {
    navigate('/home')
  }

  const handleRetry = async () => {
    try {
      setState(PROCESSING_STATES.PROCESSING)
      setProgress(0)
      setError('')
      // Trigger processing without config (backend will use backendConfig)
      await contentApi.triggerProcessing(contentId, null)
    } catch (err) {
      setError('Failed to retry processing')
      setState(PROCESSING_STATES.FAILED)
    }
  }

  const handleCancel = () => {
    navigate('/home')
  }

  return (
    <div className="content-summary">
      <header className="content-summary-header">
        <div className="content-summary-logo">◈ Learn Better</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="content-summary-main">
        <div className={`content-summary-container ${state}`}>
          {/* Processing State */}
          {state === PROCESSING_STATES.PROCESSING && (
            <>
              <div className="processing-header">
                <div className="processing-spinner"></div>
                <h2 className="processing-title">Processing Content</h2>
                <p className="processing-subtitle">Generating summary and extracting key concepts...</p>
              </div>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(progress)}%</span>
              </div>
            </>
          )}

          {/* Completed State */}
          {state === PROCESSING_STATES.COMPLETED && (
            <>
              <div className="completed-header">
                <h2 className="completed-title">{title || 'Content Processed!'}</h2>
                <p className="completed-subtitle">Review the summary and key concepts to track</p>
              </div>

              {summary && (
                <div className="summary-section">
                  <h3 className="section-title">Summary</h3>
                  <p className="summary-text">{summary}</p>
                </div>
              )}

              {keyConcepts.length > 0 && (
                <div className="concepts-section">
                  <h3 className="section-title">Key Concepts</h3>
                  <div className="concepts-grid">
                    {keyConcepts.map((concept, index) => (
                      <div key={index} className="concept-card">
                        <span className="concept-name">{concept.concept_name}</span>
                        {concept.subtitle && (
                          <span className="concept-subtitle">{concept.subtitle}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="start-quiz-btn" onClick={() => setShowQuiz(true)}>
                Start Quiz
              </button>
            </>
          )}

          {/* Failed State */}
          {state === PROCESSING_STATES.FAILED && (
            <>
              <div className="failed-header">
                <div className="failed-icon">!</div>
                <h2 className="failed-title">Processing Failed</h2>
                <p className="failed-message">{error}</p>
              </div>

              <div className="failed-actions">
                <button className="retry-btn" onClick={handleRetry}>
                  Retry
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Quiz Popup */}
      {showQuiz && (
        <QuizPopup
          key={quizKey}
          contentId={contentId}
          url={locationUrl}
          config={null}
          onClose={() => {
            setShowQuiz(false)
            setQuizKey(prev => prev + 1)  // Increment key to force remount next time
            navigate('/home')  // Navigate back to home after quiz
          }}
        />
      )}
    </div>
  )
}

export default ContentSummary

