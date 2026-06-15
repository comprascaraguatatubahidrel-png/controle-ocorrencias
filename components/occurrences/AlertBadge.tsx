import { cn, getAlertLevel } from '@/lib/utils'
import { ALERT_COLORS } from '@/lib/constants'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface AlertBadgeProps {
  promisedDate?: string | Date | null
  className?: string
}

export default function AlertBadge({ promisedDate, className }: AlertBadgeProps) {
  const level = getAlertLevel(promisedDate)
  if (level === 'none') return null

  const configs = {
    green: { label: 'No prazo', icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
    yellow: { label: 'Vence em breve', icon: AlertTriangle, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    red: { label: 'Atrasado', icon: Clock, className: 'bg-red-50 text-red-700 border-red-200' },
  }

  const config = configs[level]
  const Icon = config.icon

  return (
    <span className={cn('badge', config.className, className)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
