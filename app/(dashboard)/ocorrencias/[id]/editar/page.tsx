import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import OccurrenceForm from '@/components/occurrences/OccurrenceForm'
import { prisma } from '@/lib/prisma'

export default async function EditOccurrencePage({
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
    },
  })

  if (!occurrence) notFound()

  // Format dates and decimal values for client component
  const safeOccurrence = {
    ...occurrence,
    nfDate: occurrence.nfDate.toISOString(),
    nfValue: Number(occurrence.nfValue),
    createdAt: occurrence.createdAt.toISOString(),
    updatedAt: occurrence.updatedAt.toISOString(),
    deletedAt: occurrence.deletedAt?.toISOString() || null,
    supplier: {
      ...occurrence.supplier,
      createdAt: occurrence.supplier.createdAt.toISOString(),
      updatedAt: occurrence.supplier.updatedAt.toISOString(),
      deletedAt: occurrence.supplier.deletedAt?.toISOString() || null,
    },
    missingItems: occurrence.missingItems.map(m => ({
      ...m,
      missingQty: Number(m.missingQty),
    })),
    treatment: occurrence.treatment ? {
      ...occurrence.treatment,
      promisedDate: occurrence.treatment.promisedDate?.toISOString() || null,
      createdAt: occurrence.treatment.createdAt.toISOString(),
      updatedAt: occurrence.treatment.updatedAt.toISOString(),
    } : null,
    refusal: occurrence.refusal ? {
      ...occurrence.refusal,
      createdAt: occurrence.refusal.createdAt.toISOString(),
      updatedAt: occurrence.refusal.updatedAt.toISOString(),
    } : null,
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header 
        title="Editar Ocorrência" 
        subtitle={`Editando dados da NF ${occurrence.nfNumber}`} 
      />
      <div className="p-6 max-w-5xl mx-auto w-full">
        <OccurrenceForm occurrence={safeOccurrence as any} />
      </div>
    </div>
  )
}
