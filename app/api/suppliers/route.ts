import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { supplierSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      ...(includeInactive ? {} : { active: true }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { cnpj: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { occurrences: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = supplierSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supplier = await prisma.supplier.create({
    data: parsed.data,
  })

  return NextResponse.json(supplier, { status: 201 })
}
