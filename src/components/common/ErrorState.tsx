import React from 'react'
import { Button } from '@/components/ui/Button'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
  minHeight?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
  minHeight = 'min-h-[240px]',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#FDF7F7] border border-[#F5D5D3]',
        minHeight,
        className
      )}
    >
      <div className="w-11 h-11 rounded-lg bg-[#FCE8E6] flex items-center justify-center text-[#D9534F] mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="font-heading text-base font-semibold text-[#171918]">{title}</h4>
      <p className="text-xs sm:text-sm text-[#626763] mt-1 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 border-[#F5D5D3] hover:bg-[#FCE8E6] text-[#D9534F]"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}
