import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getServerSession } from 'next-auth'

// Get all users (Admin only)
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
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const users = await prisma.user.findMany({
      where,
      include: {
        team: true,
        badges: true,
        solves: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })
    
    const total = await prisma.user.count({ where })
    
    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        solveCount: user.solves.length,
        badgeCount: user.badges.length,
        passwordHash: undefined // Don't expose password hashes
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// Update user role (Admin only)
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
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPERADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { userId, role } = body
    
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      )
    }
    
    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: `USER_ROLE_UPDATED_TO_${role}`,
        userId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}