import Header from '@/components/layout/Header'
import OccurrenceForm from '@/components/occurrences/OccurrenceForm'

export default function NewOccurrencePage() {
  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header 
        title="Nova Ocorrência" 
        subtitle="Registre uma nova ocorrência de Nota Fiscal" 
      />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <OccurrenceForm />
      </div>
    </div>
  )
}
