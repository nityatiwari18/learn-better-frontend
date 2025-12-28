import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation, useNavigationType } from 'react-router-dom'
import { contentApi } from '../api/content'
import { storage } from '../utils/storage'
import { validateAnswer } from '../utils/quizValidator'
import ObjectiveQuestion from './quiz/ObjectiveQuestion'
import TrueFalseQuestion from './quiz/TrueFalseQuestion'
import FillBlankQuestion from './quiz/FillBlankQuestion'
import MatchFollowingQuestion from './quiz/MatchFollowingQuestion'
import OddOneOutQuestion from './quiz/OddOneOutQuestion'
import QuizScore from './quiz/QuizScore'
import Modal from './Modal'
import LoadingWithProgress from './LoadingWithProgress'
import './QuizScreen.css'

const QUIZ_STATES = {
  LOADING: 'loading',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERROR: 'error'
}

// Flag to use test data instead of API
const USE_TEST_DATA = false

// Mock quiz data for testing MatchTheFollowing questions
const MOCK_QUIZ_RESPONSE = {
  quiz: {
    id: 1,
    content_id: 1,
    questions: [
      {
        id: 1,
        quiz_id: 1,
        question_type: "match",
        question_title: "Match countries with capitals",
        description: "Match each country with its capital city",
        answer_options: {
          left: ["France", "Germany", "Italy"],
          right: ["Paris", "Berlin", "Rome"]
        },
        correct_answers: ["0-0", "1-1", "2-2"],
        hint: "Think about European geography",
        linked_concepts: ["Geography"],
        order_index: 0
      },
      {
        id: 2,
        quiz_id: 1,
        question_type: "match",
        question_title: "Match programming languages with their paradigms",
        description: "Match each programming language with its primary paradigm",
        answer_options: {
          left: ["Python", "Haskell", "C++"],
          right: ["Object-Oriented", "Functional", "Procedural"]
        },
        correct_answers: ["0-0", "1-1", "2-2"],
        hint: "Consider the primary programming style of each language",
        linked_concepts: ["Programming"],
        order_index: 1
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

function QuizScreen() {
  const { quizId: routeQuizId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  
  // Get URL, config, and contentId from location state (passed from ContentSummary)
  const { url: locationUrl, config: locationConfig, contentId: locationContentId } = location.state || {}
  
  const initialState = QUIZ_STATES.LOADING
  const [state, setState] = useState(initialState)
  const [quiz, setQuiz] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [error, setError] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingMoreQuestions, setLoadingMoreQuestions] = useState(false)
  const [showHintModal, setShowHintModal] = useState(false)
  const progressRef = useRef(null)
  const lastUrlParamsRef = useRef({ quizId: null, questionIndex: null })
  const pollIntervalRef = useRef(null)
  const questionCountRef = useRef(0)
  const isFetchingRef = useRef(false)
  const hasInitializedRef = useRef(false)
  const contentIdRef = useRef(null)

  // Add/remove body class when hint modal opens/closes for z-index override
  useEffect(() => {
    if (showHintModal) {
      document.body.classList.add('hint-modal-open')
    } else {
      document.body.classList.remove('hint-modal-open')
    }
    return () => {
      document.body.classList.remove('hint-modal-open')
    }
  }, [showHintModal])

  // Fetch quiz on mount - handle both contentId (new quiz) and quizId (existing quiz) flows
  useEffect(() => {
    // Check for contentId in query params (new quiz creation flow)
    const contentIdFromQuery = searchParams.get('contentId')
    
    if (contentIdFromQuery && !routeQuizId && !isFetchingRef.current && !hasInitializedRef.current) {
      // New quiz flow: contentId in query params, no routeQuizId
      console.log('QuizScreen effect triggered, contentId from query:', contentIdFromQuery)
      setState(QUIZ_STATES.LOADING)
      setLoadingProgress(0)
      fetchQuizByContentId(contentIdFromQuery)
      return
    }
    
    // Existing quiz flow: routeQuizId present
    if (routeQuizId && !isFetchingRef.current && !hasInitializedRef.current) {
      const questionIndex = parseInt(searchParams.get('questionIndex') || '0', 10)
      console.log('QuizScreen effect triggered, quizId:', routeQuizId, 'questionIndex:', questionIndex)
      
      hasInitializedRef.current = false
      fetchQuizById(routeQuizId, questionIndex)
    }
    
    return () => {
      console.log('QuizScreen effect cleanup')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeQuizId, searchParams])

  // Handle URL changes (browser back/forward)
  useEffect(() => {
    const urlQuestionIndex = searchParams.get('questionIndex')
    
    // Check if URL params actually changed
    const paramsChanged = urlQuestionIndex !== lastUrlParamsRef.current.questionIndex
    
    // Only handle URL changes if quiz is already loaded and params changed
    if (routeQuizId && quiz && state === QUIZ_STATES.ACTIVE && paramsChanged) {
      const questionIndex = parseInt(urlQuestionIndex || '0', 10)
      
      // Update last processed params
      lastUrlParamsRef.current = { quizId: routeQuizId, questionIndex: urlQuestionIndex }
      
      // Validate questionIndex is within bounds
      if (questionIndex >= 0 && questionIndex < (quiz.questions?.length || 0)) {
        // Only update if different from current index
        if (questionIndex !== currentIndex) {
          console.log('URL changed, updating question index to:', questionIndex)
          setCurrentIndex(questionIndex)
          setCurrentAnswer(null)
          setShowFeedback(false)
          setIsCorrect(false)
          setShowHintModal(false)
        }
      } else if (quiz.questions?.length > 0) {
        // Question index out of bounds, reset to valid index
        const validIndex = Math.max(0, Math.min(questionIndex, quiz.questions.length - 1))
        console.log('Question index out of bounds, resetting to:', validIndex)
        setSearchParams({ questionIndex: validIndex.toString() }, { replace: true })
        setCurrentIndex(validIndex)
        lastUrlParamsRef.current = { quizId: routeQuizId, questionIndex: validIndex.toString() }
      }
    } else if (routeQuizId && urlQuestionIndex) {
      // Update ref even if we don't process (to track current state)
      lastUrlParamsRef.current = { quizId: routeQuizId, questionIndex: urlQuestionIndex }
    }
  }, [searchParams, quiz, state, currentIndex, routeQuizId])

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

  // Fetch quiz by ID with cache-first loading
  const fetchQuizById = async (quizId, questionIndex = 0) => {
    if (isFetchingRef.current) {
      console.log('Already fetching quiz, skipping duplicate call')
      return
    }
    
    try {
      isFetchingRef.current = true
      console.log('Starting quiz fetch by ID:', quizId)
      
      // Clear any existing polling before starting new fetch
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      setState(QUIZ_STATES.LOADING)
      setLoadingProgress(0)
      
      let response
      
      // Cache-first loading: If we have URL and config, try cache first
      if (locationUrl && locationConfig) {
        console.log('Attempting cache-first load with URL:', locationUrl)
        try {
          // Check cache directly first
          const cached = storage.getContentCache(locationUrl, locationConfig)
          if (cached && cached.quiz && cached.quiz.quiz) {
            const cachedQuiz = cached.quiz.quiz
            // Verify the quiz ID matches
            if (cachedQuiz.id === parseInt(quizId, 10)) {
              console.log('Found matching quiz in cache, using cached data')
              response = cached.quiz
              setLoadingProgress(100)
            } else {
              // Quiz ID mismatch, fetch by quizId instead
              console.log('Cache quiz ID mismatch, fetching by quizId from API')
              response = await contentApi.getQuizById(quizId)
            }
          } else {
            // No cache or no quiz in cache, fetch by quizId
            console.log('No quiz found in cache, fetching by quizId from API')
            response = await contentApi.getQuizById(quizId)
          }
        } catch (cacheErr) {
          console.log('Cache check failed, fetching from API:', cacheErr)
          response = await contentApi.getQuizById(quizId)
        }
      } else {
        // No URL/config available, fetch directly from API
        console.log('No URL/config available, fetching directly from API')
        response = await contentApi.getQuizById(quizId)
      }
      
      console.log('Quiz fetch completed, got', response.quiz.questions?.length, 'questions')
      
      // Complete progress if not already done
      if (loadingProgress < 100) {
        setLoadingProgress(100)
      }
      
      // Validate questionIndex is within bounds
      const validIndex = Math.max(0, Math.min(questionIndex, (response.quiz.questions?.length || 1) - 1))
      
      // Wait a bit to show 100% if we loaded from cache (instant load)
      const delay = locationUrl && locationConfig ? 100 : 500
      setTimeout(() => {
        setQuiz(response.quiz)
        setUserAnswers(Array(response.quiz.questions?.length || 10).fill(null))
        setCurrentIndex(validIndex)
        setState(QUIZ_STATES.ACTIVE)
        
        // Track initial question count and content_id for polling
        questionCountRef.current = response.quiz.questions?.length || 0
        contentIdRef.current = response.quiz.content_id || null
        hasInitializedRef.current = true
        isFetchingRef.current = false
        
        // Update URL with correct questionIndex
        if (validIndex !== questionIndex) {
          setSearchParams({ questionIndex: validIndex.toString() }, { replace: true })
          lastUrlParamsRef.current = { quizId: quizId.toString(), questionIndex: validIndex.toString() }
        } else {
          lastUrlParamsRef.current = { quizId: quizId.toString(), questionIndex: validIndex.toString() }
        }
        
        // If we got less than 10 questions, start polling immediately
        if (response.quiz.questions?.length < 10) {
          console.log(`Initial load: ${response.quiz.questions?.length} questions, starting polling...`)
          setLoadingMoreQuestions(true)
          startPollingForAdditionalQuestions()
        } else {
          console.log(`Initial load: ${response.quiz.questions?.length} questions, no polling needed`)
        }
      }, delay)
    } catch (err) {
      console.error('Failed to fetch quiz by ID:', err)
      setState(QUIZ_STATES.ERROR)
      setError(err.response?.data?.message || 'Failed to load quiz. Please try again.')
      isFetchingRef.current = false
    }
  }

  // Fetch quiz by contentId (new quiz creation flow)
  const fetchQuizByContentId = async (contentId) => {
    if (isFetchingRef.current) {
      console.log('Already fetching quiz, skipping duplicate call')
      return
    }
    
    try {
      isFetchingRef.current = true
      console.log('Starting quiz fetch by contentId:', contentId)
      
      // Clear any existing polling before starting new fetch
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      // State is already set to LOADING by the useEffect
      setLoadingProgress(0)
      
      // Get url and config from location state (passed from ContentSummary)
      const url = locationUrl
      const config = locationConfig
      
      // Fetch/create quiz using contentId
      const response = await contentApi.getQuiz(contentId, url, false, config)
      
      console.log('Quiz fetch by contentId completed, got', response.quiz.questions?.length, 'questions')
      
      // Get quizId from response
      const quizId = response.quiz?.id
      if (!quizId) {
        throw new Error('Failed to get quiz ID from response')
      }
      
      // Complete progress
      setLoadingProgress(100)
      
      // Get questionIndex from query params
      const questionIndex = parseInt(searchParams.get('questionIndex') || '0', 10)
      
      // Validate questionIndex is within bounds
      const validIndex = Math.max(0, Math.min(questionIndex, (response.quiz.questions?.length || 1) - 1))
      
      // Wait a bit to show 100% progress
      setTimeout(() => {
        setQuiz(response.quiz)
        setUserAnswers(Array(response.quiz.questions?.length || 10).fill(null))
        setCurrentIndex(validIndex)
        setState(QUIZ_STATES.ACTIVE)
        
        // Track initial question count and content_id for polling
        questionCountRef.current = response.quiz.questions?.length || 0
        contentIdRef.current = response.quiz.content_id || null
        hasInitializedRef.current = true
        isFetchingRef.current = false
        
        // Update URL to /quiz/:quizId?questionIndex=X (replace: true to avoid back button issues)
        navigate(`/quiz/${quizId}?questionIndex=${validIndex}`, { replace: true })
        lastUrlParamsRef.current = { quizId: quizId.toString(), questionIndex: validIndex.toString() }
        
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
      console.error('Failed to fetch quiz by contentId:', err)
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
        
        // Get quiz content_id to poll for more questions
        if (!contentIdRef.current) {
          console.warn('Cannot poll: quiz content_id not available')
          return
        }
        
        const response = await contentApi.getQuiz(contentIdRef.current, null, true, null) // bypassCache = true
        const newCount = response.quiz.questions?.length || 0
        
        console.log(`📡 Poll #${pollCount} result: Current ${currentCount} questions, API returned ${newCount}`)
        
        if (newCount > currentCount) {
          console.log(`✨ Found ${newCount - currentCount} new questions!`)
          
          // Update ref with new count and content_id
          questionCountRef.current = newCount
          if (response.quiz.content_id) {
            contentIdRef.current = response.quiz.content_id
          }
          
          // Update quiz with new questions
          setQuiz(response.quiz)
          setUserAnswers(prev => {
            const newAnswers = [...prev]
            while (newAnswers.length < newCount) {
              newAnswers.push(null)
            }
            return newAnswers
          })
          
          // Update URL if questionIndex is out of bounds after new questions added
          const urlQuestionIndex = parseInt(searchParams.get('questionIndex') || '0', 10)
          if (response.quiz.id && urlQuestionIndex >= newCount) {
            const validIndex = Math.max(0, newCount - 1)
            setSearchParams({ questionIndex: validIndex.toString() }, { replace: true })
            lastUrlParamsRef.current = { quizId: response.quiz.id.toString(), questionIndex: validIndex.toString() }
            if (currentIndex >= newCount) {
              setCurrentIndex(validIndex)
            }
          }
          
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
      console.log('Cleaning up QuizScreen...')
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
      contentIdRef.current = null
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
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      setCurrentAnswer(null)
      setShowFeedback(false)
      setIsCorrect(false)
      setShowHintModal(false)
      
      // Update URL with new questionIndex
      if (quiz.id) {
        setSearchParams({ questionIndex: newIndex.toString() }, { replace: true })
        lastUrlParamsRef.current = { quizId: quiz.id.toString(), questionIndex: newIndex.toString() }
      }
    } else if (loadingMoreQuestions) {
      // More questions are being generated, wait for them
      console.log('Waiting for more questions to load...')
    } else {
      // Quiz completed - we have all questions
      setState(QUIZ_STATES.COMPLETED)
    }
  }

  const handleRetry = () => {
    // Reset state for retry
    hasInitializedRef.current = false
    isFetchingRef.current = false
    if (routeQuizId) {
      fetchQuizById(routeQuizId, 0)
    }
  }

  const handleClose = () => {
    // Check navigationType to handle browser back button correctly
    // If navigationType is 'POP' (browser back), go to home to avoid reloading ContentSummary
    if (navigationType === 'POP') {
      console.log('Browser back detected, navigating to home')
      navigate('/home', { replace: true })
      return
    }
    
    // Otherwise, navigate back to ContentSummary using content_id from quiz
    const contentId = quiz?.content_id || contentIdRef.current
    if (contentId) {
      navigate(`/content/${contentId}`, { replace: true })
    } else {
      // Fallback to home if content_id is not available
      navigate('/home', { replace: true })
    }
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
    <div className="quiz-screen">
      <div className={`quiz-screen-container ${state}`}>
        {/* Loading State */}
        {state === QUIZ_STATES.LOADING && (
          <div className="quiz-loading">
            <LoadingWithProgress
              title="Generating Quiz"
              subtitle="Creating personalized questions from your content..."
              progress={loadingProgress}
            />
          </div>
        )}

        {/* Active Quiz State */}
        {state === QUIZ_STATES.ACTIVE && quiz && (
          <>
            <div className="quiz-header">
              <button className="quiz-close-btn" onClick={handleClose}>×</button>
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
              {quiz.questions[currentIndex] && (quiz.questions[currentIndex].hint || quiz.questions[currentIndex].hint_description) && (
                <button
                  className="quiz-hint-btn"
                  onClick={() => setShowHintModal(true)}
                >
                  Hint
                </button>
              )}
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
            onClose={handleClose}
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
              <button className="quiz-cancel-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hint Modal */}
      {state === QUIZ_STATES.ACTIVE && quiz && quiz.questions[currentIndex] && (
        <Modal
          isOpen={showHintModal}
          onClose={() => setShowHintModal(false)}
          customClassName="quiz-hint-modal"
        >
          <div className="quiz-hint-modal-content">
            <h3 className="quiz-hint-modal-title">Hint</h3>
            <p className="quiz-hint-modal-text">
              {quiz.questions[currentIndex].hint || quiz.questions[currentIndex].hint_description || 'No hint available.'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default QuizScreen

