import './StatCard.css'

function StatCard({ icon, number, title, subtitle }) {
  return (
    <button type="button" className="stat-card">
      <div className="stat-header-row">
        <div className="stat-icon">
          {icon}
        </div>
        <div className="stat-number">{number}</div>
      </div>
      <div className="stat-label">{title}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </button>
  )
}

export default StatCard

