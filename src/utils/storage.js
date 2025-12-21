const TOKEN_KEY = 'learn_better_token'
const USER_KEY = 'learn_better_user'
const PROCESSING_CONFIG_KEY = 'learn_better_processing_config'

/**
 * Token storage utilities using localStorage for persistence
 */
export const storage = {
  /**
   * Get the stored JWT token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Save JWT token to localStorage
   * @param {string} token
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },

  /**
   * Remove JWT token from localStorage
   */
  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },

  /**
   * Get stored user data
   * @returns {object|null}
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  /**
   * Save user data to localStorage
   * @param {object} user
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  /**
   * Remove user data from localStorage
   */
  removeUser() {
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Clear all auth data (token and user)
   */
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  /**
   * Check if user is authenticated (has token)
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Get stored processing configuration
   * @returns {object|null}
   */
  getProcessingConfig() {
    const config = localStorage.getItem(PROCESSING_CONFIG_KEY)
    return config ? JSON.parse(config) : null
  },

  /**
   * Save processing configuration to localStorage
   * @param {object} config
   */
  saveProcessingConfig(config) {
    localStorage.setItem(PROCESSING_CONFIG_KEY, JSON.stringify(config))
  },

  /**
   * Clear processing configuration from localStorage
   */
  clearProcessingConfig() {
    localStorage.removeItem(PROCESSING_CONFIG_KEY)
  }
}

export default storage

