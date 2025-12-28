import { Outlet } from 'react-router-dom'
import Header from './Header'
import './MainHomeLayout.css'

function MainHomeLayout({ onLogout }) {
  return (
    <div className="main-home-layout">
      <Header isAuthenticated={true} onLogout={onLogout} />
      <main className="main-home-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainHomeLayout

