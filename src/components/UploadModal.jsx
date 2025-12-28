import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { contentApi } from '../api/content'
import { storage } from '../utils/storage'
import './UploadModal.css'

// Maximum file size: 1 MB
const MAX_FILE_SIZE = 1 * 1024 * 1024

// Error popup component
function ErrorPopup({ message, onClose }) {
  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <div className="error-popup-icon">!</div>
        <h3 className="error-popup-title">Upload Failed</h3>
        <p className="error-popup-message">{message}</p>
        <button className="error-popup-btn" onClick={onClose}>
          Try Again
        </button>
      </div>
    </div>
  )
}

// Reusable content frame component
function ContentFrame({ icon, title, description, children }) {
  return (
    <div className="content-frame">
      <span className="content-icon">{icon}</span>
      <h3 className="content-title">{title}</h3>
      <p className="content-description">{description}</p>
      {children}
    </div>
  )
}

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShowErrorPopup(false)

    // Validate input
    let hasValidInput = false
    if (activeTab === 'url' && url.trim()) {
      hasValidInput = true
    } else if (activeTab === 'pdf' && file) {
      hasValidInput = true
    } else if (activeTab === 'text' && text.trim()) {
      hasValidInput = true
    }

    if (!hasValidInput) {
      setError('Please provide content to upload')
      setShowErrorPopup(true)
      return
    }

    setIsLoading(true)

    try {
      // Check cache for URL uploads
      if (activeTab === 'url' && url.trim()) {
        const cachedData = storage.getContentCache(url.trim(), null)
        // Only use cache if it has summary or key_concepts (processing results)
        if (cachedData && (cachedData.summary || (cachedData.key_concepts && cachedData.key_concepts.length > 0))) {
          console.log('Cache hit for URL:', url.trim())
          // Use cached data - we still need to upload to get content ID, but skip processing
          try {
            const response = await contentApi.uploadWeblink(url.trim())
            if (response && response.content && response.content.id) {
              // Navigate to ContentSummary with cached data
              const { url: _, ...cacheData } = cachedData
              onClose() // Close modal first
              navigate(`/content/${response.content.id}`, {
                state: { url: url.trim(), cachedData: cacheData }
              })
              setIsLoading(false)
              return
            }
          } catch (uploadErr) {
            console.error('Failed to upload cached URL:', uploadErr)
            // Fall through to normal processing flow
          }
        }
      }

      let response
      if (activeTab === 'url' && url.trim()) {
        response = await contentApi.uploadWeblink(url.trim())
      } else if (activeTab === 'pdf' && file) {
        response = await contentApi.uploadFile(file, 'document')
      } else if (activeTab === 'text' && text.trim()) {
        response = await contentApi.uploadText(text.trim())
      }

      console.log('Upload response received:', response)

      if (response && response.content) {
        console.log('Content exists, ID:', response.content.id)
        // Trigger processing without config (backend will use backendConfig)
        try {
          if (!response.content.id) {
            console.error('Content ID is missing or falsy!')
            throw new Error('Content ID missing from response')
          }
          console.log('Triggering processing for content ID:', response.content.id)
          await contentApi.triggerProcessing(response.content.id, null)
          console.log('Processing triggered successfully, navigating to ContentSummary')
          // Navigate to ContentSummary page
          onClose() // Close modal first
          const state = {}
          if (activeTab === 'url' && url.trim()) {
            state.url = url.trim()
          }
          navigate(`/content/${response.content.id}`, { state })
        } catch (processingErr) {
          // Log failure
          console.error('Failed to trigger processing:', processingErr)
          // Still try to navigate to ContentSummary if ID exists, otherwise error
          if (response.content.id) {
            console.log('Navigating to ContentSummary despite error')
            onClose() // Close modal first
            const state = {}
            if (activeTab === 'url' && url.trim()) {
              state.url = url.trim()
            }
            navigate(`/content/${response.content.id}`, { state })
          } else {
            console.error('No ID available, showing error popup')
            setError('Upload successful but failed to start processing')
            setShowErrorPopup(true)
          }
        }
      } else {
        console.error('Response structure invalid:', { response, hasContent: !!response?.content })
      }
    } catch (err) {
      // Show error popup for upload failures
      setError('Sorry, could not upload content')
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }


  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 1 MB limit')
        return
      }
      setError('')
      setFile(selectedFile)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 1 MB limit')
        return
      }
      setError('')
      setFile(droppedFile)
    }
  }

  const handleClose = () => {
    setUrl('')
    setFile(null)
    setText('')
    setActiveTab('url')
    setError('')
    setShowErrorPopup(false)
    onClose()
  }

  const handleErrorPopupClose = () => {
    setShowErrorPopup(false)
    setError('')
  }

  const tabs = [
    { id: 'url', icon: '🔗', label: 'Paste URL' },
    { id: 'pdf', icon: '📄', label: 'Upload PDF' },
    { id: 'text', icon: '📝', label: 'Paste Text' }
  ]

  const contentConfig = {
    url: {
      icon: '🔗',
      title: 'Paste Article URL',
      description: 'Enter the URL of any article or webpage you want to learn from'
    },
    pdf: {
      icon: '📄',
      title: file ? file.name : 'Upload PDF File',
      description: file
        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
        : 'Drag and drop your PDF here or click to browse (max 1 MB)'
    },
    text: {
      icon: '📝',
      title: 'Paste Text Content',
      description: 'Paste any text content you want to learn from'
    }
  }

  const canSubmit = !isLoading && (
    (activeTab === 'url' && url.trim()) ||
    (activeTab === 'pdf' && file) ||
    (activeTab === 'text' && text.trim())
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose} fullWidth>
      <div className="upload-modal">
        {showErrorPopup && (
          <ErrorPopup message={error} onClose={handleErrorPopupClose} />
        )}

        <div className="upload-header">
          <h2 className="upload-title">Add New Content</h2>
          <p className="upload-subtitle">Choose how you want to add content</p>
        </div>

        <div className="upload-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`upload-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="upload-content">
          <ContentFrame {...contentConfig[activeTab]}>
            {activeTab === 'url' && (
              <input
                type="url"
                className="content-input"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                required
              />
            )}
            {activeTab === 'pdf' && (
              <div
                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  id="pdf-upload"
                  disabled={isLoading}
                />
                {!file && (
                  <label htmlFor="pdf-upload" className="browse-btn">
                    Browse Files
                  </label>
                )}
                {file && <span className="file-check">✓</span>}
              </div>
            )}
            {activeTab === 'text' && (
              <textarea
                className="content-textarea"
                placeholder="Paste your text content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
                rows={8}
              />
            )}
          </ContentFrame>

          <button type="submit" className="submit-btn" disabled={!canSubmit}>
            {isLoading ? 'Uploading...' : `↑ Upload ${activeTab === 'url' ? 'Article' : activeTab === 'pdf' ? 'PDF' : 'Text'}`}
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default UploadModal

