import React from 'react'
import { cn } from '@/utils/cn'

export interface ProgressRingProps {
  value: number // 0 - 100
  size?: number
  strokeWidth?: number
  variant?: 'primary' | 'success' | 'warning' | 'purple' | 'cyan' | 'forest' | 'amber'
  className?: string
  showValue?: boolean
  label?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 100,
  strokeWidth = 8,
  variant = 'forest',
  className,
  showValue = true,
  label,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference

  const strokeColors = {
    primary: 'stroke-[#1F6B4F]',
    forest: 'stroke-[#1F6B4F]',
    success: 'stroke-[#1F6B4F]',
    warning: 'stroke-[#E7A84B]',
    amber: 'stroke-[#E7A84B]',
    purple: 'stroke-[#8A78AC]',
    cyan: 'stroke-[#1F6B4F]',
  }

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-[#EAE8E1] fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'fill-none transition-all duration-700 ease-out',
            strokeColors[variant]
          )}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="font-heading text-lg font-bold text-[#171918] leading-none">{clampedValue}%</span>
          {label && <span className="text-[10px] font-medium text-[#626763] mt-0.5">{label}</span>}
        </div>
      )}
    </div>
  )
}
