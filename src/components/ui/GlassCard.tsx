import React, { useRef, useState } from 'react'
import { cn } from '@/utils/cn'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
  sheen?: boolean
  variant?: 'standard' | 'elevated' | 'interactive'
  glowColor?: string
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  spotlight = true,
  sheen = false,
  variant = 'interactive',
  glowColor = 'rgba(31, 107, 79, 0.12)',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spotlight && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setCoords({ x, y })
    }
    if (onMouseMove) onMouseMove(e)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true)
    if (onMouseEnter) onMouseEnter(e)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(false)
    if (onMouseLeave) onMouseLeave(e)
  }

  const baseGlassClass =
    variant === 'elevated'
      ? 'glass-panel-elevated'
      : variant === 'interactive'
      ? 'glass-card'
      : 'glass-panel'

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all duration-300',
        baseGlassClass,
        sheen && 'glass-sheen',
        className
      )}
      {...props}
    >
      {/* 25+ Yrs Senior Specular Spotlight (Tracks cursor reflection across glass surface) */}
      {spotlight && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 z-10"
          style={{
            background: `radial-gradient(450px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.45) 0%, ${glowColor} 40%, transparent 75%)`,
          }}
        />
      )}

      {/* Specular border reflection highlight */}
      {spotlight && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl z-20 transition-opacity duration-300 opacity-80"
          style={{
            border: '1px solid transparent',
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.8) 0%, transparent 60%) border-box`,
            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'destination-out',
            maskComposite: 'exclude',
          }}
        />
      )}

      {/* Content wrapper with proper z-index */}
      <div className="relative z-30">{children}</div>
    </div>
  )
}
