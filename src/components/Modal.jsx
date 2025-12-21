import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

function Modal({ isOpen, onClose, children, fullWidth = false, customClassName = '' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-content ${fullWidth ? 'modal-full-width' : ''} ${customClassName}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal

