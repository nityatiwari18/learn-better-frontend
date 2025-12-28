import { NavLink } from 'react-router-dom'
import './Header.css'

function Header({ isAuthenticated = false, onLogout, onOpenAuth }) {
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
                Home
              </NavLink>
              <NavLink 
                to="/upload" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Upload
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
          <button className="cta-button" onClick={onLogout}>
            Logout
          </button>
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
