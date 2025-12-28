import { useOutletContext } from 'react-router-dom'
import './Welcome.css'

function Welcome() {
  const { onOpenAuth } = useOutletContext()

  return (
    <div className="welcome">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Welcome to Learn Better</span>
            <h1 className="hero-title">
              Master skills with
              <br />
              <em>intentional practice</em>
            </h1>
            <p className="hero-description">
              A thoughtful approach to learning that focuses on deep understanding 
              over surface-level memorization. Build lasting knowledge, one concept at a time.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={onOpenAuth}>
                Start Learning
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn btn-secondary">
                Explore Features
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="card-icon">✦</div>
                <span className="card-label">Active Recall</span>
                <div className="card-progress">
                  <div className="progress-bar" style={{ '--progress': '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '◇', title: 'Spaced Repetition', desc: 'Review at optimal intervals to cement knowledge in long-term memory.' },
              { icon: '○', title: 'Active Recall', desc: 'Strengthen neural pathways by actively retrieving information.' },
              { icon: '△', title: 'Progress Tracking', desc: 'Visualize your learning journey with meaningful metrics.' },
            ].map((feature, i) => (
              <article 
                key={feature.title} 
                className="feature-card"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Welcome

