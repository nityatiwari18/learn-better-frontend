import { useState, useEffect } from 'react'
import './QuestionStyles.css'

/**
 * Fill in the Blank Question Component - Multiple Choice Version
 */
function FillBlankQuestion({ question, onAnswer, showFeedback, isCorrect, userAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || null)

  useEffect(() => {
    setSelectedAnswer(userAnswer)
  }, [userAnswer])

  const handleOptionClick = (optionKey) => {
    if (!showFeedback) {
      setSelectedAnswer(optionKey)
      onAnswer(optionKey)
    }
  }

  const getOptionClassName = (optionKey) => {
    let className = 'option-card'
    if (showFeedback) {
      if (question.correct_answers && question.correct_answers.includes(optionKey)) {
        className += ' correct'
      } else if (selectedAnswer === optionKey && !isCorrect) {
        className += ' incorrect'
      }
    } else if (selectedAnswer === optionKey) {
      className += ' selected'
    }
    return className
  }

  const answerOptions = question.answer_options || {}
  const questionText = answerOptions.text || question.description || ''
  const options = answerOptions.options || {}

  return (
    <div className="question-container">
      <h3 className="question-title">{question.question_title}</h3>
      {questionText && <p className="question-description">{questionText}</p>}
      
      <div className="question-options">
        {Object.entries(options).map(([key, value]) => (
          <div
            key={key}
            className={getOptionClassName(key)}
            onClick={() => handleOptionClick(key)}
          >
            <span className="option-label">{key}.</span> {value}
          </div>
        ))}
      </div>

      {showFeedback && (
        <div className="feedback-section">
          <p className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
            <span className="feedback-icon">{isCorrect ? '✓' : '✗'}</span>
            {isCorrect ? 'Correct!' : 'Incorrect.'}
          </p>
          {!isCorrect && question.hint && <p className="hint-text">Hint: {question.hint}</p>}
        </div>
      )}
    </div>
  )
}

export default FillBlankQuestion

