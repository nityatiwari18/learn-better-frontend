import apiClient from './client'
import { ENDPOINTS } from './endpoints'
import { storage } from '../utils/storage'

/**
 * Content API functions
 */
export const contentApi = {
  /**
   * Upload content (file, weblink, or text)
   * @param {Object} params - Upload parameters
   * @param {string} params.contentType - Type of content: 'file', 'weblink', or 'text'
   * @param {File} [params.file] - File to upload (for file type)
   * @param {string} [params.sourceUrl] - URL (for weblink type)
   * @param {string} [params.rawText] - Raw text (for text type)
   * @returns {Promise<Object>} Upload response with content data
   */
  async upload({ contentType, file, sourceUrl, rawText }) {
    if (contentType === 'file') {
      // File upload - use FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('content_type', 'file')

      const response = await apiClient.post(ENDPOINTS.CONTENT.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } else {
      // Weblink or text - use JSON
      const response = await apiClient.post(ENDPOINTS.CONTENT.UPLOAD, {
        content_type: contentType,
        source_url: sourceUrl,
        raw_text: rawText,
      })
      return response.data
    }
  },

  /**
   * Upload a file
   * @param {File} file - File to upload
   * @param {string} [category] - File category
   * @returns {Promise<Object>} Upload response
   */
  async uploadFile(file, category = '') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('content_type', 'file')
    if (category) {
      formData.append('file_category', category)
    }

    const response = await apiClient.post(ENDPOINTS.CONTENT.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Upload a weblink
   * @param {string} url - URL to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadWeblink(url) {
    const response = await apiClient.post(ENDPOINTS.CONTENT.UPLOAD, {
      content_type: 'weblink',
      source_url: url,
    })
    return response.data
  },

  /**
   * Upload raw text
   * @param {string} text - Text content to upload
   * @returns {Promise<Object>} Upload response
   */
  async uploadText(text) {
    const response = await apiClient.post(ENDPOINTS.CONTENT.UPLOAD, {
      content_type: 'text',
      raw_text: text,
    })
    return response.data
  },

  /**
   * Get all content for the current user
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page] - Page number
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<Object>} List of content with pagination
   */
  async list(params = {}) {
    const response = await apiClient.get(ENDPOINTS.CONTENT.BASE, { params })
    return response.data
  },

  /**
   * Get content by ID
   * @param {number} id - Content ID
   * @returns {Promise<Object>} Content data
   */
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.CONTENT.BY_ID(id))
    return response.data
  },

  /**
   * Delete content by ID
   * @param {number} id - Content ID
   * @returns {Promise<Object>} Delete response
   */
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.CONTENT.BY_ID(id))
    return response.data
  },

  /**
   * Get storage usage for current user
   * @returns {Promise<Object>} Storage usage data
   */
  async getStorageUsage() {
    const response = await apiClient.get(ENDPOINTS.CONTENT.STORAGE_USAGE)
    return response.data
  },

  /**
   * Trigger content processing (summary and key concepts generation)
   * @param {number} contentId - Content ID to process
   * @param {object} [config] - Optional processing configuration
   * @returns {Promise<Object>} Processing trigger response
   */
  async triggerProcessing(contentId, config = null) {
    const payload = config ? {
      model: config.model,
      api_key: config.apiKey,
      summary_prompt: config.summaryPrompt,
      key_concepts_prompt: config.keyConceptsPrompt
    } : {}
    
    const response = await apiClient.post(ENDPOINTS.CONTENT.PROCESS(contentId), payload)
    return response.data
  },

  /**
   * Get content processing status
   * @param {number} contentId - Content ID to check
   * @param {string} [url] - Optional URL for cache checking (for URL-based content)
   * @param {object} [config] - Optional config object for cache key generation
   * @returns {Promise<Object>} Processing status with summary and key concepts if completed
   */
  async getProcessingStatus(contentId, url = null, config = null) {
    // Check cache first if URL is provided
    if (url) {
      const cached = storage.getContentCache(url, config)
      if (cached && (cached.summary || (cached.key_concepts && cached.key_concepts.length > 0))) {
        // Return cached data in the same format as API response
        return {
          processing_status: 'completed',
          title: cached.title || '',
          summary: cached.summary ? { summary_text: cached.summary } : null,
          key_concepts: cached.key_concepts || []
        }
      }
    }

    const response = await apiClient.get(ENDPOINTS.CONTENT.PROCESSING_STATUS(contentId))
    const data = response.data

    // Cache the response if URL is provided and processing is completed
    if (url && data.processing_status === 'completed') {
      // Merge with existing cache to preserve quiz data if it exists
      const existingCache = storage.getContentCache(url, config) || {}
      storage.setContentCache(url, {
        ...existingCache,
        title: data.title || '',
        summary: data.summary?.summary_text || null,
        key_concepts: data.key_concepts || []
      }, config)
    }

    return data
  },

  /**
   * Get quiz by content ID (auto-creates if missing)
   * @param {number} contentId - Content ID
   * @param {string} [url] - Optional URL for cache checking (for URL-based content)
   * @param {boolean} [bypassCache=false] - If true, skip cache check and always fetch fresh data
   * @param {object} [config] - Optional config object for cache key generation
   * @returns {Promise<Object>} Quiz with questions
   */
  async getQuiz(contentId, url = null, bypassCache = false, config = null) {
    // Check cache first if URL is provided and cache is not bypassed
    if (url && !bypassCache) {
      const cached = storage.getContentCache(url, config)
      if (cached && cached.quiz) {
        return cached.quiz
      }
    }

    const response = await apiClient.get(ENDPOINTS.QUIZ.BY_CONTENT_ID(contentId))
    const data = response.data

    // Update cache with quiz data if URL is provided
    if (url) {
      const existingCache = storage.getContentCache(url, config) || {}
      storage.setContentCache(url, {
        ...existingCache,
        quiz: data
      }, config)
    }

    return data
  },

  /**
   * Get quiz by quiz ID
   * @param {number} quizId - Quiz ID
   * @returns {Promise<Object>} Quiz with questions
   */
  async getQuizById(quizId) {
    const response = await apiClient.get(ENDPOINTS.QUIZ.BY_ID(quizId))
    return response.data
  },

  /**
   * Delete a key concept
   * @param {number} contentId - Content ID
   * @param {number} conceptId - Key Concept ID
   * @returns {Promise<Object>} Delete response
   */
  async deleteKeyConcept(contentId, conceptId) {
    const response = await apiClient.delete(ENDPOINTS.CONTENT.DELETE_KEY_CONCEPT(contentId, conceptId))
    return response.data
  },
}

export default contentApi

