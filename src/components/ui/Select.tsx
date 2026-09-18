import React from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  helperText?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#171918]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-lg bg-white border border-[#E5E5DF] px-3.5 py-2 pr-10 text-sm text-[#171918] placeholder-[#8E948F] transition-colors cursor-pointer',
              'focus:outline-none focus:border-[#1F6B4F] focus:ring-1 focus:ring-[#1F6B4F]',
              'disabled:bg-[#F8F7F3] disabled:text-[#8E948F] disabled:cursor-not-allowed shadow-2xs',
              error && 'border-[#D9534F] focus:border-[#D9534F] focus:ring-[#D9534F]',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-[#171918]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#626763] absolute right-3 pointer-events-none" />
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

Select.displayName = 'Select'
