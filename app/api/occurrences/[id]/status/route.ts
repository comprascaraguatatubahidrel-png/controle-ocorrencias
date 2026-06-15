import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { statusUpdateSchema } from '@/lib/validations'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = statusUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const oldOccurrence = await prisma.occurrence.findUnique({
    where: { id },
    select: { status: true, nfNumber: true },
  })

  if (!oldOccurrence) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const occurrence = await prisma.$transaction(async (tx) => {
    const updated = await tx.occurrence.update({
      where: { id },
      data: { status: parsed.data.status },
    })

    await tx.occurrenceHistory.create({
      data: {
        occurrenceId: id,
        userId: session.user.id,
        action: 'Status alterado',
        details: `Status alterado de ${oldOccurrence.status} para ${parsed.data.status}${
          parsed.data.comment ? `: ${parsed.data.comment}` : ''
        }`,
      },
    })

    return updated
  })

  return NextResponse.json(occurrence)
}
