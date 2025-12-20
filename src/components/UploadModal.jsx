import { useState } from 'react'
import Modal from './Modal'
import { contentApi } from '../api/content'
import ProcessingPopup from './ProcessingPopup'
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
  const [activeTab, setActiveTab] = useState('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)
  const [processingContentId, setProcessingContentId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShowErrorPopup(false)
    setIsLoading(true)

    try {
      let response
      if (activeTab === 'url' && url.trim()) {
        response = await contentApi.uploadWeblink(url.trim())
      } else if (activeTab === 'pdf' && file) {
        response = await contentApi.uploadFile(file, 'document')
      } else if (activeTab === 'text' && text.trim()) {
        response = await contentApi.uploadText(text.trim())
      }

      if (response && response.content) {
        // Trigger processing for the uploaded content
        try {
          if (!response.content.id) {
            throw new Error('Content ID missing from response')
          }
          await contentApi.triggerProcessing(response.content.id)
          // Show processing popup
          setProcessingContentId(response.content.id)
          setShowProcessing(true)
        } catch (processingErr) {
          // Log failure
          console.warn('Failed to trigger processing:', processingErr)
          // Still try to show processing popup if ID exists, otherwise error
          if (response.content.id) {
            setProcessingContentId(response.content.id)
            setShowProcessing(true)
          } else {
            setError('Upload successful but failed to start processing')
            setShowErrorPopup(true)
          }
        }
      }
    } catch (err) {
      // Show error popup for upload failures
      setError('Sorry, could not upload content')
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessingComplete = () => {
    // Reset form
    setUrl('')
    setFile(null)
    setText('')
    setActiveTab('url')
    setShowProcessing(false)
    setProcessingContentId(null)

    // Notify parent and close
    if (onUploadSuccess) {
      onUploadSuccess()
    }
    onClose()
  }

  const handleProcessingClose = () => {
    setShowProcessing(false)
    setProcessingContentId(null)
    // Reset form
    setUrl('')
    setFile(null)
    setText('')
    setActiveTab('url')
    onClose()
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
    setShowProcessing(false)
    setProcessingContentId(null)
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

  // Show processing popup if processing
  if (showProcessing && processingContentId) {
    return (
      <ProcessingPopup
        contentId={processingContentId}
        onClose={handleProcessingClose}
        onComplete={handleProcessingComplete}
      />
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} fullWidth>
      <div className="upload-modal">
        {showErrorPopup && (
          <ErrorPopup message={error} onClose={handleErrorPopupClose} />
        )}

        <div className="upload-header">
          <h2 className="upload-title">Add Your First Article</h2>
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

