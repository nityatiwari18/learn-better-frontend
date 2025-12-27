/**
 * Quiz Answer Validation Utility
 * Validates user answers against correct answers for different question types
 */

/**
 * Validate objective (multiple choice) question
 * @param {Object} question - Question object
 * @param {string} userAnswer - User's selected answer
 * @returns {boolean} True if correct
 */
const validateObjective = (question, userAnswer) => {
  if (!userAnswer || !question.correct_answers) return false
  
  const correctAnswers = Array.isArray(question.correct_answers) 
    ? question.correct_answers 
    : [question.correct_answers]
  
  return correctAnswers.includes(userAnswer)
}

/**
 * Validate True/False question
 * @param {Object} question - Question object
 * @param {string} userAnswer - User's answer ('True' or 'False')
 * @returns {boolean} True if correct
 */
const validateTrueFalse = (question, userAnswer) => {
  if (!userAnswer || !question.correct_answers) return false
  
  const correctAnswer = Array.isArray(question.correct_answers)
    ? question.correct_answers[0]
    : question.correct_answers
  
  return userAnswer === correctAnswer
}

/**
 * Validate Fill in the Blank question (Multiple Choice Version)
 * @param {Object} question - Question object
 * @param {string} userAnswer - User's selected answer (A, B, C, or D)
 * @returns {boolean} True if answer is correct
 */
const validateFillBlank = (question, userAnswer) => {
  if (!userAnswer || !question.correct_answers) return false
  
  const correctAnswers = Array.isArray(question.correct_answers)
    ? question.correct_answers
    : [question.correct_answers]
  
  return correctAnswers.includes(userAnswer)
}

/**
 * Validate Match the Following question
 * @param {Object} question - Question object
 * @param {Array<Object>|Object} userAnswer - Array of {term, match} pairs OR object {term: match}
 * @returns {boolean} True if all matches are correct
 */
const validateMatchFollowing = (question, userAnswer) => {
  if (!userAnswer || !question.correct_answers) return false
  
  const correctAnswers = Array.isArray(question.correct_answers)
    ? question.correct_answers
    : [question.correct_answers]
  
  // Get left and right arrays from answer_options
  const answerOptions = question.answer_options || question.answer_json || {}
  const leftItems = answerOptions.left || []
  const rightItems = answerOptions.right || []
  
  console.log('[DEBUG validateMatchFollowing]', {
    userAnswer,
    correctAnswers,
    leftItems,
    rightItems,
    answerOptions
  })
  
  // If correct answers are in index format like "0-0", "1-1"
  if (correctAnswers.length > 0 && typeof correctAnswers[0] === 'string' && correctAnswers[0].includes('-')) {
    // Convert user answer object to index pairs
    const userPairs = []
    if (Array.isArray(userAnswer)) {
      // User answer is array of {term, match}
      userAnswer.forEach(pair => {
        const leftIndex = leftItems.indexOf(pair.term)
        const rightIndex = rightItems.indexOf(pair.match)
        console.log('[DEBUG] Looking up pair:', { term: pair.term, match: pair.match, leftIndex, rightIndex })
        if (leftIndex !== -1 && rightIndex !== -1) {
          userPairs.push(`${leftIndex}-${rightIndex}`)
        }
      })
    } else if (typeof userAnswer === 'object') {
      // User answer is object {term: match}
      Object.entries(userAnswer).forEach(([term, match]) => {
        const leftIndex = leftItems.indexOf(term)
        const rightIndex = rightItems.indexOf(match)
        console.log('[DEBUG] Looking up pair:', { term, match, leftIndex, rightIndex })
        if (leftIndex !== -1 && rightIndex !== -1) {
          userPairs.push(`${leftIndex}-${rightIndex}`)
        }
      })
    }
    
    console.log('[DEBUG] Final comparison:', { userPairs, correctAnswers, matches: correctAnswers.every(correctPair => userPairs.includes(correctPair)) })
    
    // Check if all correct pairs are matched AND same length
    return userPairs.length === correctAnswers.length && 
           correctAnswers.every(correctPair => userPairs.includes(correctPair))
  }
  
  // Legacy format: array of {term, match} objects
  if (!Array.isArray(userAnswer)) return false
  if (userAnswer.length !== correctAnswers.length) return false
  
  return userAnswer.every(userPair => {
    return correctAnswers.some(correctPair => {
      return userPair.term === correctPair.term && userPair.match === correctPair.match
    })
  })
}

