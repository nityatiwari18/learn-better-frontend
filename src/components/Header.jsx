import { NavLink, useNavigate } from 'react-router-dom'
import { storage } from '../utils/storage'
import './Header.css'

function Header({ isAuthenticated = false, onLogout, onOpenAuth }) {
  const navigate = useNavigate()
  
  // Get user data for profile button
  const user = isAuthenticated ? storage.getUser() : null
  const userInitial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'

  const handleAddReading = () => {
    navigate('/upload')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to={isAuthenticated ? "/home" : "/"} className="logo">
          <img src="/learn-better-logo.png" alt="Learn Better Logo" className="logo-mark" />
          <span className="logo-text">Learn Better</span>
        </NavLink>
        
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <NavLink 
                to="/home" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Home</span>
              </NavLink>
              <NavLink 
                to="/library" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <span>Library</span>
              </NavLink>
              <NavLink 
                to="/learning-garden" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                </svg>
                <span>Learning Garden</span>
              </NavLink>
              <NavLink 
                to="/stats" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                <span>Stats</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                About
              </NavLink>
            </>
          )}
        </nav>

        {isAuthenticated ? (
          <div className="header-actions">
            <button className="add-reading-button" onClick={handleAddReading}>
              Add a reading
            </button>
            <button className="profile-button" aria-label="Profile">
              {userInitial}
            </button>
          </div>
        ) : (
          <button className="cta-button" onClick={onOpenAuth}>
            Get Started
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
