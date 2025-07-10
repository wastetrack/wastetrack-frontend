import React, { useState } from 'react';

interface DevelopmentModalProps {
  title?: string;
  message?: string;
  buttonText?: string;
  trigger?: React.ReactNode;
  className?: string;
}

const DevelopmentModal: React.FC<DevelopmentModalProps> = ({
  title = 'Pemberitahuan',
  message = 'Mohon maaf, fitur ini masih dalam tahap pengembangan dan belum dapat diakses saat ini.',
  buttonText = 'Kembali',
  trigger,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Render trigger element jika disediakan
  const renderTrigger = () => {
    if (!trigger) return null;

    const triggerElement = trigger as React.ReactElement<{
      className?: string;
      onClick?: () => void;
    }>;
    const existingClassName = triggerElement.props?.className || '';

    return React.cloneElement(triggerElement, {
      ...triggerElement.props,
      onClick: openModal,
      className: `${existingClassName} ${className}`.trim(),
    });
  };

  // Render modal overlay
  const renderModal = () => {
    if (!isOpen) return null;

    return (
      <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4'>
        <div className='w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all'>
          <div className='flex items-center border-b border-emerald-100 bg-emerald-50 px-6 py-4'>
            <svg
              className='mr-3 h-6 w-6 text-emerald-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
              />
            </svg>
            <h3 className='text-lg font-semibold text-emerald-800'>{title}</h3>
          </div>

          <div className='p-4'>
            <div className='mb-4 text-center'>
              <p className='text-sm leading-relaxed text-gray-600'>{message}</p>
            </div>
          </div>

          <div className='px-6 pb-6'>
            <button
              onClick={closeModal}
              className='w-full rounded-lg bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700'
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderTrigger()}
      {renderModal()}
    </>
  );
};

export const showDevModal = (
  options: Omit<DevelopmentModalProps, 'trigger'> = {}
) => {
  // Check if modal already exists
  const existingModal = document.getElementById('dev-modal-overlay');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }

  const modal = document.createElement('div');
  modal.id = 'dev-modal-overlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  `;

  document.body.appendChild(modal);

  const handleClose = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
    // Redirect to customer page after closing
    if (typeof window !== 'undefined') {
      window.location.href = '/customer';
    }
  };

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 400px;
    width: 100%;
    overflow: hidden;
    transform: scale(1);
    transition: all 0.2s ease-out;
  `;

  modalContent.innerHTML = `
    <div style="background-color: #ecfdf5; padding: 24px; border-bottom: 1px solid #d1fae5; display: flex; align-items: center;">
      <svg style="width: 24px; height: 24px; color: #059669; margin-right: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>
      <h3 style="font-size: 18px; font-weight: 600; color: #065f46; margin: 0;">
        ${options.title || 'Pemberitahuan'}
      </h3>
    </div>
    <div style="padding: 16px;">
      <div style="text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0; line-height: 1.5;">
          ${options.message || 'Mohon maaf, fitur ini masih dalam tahap pengembangan dan belum dapat diakses saat ini.'}
        </p>
      </div>
    </div>
    <div style="padding: 0 24px 24px 24px;">
      <button id="dev-modal-close-btn" style="
        width: 100%;
        padding: 12px;
        background-color: #059669;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      " onmouseover="this.style.backgroundColor='#047857'" onmouseout="this.style.backgroundColor='#059669'">
        ${options.buttonText || 'Kembali'}
      </button>
    </div>
  `;

  modal.appendChild(modalContent);

  // Add event listeners
  const closeBtn = modalContent.querySelector('#dev-modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', handleClose);
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      handleClose();
    }
  });

  // Close on escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';

  // Restore body scroll when modal is closed
  const originalOverflow = document.body.style.overflow;
  const cleanup = () => {
    document.body.style.overflow = originalOverflow;
    document.removeEventListener('keydown', handleEscape);
  };

  // Add cleanup to close handler
  const originalHandleClose = handleClose;
  const enhancedHandleClose = () => {
    cleanup();
    originalHandleClose();
  };

  // Update event listeners with enhanced close handler
  if (closeBtn) {
    closeBtn.removeEventListener('click', handleClose);
    closeBtn.addEventListener('click', enhancedHandleClose);
  }

  modal.removeEventListener('click', handleClose);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      enhancedHandleClose();
    }
  });
};

export default DevelopmentModal;
