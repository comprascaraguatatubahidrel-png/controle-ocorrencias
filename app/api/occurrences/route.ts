import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { occurrenceSchema } from '@/lib/validations'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || String(ITEMS_PER_PAGE))
  const nfNumber = searchParams.get('nfNumber') || ''
  const supplierId = searchParams.get('supplierId') || ''
  const type = searchParams.get('type') || ''
  const status = searchParams.get('status') || ''
  const responsibleId = searchParams.get('responsibleId') || ''
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const where: any = { deletedAt: null }

  if (nfNumber) where.nfNumber = { contains: nfNumber, mode: 'insensitive' }
  if (supplierId) where.supplierId = supplierId
  if (type) where.type = type
  if (status) where.status = status
  if (responsibleId) where.responsibleId = responsibleId
  if (startDate || endDate) {
    where.nfDate = {}
    if (startDate) where.nfDate.gte = new Date(startDate)
    if (endDate) where.nfDate.lte = new Date(endDate)
  }

  const [data, total] = await Promise.all([
    prisma.occurrence.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        responsible: { select: { id: true, name: true, email: true } },
        treatment: { select: { promisedDate: true, status: true } },
        _count: { select: { attachments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.occurrence.count({ where }),
  ])

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = occurrenceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { missingItems, treatment, refusal, nfDate, ...rest } = parsed.data

  const occurrence = await prisma.occurrence.create({
    data: {
      ...rest,
      nfDate: new Date(nfDate),
      missingItems: missingItems?.length
        ? { create: missingItems }
        : undefined,
      treatment: treatment
        ? {
            create: {
              ...treatment,
              promisedDate: treatment.promisedDate ? new Date(treatment.promisedDate) : null,
            },
          }
        : undefined,
      refusal: refusal ? { create: refusal } : undefined,
      history: {
        create: {
          userId: session.user.id,
          action: 'Ocorrência criada',
          details: `Ocorrência ${rest.nfNumber} registrada no sistema`,
        },
      },
    },
    include: {
      supplier: true,
      responsible: true,
      missingItems: true,
      treatment: true,
      refusal: true,
    },
  })

  return NextResponse.json(occurrence, { status: 201 })
}
