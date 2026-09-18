import React from 'react'

export interface SkillPathLogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const SkillPathLogo: React.FC<SkillPathLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Minimalist Path/Growth Symbol */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#1F6B4F] flex items-center justify-center text-white shrink-0 shadow-sm`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[60%] h-[60%]"
        >
          {/* Subtle ascending path with forward momentum */}
          <path d="M4 17 L10 11 L14 15 L20 7" />
          <polyline points="15 7 20 7 20 12" />
        </svg>
      </div>

      {showText && (
        <span className={`font-heading font-bold ${textSizes[size]} tracking-tight text-[#171918]`}>
          Skill<span className="text-[#1F6B4F]">Path</span>
        </span>
      )}
    </div>
  )
}
