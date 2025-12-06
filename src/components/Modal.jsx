import React from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', position = 'top' }) => {
  if (!isOpen) return null;

  const positionClasses = position === 'center' 
    ? 'items-center' 
    : 'items-start';
  
  const modalClasses = position === 'center'
    ? `bg-white rounded-lg shadow-xl w-full ${maxWidth}`
    : `bg-white rounded-lg shadow-xl w-full ${maxWidth} my-8`;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center ${positionClasses} z-50 p-4 overflow-y-auto`}
      onClick={onClose}
    >
      <div 
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {title && (
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;