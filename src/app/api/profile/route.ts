import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { hash, compare } from 'bcrypt'

// Get user profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: true,
        badges: true,
        solves: {
          include: {
            challenge: true
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Calculate user score
    const userScore = user.solves.reduce((sum, solve) => {
      return sum + solve.challenge.points
    }, 0)
    
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        score: userScore,
        solveCount: user.solves.length,
        passwordHash: undefined // Don't expose password hash
      }
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name, currentPassword, newPassword } = body
    
    // Update profile
    const updateData: any = {}
    
    if (name) {
      updateData.name = name
    }
    
    // Handle password change
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
      
      const passwordMatch = await compare(currentPassword, user.passwordHash)
      
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }
      
      updateData.passwordHash = await hash(newPassword, 12)
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'PROFILE_UPDATED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        passwordHash: undefined
      }
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}