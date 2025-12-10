import './About.css'

function About() {
  return (
    <div className="about">
      <div className="container">
        <header className="about-header">
          <h1 className="about-title">
            About <em>Learn Better</em>
          </h1>
          <p className="about-lead">
            We believe that learning should be effective, engaging, and accessible to everyone. 
            Our mission is to help you build genuine understanding, not just surface-level familiarity.
          </p>
        </header>

        <section className="about-section">
          <div className="section-content">
            <h2>Our Philosophy</h2>
            <p>
              Traditional learning often focuses on passive consumption—reading, watching, 
              and hoping information sticks. We take a different approach, grounded in 
              cognitive science research.
            </p>
            <p>
              By combining spaced repetition, active recall, and deliberate practice, 
              we help you build durable knowledge that lasts. No more cramming. 
              No more forgetting everything after an exam.
            </p>
          </div>
          
          <div className="section-visual">
            <div className="philosophy-card">
              <div className="philosophy-item">
                <span className="philosophy-num">01</span>
                <span className="philosophy-text">Understand deeply</span>
              </div>
              <div className="philosophy-item">
                <span className="philosophy-num">02</span>
                <span className="philosophy-text">Practice deliberately</span>
              </div>
              <div className="philosophy-item">
                <span className="philosophy-num">03</span>
                <span className="philosophy-text">Review strategically</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <h2>Ready to learn better?</h2>
          <p>Join thousands of learners who have transformed their study habits.</p>
          <button className="btn btn-primary">
            Get Started Free
            <span className="btn-arrow">→</span>
          </button>
        </section>
      </div>
    </div>
  )
}

export default About
