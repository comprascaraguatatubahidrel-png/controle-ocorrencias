'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, SortingState, ColumnDef,
} from '@tanstack/react-table'
import { StatusBadge, TypeBadge } from './StatusBadge'
import AlertBadge from './AlertBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { OccurrenceData } from '@/types'
import { OCCURRENCE_STATUS_LABELS, OCCURRENCE_TYPE_LABELS, ITEMS_PER_PAGE } from '@/lib/constants'
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ChevronsUpDown, ChevronUp, ChevronDown, Filter, X, Eye,
} from 'lucide-react'

interface Filters {
  nfNumber: string
  supplierId: string
  type: string
  status: string
  responsibleId: string
}

export default function OccurrenceTable() {
  const router = useRouter()
  const [data, setData] = useState<OccurrenceData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [showFilters, setShowFilters] = useState(false)
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [filters, setFilters] = useState<Filters>({
    nfNumber: '', supplierId: '', type: '', status: '', responsibleId: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(ITEMS_PER_PAGE),
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    })
    try {
      const res = await fetch(`/api/occurrences?${params}`)
      const json = await res.json()
      setData(json.data)
      setTotal(json.total)
      setTotalPages(json.totalPages)
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(setSuppliers)
    fetch('/api/users').then(r => r.json()).then(setUsers)
  }, [])

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nfNumber',
      header: 'Nº NF',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-blue-600">{row.original.nfNumber}</span>
      ),
    },
    {
      accessorKey: 'supplier.name',
      header: 'Fornecedor',
      cell: ({ row }) => (
        <span className="font-medium text-slate-700">{row.original.supplier?.name}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => <TypeBadge type={row.original.type} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'alert',
      header: 'Prazo',
      cell: ({ row }) => (
        <AlertBadge promisedDate={row.original.treatment?.promisedDate} />
      ),
    },
    {
      accessorKey: 'responsible.name',
      header: 'Responsável',
      cell: ({ row }) => (
        <span className="text-slate-600">{row.original.responsible?.name}</span>
      ),
    },
    {
      accessorKey: 'nfDate',
      header: 'Data NF',
      cell: ({ row }) => formatDate(row.original.nfDate),
    },
    {
      accessorKey: 'createdAt',
      header: 'Cadastro',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Link
          href={`/ocorrencias/${row.original.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver
        </Link>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualPagination: true,
    pageCount: totalPages,
  })

  const clearFilters = () => {
    setFilters({ nfNumber: '', supplierId: '', type: '', status: '', responsibleId: '' })
    setPage(1)
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={filters.nfNumber}
              onChange={e => { setFilters(f => ({ ...f, nfNumber: e.target.value })); setPage(1) }}
              placeholder="Buscar por Nº NF..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all ${
              showFilters || hasFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="bg-white text-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Limpar
            </button>
          )}
        </div>
        <Link
          href="/ocorrencias/nova"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/25 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nova Ocorrência
        </Link>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
          <select
            value={filters.supplierId}
            onChange={e => { setFilters(f => ({ ...f, supplierId: e.target.value })); setPage(1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os fornecedores</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={filters.type}
            onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(OCCURRENCE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            {Object.entries(OCCURRENCE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={filters.responsibleId}
            onChange={e => { setFilters(f => ({ ...f, responsibleId: e.target.value })); setPage(1) }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os responsáveis</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc'
                            ? <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                            : header.column.getIsSorted() === 'desc'
                              ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                              : <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 opacity-30" />
                      <p className="text-sm font-medium">Nenhuma ocorrência encontrada</p>
                      <p className="text-xs">Tente ajustar os filtros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="cursor-pointer" onClick={() => router.push(`/ocorrencias/${row.original.id}`)}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {total} ocorrência{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-600 px-2">
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
