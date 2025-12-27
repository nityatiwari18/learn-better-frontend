import { useState } from 'react'
import './QuestionStyles.css'

/**
 * Objective (Multiple Choice) Question Component
 */
function ObjectiveQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  // Handle both formats: {options: [...]} or {A: "...", B: "...", C: "...", D: "..."}
  const answerOptions = question.answer_options || question.answer_json || {}
  const options = answerOptions.options || 
                  Object.entries(answerOptions)
                    .filter(([key]) => key.match(/^[A-D]$/))
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([, value]) => value)

  // Convert userAnswer letter (A, B, C) to option text for display
  const getOptionFromLetter = (letter) => {
    if (!letter) return null
    const index = letter.charCodeAt(0) - 65 // A=0, B=1, etc.
    return options[index] || null
  }

  const [selectedOption, setSelectedOption] = useState(getOptionFromLetter(userAnswer))

  const handleOptionSelect = (option) => {
    if (showFeedback) return // Don't allow changes after feedback shown
    
    setSelectedOption(option)
    
    // Backend expects option letter (A, B, C, D), not full text
    const optionIndex = options.indexOf(option)
    const optionLetter = String.fromCharCode(65 + optionIndex) // A, B, C, D
    onAnswer(optionLetter)
  }

  const getOptionClass = (option) => {
    let className = 'option-card'
    
    if (selectedOption === option) {
      className += ' selected'
    }
    
    if (showFeedback) {
      if (selectedOption === option) {
        className += isCorrect ? ' correct' : ' incorrect'
      }
      // Show correct answer if user was wrong
      // correct_answers contains letters (A, B, C), so convert option to letter
      if (!isCorrect) {
        const optionIndex = options.indexOf(option)
        const optionLetter = String.fromCharCode(65 + optionIndex)
        if (question.correct_answers?.includes(optionLetter)) {
          className += ' correct-answer'
        }
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
      
      <div className="options-grid">
        {options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(option)}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="option-label">{String.fromCharCode(65 + index)}</div>
            <div className="option-text">{option}</div>
          </div>
        ))}
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

export default ObjectiveQuestion

