/**
 * Unit Tests for Quiz Validator
 * Tests all question types with backend format expectations
 */

import { validateAnswer, getCorrectAnswer } from './quizValidator'

describe('Quiz Validator - Answer Format Tests', () => {
  
  describe('Objective Questions', () => {
    const objectiveQuestion = {
      id: 1,
      question_type: 'objective',
      question_title: 'What is the capital of France?',
      answer_options: {
        options: ['Paris', 'London', 'Berlin', 'Madrid']
      },
      correct_answers: ['A'] // Backend sends letter
    }

    test('should validate correct answer with letter format', () => {
      expect(validateAnswer(objectiveQuestion, 'A')).toBe(true)
    })

    test('should invalidate wrong answer with letter format', () => {
      expect(validateAnswer(objectiveQuestion, 'B')).toBe(false)
      expect(validateAnswer(objectiveQuestion, 'C')).toBe(false)
      expect(validateAnswer(objectiveQuestion, 'D')).toBe(false)
    })

    test('should handle multiple correct answers', () => {
      const multiAnswerQuestion = {
        ...objectiveQuestion,
        correct_answers: ['A', 'B']
      }
      expect(validateAnswer(multiAnswerQuestion, 'A')).toBe(true)
      expect(validateAnswer(multiAnswerQuestion, 'B')).toBe(true)
      expect(validateAnswer(multiAnswerQuestion, 'C')).toBe(false)
    })

    test('should handle alternative format with A/B/C/D keys', () => {
      const altFormatQuestion = {
        ...objectiveQuestion,
        answer_options: {
          A: 'Paris',
          B: 'London',
          C: 'Berlin',
          D: 'Madrid'
        }
      }
      expect(validateAnswer(altFormatQuestion, 'A')).toBe(true)
    })

    test('should return N/A for getCorrectAnswer with no answers', () => {
      const noAnswerQuestion = { ...objectiveQuestion }
      delete noAnswerQuestion.correct_answers
      expect(getCorrectAnswer(noAnswerQuestion)).toBe('N/A')
    })
  })

  describe('True/False Questions', () => {
    const trueFalseQuestion = {
      id: 2,
      question_type: 'true_false',
      question_title: 'The Earth is flat',
      correct_answers: ['false'] // Backend sends lowercase
    }

    test('should validate correct answer with lowercase format', () => {
      expect(validateAnswer(trueFalseQuestion, 'false')).toBe(true)
    })

    test('should invalidate wrong answer', () => {
      expect(validateAnswer(trueFalseQuestion, 'true')).toBe(false)
    })

    test('should validate true answer', () => {
      const trueQuestion = {
        ...trueFalseQuestion,
        correct_answers: ['true']
      }
      expect(validateAnswer(trueQuestion, 'true')).toBe(true)
      expect(validateAnswer(trueQuestion, 'false')).toBe(false)
    })

    test('should handle array format', () => {
      expect(validateAnswer(trueFalseQuestion, 'false')).toBe(true)
    })

    test('should handle alternative question type name', () => {
      const altQuestion = {
        ...trueFalseQuestion,
        question_type: 'TrueOrFalse'
      }
      expect(validateAnswer(altQuestion, 'false')).toBe(true)
    })
  })

  describe('Fill in the Blank Questions', () => {
    const fillBlankQuestion = {
      id: 3,
      question_type: 'fill_blank',
      question_title: 'Fill in the blank',
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

    test('should validate correct answer with letter format', () => {
      expect(validateAnswer(fillBlankQuestion, 'A')).toBe(true)
    })

    test('should invalidate wrong answer', () => {
      expect(validateAnswer(fillBlankQuestion, 'B')).toBe(false)
      expect(validateAnswer(fillBlankQuestion, 'C')).toBe(false)
      expect(validateAnswer(fillBlankQuestion, 'D')).toBe(false)
    })

    test('should handle alternative question type name', () => {
      const altQuestion = {
        ...fillBlankQuestion,
        question_type: 'FillInTheBlank'
      }
      expect(validateAnswer(altQuestion, 'A')).toBe(true)
    })

    test('should handle multiple correct answers', () => {
      const multiAnswerQuestion = {
        ...fillBlankQuestion,
        correct_answers: ['A', 'B']
      }
      expect(validateAnswer(multiAnswerQuestion, 'A')).toBe(true)
      expect(validateAnswer(multiAnswerQuestion, 'B')).toBe(true)
    })
  })

  describe('Match the Following Questions', () => {
    const matchQuestion = {
      id: 4,
      question_type: 'match',
      question_title: 'Match the countries with capitals',
      answer_options: {
        left: ['France', 'Germany', 'Italy'],
        right: ['Paris', 'Berlin', 'Rome']
      },
      correct_answers: ['0-0', '1-1', '2-2'] // Backend sends index pairs
    }

    test('should validate correct matches with array format', () => {
      const userAnswer = [
        { term: 'France', match: 'Paris' },
        { term: 'Germany', match: 'Berlin' },
        { term: 'Italy', match: 'Rome' }
      ]
      expect(validateAnswer(matchQuestion, userAnswer)).toBe(true)
    })

    test('should invalidate incorrect matches', () => {
      const userAnswer = [
        { term: 'France', match: 'Berlin' },
        { term: 'Germany', match: 'Paris' },
        { term: 'Italy', match: 'Rome' }
      ]
      expect(validateAnswer(matchQuestion, userAnswer)).toBe(false)
    })

    test('should validate correct matches with object format', () => {
      const userAnswer = {
        'France': 'Paris',
        'Germany': 'Berlin',
        'Italy': 'Rome'
      }
      expect(validateAnswer(matchQuestion, userAnswer)).toBe(true)
    })

    test('should handle partial matches', () => {
      const userAnswer = [
        { term: 'France', match: 'Paris' },
        { term: 'Germany', match: 'Rome' }
      ]
      expect(validateAnswer(matchQuestion, userAnswer)).toBe(false)
    })

    test('should handle alternative question type name', () => {
      const altQuestion = {
        ...matchQuestion,
        question_type: 'MatchTheFollowing'
      }
      const userAnswer = [
        { term: 'France', match: 'Paris' },
        { term: 'Germany', match: 'Berlin' },
        { term: 'Italy', match: 'Rome' }
      ]
      expect(validateAnswer(altQuestion, userAnswer)).toBe(true)
    })

    test('should handle legacy format with term/match objects in correct_answers', () => {
      const legacyQuestion = {
        ...matchQuestion,
        correct_answers: [
          { term: 'France', match: 'Paris' },
          { term: 'Germany', match: 'Berlin' },
          { term: 'Italy', match: 'Rome' }
        ]
      }
      const userAnswer = [
        { term: 'France', match: 'Paris' },
        { term: 'Germany', match: 'Berlin' },
        { term: 'Italy', match: 'Rome' }
      ]
      expect(validateAnswer(legacyQuestion, userAnswer)).toBe(true)
    })
  })

  describe('Odd One Out Questions', () => {
    const oddOneOutQuestion = {
      id: 5,
      question_type: 'odd_one_out',
      question_title: 'Find the odd one out',
      answer_options: {
        options: ['Apple', 'Banana', 'Orange', 'Carrot']
      },
      correct_answers: ['Carrot'] // Backend sends item text
    }

    test('should validate correct answer with item text', () => {
      expect(validateAnswer(oddOneOutQuestion, 'Carrot')).toBe(true)
    })

    test('should invalidate wrong answer', () => {
      expect(validateAnswer(oddOneOutQuestion, 'Apple')).toBe(false)
      expect(validateAnswer(oddOneOutQuestion, 'Banana')).toBe(false)
      expect(validateAnswer(oddOneOutQuestion, 'Orange')).toBe(false)
    })

    test('should handle alternative question type name', () => {
      const altQuestion = {
        ...oddOneOutQuestion,
        question_type: 'OddOneOut'
      }
      expect(validateAnswer(altQuestion, 'Carrot')).toBe(true)
    })

    test('should handle items array format', () => {
      const altFormatQuestion = {
        ...oddOneOutQuestion,
        answer_options: {
          items: ['Apple', 'Banana', 'Orange', 'Carrot']
        }
      }
      expect(validateAnswer(altFormatQuestion, 'Carrot')).toBe(true)
    })

    test('should handle multiple correct answers', () => {
      const multiAnswerQuestion = {
        ...oddOneOutQuestion,
        correct_answers: ['Carrot', 'Potato']
      }
      expect(validateAnswer(multiAnswerQuestion, 'Carrot')).toBe(true)
      expect(validateAnswer(multiAnswerQuestion, 'Potato')).toBe(true)
      expect(validateAnswer(multiAnswerQuestion, 'Apple')).toBe(false)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    test('should return false for null question', () => {
      expect(validateAnswer(null, 'A')).toBe(false)
    })

    test('should return false for question without type', () => {
      const invalidQuestion = { id: 1, question_title: 'Test' }
      expect(validateAnswer(invalidQuestion, 'A')).toBe(false)
    })

    test('should return false for unknown question type', () => {
      const unknownQuestion = {
        question_type: 'unknown_type',
        correct_answers: ['A']
      }
      expect(validateAnswer(unknownQuestion, 'A')).toBe(false)
    })

    test('should return false for null or undefined answer', () => {
      const question = {
        question_type: 'objective',
        correct_answers: ['A']
      }
      expect(validateAnswer(question, null)).toBe(false)
      expect(validateAnswer(question, undefined)).toBe(false)
    })

    test('should return false for question without correct_answers', () => {
      const question = {
        question_type: 'objective'
      }
      expect(validateAnswer(question, 'A')).toBe(false)
    })
  })

  describe('getCorrectAnswer Display Function', () => {
    test('should return correct answer string for objective', () => {
      const question = {
        question_type: 'objective',
        correct_answers: ['A']
      }
      expect(getCorrectAnswer(question)).toBe('A')
    })

    test('should join multiple correct answers', () => {
      const question = {
        question_type: 'objective',
        correct_answers: ['A', 'B', 'C']
      }
      expect(getCorrectAnswer(question)).toBe('A, B, C')
    })

    test('should return array for match questions', () => {
      const question = {
        question_type: 'MatchTheFollowing',
        correct_answers: ['0-0', '1-1', '2-2']
      }
      const result = getCorrectAnswer(question)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toEqual(['0-0', '1-1', '2-2'])
    })

    test('should handle non-array correct_answers', () => {
      const question = {
        question_type: 'objective',
        correct_answers: 'A'
      }
      expect(getCorrectAnswer(question)).toBe('A')
    })

    test('should return N/A for missing correct_answers', () => {
      const question = {
        question_type: 'objective'
      }
      expect(getCorrectAnswer(question)).toBe('N/A')
    })
  })
})

