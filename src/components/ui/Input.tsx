import React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: 'sm' | 'md'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, size = 'md', className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = error && inputId ? `${inputId}-error` : undefined
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#171918]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div
              className={cn(
                'absolute flex items-center pointer-events-none text-[#626763]',
                size === 'sm' ? 'left-2.5' : 'left-3'
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId || helperId || undefined}
            className={cn(
              'w-full rounded-lg bg-white border border-[#E5E5DF] text-[#171918] placeholder-[#8E948F] transition-colors',
              size === 'sm'
                ? 'h-9 px-3 py-1.5 text-xs'
                : 'h-10.5 px-3.5 py-2 text-sm',
              'focus:outline-none focus:border-[#1F6B4F] focus:ring-1 focus:ring-[#1F6B4F]',
              'disabled:bg-[#F8F7F3] disabled:text-[#8E948F] disabled:cursor-not-allowed shadow-2xs',
              leftIcon && (size === 'sm' ? 'pl-8' : 'pl-10'),
              rightIcon && (size === 'sm' ? 'pr-8' : 'pr-10'),
              error && 'border-[#D9534F] focus:border-[#D9534F] focus:ring-[#D9534F]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                'absolute flex items-center text-[#626763]',
                size === 'sm' ? 'right-2.5' : 'right-3'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-[#D9534F]">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#626763]">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
