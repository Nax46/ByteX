import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'cyan' | 'forest' | 'lavender' | 'outline'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[#F1EFEA] text-[#171918] border-[#E5E5DF]',
    success: 'bg-[#D8E8DE] text-[#1F6B4F] border-[#C2D8C9]',
    forest: 'bg-[#D8E8DE] text-[#1F6B4F] border-[#C2D8C9]',
    warning: 'bg-[#FDF4E6] text-[#A66E1D] border-[#F8DCB5]',
    danger: 'bg-[#FCE8E6] text-[#B83834] border-[#F7C6C4]',
    purple: 'bg-[#E8E3F4] text-[#554674] border-[#D6CDED]',
    lavender: 'bg-[#E8E3F4] text-[#554674] border-[#D6CDED]',
    cyan: 'bg-[#D8E8DE] text-[#1F6B4F] border-[#C2D8C9]',
    outline: 'bg-white text-[#626763] border-[#E5E5DF]',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border tracking-tight',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
