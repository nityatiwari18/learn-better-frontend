/**
 * API Endpoints
 * Centralized endpoint constants for the Learn Better API
 */

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/v1/auth/login',
    SIGNUP: '/v1/auth/signup',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    ME: '/v1/auth/me',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
  },

  // Content
  CONTENT: {
    BASE: '/v1/content',
    BY_ID: (id) => `/v1/content/${id}`,
    UPLOAD: '/v1/content',
    STORAGE_USAGE: '/v1/content/storage/usage',
    PROCESS: (id) => `/v1/content/${id}/process`,
    PROCESSING_STATUS: (id) => `/v1/content/${id}/processing-status`,
  },

  // Quiz
  QUIZ: {
    BY_CONTENT_ID: (id) => `/v1/content/${id}/quiz`,
    BY_ID: (id) => `/v1/quiz/${id}`,
  },
}

export default ENDPOINTS

