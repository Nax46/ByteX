import React, { useState } from 'react'
import { cn } from '@/utils/cn'
import { formatInitials } from '@/utils/formatters'

export interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  status?: 'online' | 'offline' | 'busy'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className,
  status,
}) => {
  const [imageFailed, setImageFailed] = useState(false)

  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base',
  }

  const statusColors = {
    online: 'bg-[#1F6B4F]',
    offline: 'bg-[#8E948F]',
    busy: 'bg-[#E7A84B]',
  }

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-heading font-semibold bg-[#D8E8DE] text-[#1F6B4F] overflow-hidden select-none border border-[#C2D8C9]',
          sizeStyles[size],
          className
        )}
      >
        {src && !imageFailed ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{formatInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white',
            statusColors[status]
          )}
        />
      )}
    </div>
  )
}
