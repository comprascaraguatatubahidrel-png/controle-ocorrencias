import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, formatCNPJ } from '@/lib/utils'
import { StatusBadge, TypeBadge } from '@/components/occurrences/StatusBadge'
import AlertBadge from '@/components/occurrences/AlertBadge'
import OccurrenceDetailActions from '@/components/occurrences/OccurrenceDetailActions'
import HistoryTimeline from '@/components/occurrences/HistoryTimeline'
import AttachmentsSection from '@/components/occurrences/AttachmentsSection'
import { 
  TREATMENT_TYPE_LABELS, TREATMENT_STATUS_LABELS, 
  REFUSAL_REASON_LABELS, REFUSAL_STATUS_LABELS,
  SUPPLIER_ACKNOWLEDGED_LABELS
} from '@/lib/constants'
import { FileText, Building2, User, Clock, AlertTriangle } from 'lucide-react'

export default async function OccurrenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const occurrence = await prisma.occurrence.findFirst({
    where: { id, deletedAt: null },
    include: {
      supplier: true,
      responsible: { select: { id: true, name: true, email: true, role: true } },
      missingItems: true,
      treatment: true,
      refusal: true,
      attachments: { orderBy: { createdAt: 'desc' } },
      history: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!occurrence) notFound()

  // Safe formatting for client components
  const safeAttachments = occurrence.attachments.map(a => ({
    ...a,
    createdAt: a.createdAt.toISOString()
  }))
  const safeHistory = occurrence.history.map(h => ({
    ...h,
    createdAt: h.createdAt.toISOString()
  }))

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header 
        title={`Ocorrência ${occurrence.nfNumber}`} 
        subtitle="Detalhes e acompanhamento" 
      />
      
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header Actions & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <TypeBadge type={occurrence.type} className="text-sm px-3 py-1" />
            <StatusBadge status={occurrence.status} className="text-sm px-3 py-1" />
            <AlertBadge promisedDate={occurrence.treatment?.promisedDate} className="text-sm px-3 py-1" />
          </div>
          <OccurrenceDetailActions 
            occurrenceId={occurrence.id} 
            currentStatus={occurrence.status} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* NF Details */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                <h2 className="text-base font-semibold text-slate-800">Dados da Nota Fiscal</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Número</p>
                    <p className="text-base font-semibold text-slate-900">{occurrence.nfNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Data</p>
                    <p className="text-base font-medium text-slate-900">{formatDate(occurrence.nfDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Valor</p>
                    <p className="text-base font-medium text-slate-900">{formatCurrency(Number(occurrence.nfValue))}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Fornecedor Reconheceu?</p>
                    <p className="text-base font-medium text-slate-900">
                      {SUPPLIER_ACKNOWLEDGED_LABELS[occurrence.supplierAcknowledged as keyof typeof SUPPLIER_ACKNOWLEDGED_LABELS]}
                    </p>
                  </div>
                </div>
                {occurrence.observations && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-2">Observações</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{occurrence.observations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Type Specific Data */}
            {occurrence.type === 'NF_COM_FALTA' && (
              <div className="bg-white rounded-2xl border border-purple-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-purple-100 bg-purple-50 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base font-semibold text-purple-900">Itens Faltantes e Tratativa</h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Itens Faltantes</h3>
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 font-medium rounded-l-lg">Produto</th>
                          <th className="px-4 py-2 font-medium rounded-r-lg w-32">Qtd. Faltante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occurrence.missingItems.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100 last:border-0">
                            <td className="px-4 py-3 text-slate-700">{item.product}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{Number(item.missingQty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {occurrence.treatment && (
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-800 mb-4">Tratativa Definida</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Tipo</p>
                          <p className="text-sm font-medium text-slate-900">
                            {TREATMENT_TYPE_LABELS[occurrence.treatment.type as keyof typeof TREATMENT_TYPE_LABELS]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                          <p className="text-sm font-medium text-slate-900">
                            {TREATMENT_STATUS_LABELS[occurrence.treatment.status as keyof typeof TREATMENT_STATUS_LABELS]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Data Prometida</p>
                          <p className="text-sm font-medium text-slate-900">
                            {formatDate(occurrence.treatment.promisedDate)}
                          </p>
                        </div>
                      </div>
                      {occurrence.treatment.observations && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-slate-500 mb-1">Observações da Tratativa</p>
                          <p className="text-sm text-slate-700">{occurrence.treatment.observations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {occurrence.type === 'NF_RECUSADA' && occurrence.refusal && (
              <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-base font-semibold text-red-900">Detalhes da Recusa</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Motivo</p>
                      <p className="text-sm font-medium text-slate-900">
                        {REFUSAL_REASON_LABELS[occurrence.refusal.reason as keyof typeof REFUSAL_REASON_LABELS]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                      <p className="text-sm font-medium text-slate-900">
                        {REFUSAL_STATUS_LABELS[occurrence.refusal.status as keyof typeof REFUSAL_STATUS_LABELS]}
                      </p>
                    </div>
                  </div>
                  {occurrence.refusal.description && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Descrição</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {occurrence.refusal.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Anexos</h2>
              </div>
              <div className="p-6">
                <AttachmentsSection 
                  occurrenceId={occurrence.id} 
                  attachments={safeAttachments as any} 
                  readOnly={occurrence.status === 'RESOLVIDA' || occurrence.status === 'CANCELADA'}
                />
              </div>
            </div>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Context Info */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Fornecedor
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-medium text-slate-900">{occurrence.supplier.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{occurrence.supplier.cnpj ? formatCNPJ(occurrence.supplier.cnpj) : 'Sem CNPJ'}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100" />
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
                    <User className="w-4 h-4 text-blue-600" />
                    Responsável
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-medium text-slate-900">{occurrence.responsible.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{occurrence.responsible.email}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100" />
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Datas
                  </div>
                  <div className="pl-6 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Abertura:</span>
                      <span className="font-medium text-slate-900">{formatDate(occurrence.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Última alt:</span>
                      <span className="font-medium text-slate-900">{formatDate(occurrence.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-800">Histórico</h2>
              </div>
              <div className="p-6 max-h-[500px] overflow-y-auto">
                <HistoryTimeline history={safeHistory as any} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
