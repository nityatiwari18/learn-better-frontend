import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { storage } from '../utils/storage'
import { contentApi } from '../api/content'
import ContentCard from '../components/ContentCard'
import AddFirstReadingCard from '../components/AddFirstReadingCard'
import ReadingsStatCard from '../components/ReadingsStatCard'
import StudySessionsStatCard from '../components/StudySessionsStatCard'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
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

  // Initial fetch and refetch when returning from upload page
  useEffect(() => {
    fetchContent()
  }, [fetchContent, location.pathname])

  // Handle content deletion
  const handleDelete = (contentId) => {
    setContentList(prev => prev.filter(c => c.id !== contentId))
  }

  const hasContent = contentList.length > 0

  return (
    <div className="child-container dashboard">
      <main className="dashboard-main">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Hello, <span className="user-name">{firstName}</span>
          </h1>
          <p className="welcome-subtitle">
            {hasContent 
              ? 'Your learning materials are ready. Click on any content to see its summary and key concepts.'
              : 'This workspace is designed for structured practice and long-term retention from your readings.'
            }
          </p>
        </div>

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
          <div className="dashboard-cards-container">
            <AddFirstReadingCard />
            <div className="dashboard-stats-container">
              <ReadingsStatCard />
              <StudySessionsStatCard />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard

