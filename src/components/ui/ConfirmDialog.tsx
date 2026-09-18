import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle, Trash2, Info } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
        )
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#1F6B4F] flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        )
    }
  }

  const getConfirmButtonClasses = () => {
    if (variant === 'danger') {
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 shadow-sm'
    }
    if (variant === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-600 shadow-sm'
    }
    return 'bg-[#1F6B4F] hover:bg-[#154d38] text-white focus:ring-[#1F6B4F] shadow-sm'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3.5">
          {getIcon()}
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-[#171918] leading-snug">
              {title}
            </h3>
            <p className="text-xs text-[#626763] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5DF]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClasses()}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
