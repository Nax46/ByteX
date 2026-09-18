import React from 'react'
import { cn } from '@/utils/cn'

export interface ProgressBarProps {
  value: number // 0 - 100
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'purple' | 'cyan' | 'forest' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'forest',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  const variantStyles = {
    primary: 'bg-[#1F6B4F]',
    forest: 'bg-[#1F6B4F]',
    success: 'bg-[#1F6B4F]',
    warning: 'bg-[#E7A84B]',
    amber: 'bg-[#E7A84B]',
    purple: 'bg-[#8A78AC]',
    cyan: 'bg-[#1F6B4F]',
  }

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs text-[#171918]">
          {label && <span className="font-medium text-[#171918]">{label}</span>}
          {showPercentage && <span className="font-semibold text-[#1F6B4F]">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-[#EAE8E1] rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            variantStyles[variant],
            percentage > 0 && percentage < 100 && 'progress-shimmer'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
