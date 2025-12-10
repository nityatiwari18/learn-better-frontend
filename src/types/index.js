/**
 * Type definitions index
 * Re-exports all types for convenient imports
 * 
 * Usage:
 * import { User, LoginResponse } from '../types'
 * 
 * Note: JSDoc types are used for intellisense support in JavaScript.
 * The actual type checking happens via JSDoc comments in the source files.
 */

// Re-export auth types
export * from './auth'

// Re-export common types
export * from './common'

/**
 * @typedef {import('./auth').User} User
 * @typedef {import('./auth').LoginRequest} LoginRequest
 * @typedef {import('./auth').LoginResponse} LoginResponse
 * @typedef {import('./auth').SignupRequest} SignupRequest
 * @typedef {import('./auth').SignupResponse} SignupResponse
 * @typedef {import('./auth').AuthState} AuthState
 * 
 * @typedef {import('./common').ApiError} ApiError
 * @typedef {import('./common').ApiResponse} ApiResponse
 * @typedef {import('./common').PaginatedResponse} PaginatedResponse
 * @typedef {import('./common').Timestamps} Timestamps
 */

