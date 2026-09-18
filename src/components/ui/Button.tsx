import React from 'react'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'highlight' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F6B4F] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.99]'

  const variantStyles = {
    primary:
      'bg-[#1F6B4F] hover:bg-[#17543E] text-white shadow-sm border border-[#1F6B4F]',
    secondary:
      'bg-[#D8E8DE] hover:bg-[#C9DFD0] text-[#1F6B4F] font-semibold border border-[#C9DFD0]',
    outline:
      'bg-white hover:bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF] hover:border-[#D0D0C8] shadow-xs',
    ghost:
      'bg-transparent hover:bg-[#F1EFEA] text-[#626763] hover:text-[#171918]',
    danger:
      'bg-[#D9534F] hover:bg-[#c94541] text-white shadow-xs',
    highlight:
      'bg-[#E7A84B] hover:bg-[#D99A3D] text-[#171918] font-semibold shadow-xs',
    gradient:
      'bg-[#1F6B4F] hover:bg-[#17543E] text-white shadow-sm', // Alias to primary for clean brand consistency
  }

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 gap-2 font-medium',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 font-semibold',
    icon: 'p-2 aspect-square',
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
