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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * Attaches JWT token to every request if available
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
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
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data directly for convenience
    return response
  },
  (error) => {
    const { response } = error

    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          storage.clearAuth()
          // Optionally redirect to login page
          // window.location.href = '/'
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

