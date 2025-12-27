import { useState, useEffect } from 'react'
import Modal from './Modal'
import { storage } from '../utils/storage'
import './ProcessingConfigModal.css'

const DEFAULT_CONFIG = {
  model: 'gpt-5.2',
  apiKey: '',
  summaryPrompt: `You are an expert at summarizing educational content. Please provide a clear, concise summary of the following content.

The summary should:
- Capture the main ideas and key points
- Be LESS THAN 200 CHARACTERS (this is a strict limit)
- Use clear, accessible language
- Be a single sentence or two short sentences

Content to summarize:
---
{{content}}
---

Please provide only the summary text without any additional commentary or labels. Remember: maximum 200 characters.`,
  keyConceptsPrompt: `You are an expert at identifying and explaining key concepts from educational content. Please extract the most important concepts from the following content.

For each concept:
- Provide a clear, concise name (2-5 words)
- Write a brief description (1-2 sentences) explaining the concept

Return the concepts in the following JSON format:
{
  "concepts": [
    {
      "name": "Concept Name",
      "description": "Brief description of the concept."
    }
  ]
}

Extract between 3-7 key concepts, focusing on the most important and educational ones.

Content to analyze:
---
{{content}}
---

Return only the JSON object, no additional text.`
}

export default function ProcessingConfigModal({ isOpen, onClose, onSubmit }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    if (isOpen) {
      // Load saved config from localStorage
      const savedConfig = storage.getProcessingConfig()
      if (savedConfig) {
        setConfig({ ...DEFAULT_CONFIG, ...savedConfig })
      }
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save config to localStorage
    storage.saveProcessingConfig(config)
    // Return config to parent
    onSubmit(config)
  }

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG)
  }

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} customClassName="processing-config-modal">
      <div className="processing-config-modal-content">
        <div className="processing-config-header">
          <h2>Processing Configuration</h2>
        </div>

        <form onSubmit={handleSubmit} className="processing-config-form">
          <div className="form-group">
            <label htmlFor="model" className="form-label">Model</label>
            <input
              id="model"
              type="text"
              className="form-input"
              value={config.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g., gpt-4, gpt-3.5-turbo, gemini-2.0-flash"
              required
            />
            <small className="form-hint">The LLM model to use for processing</small>
          </div>

          <div className="form-group">
            <label htmlFor="apiKey" className="form-label">API Key (Optional)</label>
            <input
              id="apiKey"
              type="password"
              className="form-input"
              value={config.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="Leave empty to use server default"
            />
            <small className="form-hint">Custom API key for your own LLM provider</small>
          </div>

          <div className="form-group">
            <label htmlFor="summaryPrompt" className="form-label">Summary Prompt</label>
            <textarea
              id="summaryPrompt"
              className="form-input"
              value={config.summaryPrompt}
              onChange={(e) => handleChange('summaryPrompt', e.target.value)}
              rows="6"
              required
            />
            <small className="form-hint">Use &#123;&#123;content&#125;&#125; as placeholder for the content</small>
          </div>

          <div className="form-group">
            <label htmlFor="keyConceptsPrompt" className="form-label">Key Concepts Prompt</label>
            <textarea
              id="keyConceptsPrompt"
              className="form-input"
              value={config.keyConceptsPrompt}
              onChange={(e) => handleChange('keyConceptsPrompt', e.target.value)}
              rows="8"
              required
            />
            <small className="form-hint">Use &#123;&#123;content&#125;&#125; as placeholder for the content</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleReset} className="btn-secondary">
              Reset to Defaults
            </button>
            <div className="form-actions-right">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Continue with Upload
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
