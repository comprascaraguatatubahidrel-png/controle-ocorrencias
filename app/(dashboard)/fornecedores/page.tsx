import Header from '@/components/layout/Header'
import SupplierTable from '@/components/suppliers/SupplierTable'
import { prisma } from '@/lib/prisma'

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { occurrences: true } } },
    orderBy: { name: 'asc' },
  })

  // Format dates for client component
  const safeSuppliers = suppliers.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    deletedAt: s.deletedAt?.toISOString() || null,
  }))

  return (
    <div className="flex flex-col h-full min-h-screen bg-slate-50">
      <Header 
        title="Fornecedores" 
        subtitle="Gerencie o cadastro de fornecedores do sistema" 
      />
      <div className="p-6 max-w-7xl mx-auto w-full">
        <SupplierTable initialData={safeSuppliers as any} />
      </div>
    </div>
  )
}
