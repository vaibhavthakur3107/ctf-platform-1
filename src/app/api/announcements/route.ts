import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Get published announcements for public display
export async function GET(request: Request) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Return last 10 announcements
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
