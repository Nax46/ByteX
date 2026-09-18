import React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#171918]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#626763]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-lg bg-white border border-[#E5E5DF] px-3.5 py-2 text-sm text-[#171918] placeholder-[#8E948F] transition-colors',
              'focus:outline-none focus:border-[#1F6B4F] focus:ring-1 focus:ring-[#1F6B4F]',
              'disabled:bg-[#F8F7F3] disabled:text-[#8E948F] disabled:cursor-not-allowed shadow-2xs',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#D9534F] focus:border-[#D9534F] focus:ring-[#D9534F]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[#626763]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#D9534F]">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#626763]">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
