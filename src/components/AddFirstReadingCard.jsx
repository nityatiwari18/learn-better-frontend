import { useNavigate } from 'react-router-dom'
import './AddFirstReadingCard.css'

function AddFirstReadingCard() {
  const navigate = useNavigate()

  const handleAddReading = () => {
    navigate('/upload')
  }

  return (
    <div className="add-first-reading-card">
      <div className="card-header">
        <h2 className="card-title">Add your first reading.</h2>
        <div className="card-icon">
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
      </div>
      <p className="card-description">
        Learn Better revisits important ideas from your readings over time to support long-term retention. Start by adding one item you want to <strong>understand deeply</strong>.
      </p>
      <button className="add-reading-btn" onClick={handleAddReading}>
        Add reading
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}

export default AddFirstReadingCard

