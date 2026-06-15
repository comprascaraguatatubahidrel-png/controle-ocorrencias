import Header from '@/components/layout/Header'
import OccurrenceTable from '@/components/occurrences/OccurrenceTable'

export default function OccurrencesPage() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header 
        title="Ocorrências" 
        subtitle="Acompanhe e gerencie todas as ocorrências de NF" 
      />
      <div className="p-6 max-w-7xl mx-auto w-full">
        <OccurrenceTable />
      </div>
    </div>
  )
}
