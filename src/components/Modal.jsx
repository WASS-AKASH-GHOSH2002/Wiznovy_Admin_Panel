import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', position = 'top' }) => {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = position === 'center' 
    ? 'items-center justify-center' 
    : 'items-start justify-center pt-8';
  
  const modalClasses = `bg-white rounded-lg shadow-xl w-full ${maxWidth}`;

  return (
    <dialog 
      open={isOpen}
      className="fixed inset-0 bg-transparent border-0 max-w-none max-h-none p-0 m-0"
      onClick={onClose}
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex ${positionClasses} z-50 p-4 overflow-y-auto`}>
        <div 
          className={modalClasses}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {title && (
              <h2 id="modal-title" className="text-2xl font-bold mb-4">{title}</h2>
            )}
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  position: PropTypes.oneOf(['top', 'center'])
};

export default Modal;