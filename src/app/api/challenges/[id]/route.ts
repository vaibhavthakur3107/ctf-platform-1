import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { calculateDynamicPoints } from '@/lib/utils'
import { limit } from '@/lib/rate-limit'
import { getServerSession } from 'next-auth/react'

// Get challenge details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        solvedBy: {
          select: {
            id: true,
            userId: true,
            timestamp: true
          }
        }
      }
    })
    
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }
    
    const formattedChallenge = {
      ...challenge,
      solvedCount: challenge.solvedBy.length,
      currentPoints: calculateDynamicPoints(
        challenge.points,
        challenge.minPoints,
        challenge.decay,
        challenge.solvedBy.length
      )
    }
    
    return NextResponse.json({
      success: true,
      data: formattedChallenge
    })
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge' },
      { status: 500 }
    )
  }
}

// Submit flag solution
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Rate limiting
    const rateLimitResult = await limit(ip)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: rateLimitResult.headers }
      )
    }
    
    const body = await request.json()
    const { flag } = body
    
    if (!flag) {
      return NextResponse.json(
        { success: false, error: 'Flag is required' },
        { status: 400 }
      )
    }
    
    // Check for honey tokens
    const honeyToken = await prisma.honeyToken.findFirst({
      where: { token: flag }
    })
    
    if (honeyToken) {
      // Ban the user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'BANNED' }
      })
      
      await prisma.auditLog.create({
        data: {
          action: 'USER_BANNED_HONEYTOKEN',
          userId: session.user.id,
          ipAddress: ip,
        }
      })
      
      return NextResponse.json(
        { success: false, error: 'Invalid flag' },
        { status: 400 }
      )
    }
    
    // Get challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        solvedBy: true
      }
    })
    
    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }
    
    // Check if already solved
    const alreadySolved = challenge.solvedBy.some(solve => solve.userId === session.user.id)
    
    if (alreadySolved) {
      return NextResponse.json(
        { success: false, error: 'You have already solved this challenge' },
        { status: 400 }
      )
    }
    
    // Check if flag is correct
    if (flag !== challenge.flag) {
      return NextResponse.json(
        { success: false, error: 'Incorrect flag' },
        { status: 400 }
      )
    }
    
    // Calculate points
    const points = calculateDynamicPoints(
      challenge.points,
      challenge.minPoints,
      challenge.decay,
      challenge.solvedBy.length
    )
    
    // Create solve record
    const solve = await prisma.solve.create({
      data: {
        userId: session.user.id,
        challengeId: challenge.id,
      }
    })
    
    // Update user score
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // This would be handled by a trigger or separate logic in production
        // For now, we'll just log the solve
      }
    })
    
    // Check for achievements
    const solveCount = challenge.solvedBy.length + 1
    
    // First Blood achievement (first solve)
    if (solveCount === 1) {
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: 'FIRST_BLOOD',
        }
      })
    }
    
    // Speed Demon achievement (solve within 2 minutes)
    // This would require tracking when the user first viewed the challenge
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_SOLVED',
        userId: session.user.id,
        ipAddress: ip,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        solve,
        points,
        message: 'Correct flag! Challenge solved.'
      }
    })
  } catch (error) {
    console.error('Error submitting flag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit flag' },
      { status: 500 }
    )
  }
}

// Update challenge (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Update challenge
    const challenge = await prisma.challenge.update({
      where: { id: params.id },
      data: body
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_UPDATED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: challenge
    })
  } catch (error) {
    console.error('Error updating challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update challenge' },
      { status: 500 }
    )
  }
}

// Delete challenge (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    // Delete challenge
    await prisma.challenge.delete({
      where: { id: params.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_DELETED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Challenge deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete challenge' },
      { status: 500 }
    )
  }
}