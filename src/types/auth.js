/**
 * Auth-related type definitions
 * @module types/auth
 */

/**
 * @typedef {Object} User
 * @property {string|number} id - User ID
 * @property {string} username - Username
 * @property {string} [email] - User email
 * @property {string} [name] - Display name
 * @property {string} [avatar] - Avatar URL
 * @property {string} createdAt - Account creation date
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} username - Username
 * @property {string} password - Password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} token - JWT token
 * @property {User} user - User data
 * @property {string} [message] - Success message
 */

/**
 * @typedef {Object} SignupRequest
 * @property {string} username - Username
 * @property {string} password - Password
 * @property {string} [email] - Optional email
 */

/**
 * @typedef {Object} SignupResponse
 * @property {string} token - JWT token
 * @property {User} user - Created user data
 * @property {string} [message] - Success message
 */

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated - Whether user is logged in
 * @property {User|null} user - Current user data
 * @property {boolean} isLoading - Whether auth state is loading
 */

export const AuthTypes = {}

