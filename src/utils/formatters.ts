export function formatPercentage(value: number, decimals: number = 0): string {
  return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`
}

export function formatInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatScoreToLevel(score: number): string {
  if (score >= 90) return 'Expert'
  if (score >= 75) return 'Advanced'
  if (score >= 50) return 'Intermediate'
  if (score >= 25) return 'Beginner'
  return 'Novice'
}
