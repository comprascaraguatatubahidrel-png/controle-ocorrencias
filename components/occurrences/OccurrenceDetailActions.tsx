'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OCCURRENCE_STATUS_LABELS } from '@/lib/constants'
import { Edit2, CheckCircle2, MessageSquare, Loader2, RefreshCw } from 'lucide-react'

interface ActionsProps {
  occurrenceId: string
  currentStatus: string
}

export default function OccurrenceDetailActions({ occurrenceId, currentStatus }: ActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [comment, setComment] = useState('')

  const handleUpdateStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/occurrences/${occurrenceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment: comment.trim() || undefined }),
      })
      if (res.ok) {
        setShowStatusModal(false)
        setComment('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/occurrences/${occurrenceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })
      if (res.ok) {
        setShowCommentModal(false)
        setComment('')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    if (!confirm('Deseja realmente encerrar esta ocorrência?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/occurrences/${occurrenceId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVIDA' }),
      })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/ocorrencias/${occurrenceId}/editar`}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </Link>
        <button
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Alterar Status
        </button>
        <button
          onClick={() => setShowCommentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Comentar
        </button>
        {currentStatus !== 'RESOLVIDA' && currentStatus !== 'CANCELADA' && (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-green-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Encerrar Ocorrência
          </button>
        )}
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Alterar Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Novo Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  {Object.entries(OCCURRENCE_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Comentário (opcional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Motivo da alteração..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setShowStatusModal(false); setComment('') }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Comentário</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Escreva seu comentário..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => { setShowCommentModal(false); setComment('') }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={loading || !comment.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Comentar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
