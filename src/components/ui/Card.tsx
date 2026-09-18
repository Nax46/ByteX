import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  glass?: boolean | 'elevated' | 'interactive'
  sheen?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  glass = false,
  sheen = false,
  ...props
}) => {
  const glassClasses = glass
    ? glass === 'elevated'
      ? 'glass-panel-elevated'
      : glass === 'interactive'
      ? 'glass-card'
      : 'glass-panel'
    : 'border border-[#E5E5DF] bg-white shadow-xs'

  return (
    <div
      className={cn(
        'rounded-xl p-5 text-[#171918] transition-all duration-200 ease-out',
        glassClasses,
        hoverEffect && !glass &&
          'hover:border-[#D0D0C8] hover:shadow-[0_8px_20px_-4px_rgba(23,25,24,0.06)] hover:-translate-y-0.5',
        sheen && 'glass-sheen',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('flex flex-col space-y-1 pb-3', className)} {...props} />

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <h3 className={cn('font-heading text-base sm:text-lg font-semibold tracking-tight text-[#171918]', className)} {...props} />

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => <p className={cn('text-xs sm:text-sm text-[#626763]', className)} {...props} />

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('pt-0', className)} {...props} />

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('flex items-center pt-4 border-t border-[#E5E5DF]', className)} {...props} />
