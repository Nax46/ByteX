export function formatPercentage(value: number, decimals: number = 0): string {
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : 0
  return `${Math.round(safeVal * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`
}

export function formatInitials(name: unknown): string {
  if (!name || typeof name !== 'string') return '?'
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatDate(dateString: unknown): string {
  if (!dateString || typeof dateString !== 'string') return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dateString
  }
}

export function formatScoreToLevel(score: unknown): string {
  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0
  if (safeScore >= 90) return 'Expert'
  if (safeScore >= 75) return 'Advanced'
  if (safeScore >= 50) return 'Intermediate'
  if (safeScore >= 25) return 'Beginner'
  return 'Novice'
}
