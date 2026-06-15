import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const [
    open,
    resolved,
    nfWithMissing,
    nfRefused,
    recentOccurrences,
    overdue,
    dueSoon,
    monthlyData,
    supplierData,
  ] = await Promise.all([
    // Open occurrences
    prisma.occurrence.count({ where: { status: 'ABERTA', deletedAt: null } }),
    // Resolved occurrences
    prisma.occurrence.count({ where: { status: 'RESOLVIDA', deletedAt: null } }),
    // NF with missing items
    prisma.occurrence.count({ where: { type: 'NF_COM_FALTA', deletedAt: null, status: { not: 'CANCELADA' } } }),
    // NF refused
    prisma.occurrence.count({ where: { type: 'NF_RECUSADA', deletedAt: null, status: { not: 'CANCELADA' } } }),
    // Recent occurrences
    prisma.occurrence.findMany({
      where: { deletedAt: null },
      include: {
        supplier: { select: { name: true } },
        responsible: { select: { name: true } },
        treatment: { select: { promisedDate: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Overdue
    prisma.occurrence.count({
      where: {
        deletedAt: null,
        status: { notIn: ['RESOLVIDA', 'CANCELADA'] },
        treatment: { promisedDate: { lt: now } },
      },
    }),
    // Due soon (within 2 days)
    prisma.occurrence.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ['RESOLVIDA', 'CANCELADA'] },
        treatment: {
          promisedDate: {
            gte: now,
            lte: twoDaysFromNow,
          },
        },
      },
      include: {
        supplier: { select: { name: true } },
        treatment: { select: { promisedDate: true } },
      },
      orderBy: { treatment: { promisedDate: 'asc' } },
      take: 5,
    }),
    // Monthly data (last 6 months)
    prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM occurrences
      WHERE "deletedAt" IS NULL 
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
    // Top suppliers by occurrence count
    prisma.occurrence.groupBy({
      by: ['supplierId'],
      where: { deletedAt: null, status: { notIn: ['CANCELADA'] } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  // Get supplier names for chart
  const supplierIds = supplierData.map((s) => s.supplierId)
  const suppliers = await prisma.supplier.findMany({
    where: { id: { in: supplierIds } },
    select: { id: true, name: true },
  })

  const supplierChartData = supplierData.map((s) => ({
    name: suppliers.find((sup) => sup.id === s.supplierId)?.name || 'Desconhecido',
    total: s._count.id,
  }))

  return NextResponse.json({
    stats: {
      open,
      resolved,
      nfWithMissing,
      nfRefused,
      overdue,
    },
    recentOccurrences,
    dueSoon,
    monthlyData: monthlyData.map((m) => ({
      month: m.month,
      total: Number(m.count),
    })),
    supplierChartData,
  })
}
