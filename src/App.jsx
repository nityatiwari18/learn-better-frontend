import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import About from './pages/About'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Library from './pages/Library'
import LearningGarden from './pages/LearningGarden'
import Stats from './pages/Stats'
import ContentSummary from './pages/ContentSummary'
import QuizScreen from './components/QuizScreen'
import Layout from './components/Layout'
import MainHomeLayout from './components/MainHomeLayout'
import AuthModal from './components/AuthModal'
import { storage } from './utils/storage'
import './App.css'

function App() {
  const navigate = useNavigate()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(storage.isAuthenticated())
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showSessionExpired, setShowSessionExpired] = useState(false)

  const openAuth = () => setIsAuthOpen(true)
  const closeAuth = () => setIsAuthOpen(false)

  const handleAuthSuccess = () => {
    setIsAuthOpen(false)
    setIsAuthenticated(true)
    setShowSuccessToast(true)
    // Auto-dismiss toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false)
    }, 3000)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    navigate('/', { replace: true })
  }

  const handleSessionExpiredLogin = () => {
    setShowSessionExpired(false)
    setIsAuthOpen(true)
  }

  // Check auth status and token expiry flag on mount
  useEffect(() => {
    setIsAuthenticated(storage.isAuthenticated())
    
    // Check if redirected due to token expiry
    const tokenExpired = localStorage.getItem('token_expired')
    if (tokenExpired === 'true') {
      localStorage.removeItem('token_expired')
      setShowSessionExpired(true)
    }
  }, [])

  // Render authenticated routes for authenticated users
  if (isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/" element={<MainHomeLayout onLogout={handleLogout} />}>
            <Route path="home" element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="library" element={<Library />} />
            <Route path="learning-garden" element={<LearningGarden />} />
            <Route path="stats" element={<Stats />} />
            <Route path="content/:contentId" element={<ContentSummary />} />
            <Route path="quiz/:quizId" element={<QuizScreen />} />
            <Route path="quiz" element={<QuizScreen />} />
            <Route index element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
        {showSuccessToast && (
          <div className="logged-in-toast">
            <div className="toast-content">
              <span className="toast-icon">✓</span>
              <span>User logged in successful</span>
            </div>
            <button 
              className="toast-close" 
              onClick={() => setShowSuccessToast(false)}
            >
              ×
            </button>
          </div>
        )}
      </>
    )
  }

  // Render public pages for non-authenticated users
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout onOpenAuth={openAuth} />}>
          <Route index element={<Welcome />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={closeAuth} 
        onAuthSuccess={handleAuthSuccess}
      />
      {/* Session Expired Popup */}
      {showSessionExpired && (
        <div className="session-expired-overlay">
          <div className="session-expired-popup">
            <div className="session-expired-icon">!</div>
            <h3 className="session-expired-title">Session Expired</h3>
            <p className="session-expired-message">
              Your session has expired. Please login again to continue.
            </p>
            <button 
              className="session-expired-btn"
              onClick={handleSessionExpiredLogin}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
