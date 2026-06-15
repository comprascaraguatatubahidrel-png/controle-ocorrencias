'use client'

import { formatDateTime, getInitials } from '@/lib/utils'
import { OccurrenceHistoryData } from '@/types'
import {
  FileText, Edit3, CheckCircle, Paperclip, MessageSquare,
  Plus, RefreshCw, XCircle
} from 'lucide-react'

interface HistoryTimelineProps {
  history: OccurrenceHistoryData[]
}

function getActionIcon(action: string) {
  if (action.includes('criada')) return { icon: Plus, color: 'bg-blue-100 text-blue-600' }
  if (action.includes('editada')) return { icon: Edit3, color: 'bg-orange-100 text-orange-600' }
  if (action.includes('Status')) return { icon: RefreshCw, color: 'bg-purple-100 text-purple-600' }
  if (action.includes('Anexo') || action.includes('arquivo')) return { icon: Paperclip, color: 'bg-green-100 text-green-600' }
  if (action.includes('Comentário')) return { icon: MessageSquare, color: 'bg-slate-100 text-slate-600' }
  if (action.includes('Encerrada') || action.includes('Cancelada')) return { icon: XCircle, color: 'bg-red-100 text-red-600' }
  return { icon: FileText, color: 'bg-slate-100 text-slate-600' }
}

export default function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Nenhuma movimentação registrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {history.map((item, index) => {
        const { icon: Icon, color } = getActionIcon(item.action)
        const isLast = index === history.length - 1

        return (
          <div key={item.id} className="flex gap-4 animate-fade-in">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-slate-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{item.action}</p>
                  {item.details && (
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{item.details}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {getInitials(item.user.name)}
                </div>
                <span className="text-xs text-slate-500">{item.user.name}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
