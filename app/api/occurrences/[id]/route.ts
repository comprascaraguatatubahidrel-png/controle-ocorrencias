import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { occurrenceSchema } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const occurrence = await prisma.occurrence.findFirst({
    where: { id, deletedAt: null },
    include: {
      supplier: true,
      responsible: { select: { id: true, name: true, email: true, role: true } },
      missingItems: true,
      treatment: true,
      refusal: true,
      attachments: { orderBy: { createdAt: 'desc' } },
      history: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!occurrence) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(occurrence)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = occurrenceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { missingItems, treatment, refusal, nfDate, ...rest } = parsed.data

  // Get old occurrence for history
  const oldOccurrence = await prisma.occurrence.findUnique({ where: { id }, select: { status: true, nfNumber: true } })

  const occurrence = await prisma.$transaction(async (tx) => {
    // Delete old related data
    await tx.missingItem.deleteMany({ where: { occurrenceId: id } })

    const updated = await tx.occurrence.update({
      where: { id },
      data: {
        ...rest,
        nfDate: new Date(nfDate),
        missingItems: missingItems?.length
          ? { create: missingItems }
          : undefined,
        treatment: treatment
          ? {
              upsert: {
                create: {
                  ...treatment,
                  promisedDate: treatment.promisedDate ? new Date(treatment.promisedDate) : null,
                },
                update: {
                  ...treatment,
                  promisedDate: treatment.promisedDate ? new Date(treatment.promisedDate) : null,
                },
              },
            }
          : undefined,
        refusal: refusal
          ? {
              upsert: {
                create: refusal,
                update: refusal,
              },
            }
          : undefined,
        history: {
          create: {
            userId: session.user.id,
            action: 'Ocorrência editada',
            details: `Dados da ocorrência ${rest.nfNumber} foram atualizados`,
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

    if (oldOccurrence?.status !== rest.status) {
      await tx.occurrenceHistory.create({
        data: {
          occurrenceId: id,
          userId: session.user.id,
          action: 'Status alterado',
          details: `Status alterado de ${oldOccurrence?.status} para ${rest.status}`,
        },
      })
    }

    return updated
  })

  return NextResponse.json(occurrence)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  await prisma.occurrence.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
