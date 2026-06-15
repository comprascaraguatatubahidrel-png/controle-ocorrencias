import { cn } from '@/lib/utils'
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_TYPE_LABELS, STATUS_COLORS, TYPE_COLORS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  className?: string
}

interface TypeBadgeProps {
  type: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = OCCURRENCE_STATUS_LABELS[status as keyof typeof OCCURRENCE_STATUS_LABELS] || status
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <span className={cn('badge border', colorClass, className)}>
      {label}
    </span>
  )
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const label = OCCURRENCE_TYPE_LABELS[type as keyof typeof OCCURRENCE_TYPE_LABELS] || type
  const colorClass = TYPE_COLORS[type] || 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <span className={cn('badge border', colorClass, className)}>
      {label}
    </span>
  )
}
