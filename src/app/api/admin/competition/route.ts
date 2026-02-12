import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getServerSession } from 'next-auth'

// Get competition settings
export async function GET(request: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const settings = await prisma.competitionSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching competition settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch competition settings' },
      { status: 500 }
    )
  }
}

// Update competition settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Get existing settings or create new ones
    let settings = await prisma.competitionSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.competitionSettings.create({
        data: body
      })
    } else {
      settings = await prisma.competitionSettings.update({
        where: { id: settings.id },
        data: body
      })
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'COMPETITION_SETTINGS_UPDATED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error updating competition settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update competition settings' },
      { status: 500 }
    )
  }
}