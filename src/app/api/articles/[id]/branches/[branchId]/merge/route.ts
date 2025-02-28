// Revised approach: Remove the second context parameter entirely.
// Instead, we manually parse the parameters from request.url, avoiding the param type conflict.
// This should satisfy Next.js route handler type constraints.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET: Merge a branch into another branch (placeholder logic)
// Function signature accepts only a Request object; we parse route parameters manually from the URL.
export async function GET(request: Request): Promise<Response> {
  try {
    // Parse the [id] and [branchId] from the URL manually.
    // Expected URL structure: /api/articles/:id/branches/:branchId/merge
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const idx = segments.findIndex(segment => segment === 'articles')
    if (idx < 0 || segments.length < idx + 4) {
      return NextResponse.json({ error: 'Invalid route structure' }, { status: 400 })
    }
    const id = segments[idx + 1]
    const branchId = segments[idx + 3]

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the article exists and if the user is authorized to perform a merge.
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: { select: { id: true } } },
    })
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    if (article.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Retrieve the targetBranchId from the query string.
    const targetBranchId = url.searchParams.get('targetBranchId')
    if (!targetBranchId) {
      return NextResponse.json({ error: 'targetBranchId is required' }, { status: 400 })
    }
    if (targetBranchId === branchId) {
      return NextResponse.json({ error: 'Cannot merge a branch into itself' }, { status: 400 })
    }

    // Placeholder merging logic: Merge the two latest versions of the article
    const sourceVersion = await prisma.version.findFirst({
      where: { articleId: id },
      orderBy: { number: 'desc' },
    })
    if (!sourceVersion) {
      return NextResponse.json({ error: 'No source version found' }, { status: 404 })
    }
    const targetVersion = await prisma.version.findFirst({
      where: { articleId: id },
      orderBy: { number: 'desc' },
    })
    if (!targetVersion) {
      return NextResponse.json({ error: 'No target version found' }, { status: 404 })
    }

    // Create a new merged version with an incremented version number.
    const newVersionNumber = targetVersion.number + 1
    const mergedVersion = await prisma.version.create({
      data: {
        articleId: id,
        number: newVersionNumber,
        content: sourceVersion.content,
      },
    })

    return NextResponse.json({
      message: 'Branch merged successfully (GET placeholder)',
      mergedVersion,
    })
  } catch (err) {
    console.error('Error merging branch:', err)
    return NextResponse.json({ error: 'Error merging branch' }, { status: 500 })
  }
}
