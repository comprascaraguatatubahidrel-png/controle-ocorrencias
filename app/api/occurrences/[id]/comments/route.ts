import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const commentSchema = z.object({
  comment: z.string().min(1, 'Comentário é obrigatório'),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const history = await prisma.occurrenceHistory.create({
    data: {
      occurrenceId: id,
      userId: session.user.id,
      action: 'Comentário adicionado',
      details: parsed.data.comment,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(history, { status: 201 })
}
