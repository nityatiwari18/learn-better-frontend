import { useState } from 'react'
import { getCorrectAnswer } from '../../utils/quizValidator'
import './QuestionStyles.css'

/**
 * Quiz Score and Review Component
 */
function QuizScore({ quiz, userAnswers, onClose }) {
  const [showReview, setShowReview] = useState(false)

  // Calculate score
  const totalQuestions = quiz.questions?.length || 0
  const correctAnswers = userAnswers.filter(ans => ans?.isCorrect).length
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  // Calculate breakdown by question type
  const getBreakdown = () => {
    const breakdown = {}
    
    quiz.questions?.forEach((question, index) => {
      const type = question.question_type
      if (!breakdown[type]) {
        breakdown[type] = { total: 0, correct: 0 }
      }
      breakdown[type].total++
      if (userAnswers[index]?.isCorrect) {
        breakdown[type].correct++
      }
    })
    
    return breakdown
  }

  const breakdown = getBreakdown()

  const getScoreClass = () => {
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'average'
    return 'needs-improvement'
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent work! 🎉'
    if (percentage >= 60) return 'Good job! 👍'
    if (percentage >= 40) return 'Not bad, keep practicing! 💪'
    return 'Keep studying and try again! 📚'
  }

  const formatUserAnswer = (answer, questionType) => {
    if (!answer) return 'No answer'
    
    if (questionType === 'FillInTheBlank' && Array.isArray(answer)) {
      return answer.join(', ')
    }
    
    if (questionType === 'MatchTheFollowing' && Array.isArray(answer)) {
      return answer.map(pair => `${pair.term} → ${pair.match}`).join('; ')
    }
    
    return String(answer)
  }

  return (
    <div className="quiz-score-container">
      {!showReview ? (
        // Score Summary View
        <>
          <div className="quiz-score-header">
            <div className={`quiz-score-circle ${getScoreClass()}`}>
              <div className="quiz-score-percentage">{percentage}%</div>
              <div className="quiz-score-fraction">{correctAnswers}/{totalQuestions}</div>
            </div>
            <h2 className="quiz-score-title">{getScoreMessage()}</h2>
          </div>

          <div className="quiz-score-breakdown">
            <h3 className="breakdown-title">Performance by Question Type</h3>
            <div className="breakdown-list">
              {Object.entries(breakdown).map(([type, stats]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-type">{type}</span>
                  <div className="breakdown-bar-container">
                    <div 
                      className="breakdown-bar"
                      style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="breakdown-stats">{stats.correct}/{stats.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="quiz-score-actions">
            <button 
              className="quiz-review-btn"
              onClick={() => setShowReview(true)}
            >
              Review Answers
            </button>
            <button 
              className="quiz-done-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        // Review Mode
        <>
          <div className="quiz-review-header">
            <button 
              className="quiz-back-btn"
              onClick={() => setShowReview(false)}
            >
              ← Back to Score
            </button>
            <h2 className="quiz-review-title">Review Your Answers</h2>
          </div>

          <div className="quiz-review-list">
            {quiz.questions?.map((question, index) => {
              const userAns = userAnswers[index]
              const isCorrect = userAns?.isCorrect || false
              
              return (
                <div key={index} className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-item-header">
                    <span className="review-item-number">Question {index + 1}</span>
                    <span className={`review-item-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  <div className="review-item-question">
                    <strong>{question.question_title}</strong>
                  </div>
                  
                  {question.description && (
                    <div className="review-item-description">{question.description}</div>
                  )}
                  
                  <div className="review-item-answers">
                    <div className="review-answer-row">
                      <span className="review-answer-label">Your answer:</span>
                      <span className={`review-answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {formatUserAnswer(userAns?.userAnswer, question.question_type)}
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div className="review-answer-row">
                        <span className="review-answer-label">Correct answer:</span>
                        <span className="review-answer-value correct">
                          {typeof getCorrectAnswer(question) === 'object' 
                            ? JSON.stringify(getCorrectAnswer(question))
                            : getCorrectAnswer(question)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isCorrect && question.hint_description && (
                    <div className="review-item-hint">
                      <strong>Hint:</strong> {question.hint_description}
                    </div>
                  )}
                  
                  {question.linked_key_concepts && question.linked_key_concepts.length > 0 && (
                    <div className="review-item-concepts">
                      <strong>Related concepts:</strong>{' '}
                      {Array.isArray(question.linked_key_concepts) 
                        ? question.linked_key_concepts.join(', ')
                        : question.linked_key_concepts}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="quiz-review-footer">
            <button 
              className="quiz-done-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default QuizScore

