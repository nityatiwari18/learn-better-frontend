import apiClient from './client'
import { ENDPOINTS } from './endpoints'
import { storage } from '../utils/storage'

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Login user with credentials
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('../types/auth').LoginResponse>}
   */
  async login(email, password) {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    })
    
    // Store token and user data on successful login
    if (response.data.token) {
      storage.setToken(response.data.token)
    }
    if (response.data.user) {
      storage.setUser(response.data.user)
    }
    
    return response.data
  },

  /**
   * Register new user
   * @param {string} email
   * @param {string} password
   * @param {string} firstName
   * @param {string} lastName
   * @returns {Promise<import('../types/auth').SignupResponse>}
   */
  async signup(email, password, firstName, lastName) {
    const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    })
    
    // Auto-login after signup if token is returned
    if (response.data.token) {
      storage.setToken(response.data.token)
    }
    if (response.data.user) {
      storage.setUser(response.data.user)
    }
    
    return response.data
  },

  /**
   * Logout user - clears local storage
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Optional: call backend logout endpoint
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      storage.clearAuth()
    }
  },

  /**
   * Get current user info
   * @returns {Promise<import('../types/auth').User>}
   */
  async getCurrentUser() {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME)
    return response.data
  },

  /**
   * Check if user is authenticated (local check)
   * @returns {boolean}
   */
  isAuthenticated() {
    return storage.isAuthenticated()
  },

  /**
   * Get stored user (local)
   * @returns {import('../types/auth').User|null}
   */
  getStoredUser() {
    return storage.getUser()
  },
}

export default authApi

