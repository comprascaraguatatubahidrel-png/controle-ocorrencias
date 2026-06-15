'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number
  icon: ReactNode
  description?: string
  colorClass?: string
}

export function StatsCard({ title, value, icon, description, colorClass = "text-slate-600" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {description && (
            <p className={`text-xs mt-2 font-medium ${colorClass}`}>{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '50')} ${colorClass}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
