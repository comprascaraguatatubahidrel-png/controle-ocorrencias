import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { supplierSchema } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const supplier = await prisma.supplier.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { occurrences: true } } },
  })

  if (!supplier) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(supplier)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  // Allow soft delete
  if (body.deletedAt !== undefined) {
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const supplier = await prisma.supplier.update({
      where: { id },
      data: { deletedAt: body.deletedAt ? new Date() : null, active: false },
    })
    return NextResponse.json(supplier)
  }

  const parsed = supplierSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(supplier)
}
