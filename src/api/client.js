import axios from 'axios'
import { storage } from '../utils/storage'

/**
 * Base URL for API requests
 * Uses environment variable or defaults to localhost
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

/**
 * Axios instance with pre-configured defaults
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Auth endpoints that don't require token validation
 */
const AUTH_ENDPOINTS = ['/v1/auth/login', '/v1/auth/signup', '/v1/auth/refresh']

/**
 * Check if the request URL is an auth endpoint
 */
const isAuthEndpoint = (url) => {
  return AUTH_ENDPOINTS.some(endpoint => url?.includes(endpoint))
}

/**
 * Check if JWT token is expired
 */
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    // Check if token expires in less than 60 seconds
    return payload.exp * 1000 < Date.now() + 60000
  } catch {
    return true
  }
}

/**
 * Request interceptor
 * Attaches JWT token to every request if available
 * Skips token check for auth endpoints (login, signup)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Skip token validation for auth endpoints
    if (isAuthEndpoint(config.url)) {
      return config
    }

    const token = storage.getToken()
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        storage.clearAuth()
        localStorage.setItem('token_expired', 'true')
        window.location.href = '/'
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handles common error scenarios
 * Skips auth redirect for login/signup endpoints
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly for convenience
    return response
  },
  (error) => {
    const { response, config } = error

    if (response) {
      switch (response.status) {
        case 401:
          // Skip redirect for auth endpoints - let them handle their own errors
          if (!isAuthEndpoint(config?.url)) {
            // Unauthorized - clear auth, set expiry flag, and redirect to homepage
            storage.clearAuth()
            localStorage.setItem('token_expired', 'true')
            window.location.href = '/'
          }
          break
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          break
        default:
          console.error('API error:', response.status)
      }
    } else if (error.request) {
      // Network error - request made but no response
      console.error('Network error - no response received')
    } else {
      // Error setting up request
      console.error('Request error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
