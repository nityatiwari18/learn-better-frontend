import { useState, useEffect, useRef } from 'react'
import { contentApi } from '../api/content'
import './ProcessingPopup.css'

const PROCESSING_STATES = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

function ProcessingPopup({ contentId, onClose, onComplete }) {
  const [state, setState] = useState(PROCESSING_STATES.PROCESSING)
  const [progress, setProgress] = useState(0)
  const [summary, setSummary] = useState(null)
  const [keyConcepts, setKeyConcepts] = useState([])
  const [error, setError] = useState('')
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

  // Poll processing status
  useEffect(() => {
    if (!contentId) return

    const checkStatus = async () => {
      try {
        const status = await contentApi.getProcessingStatus(contentId)
        
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
          
          // Set results
          if (status.summary) {
            setSummary(status.summary.summary_text)
          }
          if (status.key_concepts && status.key_concepts.length > 0) {
            setKeyConcepts(status.key_concepts)
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
  }, [contentId])

  const handleDone = () => {
    if (onComplete) {
      onComplete()
    }
    if (onClose) {
      onClose()
    }
  }

  const handleRetry = async () => {
    try {
      setState(PROCESSING_STATES.PROCESSING)
      setProgress(0)
      setError('')
      await contentApi.triggerProcessing(contentId)
    } catch (err) {
      setError('Failed to retry processing')
      setState(PROCESSING_STATES.FAILED)
    }
  }

  return (
    <div className="processing-popup-overlay">
      <div className={`processing-popup ${state}`}>
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
              <div className="completed-icon">✓</div>
              <h2 className="completed-title">Content Processed!</h2>
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="done-btn" onClick={handleDone}>
              Done
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
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProcessingPopup

