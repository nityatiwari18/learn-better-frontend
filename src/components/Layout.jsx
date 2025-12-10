import { Outlet } from 'react-router-dom'
import Header from './Header'
import './Layout.css'

function Layout({ onOpenAuth }) {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <Outlet context={{ onOpenAuth }} />
      </main>
      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            Built with intention · Learn Better © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
