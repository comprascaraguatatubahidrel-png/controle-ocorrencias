'use client'

import { useState } from 'react'
import { useFieldArray, Control, UseFormRegister, FieldErrors } from 'react-hook-form'
import { OccurrenceFormData } from '@/lib/validations'
import { Plus, Trash2, PackageSearch } from 'lucide-react'

interface MissingItemsSectionProps {
  control: Control<OccurrenceFormData>
  register: UseFormRegister<OccurrenceFormData>
  errors: FieldErrors<OccurrenceFormData>
}

export default function MissingItemsSection({ control, register, errors }: MissingItemsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'missingItems',
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageSearch className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-800">Itens Faltantes</h3>
        </div>
        <button
          type="button"
          onClick={() => append({ product: '', missingQty: 1 })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Item
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          <PackageSearch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">Nenhum item adicionado</p>
          <p className="text-xs text-slate-300 mt-1">Clique em &quot;Adicionar Item&quot; para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-3 px-3">
            <div className="col-span-8 text-xs font-medium text-slate-500 uppercase tracking-wide">Produto</div>
            <div className="col-span-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Qtd. Faltante</div>
            <div className="col-span-1" />
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
              <div className="col-span-8">
                <input
                  {...register(`missingItems.${index}.product`)}
                  placeholder="Nome do produto"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.missingItems?.[index]?.product && (
                  <p className="text-red-500 text-xs mt-1">{errors.missingItems[index]?.product?.message}</p>
                )}
              </div>
              <div className="col-span-3">
                <input
                  {...register(`missingItems.${index}.missingQty`, { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
