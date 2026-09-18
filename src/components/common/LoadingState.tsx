import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface LoadingStateProps {
  message?: string
  description?: string
  className?: string
  minHeight?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  description,
  className,
  minHeight = 'min-h-[220px]',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl bg-white border border-[#E5E5DF] shadow-xs',
        minHeight,
        className
      )}
    >
      <Loader2 className="w-6 h-6 animate-spin text-[#1F6B4F] mb-3" />
      <p className="text-sm font-medium text-[#171918]">{message}</p>
      {description && <p className="text-xs text-[#626763] mt-1 max-w-sm">{description}</p>}
    </div>
  )
}
