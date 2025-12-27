import { useState, useEffect, useRef } from 'react'
import { contentApi } from '../api/content'
import { validateAnswer } from '../utils/quizValidator'
import ObjectiveQuestion from './quiz/ObjectiveQuestion'
import TrueFalseQuestion from './quiz/TrueFalseQuestion'
import FillBlankQuestion from './quiz/FillBlankQuestion'
import MatchFollowingQuestion from './quiz/MatchFollowingQuestion'
import OddOneOutQuestion from './quiz/OddOneOutQuestion'
import QuizScore from './quiz/QuizScore'
import './QuizPopup.css'

const QUIZ_STATES = {
  LOADING: 'loading',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERROR: 'error'
}

function QuizPopup({ contentId, onClose }) {
  const [state, setState] = useState(QUIZ_STATES.LOADING)
  const [quiz, setQuiz] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [error, setError] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMoreQuestions, setLoadingMoreQuestions] = useState(false)
  const progressRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const questionCountRef = useRef(0) // Track current question count
  const isFetchingRef = useRef(false) // Prevent multiple simultaneous fetches
  const hasInitializedRef = useRef(false) // Track if quiz has been loaded

  // Fetch quiz on mount or contentId change
  useEffect(() => {
    console.log('QuizPopup effect triggered, contentId:', contentId)
    
    // Reset initialization flag when contentId changes
    hasInitializedRef.current = false
    
    // Only fetch if not already fetching
    if (!isFetchingRef.current) {
      fetchQuiz()
    }
    
    return () => {
      console.log('QuizPopup effect cleanup')
    }
  }, [contentId])

  // Simulated loading progress
  useEffect(() => {
    if (state === QUIZ_STATES.LOADING) {
      progressRef.current = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressRef.current)
            return 90
          }
          const increment = Math.max(0.5, (90 - prev) / 15)
          return Math.min(90, prev + increment)
        })
      }, 500)
    }

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current)
      }
    }
  }, [state])

  const fetchQuiz = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('Already fetching quiz, skipping duplicate call')
      return
    }
    
    try {
      isFetchingRef.current = true
      console.log('Starting quiz fetch for contentId:', contentId)
      
      // Clear any existing polling before starting new fetch
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      setState(QUIZ_STATES.LOADING)
      setLoadingProgress(0)
      
      const response = await contentApi.getQuiz(contentId)
      console.log('Quiz fetch completed, got', response.quiz.questions?.length, 'questions')
      
      // Complete progress
      setLoadingProgress(100)
      
      // Wait a bit to show 100%
      setTimeout(() => {
        setQuiz(response.quiz)
        setUserAnswers(Array(response.quiz.questions?.length || 10).fill(null))
        setState(QUIZ_STATES.ACTIVE)
        
        // Track initial question count
        questionCountRef.current = response.quiz.questions?.length || 0
        hasInitializedRef.current = true
        isFetchingRef.current = false
        
        // If we got less than 10 questions, start polling immediately
        if (response.quiz.questions?.length < 10) {
          console.log(`Initial load: ${response.quiz.questions?.length} questions, starting polling...`)
          setLoadingMoreQuestions(true)
          startPollingForAdditionalQuestions()
        } else {
          console.log(`Initial load: ${response.quiz.questions?.length} questions, no polling needed`)
        }
      }, 500)
    } catch (err) {
      console.error('Failed to fetch quiz:', err)
      setState(QUIZ_STATES.ERROR)
      setError(err.response?.data?.message || 'Failed to load quiz. Please try again.')
      isFetchingRef.current = false
    }
  }


  const startPollingForAdditionalQuestions = () => {
    // Prevent multiple polling intervals
    if (pollIntervalRef.current) {
      console.warn('⚠️ Polling already in progress, skipping...')
      return
    }
    
    console.log('🔄 Starting immediate polling for additional questions...')
    console.log('📊 Current question count:', questionCountRef.current)
    
    // First poll immediately, then set interval
    let pollCount = 0
    
    const doPoll = async () => {
      pollCount++
      try {
        const currentCount = questionCountRef.current
        
        console.log(`📡 Poll attempt #${pollCount} - Current ${currentCount} questions`)
        
        // Check if we already have 10 questions before making API call
        if (currentCount >= 10) {
          console.log('✅ Already have all questions, stopping polling')
          setLoadingMoreQuestions(false)
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
          }
          return
        }
        
        const response = await contentApi.getQuiz(contentId)
        const newCount = response.quiz.questions?.length || 0
        
        console.log(`📡 Poll #${pollCount} result: Current ${currentCount} questions, API returned ${newCount}`)
        
        if (newCount > currentCount) {
          console.log(`✨ Found ${newCount - currentCount} new questions!`)
          
          // Update ref with new count
          questionCountRef.current = newCount
          
          // Update quiz with new questions
          setQuiz(response.quiz)
          setUserAnswers(prev => {
            const newAnswers = [...prev]
            while (newAnswers.length < newCount) {
              newAnswers.push(null)
            }
            return newAnswers
          })
          
          // If we have all 10 questions, stop polling
          if (newCount >= 10) {
            setLoadingMoreQuestions(false)
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
              pollIntervalRef.current = null
            }
            console.log('🎉 All questions loaded, polling stopped')
          }
        } else {
          console.log(`⏳ No new questions yet (still ${currentCount})`)
        }
      } catch (err) {
        console.error('❌ Polling error:', err)
      }
    }
    
    // Start with immediate poll
    doPoll()
    
    // Then poll every 5 seconds
    pollIntervalRef.current = setInterval(doPoll, 5000)
    console.log('⏰ Polling interval set (every 5 seconds)')
    
    // Safety timeout: stop polling after 60 seconds
    setTimeout(() => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
        setLoadingMoreQuestions(false)
        console.log('⏱️ Polling timeout reached (60 seconds)')
      }
    }, 60000)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up QuizPopup...')
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (progressRef.current) {
        clearInterval(progressRef.current)
        progressRef.current = null
      }
      // Reset flags
      hasInitializedRef.current = false
      isFetchingRef.current = false
    }
  }, [])

  const handleAnswer = (answer) => {
    setCurrentAnswer(answer)
    
    // Validate answer immediately
    const question = quiz.questions[currentIndex]
    const correct = validateAnswer(question, answer)
    setIsCorrect(correct)
    setShowFeedback(true)
    
    // Store answer
    const newAnswers = [...userAnswers]
    newAnswers[currentIndex] = {
      questionId: question.id,
      userAnswer: answer,
      isCorrect: correct,
      timestamp: Date.now()
    }
    setUserAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentIndex + 1)
      setCurrentAnswer(null)
      setShowFeedback(false)
      setIsCorrect(false)
    } else if (loadingMoreQuestions) {
      // More questions are being generated, wait for them
      console.log('Waiting for more questions to load...')
      // Don't do anything, button should be disabled or show loading
    } else {
      // Quiz completed - we have all questions
      setState(QUIZ_STATES.COMPLETED)
    }
  }

  const handleRetry = () => {
    // Reset state for retry
    hasInitializedRef.current = false
    isFetchingRef.current = false
    fetchQuiz()
  }

  const renderQuestion = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return null
    
    const question = quiz.questions[currentIndex]
    const savedAnswer = userAnswers[currentIndex]?.userAnswer || null
    
    const commonProps = {
      question,
      onAnswer: handleAnswer,
      showFeedback,
      isCorrect,
      userAnswer: currentAnswer || savedAnswer
    }

    switch (question.question_type) {
      case 'objective':
      case 'Objective':
        return <ObjectiveQuestion {...commonProps} />
      case 'true_false':
      case 'TrueOrFalse':
        return <TrueFalseQuestion {...commonProps} />
      case 'fill_blank':
      case 'FillInTheBlank':
        return <FillBlankQuestion {...commonProps} />
      case 'match':
      case 'MatchTheFollowing':
        return <MatchFollowingQuestion {...commonProps} />
      case 'odd_one_out':
      case 'OddOneOut':
        return <OddOneOutQuestion {...commonProps} />
      default:
        return <div className="error-message">Unknown question type: {question.question_type}</div>
    }
  }

  return (
    <div className="quiz-popup-overlay">
      <div className={`quiz-popup ${state}`}>
        {/* Loading State */}
        {state === QUIZ_STATES.LOADING && (
          <div className="quiz-loading">
            <div className="quiz-loading-header">
              <div className="quiz-loading-spinner"></div>
              <h2 className="quiz-loading-title">Generating Quiz</h2>
              <p className="quiz-loading-subtitle">Creating personalized questions from your content...</p>
            </div>
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(loadingProgress)}%</span>
            </div>
          </div>
        )}

        {/* Active Quiz State */}
        {state === QUIZ_STATES.ACTIVE && quiz && (
          <>
            <div className="quiz-header">
              <button className="quiz-close-btn" onClick={onClose}>×</button>
              <div className="quiz-progress-info">
                Question {currentIndex + 1} of {quiz.questions?.length || 10}
                {loadingMoreQuestions && (
                  <span className="loading-more-indicator"> (Loading more questions...)</span>
                )}
              </div>
              <div className="quiz-progress-bar-small">
                <div 
                  className="quiz-progress-fill-small"
                  style={{ width: `${((currentIndex + 1) / (quiz.questions?.length || 10)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="quiz-content">
              {renderQuestion()}
            </div>

            <div className="quiz-footer">
              <button
                className="quiz-next-btn"
                onClick={handleNext}
                disabled={!showFeedback || (currentIndex >= quiz.questions.length - 1 && loadingMoreQuestions)}
              >
                {currentIndex < quiz.questions.length - 1 
                  ? 'Next Question' 
                  : loadingMoreQuestions 
                    ? 'Loading More Questions...' 
                    : 'Finish Quiz'}
              </button>
            </div>
          </>
        )}

        {/* Completed State */}
        {state === QUIZ_STATES.COMPLETED && (
          <QuizScore
            quiz={quiz}
            userAnswers={userAnswers}
            onClose={onClose}
          />
        )}

        {/* Error State */}
        {state === QUIZ_STATES.ERROR && (
          <div className="quiz-error">
            <div className="quiz-error-icon">!</div>
            <h2 className="quiz-error-title">Failed to Load Quiz</h2>
            <p className="quiz-error-message">{error}</p>
            <div className="quiz-error-actions">
              <button className="quiz-retry-btn" onClick={handleRetry}>
                Retry
              </button>
              <button className="quiz-cancel-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPopup

