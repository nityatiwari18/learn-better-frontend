import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { contentApi } from '../api/content'
import { storage } from '../utils/storage'
import LoadingWithProgress from '../components/LoadingWithProgress'
import './ContentSummary.css'

const PROCESSING_STATES = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

function ContentSummary() {
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
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAddingNewTrack, setIsAddingNewTrack] = useState(false)
  const [newTrackName, setNewTrackName] = useState('')
  const [learningTracks, setLearningTracks] = useState([
    'Machine Learning',
    'React Development',
    'System Design',
    'UI/UX Design',
    'Product Management'
  ])
  const pollingRef = useRef(null)
  const progressRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [contentId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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

  const handleDeleteConcept = async (conceptId) => {
    if (!contentId || !conceptId) return
    
    try {
      // Optimistically remove from UI
      const updatedConcepts = keyConcepts.filter(concept => concept.id !== conceptId)
      setKeyConcepts(updatedConcepts)

      // Update localStorage cache if URL exists
      if (locationUrl) {
        const existingCache = storage.getContentCache(locationUrl, null) || {}
        storage.setContentCache(locationUrl, {
          ...existingCache,
          key_concepts: updatedConcepts
        }, null)
      }

      // Make API call to delete from database
      await contentApi.deleteKeyConcept(contentId, conceptId)
    } catch (err) {
      console.error('Failed to delete key concept:', err)
      // Revert optimistic update on error
      try {
        const status = await contentApi.getProcessingStatus(contentId, locationUrl, null)
        if (status.key_concepts && status.key_concepts.length > 0) {
          setKeyConcepts(status.key_concepts)
          if (locationUrl) {
            const existingCache = storage.getContentCache(locationUrl, null) || {}
            storage.setContentCache(locationUrl, {
              ...existingCache,
              key_concepts: status.key_concepts
            }, null)
          }
        }
      } catch (fetchErr) {
        console.error('Failed to revert key concepts:', fetchErr)
      }
      setError('Failed to delete key concept. Please try again.')
    }
  }

  const handleStartQuiz = () => {
    if (!contentId) return
    
    // Get config from storage
    const config = storage.getProcessingConfig()
    
    // Navigate immediately - QuizScreen will handle API call and show "Generating Quiz"
    // Pass URL and config in location state for cache optimization
    navigate(`/quiz?contentId=${contentId}&questionIndex=0`, {
      state: {
        url: locationUrl,
        config: config
      }
    })
  }

  // Focus input when entering add mode
  useEffect(() => {
    if (isAddingNewTrack && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingNewTrack])

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleTrackSelect = (track) => {
    setSelectedTrack(track)
    setIsDropdownOpen(false)
  }

  const handleAddNewTrack = () => {
    setIsAddingNewTrack(true)
    setIsDropdownOpen(false)
    setNewTrackName('')
  }

  const handleSaveNewTrack = () => {
    const trimmedName = newTrackName.trim()
    if (trimmedName) {
      // Check if track already exists
      if (!learningTracks.includes(trimmedName)) {
        setLearningTracks([...learningTracks, trimmedName])
      }
      setSelectedTrack(trimmedName)
      setIsAddingNewTrack(false)
      setNewTrackName('')
    }
  }

  const handleCancelNewTrack = () => {
    setIsAddingNewTrack(false)
    setNewTrackName('')
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveNewTrack()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelNewTrack()
    }
  }

  return (
    <div className="child-container content-summary">
      <main className="content-summary-main">
        <div className={`content-summary-container ${state}`}>
          {/* Processing State */}
          {state === PROCESSING_STATES.PROCESSING && (
            <LoadingWithProgress
              title="Processing Content"
              subtitle="Generating summary and extracting key concepts..."
              progress={progress}
            />
          )}

          {/* Completed State */}
          {state === PROCESSING_STATES.COMPLETED && (
            <>
              <div className="completed-header">
                <h2 className="completed-title">{title || 'Content Processed!'}</h2>
                <p className="completed-subtitle">Review the summary and key concepts to track</p>
              </div>

              {(summary || keyConcepts.length > 0) && (
                <div className="content-results-container">
                  <p className="title-content-text">We have analysed your source. Review how it's organized for long term retention</p>
                  <h2 className="section-title">Learning Track</h2>
                  <p className="subtitle-text-2">Your retention is tracked by learning track, and you can personalised this for your content</p>
                  
                  <div className="learning-track-dropdown-container" ref={dropdownRef}>
                    {isAddingNewTrack ? (
                      <div className="learning-track-input-container">
                        <input
                          ref={inputRef}
                          type="text"
                          className="learning-track-input"
                          placeholder="e.g., Machine Learning, Product Management"
                          value={newTrackName}
                          onChange={(e) => setNewTrackName(e.target.value)}
                          onKeyDown={handleInputKeyDown}
                        />
                        <div className="learning-track-action-buttons">
                          <button
                            type="button"
                            className="learning-track-action-btn save-btn"
                            onClick={handleSaveNewTrack}
                            title="Save"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="learning-track-action-btn cancel-btn"
                            onClick={handleCancelNewTrack}
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`learning-track-dropdown ${isDropdownOpen ? 'open' : ''}`}
                          onClick={handleDropdownToggle}
                        >
                          <span className={`dropdown-selected-text ${!selectedTrack ? 'placeholder' : ''}`}>
                            {selectedTrack || 'Select a learning track'}
                          </span>
                          <svg
                            className={`dropdown-chevron ${isDropdownOpen ? 'open' : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        {isDropdownOpen && (
                          <div className="learning-track-dropdown-menu">
                            {learningTracks.map((track) => (
                              <button
                                key={track}
                                type="button"
                                className={`dropdown-menu-item ${selectedTrack === track ? 'selected' : ''}`}
                                onClick={() => handleTrackSelect(track)}
                              >
                                {track}
                              </button>
                            ))}
                            <button
                              type="button"
                              className="dropdown-menu-item add-new-track-item"
                              onClick={handleAddNewTrack}
                            >
                              + Add New Learning Track
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {summary && (
                    <div className="summary-section">
                      <h3 className="section-title">Summary</h3>
                      <p className="summary-text">{summary}</p>
                    </div>
                  )}

                  {keyConcepts.length > 0 && summary && (
                    <hr className="section-divider" />
                  )}

                  {keyConcepts.length > 0 && (
                    <div className="concepts-section">
                      <h3 className="section-title">Key Concepts</h3>
                      <p className="subtitle-text-1">Below key concepts will be used to guide your long-term retention practice.</p>
                      <div className="concepts-grid">
                        {keyConcepts.map((concept) => (
                          <div 
                            key={concept.id || concept.concept_name} 
                            className="concept-card"
                          >
                            <div className="concept-content">
                              <span className="concept-name">{concept.concept_name}</span>
                              {concept.subtitle && (
                                <span className="concept-subtitle">{concept.subtitle}</span>
                              )}
                            </div>
                            {concept.id && (
                              <button
                                className="concept-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteConcept(concept.id)
                                }}
                                title="Delete concept"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                className="start-quiz-btn" 
                onClick={handleStartQuiz}
              >
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
    </div>
  )
}

export default ContentSummary

