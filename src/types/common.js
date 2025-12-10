/**
 * Common/shared type definitions
 * @module types/common
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [code] - Error code
 * @property {Object} [details] - Additional error details
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data - Array of items
 * @property {number} page - Current page number
 * @property {number} pageSize - Items per page
 * @property {number} totalPages - Total number of pages
 * @property {number} totalItems - Total number of items
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} [data] - Response data
 * @property {string} [message] - Response message
 * @property {ApiError} [error] - Error details if request failed
 */

/**
 * @typedef {Object} Timestamps
 * @property {string} createdAt - ISO date string
 * @property {string} updatedAt - ISO date string
 */

export const CommonTypes = {}

