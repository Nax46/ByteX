import React, { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value?: number
  end?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  end,
  duration = 900,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const targetValue = value ?? end ?? 0
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const startValue = 0

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease out cubic: 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startValue + (targetValue - startValue) * easeProgress))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [targetValue, duration])

  return (
    <span className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
