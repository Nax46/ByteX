import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  centeredTitle?: boolean
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  centeredTitle = false,
  children,
  className,
  size = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
      // Focus modal container on open for screen readers
      dialogRef.current?.focus()
      return () => {
        document.body.style.overflow = originalBodyOverflow
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || typeof document === 'undefined') return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex min-h-screen items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Background click backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl bg-white border border-[#E5E5DF] shadow-2xl text-[#171918] z-10 flex flex-col max-h-[calc(100vh-2.5rem)] sm:max-h-[calc(100vh-3.5rem)] my-auto overflow-hidden focus:outline-none',
          sizeStyles[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed/Sticky at top */}
        {title || description ? (
          centeredTitle ? (
            <div className="relative px-12 py-5 border-b border-[#E5E5DF] shrink-0 bg-white text-center">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              {title && (
                <h3 id="modal-title" className="font-heading text-lg font-bold text-[#171918] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-description" className="text-xs text-[#626763] mt-1 max-w-md mx-auto">
                  {description}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start justify-between px-6 py-4.5 border-b border-[#E5E5DF] shrink-0 bg-white">
              <div className="pr-4 text-left">
                {title && (
                  <h3 id="modal-title" className="font-heading text-lg font-bold text-[#171918]">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="modal-description" className="text-xs text-[#626763] mt-0.5">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Body - Scrollable content area */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
