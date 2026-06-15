'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { OccurrenceChart, SupplierChart } from '@/components/dashboard/Charts'
import { TypeBadge, StatusBadge } from '@/components/occurrences/StatusBadge'
import AlertBadge from '@/components/occurrences/AlertBadge'
import { formatDate } from '@/lib/utils'
import { 
  ClipboardList, CheckCircle2, AlertTriangle, 
  XOctagon, Clock, ChevronRight 
} from 'lucide-react'

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-slate-50">
        <Header title="Dashboard" subtitle="Visão geral do sistema" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header title="Dashboard" subtitle="Visão geral do sistema" />
      
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Em Aberto"
            value={data.stats.open}
            icon={<ClipboardList className="w-5 h-5" />}
            colorClass="text-blue-600"
            description="Ocorrências ativas"
          />
          <StatsCard
            title="Resolvidas"
            value={data.stats.resolved}
            icon={<CheckCircle2 className="w-5 h-5" />}
            colorClass="text-green-600"
            description="No total"
          />
          <StatsCard
            title="NFs com Falta"
            value={data.stats.nfWithMissing}
            icon={<AlertTriangle className="w-5 h-5" />}
            colorClass="text-purple-600"
          />
          <StatsCard
            title="NFs Recusadas"
            value={data.stats.nfRefused}
            icon={<XOctagon className="w-5 h-5" />}
            colorClass="text-red-600"
          />
          <StatsCard
            title="Atrasadas"
            value={data.stats.overdue}
            icon={<Clock className="w-5 h-5" />}
            colorClass="text-orange-600"
            description="Tratativas vencidas"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Ocorrências por Mês (Últimos 6 meses)</h3>
            <OccurrenceChart data={data.monthlyData} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-6">Top Fornecedores (com mais ocorrências)</h3>
            <SupplierChart data={data.supplierChartData} />
          </div>
        </div>

        {/* Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Occurrences */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">Últimas Ocorrências</h3>
              <Link href="/ocorrencias" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Ver todas <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  {data.recentOccurrences.map((occ: any) => (
                    <tr key={occ.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono font-medium text-blue-600">{occ.nfNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{occ.supplier.name}</p>
                      </td>
                      <td className="px-5 py-3"><TypeBadge type={occ.type} /></td>
                      <td className="px-5 py-3"><StatusBadge status={occ.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/ocorrencias/${occ.id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-5 h-5 ml-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.recentOccurrences.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Nenhuma ocorrência recente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Due Soon / Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-800">Vencimentos Próximos</h3>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <tbody>
                  {data.dueSoon.map((occ: any) => (
                    <tr key={occ.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-mono font-medium text-blue-600">{occ.nfNumber}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{occ.supplier.name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <AlertBadge promisedDate={occ.treatment?.promisedDate} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600 font-medium">
                        {formatDate(occ.treatment?.promisedDate)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/ocorrencias/${occ.id}`} className="text-slate-400 hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-5 h-5 ml-auto" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.dueSoon.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-400">Nenhum vencimento próximo.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
