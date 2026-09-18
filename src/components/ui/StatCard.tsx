import React from 'react'
import { Card } from './Card'
import { cn } from '@/utils/cn'

export interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: 'primary' | 'secondary' | 'forest' | 'amber' | 'lavender'
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  const isStreak = title.toLowerCase().includes('streak')

  return (
    <Card
      glass="interactive"
      sheen={isStreak}
      className={cn(
        'p-4 sm:p-5 flex flex-col justify-between border-white/80 hover-lift transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#626763]">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#171918]">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  'text-[11px] font-semibold px-1.5 py-0.5 rounded transition-transform',
                  isStreak
                    ? 'bg-[#FDF3E5] text-[#A66E1D] border border-[#E7A84B]/30 animate-amberGlow'
                    : trend.isPositive
                    ? 'bg-[#D8E8DE] text-[#1F6B4F]'
                    : 'bg-[#FCE8E6] text-[#B83834]'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-[#626763] pt-0.5">{subtitle}</p>}
        </div>

        {icon && (
          <div className="w-9 h-9 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
