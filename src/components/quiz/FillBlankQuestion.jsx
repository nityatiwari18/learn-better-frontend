import { useState, useEffect } from 'react'
import { formatCorrectAnswerForDisplay } from '../../utils/quizValidator'
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
      // Highlight user's selected answer
      if (selectedAnswer === optionKey) {
        className += isCorrect ? ' correct' : ' incorrect'
      }
      // Always highlight correct answer when feedback is shown
      if (question.correct_answers && question.correct_answers.includes(optionKey)) {
        className += ' correct-answer'
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
      <h2 className="question-title">{question.question_title}</h2>
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
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback-content">
            <div className="feedback-title">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            {!isCorrect && (
              <div className="feedback-answer">
                The correct answer is <strong>{formatCorrectAnswerForDisplay(question)}</strong>.
              </div>
            )}
            {!isCorrect && (question.hint || question.hint_description) && (
              <div className="feedback-hint">
                <strong>Hint:</strong> {question.hint || question.hint_description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FillBlankQuestion