/**
 * Validate Odd One Out question
 * @param {Object} question - Question object
 * @param {string} userAnswer - User's selected answer
 * @returns {boolean} True if correct
 */
const validateOddOneOut = (question, userAnswer) => {
  if (!userAnswer || !question.correct_answers) return false
  
  const correctAnswers = Array.isArray(question.correct_answers)
    ? question.correct_answers
    : [question.correct_answers]
  
  return correctAnswers.includes(userAnswer)
}

/**
 * Main validation function - routes to appropriate validator based on question type
 * @param {Object} question - Question object with question_type field
 * @param {*} userAnswer - User's answer (format depends on question type)
 * @returns {boolean} True if answer is correct
 */
export const validateAnswer = (question, userAnswer) => {
  if (!question || !question.question_type) return false
  
  switch (question.question_type) {
    case 'objective':
    case 'Objective':
      return validateObjective(question, userAnswer)
    case 'true_false':
    case 'TrueOrFalse':
      return validateTrueFalse(question, userAnswer)
    case 'fill_blank':
    case 'FillInTheBlank':
      return validateFillBlank(question, userAnswer)
    case 'match':
    case 'MatchTheFollowing':
      return validateMatchFollowing(question, userAnswer)
    case 'odd_one_out':
    case 'OddOneOut':
      return validateOddOneOut(question, userAnswer)
    default:
      console.warn(`Unknown question type: ${question.question_type}`)
      return false
  }
}

/**
 * Get the correct answer(s) for display purposes
 * @param {Object} question - Question object
 * @returns {string|Array} Correct answer(s) formatted for display
 */
export const getCorrectAnswer = (question) => {
  if (!question || !question.correct_answers) return 'N/A'
  
  if (Array.isArray(question.correct_answers)) {
    if (question.question_type === 'MatchTheFollowing') {
      return question.correct_answers
    }
    return question.correct_answers.join(', ')
  }
  
  return question.correct_answers
}

/**
 * Format correct answers for display in feedback messages
 * @param {Object} question - Question object
 * @returns {string} Formatted correct answer text (e.g., "A", "A or B", "A, B, or C")
 */
export const formatCorrectAnswerForDisplay = (question) => {
  if (!question || !question.correct_answers) return 'N/A'
  
  const correctAnswers = Array.isArray(question.correct_answers)
    ? question.correct_answers
    : [question.correct_answers]
  
  if (correctAnswers.length === 0) return 'N/A'
  
  const questionType = question.question_type
  
  // Handle True/False questions
  if (questionType === 'true_false' || questionType === 'TrueOrFalse') {
    const answer = correctAnswers[0]
    return answer.charAt(0).toUpperCase() + answer.slice(1) // Capitalize first letter
  }
  
  // Handle Odd One Out - return the actual item text
  if (questionType === 'odd_one_out' || questionType === 'OddOneOut') {
    return correctAnswers[0] // Return the item text directly
  }
  
  // Handle Match Following - return formatted pairs
  if (questionType === 'match' || questionType === 'MatchTheFollowing') {
    // For match questions, we show correct answer per term in the component
    // This function is mainly for other question types
    return 'See correct matches above'
  }
  
  // Handle Objective and FillBlank - format letters (A, B, C, D)
  if (correctAnswers.length === 1) {
    return correctAnswers[0]
  } else if (correctAnswers.length === 2) {
    return `${correctAnswers[0]} or ${correctAnswers[1]}`
  } else {
    // 3 or more answers: "A, B, or C"
    const allButLast = correctAnswers.slice(0, -1).join(', ')
    const last = correctAnswers[correctAnswers.length - 1]
    return `${allButLast}, or ${last}`
  }
}

export default {
  validateAnswer,
  getCorrectAnswer,
  formatCorrectAnswerForDisplay,
}

