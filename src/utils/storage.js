const TOKEN_KEY = 'learn_better_token'
const USER_KEY = 'learn_better_user'
const PROCESSING_CONFIG_KEY = 'learn_better_processing_config'
const CACHE_PREFIX = 'learn_better_content_cache_'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

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
  },

  /**
   * Generate a hash from config object
   * @param {object} config - Config object with model, apiKey, summaryPrompt, keyConceptsPrompt
   * @returns {string} Hash string
   */
  hashConfig(config) {
    if (!config) return ''
    
    // Create a stable string representation of the config
    const configString = JSON.stringify({
      model: config.model || '',
      apiKey: config.apiKey || '',
      summaryPrompt: config.summaryPrompt || '',
      keyConceptsPrompt: config.keyConceptsPrompt || ''
    })
    
    // Simple hash function (djb2 algorithm)
    let hash = 5381
    for (let i = 0; i < configString.length; i++) {
      hash = ((hash << 5) + hash) + configString.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Return positive hash as hex string
    return Math.abs(hash).toString(16)
  },

  /**
   * Normalize URL for consistent cache key
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    if (!url) return ''
    try {
      // Create URL object to parse and normalize
      const urlObj = new URL(url)
      // Normalize: lowercase, remove trailing slash from pathname
      let normalized = urlObj.protocol.toLowerCase() + '//' + urlObj.hostname.toLowerCase()
      if (urlObj.port) {
        normalized += ':' + urlObj.port
      }
      let pathname = urlObj.pathname.toLowerCase()
      // Remove trailing slash
      if (pathname.endsWith('/') && pathname.length > 1) {
        pathname = pathname.slice(0, -1)
      }
      normalized += pathname
      if (urlObj.search) {
        normalized += urlObj.search
      }
      if (urlObj.hash) {
        normalized += urlObj.hash
      }
      return normalized
    } catch (e) {
      // If URL parsing fails, return normalized version of input
      let normalized = url.toLowerCase().trim()
      if (normalized.endsWith('/') && normalized.length > 1) {
        normalized = normalized.slice(0, -1)
      }
      return normalized
    }
  },

  /**
   * Get cache key for a URL and optional config
   * @param {string} url - URL
   * @param {object} [config] - Optional config object
   * @returns {string} Cache key
   */
  getCacheKey(url, config = null) {
    const normalizedUrl = this.normalizeUrl(url)
    const configHash = config ? this.hashConfig(config) : ''
    return CACHE_PREFIX + normalizedUrl + (configHash ? '_' + configHash : '')
  },

  /**
   * Get cached content data for a URL if valid (not expired)
   * @param {string} url - URL to get cache for
   * @param {object} [config] - Optional config object for cache key generation
   * @returns {object|null} Cached data or null if not found/expired
   */
  getContentCache(url, config = null) {
    const cacheKey = this.getCacheKey(url, config)
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    try {
      const data = JSON.parse(cached)
      const cachedAt = new Date(data.cachedAt)
      const now = new Date()
      const age = now - cachedAt

      // Check if cache is expired
      if (age > CACHE_TTL_MS) {
        // Remove expired cache
        localStorage.removeItem(cacheKey)
        return null
      }

      return data
    } catch (e) {
      // If parsing fails, remove invalid cache
      localStorage.removeItem(cacheKey)
      return null
    }
  },

  /**
   * Store content cache for a URL
   * @param {string} url - URL to cache for
   * @param {object} data - Data to cache (should include summary, key_concepts, quiz)
   * @param {object} [config] - Optional config object for cache key generation
   */
  setContentCache(url, data, config = null) {
    const cacheKey = this.getCacheKey(url, config)
    const cacheData = {
      ...data,
      cachedAt: new Date().toISOString()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  },

  /**
   * Clear expired content caches
   * This can be called periodically to clean up old cache entries
   */
  clearExpiredCache() {
    const keys = Object.keys(localStorage)
    const now = new Date()
    
    keys.forEach(key => {
      // Check if key starts with cache prefix (may include config hash suffix)
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const data = JSON.parse(cached)
            const cachedAt = new Date(data.cachedAt)
            const age = now - cachedAt
            
            if (age > CACHE_TTL_MS) {
              localStorage.removeItem(key)
            }
          }
        } catch (e) {
          // Remove invalid cache entries
          localStorage.removeItem(key)
        }
      }
    })
  }
}

export default storage

