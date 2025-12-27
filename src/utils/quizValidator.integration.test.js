/**
 * Integration Tests - Component Answer Format with Backend Response
 * Tests that components send answers in the format expected by backend
 */

import { describe, test, expect } from 'vitest'
import { validateAnswer } from './quizValidator'

describe('Integration Tests - Component to Backend Format', () => {
  
  describe('Objective Question - Backend Response Simulation', () => {
    // Simulating actual backend response format
    const backendQuestion = {
      id: 1,
      question_type: 'objective',
      question_title: 'What is the capital of France?',
      answer_options: {
        options: ['Paris', 'London', 'Berlin', 'Madrid']
      },
      correct_answers: ['A'] // Backend sends letter
    }

    test('Component should send letter A when user selects first option "Paris"', () => {
      // User clicks on "Paris" (index 0)
      const optionText = 'Paris'
      const optionIndex = backendQuestion.answer_options.options.indexOf(optionText)
      const optionLetter = String.fromCharCode(65 + optionIndex) // A
      
      // Component sends letter to validator
      const isCorrect = validateAnswer(backendQuestion, optionLetter)
      
      expect(optionLetter).toBe('A')
      expect(isCorrect).toBe(true)
    })

    test('Component should send letter B when user selects second option "London"', () => {
      const optionText = 'London'
      const optionIndex = backendQuestion.answer_options.options.indexOf(optionText)
      const optionLetter = String.fromCharCode(65 + optionIndex) // B
      
      const isCorrect = validateAnswer(backendQuestion, optionLetter)
      
      expect(optionLetter).toBe('B')
      expect(isCorrect).toBe(false) // Wrong answer
    })

    test('Should work with alternative backend format (A/B/C/D keys)', () => {
      const altFormatQuestion = {
        ...backendQuestion,
        answer_options: {
          A: 'Paris',
          B: 'London',
          C: 'Berlin',
          D: 'Madrid'
        }
      }

      // Extract options in order
      const options = Object.entries(altFormatQuestion.answer_options)
        .filter(([key]) => key.match(/^[A-D]$/))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => value)

      const optionText = 'Paris'
      const optionIndex = options.indexOf(optionText)
      const optionLetter = String.fromCharCode(65 + optionIndex)
      
      const isCorrect = validateAnswer(altFormatQuestion, optionLetter)
      
      expect(isCorrect).toBe(true)
    })
  })

  describe('True/False Question - Backend Response Simulation', () => {
    const backendQuestion = {
      id: 2,
      question_type: 'true_false',
      question_title: 'The Earth is round',
      correct_answers: ['true'] // Backend sends lowercase
    }

    test('Component should send lowercase "true" when user clicks True button', () => {
      // User clicks "True" button (displays as "True")
      const displayValue = 'True'
      const sentValue = displayValue.toLowerCase() // Convert to lowercase
      
      const isCorrect = validateAnswer(backendQuestion, sentValue)
      
      expect(sentValue).toBe('true')
      expect(isCorrect).toBe(true)
    })

    test('Component should send lowercase "false" when user clicks False button', () => {
      const displayValue = 'False'
      const sentValue = displayValue.toLowerCase()
      
      const isCorrect = validateAnswer(backendQuestion, sentValue)
      
      expect(sentValue).toBe('false')
      expect(isCorrect).toBe(false) // Wrong answer
    })

    test('Should validate false answer correctly', () => {
      const falseQuestion = {
        ...backendQuestion,
        correct_answers: ['false']
      }

      const sentValue = 'False'.toLowerCase()
      const isCorrect = validateAnswer(falseQuestion, sentValue)
      
      expect(isCorrect).toBe(true)
    })
  })

  describe('Fill Blank Question - Backend Response Simulation', () => {
    const backendQuestion = {
      id: 3,
      question_type: 'fill_blank',
      question_title: 'Complete the sentence',
      answer_options: {
        text: 'The _____ is the largest planet',
        options: {
          A: 'Jupiter',
          B: 'Mars',
          C: 'Earth',
          D: 'Venus'
        }
      },
      correct_answers: ['A'] // Backend sends letter
    }

    test('Component should send letter A when user selects option A', () => {
      // Component already sends option key directly
      const selectedKey = 'A'
      
      const isCorrect = validateAnswer(backendQuestion, selectedKey)
      
      expect(isCorrect).toBe(true)
    })

    test('Component behavior is already correct - sends key not value', () => {
      // User clicks on option with key 'B'
      const selectedKey = 'B' // Component sends key, not "Mars"
      
      const isCorrect = validateAnswer(backendQuestion, selectedKey)
      
      expect(isCorrect).toBe(false)
    })
  })

  describe('Match Following Question - Backend Response Simulation', () => {
    const backendQuestion = {
      id: 4,
      question_type: 'match',
      question_title: 'Match countries with capitals',
      answer_options: {
        left: ['France', 'Germany', 'Italy'],
        right: ['Paris', 'Berlin', 'Rome']
      },
      correct_answers: ['0-0', '1-1', '2-2'] // Backend sends index pairs
    }

    test('Component sends array of objects, validator converts to index pairs', () => {
      // Component sends array of {term, match} objects
      const userAnswer = [
        { term: 'France', match: 'Paris' },
        { term: 'Germany', match: 'Berlin' },
        { term: 'Italy', match: 'Rome' }
      ]
      
      const isCorrect = validateAnswer(backendQuestion, userAnswer)
      
      expect(isCorrect).toBe(true)
    })

    test('Incorrect matches should fail validation', () => {
      const userAnswer = [
        { term: 'France', match: 'Berlin' }, // Wrong!
        { term: 'Germany', match: 'Paris' },  // Wrong!
        { term: 'Italy', match: 'Rome' }
      ]
      
      const isCorrect = validateAnswer(backendQuestion, userAnswer)
      
      expect(isCorrect).toBe(false)
    })

    test('Component can also send object format {term: match}', () => {
      const userAnswer = {
        'France': 'Paris',
        'Germany': 'Berlin',
        'Italy': 'Rome'
      }
      
      const isCorrect = validateAnswer(backendQuestion, userAnswer)
      
      expect(isCorrect).toBe(true)
    })
  })

  describe('Odd One Out Question - Backend Response Simulation', () => {
    const backendQuestion = {
      id: 5,
      question_type: 'odd_one_out',
      question_title: 'Find the odd one out',
      answer_options: {
        options: ['Apple', 'Banana', 'Orange', 'Carrot']
      },
      correct_answers: ['Carrot'] // Backend sends actual item text
    }

    test('Component should send actual item text when user selects it', () => {
      // User clicks on "Carrot"
      const selectedOption = 'Carrot'
      
      const isCorrect = validateAnswer(backendQuestion, selectedOption)
      
      expect(isCorrect).toBe(true)
    })

    test('Wrong selection should fail validation', () => {
      const selectedOption = 'Apple'
      
      const isCorrect = validateAnswer(backendQuestion, selectedOption)
      
      expect(isCorrect).toBe(false)
    })

    test('Should work with alternative items array format', () => {
      const altFormatQuestion = {
        ...backendQuestion,
        answer_options: {
          items: ['Apple', 'Banana', 'Orange', 'Carrot']
        }
      }

      const selectedOption = 'Carrot'
      const isCorrect = validateAnswer(altFormatQuestion, selectedOption)
      
      expect(isCorrect).toBe(true)
    })
  })

  describe('Real Backend Response Scenarios', () => {
    test('Complete quiz flow - Objective question', () => {
      const backendResponse = {
        quiz: {
          id: 1,
          questions: [
            {
              id: 1,
              question_type: 'objective',
              question_title: 'Which programming language is this?',
              answer_options: {
                options: ['Python', 'JavaScript', 'Go', 'Rust']
              },
              correct_answers: ['C'] // Go is at index 2 = C
            }
          ]
        }
      }

      const question = backendResponse.quiz.questions[0]
      
      // User selects "Go" (index 2)
      const selectedText = 'Go'
      const selectedIndex = question.answer_options.options.indexOf(selectedText)
      const sentValue = String.fromCharCode(65 + selectedIndex)
      
      expect(sentValue).toBe('C')
      expect(validateAnswer(question, sentValue)).toBe(true)
    })

    test('Complete quiz flow - True/False question', () => {
      const backendResponse = {
        quiz: {
          questions: [
            {
              id: 2,
              question_type: 'true_false',
              question_title: 'React is a framework',
              correct_answers: ['false'] // It's a library!
            }
          ]
        }
      }

      const question = backendResponse.quiz.questions[0]
      
      // User clicks False button
      const sentValue = 'False'.toLowerCase()
      
      expect(sentValue).toBe('false')
      expect(validateAnswer(question, sentValue)).toBe(true)
    })

    test('Complete quiz flow - Mixed question types', () => {
      const backendResponse = {
        quiz: {
          questions: [
            {
              id: 1,
              question_type: 'objective',
              question_title: 'Select correct answer',
              answer_options: { options: ['A', 'B', 'C'] },
              correct_answers: ['A']
            },
            {
              id: 2,
              question_type: 'true_false',
              question_title: 'True or False?',
              correct_answers: ['true']
            },
            {
              id: 3,
              question_type: 'fill_blank',
              question_title: 'Fill blank',
              answer_options: { options: { A: 'One', B: 'Two' } },
              correct_answers: ['B']
            }
          ]
        }
      }

      // Test all three questions
      expect(validateAnswer(backendResponse.quiz.questions[0], 'A')).toBe(true)
      expect(validateAnswer(backendResponse.quiz.questions[1], 'true')).toBe(true)
      expect(validateAnswer(backendResponse.quiz.questions[2], 'B')).toBe(true)
    })
  })
})

