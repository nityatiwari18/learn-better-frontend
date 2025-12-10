import { useState } from 'react'
import Modal from './Modal'
import './UploadModal.css'

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

function UploadModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('url')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'url' && url.trim()) {
      console.log('Uploading URL:', url)
      // TODO: Implement URL upload API call
    } else if (activeTab === 'pdf' && file) {
      console.log('Uploading file:', file.name)
      // TODO: Implement file upload API call
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
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
      setFile(droppedFile)
    }
  }

  const handleClose = () => {
    setUrl('')
    setFile(null)
    setActiveTab('url')
    onClose()
  }

  const tabs = [
    { id: 'url', icon: '🔗', label: 'Paste URL' },
    { id: 'pdf', icon: '📄', label: 'Upload PDF' }
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
        : 'Drag and drop your PDF here or click to browse'
    }
  }

  const canSubmit = (activeTab === 'url' && url.trim()) || (activeTab === 'pdf' && file)

  return (
    <Modal isOpen={isOpen} onClose={handleClose} fullWidth>
      <div className="upload-modal">
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
            {activeTab === 'url' ? (
              <input
                type="url"
                className="content-input"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            ) : (
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
                />
                {!file && (
                  <label htmlFor="pdf-upload" className="browse-btn">
                    Browse Files
                  </label>
                )}
                {file && <span className="file-check">✓</span>}
              </div>
            )}
          </ContentFrame>

          <button type="submit" className="submit-btn" disabled={!canSubmit}>
            ↑ Upload {activeTab === 'url' ? 'Article' : 'PDF'}
          </button>
        </form>
      </div>
    </Modal>
  )
}

export default UploadModal

