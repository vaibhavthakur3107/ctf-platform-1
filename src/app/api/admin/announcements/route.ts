import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { auth, isAdmin } from '@/lib/auth'

// Get all announcements
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const where: any = {}

    if (!includeUnpublished) {
      where.isPublished = true
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: announcements
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}

// Create announcement (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(auth)

    if (!session || !session.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, content, priority = 'INFO', isPublished = false } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        isPublished,
        publishedBy: session.user.id
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'ANNOUNCEMENT_CREATED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      data: announcement
    })

  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}
