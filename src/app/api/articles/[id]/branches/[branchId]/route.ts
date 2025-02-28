import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Basic route handlers with minimal complexity
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string, branchId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get article
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorId: true
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    if (article.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get branch info
    const branch = await prisma.version.findFirst({
      where: { 
        articleId: params.id,
        branchId: params.branchId
      },
      orderBy: { number: 'desc' },
      select: {
        id: true,
        number: true,
        content: true,
        createdAt: true
      }
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    return NextResponse.json({ branch })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string, branchId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Quick permission check
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (article.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use transaction for atomic operation
    await prisma.$transaction([
      prisma.version.deleteMany({
        where: { 
          articleId: params.id,
          branchId: params.branchId
        }
      }),
      prisma.branch.delete({
        where: { id: params.branchId }
      })
    ])

    return NextResponse.json({ message: 'Deleted' })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
