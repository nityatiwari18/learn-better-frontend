import apiClient from './client'
import { ENDPOINTS } from './endpoints'

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
   * @returns {Promise<Object>} Processing status with summary and key concepts if completed
   */
  async getProcessingStatus(contentId) {
    const response = await apiClient.get(ENDPOINTS.CONTENT.PROCESSING_STATUS(contentId))
    return response.data
  },
}

export default contentApi

