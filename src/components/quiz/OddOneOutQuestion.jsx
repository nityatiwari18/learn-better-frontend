import { useState } from 'react'
import { formatCorrectAnswerForDisplay } from '../../utils/quizValidator'
import './QuestionStyles.css'

/**
 * Odd One Out Question Component
 */
function OddOneOutQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  const [selectedOption, setSelectedOption] = useState(userAnswer || null)

  const handleOptionSelect = (option) => {
    if (showFeedback) return // Don't allow changes after feedback shown
    
    setSelectedOption(option)
    onAnswer(option)
  }

  const answerOptions = question.answer_options || question.answer_json || {}
  const options = answerOptions.options || answerOptions.items || []

  const getOptionClass = (option) => {
    let className = 'odd-one-out-card'
    
    if (selectedOption === option) {
      className += ' selected'
    }
    
    if (showFeedback) {
      if (selectedOption === option) {
        className += isCorrect ? ' correct' : ' incorrect'
      }
      // Always show correct answer when feedback is shown
      if (question.correct_answers?.includes(option)) {
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
      
      <div className="odd-one-out-grid">
        {options.map((option, index) => (
          <div
            key={index}
            className={getOptionClass(option)}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="odd-one-out-text">{option}</div>
          </div>
        ))}
      </div>

      {showFeedback && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback-content">
            <div className="feedback-title">
              {isCorrect ? 'Correct! You found the odd one out!' : 'Incorrect'}
            </div>
            {!isCorrect && (
              <div className="feedback-answer">
                The correct answer is <strong>{formatCorrectAnswerForDisplay(question)}</strong>.
              </div>
            )}
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

export default OddOneOutQuestion

