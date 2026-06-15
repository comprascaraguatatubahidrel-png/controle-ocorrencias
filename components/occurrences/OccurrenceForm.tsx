'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { occurrenceSchema, OccurrenceFormData } from '@/lib/validations'
import {
  OCCURRENCE_TYPE_LABELS, OCCURRENCE_STATUS_LABELS,
  SUPPLIER_ACKNOWLEDGED_LABELS, TREATMENT_TYPE_LABELS,
  TREATMENT_STATUS_LABELS, REFUSAL_REASON_LABELS, REFUSAL_STATUS_LABELS
} from '@/lib/constants'
import { OccurrenceData } from '@/types'
import MissingItemsSection from './MissingItemsSection'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

interface OccurrenceFormProps {
  occurrence?: OccurrenceData
}

function FormSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-4 ${className}`}>
      <h2 className="text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">{title}</h2>
      {children}
    </div>
  )
}

function FormField({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const inputClass = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
const selectClass = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

export default function OccurrenceForm({ occurrence }: OccurrenceFormProps) {
  const router = useRouter()
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceSchema),
    defaultValues: occurrence
      ? {
          nfNumber: occurrence.nfNumber,
          supplierId: occurrence.supplierId,
          nfDate: new Date(occurrence.nfDate).toISOString().split('T')[0],
          nfValue: Number(occurrence.nfValue),
          type: occurrence.type,
          responsibleId: occurrence.responsibleId,
          status: occurrence.status,
          observations: occurrence.observations || '',
          supplierAcknowledged: occurrence.supplierAcknowledged,
          missingItems: occurrence.missingItems?.map(i => ({
            product: i.product,
            missingQty: Number(i.missingQty),
          })),
          treatment: occurrence.treatment ? {
            type: occurrence.treatment.type,
            promisedDate: occurrence.treatment.promisedDate
              ? new Date(occurrence.treatment.promisedDate).toISOString().split('T')[0]
              : '',
            observations: occurrence.treatment.observations || '',
            status: occurrence.treatment.status,
          } : undefined,
          refusal: occurrence.refusal ? {
            reason: occurrence.refusal.reason,
            description: occurrence.refusal.description || '',
            status: occurrence.refusal.status,
          } : undefined,
        }
      : { status: 'ABERTA', supplierAcknowledged: 'AGUARDANDO_RETORNO' },
  })

  const occurrenceType = watch('type')

  useEffect(() => {
    fetch('/api/suppliers?includeInactive=false')
      .then(r => r.json()).then(setSuppliers)
    fetch('/api/users')
      .then(r => r.json()).then(setUsers)
  }, [])

  const onSubmit = async (data: OccurrenceFormData) => {
    setSaving(true)
    try {
      const url = occurrence ? `/api/occurrences/${occurrence.id}` : '/api/occurrences'
      const method = occurrence ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const saved = await res.json()
        router.push(`/ocorrencias/${saved.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* NF Data */}
      <FormSection title="📄 Dados da Nota Fiscal">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Número da NF" error={errors.nfNumber?.message} required>
            <input {...register('nfNumber')} placeholder="Ex: NF-001234" className={inputClass} />
          </FormField>
          <FormField label="Fornecedor" error={errors.supplierId?.message} required>
            <select {...register('supplierId')} className={selectClass}>
              <option value="">Selecione o fornecedor</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Data da NF" error={errors.nfDate?.message} required>
            <input {...register('nfDate')} type="date" className={inputClass} />
          </FormField>
          <FormField label="Valor da NF (R$)" error={errors.nfValue?.message} required>
            <input {...register('nfValue', { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0,00" className={inputClass} />
          </FormField>
        </div>
      </FormSection>

      {/* Occurrence Data */}
      <FormSection title="⚠️ Dados da Ocorrência">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tipo de Ocorrência" error={errors.type?.message} required>
            <select {...register('type')} className={selectClass}>
              <option value="">Selecione o tipo</option>
              {Object.entries(OCCURRENCE_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Responsável" error={errors.responsibleId?.message} required>
            <select {...register('responsibleId')} className={selectClass}>
              <option value="">Selecione o responsável</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </FormField>
          <FormField label="Status" error={errors.status?.message} required>
            <select {...register('status')} className={selectClass}>
              {Object.entries(OCCURRENCE_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Fornecedor Reconheceu?" error={errors.supplierAcknowledged?.message} required>
            <select {...register('supplierAcknowledged')} className={selectClass}>
              {Object.entries(SUPPLIER_ACKNOWLEDGED_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </FormField>
        </div>
        <FormField label="Observações">
          <textarea {...register('observations')} rows={3} placeholder="Descreva a ocorrência..." className={`${inputClass} resize-none`} />
        </FormField>
      </FormSection>

      {/* NF COM FALTA */}
      {occurrenceType === 'NF_COM_FALTA' && (
        <FormSection title="📦 Itens Faltantes" className="border-purple-200 bg-purple-50/30">
          <MissingItemsSection control={control} register={register} errors={errors} />

          <div className="pt-2 border-t border-purple-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">🤝 Tratativa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tipo de Tratativa">
                <select {...register('treatment.type')} className={selectClass}>
                  <option value="">Selecione</option>
                  {Object.entries(TREATMENT_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status da Tratativa">
                <select {...register('treatment.status')} className={selectClass}>
                  {Object.entries(TREATMENT_STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Data Prometida pelo Fornecedor">
                <input {...register('treatment.promisedDate')} type="date" className={inputClass} />
              </FormField>
              <FormField label="Observações da Tratativa">
                <input {...register('treatment.observations')} placeholder="Detalhes da tratativa" className={inputClass} />
              </FormField>
            </div>
          </div>
        </FormSection>
      )}

      {/* NF RECUSADA */}
      {occurrenceType === 'NF_RECUSADA' && (
        <FormSection title="🚫 Detalhes da Recusa" className="border-red-200 bg-red-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Motivo da Recusa" required>
              <select {...register('refusal.reason')} className={selectClass}>
                <option value="">Selecione o motivo</option>
                {Object.entries(REFUSAL_REASON_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status">
              <select {...register('refusal.status')} className={selectClass}>
                {Object.entries(REFUSAL_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Descrição Detalhada">
            <textarea {...register('refusal.description')} rows={3} placeholder="Descreva o motivo da recusa em detalhes..." className={`${inputClass} resize-none`} />
          </FormField>
        </FormSection>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/25"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : occurrence ? 'Atualizar Ocorrência' : 'Registrar Ocorrência'}
        </button>
      </div>
    </form>
  )
}
