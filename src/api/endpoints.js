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

  // Add more endpoint groups as needed
  // COURSES: {
  //   BASE: '/courses',
  //   BY_ID: (id) => `/courses/${id}`,
  // },
}

export default ENDPOINTS

