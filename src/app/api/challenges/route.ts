import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { calculateDynamicPoints } from '@/lib/utils'
import { limit } from '@/lib/rate-limit'
import { getServerSession } from 'next-auth'

// Get all challenges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (category && category !== 'ALL') {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { author: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    // Get challenges with solve counts
    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        solvedBy: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
    })
    
    // Calculate total count for pagination
    const total = await prisma.challenge.count({ where })
    
    // Format challenges with dynamic points
    const formattedChallenges = challenges.map(challenge => ({
      ...challenge,
      solvedCount: challenge.solvedBy.length,
      currentPoints: calculateDynamicPoints(
        challenge.points,
        challenge.minPoints,
        challenge.decay,
        challenge.solvedBy.length
      )
    }))
    
    return NextResponse.json({
      success: true,
      data: formattedChallenges,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

// Create a new challenge (Admin only)
export async function POST(request: Request) {
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
    
    // Validate input
    const { title, description, category, tags, points, minPoints, decay, flag, fileUrl } = body
    
    if (!title || !description || !category || !points || !minPoints || !flag) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        tags: tags || [],
        author: user.name || 'Admin',
        points,
        minPoints,
        decay: decay || 0.1,
        flag,
        fileUrl: fileUrl || null,
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_CREATED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json(
      { success: true, data: challenge },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}