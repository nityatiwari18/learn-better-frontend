import { useState } from 'react'
import './QuestionStyles.css'

/**
 * True/False Question Component
 */
function TrueFalseQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  // Convert lowercase userAnswer (true/false) to capitalized for display (True/False)
  const getDisplayValue = (value) => {
    if (!value) return null
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  const [selectedAnswer, setSelectedAnswer] = useState(getDisplayValue(userAnswer))

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return // Don't allow changes after feedback shown
    
    setSelectedAnswer(answer)
    // Backend expects lowercase "true" or "false"
    onAnswer(answer.toLowerCase())
  }

  const getButtonClass = (answer) => {
    let className = 'true-false-button'
    
    if (selectedAnswer === answer) {
      className += ' selected'
    }
    
    if (showFeedback) {
      if (selectedAnswer === answer) {
        className += isCorrect ? ' correct' : ' incorrect'
      }
      // Show correct answer if user was wrong
      // correct_answers contains lowercase (true/false), answer is capitalized (True/False)
      if (!isCorrect && question.correct_answers?.includes(answer.toLowerCase())) {
        className += ' correct-answer'
      }
    }
    
    return className
  }

  return (
    <div className="question-container">
      <h2 className="question-title">{question.question_title}</h2>
      {question.description && (
        <p className="question-description">{question.description}</p>
      )}
      
      <div className="true-false-container">
        <button
          className={getButtonClass('True')}
          onClick={() => handleAnswerSelect('True')}
          disabled={showFeedback}
        >
          <span className="true-false-icon">✓</span>
          <span className="true-false-text">True</span>
        </button>
        
        <button
          className={getButtonClass('False')}
          onClick={() => handleAnswerSelect('False')}
          disabled={showFeedback}
        >
          <span className="true-false-icon">✗</span>
          <span className="true-false-text">False</span>
        </button>
      </div>

      {showFeedback && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback-content">
            <div className="feedback-title">
              {isCorrect ? 'Correct!' : 'Incorrect'}
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

export default TrueFalseQuestion

