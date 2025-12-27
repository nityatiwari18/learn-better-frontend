import { useState, useEffect } from 'react'
import './QuestionStyles.css'

/**
 * Match the Following Question Component with Drag and Drop
 */
function MatchFollowingQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  const answerOptions = question.answer_options || question.answer_json || {}
  
  // Handle both formats: {pairs: [...]} or {left: [...], right: [...]}
  let terms
  if (answerOptions.pairs) {
    terms = answerOptions.pairs.map(p => p.term)
  } else if (answerOptions.left && answerOptions.right) {
    terms = answerOptions.left || []
  } else {
    terms = []
  }
  
  // Helper function to normalize userAnswer (array or object format) to object format
  const normalizeUserAnswer = (answer) => {
    if (!answer) return {}
    if (Array.isArray(answer)) {
      // Convert array format [{term: 'x', match: 'y'}] to object format {x: 'y'}
      return answer.reduce((acc, item) => {
        if (item && item.term && item.match) {
          acc[item.term] = item.match
        }
        return acc
      }, {})
    }
    return answer // Already in object format
  }
  
  const [matches, setMatches] = useState([])
  const [userMatches, setUserMatches] = useState(normalizeUserAnswer(userAnswer))
  const [draggedMatch, setDraggedMatch] = useState(null)
  const [dragOverTerm, setDragOverTerm] = useState(null)

  // Initialize matches array only when question changes
  useEffect(() => {
    const currentUserMatches = userAnswer || {}
    setUserMatches(currentUserMatches)
    setDraggedMatch(null)
    setDragOverTerm(null)
    
    // Initialize matches array with enabled flags
    let initialMatches = []
    if (answerOptions.pairs) {
      initialMatches = answerOptions.pairs.map(p => p.match)
    } else if (answerOptions.left && answerOptions.right) {
      initialMatches = [...(answerOptions.right || [])]
    }
    
    // Shuffle once and add enabled flag
    const shuffledMatches = [...initialMatches].sort(() => Math.random() - 0.5)
    const matchesWithFlags = shuffledMatches.map(value => ({
      value,
      enabled: !Object.values(currentUserMatches).includes(value)
    }))
    setMatches(matchesWithFlags)
  }, [question.id, answerOptions])

  // Update userMatches and enabled flags when userAnswer changes (without re-initializing matches array)
  useEffect(() => {
    const currentUserMatches = normalizeUserAnswer(userAnswer)
    setUserMatches(currentUserMatches)
    
    // Update enabled flags in existing matches array based on userAnswer
    // Only update if matches array is already initialized (not empty)
    setMatches(prevMatches => {
      if (prevMatches.length === 0) {
        return prevMatches // Don't update if matches haven't been initialized yet
      }
      return prevMatches.map(m => ({
        ...m,
        enabled: !Object.values(currentUserMatches).includes(m.value)
      }))
    })
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
    
    // Update matches array: if it was already assigned, it stays disabled; if new assignment, disable it
    setMatches(prevMatches => 
      prevMatches.map(m => 
        m.value === draggedMatch ? { ...m, enabled: false } : m
      )
    )
    
    setDraggedMatch(null)
    setDragOverTerm(null)
    
    // Check if all terms are matched (only count matches for terms in current question)
    const matchedTermsCount = terms.filter(term => newMatches[term]).length
    if (matchedTermsCount === terms.length) {
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
    const removedMatch = newMatches[term]
    delete newMatches[term]
    setUserMatches(newMatches)
    
    // Re-enable the removed match in matches array
    if (removedMatch) {
      setMatches(prevMatches => 
        prevMatches.map(m => 
          m.value === removedMatch ? { ...m, enabled: true } : m
        )
      )
    }
  }

  const isMatchUsed = (match) => {
    const matchItem = matches.find(m => m.value === match)
    return matchItem ? !matchItem.enabled : false
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

  const getMatchClass = (matchValue, enabled) => {
    let className = 'match-option-card'
    
    if (!enabled) {
      className += ' disabled'
    }
    
    if (isMatchUsed(matchValue)) {
      className += ' used'
    }
    
    if (draggedMatch === matchValue) {
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
              className={getMatchClass(match.value, match.enabled)}
              draggable={!showFeedback && match.enabled}
              onDragStart={() => handleDragStart(match.value)}
              onDragEnd={() => setDraggedMatch(null)}
            >
              {match.value}
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

