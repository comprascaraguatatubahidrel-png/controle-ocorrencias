'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, SupplierFormData } from '@/lib/validations'
import { formatCNPJ } from '@/lib/utils'
import { SupplierData } from '@/types'
import { Loader2, Plus, Edit2, Trash2, Search, Building2, AlertTriangle, AlertCircle } from 'lucide-react'

interface SupplierTableProps {
  initialData: SupplierData[]
}

export default function SupplierTable({ initialData }: SupplierTableProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { active: true },
  })

  const filteredData = data.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.cnpj && s.cnpj.includes(search))
  )

  const openModal = (supplier?: SupplierData) => {
    setEditingSupplier(supplier || null)
    reset(supplier || { name: '', cnpj: '', contact: '', active: true })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingSupplier(null)
    reset()
  }

  const onSubmit = async (formData: SupplierFormData) => {
    setSaving(true)
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers'
      const method = editingSupplier ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const saved = await res.json()
        if (editingSupplier) {
          setData(data.map(s => s.id === saved.id ? { ...s, ...saved } : s))
        } else {
          setData([...data, { ...saved, _count: { occurrences: 0 } }])
        }
        closeModal()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string, occCount: number = 0) => {
    if (occCount > 0) {
      alert(`Não é possível excluir o fornecedor "${name}" pois ele possui ${occCount} ocorrência(s) vinculada(s). Você pode inativá-lo editando o cadastro.`)
      return
    }

    if (!confirm(`Deseja realmente excluir o fornecedor "${name}"?`)) return

    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedAt: new Date().toISOString() }),
      })
      if (res.ok) {
        setData(data.filter(s => s.id !== id))
      } else {
        alert('Erro ao excluir fornecedor. Verifique suas permissões.')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Fornecedor</th>
                <th>CNPJ</th>
                <th>Contato</th>
                <th>Status</th>
                <th className="text-center">Ocorrências</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">Nenhum fornecedor encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((supplier) => (
                  <tr key={supplier.id} className={!supplier.active ? 'opacity-60 bg-slate-50' : ''}>
                    <td className="font-medium text-slate-800">{supplier.name}</td>
                    <td className="font-mono text-slate-600">{supplier.cnpj ? formatCNPJ(supplier.cnpj) : '—'}</td>
                    <td className="text-slate-600">{supplier.contact || '—'}</td>
                    <td>
                      <span className={`badge ${supplier.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {supplier.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center min-w-8 h-6 px-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                        {supplier._count?.occurrences || 0}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(supplier)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.name, supplier._count?.occurrences)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
          Total de {filteredData.length} fornecedores
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome da Empresa <span className="text-red-500">*</span></label>
                <input
                  {...register('name')}
                  placeholder="Razão Social ou Nome Fantasia"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">CNPJ</label>
                <input
                  {...register('cnpj')}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contato (Telefone/Email)</label>
                <input
                  {...register('contact')}
                  placeholder="Ex: contato@empresa.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {editingSupplier && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" {...register('active')} className="peer sr-only" />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700 select-none group-hover:text-blue-600 transition-colors">
                      Fornecedor Ativo
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 mt-1 pl-12">
                    Desative se não for mais utilizar este fornecedor.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-500/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Salvando...' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
