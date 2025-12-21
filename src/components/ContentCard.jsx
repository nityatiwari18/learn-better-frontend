import { useState, useEffect, useRef } from 'react'
import { contentApi } from '../api/content'
import { storage } from '../utils/storage'
import './ContentCard.css'

// Processing status constants
const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

function ContentCard({ content, onDelete }) {
  const [processingStatus, setProcessingStatus] = useState(null)
  const [summary, setSummary] = useState(null)
  const [keyConcepts, setKeyConcepts] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const pollingRef = useRef(null)

  // Determine content title
  const getContentTitle = () => {
    if (content.original_filename) return content.original_filename
    if (content.source_url) {
      try {
        const url = new URL(content.source_url)
        return url.hostname + url.pathname.slice(0, 30) + (url.pathname.length > 30 ? '...' : '')
      } catch {
        return content.source_url.slice(0, 50)
      }
    }
    if (content.raw_text) return content.raw_text.slice(0, 50) + '...'
    return `Content #${content.id}`
  }

  // Get content type icon
  const getContentIcon = () => {
    switch (content.content_type) {
      case 'file': return '📄'
      case 'weblink': return '🔗'
      case 'text': return '📝'
      default: return '📋'
    }
  }

  // Fetch processing status
  const fetchProcessingStatus = async () => {
    try {
      const status = await contentApi.getProcessingStatus(content.id)
      setProcessingStatus(status.processing_status)
      
      if (status.summary) {
        setSummary(status.summary)
      }
      if (status.key_concepts && status.key_concepts.length > 0) {
        setKeyConcepts(status.key_concepts)
      }

      // Stop polling if completed or failed
      if (status.processing_status === PROCESSING_STATUS.COMPLETED || 
          status.processing_status === PROCESSING_STATUS.FAILED) {
        stopPolling()
      }
    } catch (err) {
      console.error('Failed to fetch processing status:', err)
    }
  }

  // Start polling for status
  const startPolling = () => {
    if (!isPolling) {
      setIsPolling(true)
      pollingRef.current = setInterval(fetchProcessingStatus, 3000)
    }
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsPolling(false)
  }

  // Initial fetch and setup polling if needed
  useEffect(() => {
    fetchProcessingStatus()
    
    return () => stopPolling()
  }, [content.id])

  // Start polling when status is processing
  useEffect(() => {
    if (processingStatus === PROCESSING_STATUS.PROCESSING || 
        processingStatus === PROCESSING_STATUS.PENDING) {
      startPolling()
    } else {
      stopPolling()
    }
  }, [processingStatus])

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await contentApi.delete(content.id)
        if (onDelete) onDelete(content.id)
      } catch (err) {
        console.error('Failed to delete content:', err)
      }
    }
  }

  // Retry processing
  const handleRetryProcessing = async (e) => {
    e.stopPropagation()
    try {
      // Load saved config from localStorage
      const savedConfig = storage.getProcessingConfig()
      await contentApi.triggerProcessing(content.id, savedConfig)
      setProcessingStatus(PROCESSING_STATUS.PROCESSING)
      startPolling()
    } catch (err) {
      console.error('Failed to trigger processing:', err)
    }
  }

  // Render status badge
  const renderStatusBadge = () => {
    switch (processingStatus) {
      case PROCESSING_STATUS.PROCESSING:
      case PROCESSING_STATUS.PENDING:
        return (
          <span className="status-badge processing">
            <span className="spinner"></span>
            Processing...
          </span>
        )
      case PROCESSING_STATUS.COMPLETED:
        return <span className="status-badge completed">Ready</span>
      case PROCESSING_STATUS.FAILED:
        return (
          <span className="status-badge failed" onClick={handleRetryProcessing}>
            Failed - Click to retry
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className={`content-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="content-card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="content-card-info">
          <span className="content-card-icon">{getContentIcon()}</span>
          <div className="content-card-details">
            <h3 className="content-card-title">{getContentTitle()}</h3>
            <p className="content-card-meta">
              {content.content_type} • {new Date(content.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="content-card-actions">
          {renderStatusBadge()}
          <button className="delete-btn" onClick={handleDelete} title="Delete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="content-card-body">
          {/* Summary Section */}
          {summary && (
            <div className="content-section">
              <h4 className="section-title">Summary</h4>
              <p className="summary-text">{summary.summary_text}</p>
            </div>
          )}

          {/* Key Concepts Section */}
          {keyConcepts.length > 0 && (
            <div className="content-section">
              <h4 className="section-title">Key Concepts</h4>
              <div className="key-concepts-grid">
                {keyConcepts.map((concept, index) => (
                  <div key={index} className="concept-card">
                    <h5 className="concept-name">{concept.concept_name}</h5>
                    <p className="concept-description">{concept.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show processing message if still processing */}
          {(processingStatus === PROCESSING_STATUS.PROCESSING || 
            processingStatus === PROCESSING_STATUS.PENDING) && (
            <div className="processing-message">
              <span className="spinner large"></span>
              <p>Generating summary and extracting key concepts...</p>
            </div>
          )}

          {/* Show error if failed */}
          {processingStatus === PROCESSING_STATUS.FAILED && !summary && keyConcepts.length === 0 && (
            <div className="error-message">
              <p>Processing failed. Click the retry button above to try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContentCard


