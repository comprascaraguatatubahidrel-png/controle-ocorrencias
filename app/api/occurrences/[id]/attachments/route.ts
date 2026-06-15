import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const attachments = await prisma.attachment.findMany({
    where: { occurrenceId: id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(attachments)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const formData = await req.formData()
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const attachments = []

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { url, publicId, type } = await uploadToCloudinary(buffer, file.name)

    const attachment = await prisma.attachment.create({
      data: {
        occurrenceId: id,
        url,
        publicId,
        type,
        name: file.name,
      },
    })

    attachments.push(attachment)
  }

  await prisma.occurrenceHistory.create({
    data: {
      occurrenceId: id,
      userId: session.user.id,
      action: 'Anexos adicionados',
      details: `${attachments.length} arquivo(s) adicionado(s)`,
    },
  })

  return NextResponse.json(attachments, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const attachmentId = searchParams.get('attachmentId')

  if (!attachmentId) {
    return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 })
  }

  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, occurrenceId: id },
  })

  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await deleteFromCloudinary(attachment.publicId, attachment.type === 'PDF')
  await prisma.attachment.delete({ where: { id: attachmentId } })

  return NextResponse.json({ success: true })
}
