'use client'

import { useState, useCallback } from 'react'
import { AttachmentData } from '@/types'
import { formatDate } from '@/lib/utils'
import { Upload, File, Image, Trash2, Eye, Download, X, Loader2 } from 'lucide-react'

interface AttachmentsSectionProps {
  occurrenceId: string
  attachments: AttachmentData[]
  onUpdate?: () => void
  readOnly?: boolean
}

export default function AttachmentsSection({
  occurrenceId,
  attachments,
  onUpdate,
  readOnly = false,
}: AttachmentsSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('files', file))

    try {
      const res = await fetch(`/api/occurrences/${occurrenceId}/attachments`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) onUpdate?.()
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }, [occurrenceId, onUpdate])

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Deseja excluir este anexo?')) return
    setDeleting(attachmentId)
    try {
      await fetch(`/api/occurrences/${occurrenceId}/attachments?attachmentId=${attachmentId}`, {
        method: 'DELETE',
      })
      onUpdate?.()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {!readOnly && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600 font-medium">Enviando arquivos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">
                Arraste arquivos ou <span className="text-blue-600">clique para selecionar</span>
              </p>
              <p className="text-xs text-slate-400">Imagens e PDFs • Múltiplos arquivos</p>
            </div>
          )}
        </div>
      )}

      {/* Attachments grid */}
      {attachments.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
                {att.type === 'IMAGE' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <File className="w-10 h-10 text-red-500" />
                    <span className="text-xs font-bold text-red-600 uppercase">PDF</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {att.type === 'IMAGE' && (
                    <button
                      onClick={() => setPreviewUrl(att.url)}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {!readOnly && (
                    <button
                      onClick={() => handleDelete(att.id)}
                      disabled={deleting === att.id}
                      className="w-8 h-8 bg-red-500/60 hover:bg-red-500/80 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      {deleting === att.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* File name */}
              <div className="px-2 py-1.5">
                <p className="text-xs text-slate-600 truncate font-medium">{att.name}</p>
                <p className="text-xs text-slate-400">{formatDate(att.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-slate-400">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum anexo adicionado</p>
        </div>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
