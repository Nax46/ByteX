import React from 'react'
import { Button } from '@/components/ui/Button'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  minHeight?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  minHeight = 'min-h-[240px]',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl bg-white border border-dashed border-[#E5E5DF]',
        minHeight,
        className
      )}
    >
      <div className="w-11 h-11 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-center text-[#626763] mb-3">
        {icon || <Inbox className="w-5 h-5 text-[#626763]" />}
      </div>
      <h4 className="font-heading text-base font-semibold text-[#171918]">{title}</h4>
      {description && (
        <p className="text-xs sm:text-sm text-[#626763] mt-1 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
