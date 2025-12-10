import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <NavLink to="/" className="logo">
          <span className="logo-mark">◈</span>
          <span className="logo-text">Learn Better</span>
        </NavLink>
        
        <nav className="nav">
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
        </nav>

        <button className="cta-button">
          Get Started
        </button>
      </div>
    </header>
  )
}

export default Header
