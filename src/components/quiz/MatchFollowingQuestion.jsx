import { useState, useEffect } from 'react'
import './QuestionStyles.css'

/**
 * Match the Following Question Component with Drag and Drop
 */
function MatchFollowingQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  const answerOptions = question.answer_options || question.answer_json || {}
  
  // Handle both formats: {pairs: [...]} or {left: [...], right: [...]}
  let terms, matches
  if (answerOptions.pairs) {
    terms = answerOptions.pairs.map(p => p.term)
    matches = [...answerOptions.pairs.map(p => p.match)].sort(() => Math.random() - 0.5)
  } else if (answerOptions.left && answerOptions.right) {
    terms = answerOptions.left || []
    matches = [...(answerOptions.right || [])].sort(() => Math.random() - 0.5)
  } else {
    terms = []
    matches = []
  }
  
  const [userMatches, setUserMatches] = useState(userAnswer || {})
  const [draggedMatch, setDraggedMatch] = useState(null)
  const [dragOverTerm, setDragOverTerm] = useState(null)

  useEffect(() => {
    if (userAnswer) {
      setUserMatches(userAnswer)
    }
  }, [userAnswer])

  const handleDragStart = (match) => {
    setDraggedMatch(match)
  }

  const handleDragOver = (e, term) => {
    e.preventDefault()
    setDragOverTerm(term)
  }

  const handleDragLeave = () => {
    setDragOverTerm(null)
  }

  const handleDrop = (e, term) => {
    e.preventDefault()
    
    if (showFeedback || !draggedMatch) return
    
    const newMatches = { ...userMatches }
    
    // Remove this match from any other term
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === draggedMatch) {
        delete newMatches[key]
      }
    })
    
    // Assign to new term
    newMatches[term] = draggedMatch
    
    setUserMatches(newMatches)
    setDraggedMatch(null)
    setDragOverTerm(null)
    
    // Check if all terms are matched
    if (Object.keys(newMatches).length === terms.length) {
      // Convert to array format for validation
      const matchArray = terms.map(term => ({
        term: term,
        match: newMatches[term]
      }))
      console.log('[DEBUG MatchFollowingQuestion] Submitting answer:', {
        matchArray,
        terms,
        newMatches,
        answerOptions
      })
      onAnswer(matchArray)
    }
  }

  const handleRemoveMatch = (term) => {
    if (showFeedback) return
    
    const newMatches = { ...userMatches }
    delete newMatches[term]
    setUserMatches(newMatches)
  }

  const isMatchUsed = (match) => {
    return Object.values(userMatches).includes(match)
  }

  const getTermClass = (term) => {
    let className = 'match-term-card'
    
    if (dragOverTerm === term) {
      className += ' drag-over'
    }
    
    if (userMatches[term]) {
      className += ' has-match'
    }
    
    if (showFeedback) {
      // Get the correct match for this term
      const termIndex = terms.indexOf(term)
      const correctMatch = answerOptions.right ? answerOptions.right[termIndex] : null
      
      if (correctMatch && userMatches[term] === correctMatch) {
        className += ' correct'
      } else if (userMatches[term]) {
        className += ' incorrect'
      }
    }
    
    return className
  }

  const getMatchClass = (match) => {
    let className = 'match-option-card'
    
    if (isMatchUsed(match)) {
      className += ' used'
    }
    
    if (draggedMatch === match) {
      className += ' dragging'
    }
    
    return className
  }

  return (
    <div className="question-container">
      <h2 className="question-title">{question.question_title}</h2>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      
      <div className="match-following-container">
        {/* Left column - Terms */}
        <div className="match-terms-column">
          <h3 className="match-column-title">Terms</h3>
          {terms.map((term, index) => (
            <div
              key={index}
              className={getTermClass(term)}
              onDragOver={(e) => handleDragOver(e, term)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, term)}
            >
              <div className="match-term-text">{term}</div>
              {userMatches[term] && (
                <div className="match-assigned">
                  <span className="match-assigned-text">{userMatches[term]}</span>
                  {!showFeedback && (
                    <button
                      className="match-remove-btn"
                      onClick={() => handleRemoveMatch(term)}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
              {showFeedback && (
                <div className="match-correct-answer">
                  Correct: <strong>{answerOptions.right ? answerOptions.right[terms.indexOf(term)] : 'N/A'}</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right column - Matches */}
        <div className="match-options-column">
          <h3 className="match-column-title">Drag to Match</h3>
          {matches.map((match, index) => (
            <div
              key={index}
              className={getMatchClass(match)}
              draggable={!showFeedback && !isMatchUsed(match)}
              onDragStart={() => handleDragStart(match)}
              onDragEnd={() => setDraggedMatch(null)}
            >
              {match}
            </div>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback-content">
            <div className="feedback-title">
              {isCorrect ? 'All matches correct!' : 'Some matches are incorrect'}
            </div>
            {!isCorrect && question.hint_description && (
              <div className="feedback-hint">
                <strong>Hint:</strong> {question.hint_description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MatchFollowingQuestion

