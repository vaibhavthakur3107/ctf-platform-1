import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateInviteCode } from '@/lib/utils'
import { getServerSession } from 'next-auth'

// Create a team
export async function POST(request: Request) {
  try {
    const session = await getServerSession(auth)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      )
    }
    
    // Check if user already has a team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })
    
    if (user?.team) {
      return NextResponse.json(
        { success: false, error: 'You are already in a team' },
        { status: 400 }
      )
    }
    
    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        inviteCode: generateInviteCode(),
        members: {
          connect: { id: session.user.id }
        }
      }
    })
    
    // Update user with team ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamId: team.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_CREATED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: team
    })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

// Join a team
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
    const { inviteCode } = body
    
    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: 'Invite code is required' },
        { status: 400 }
      )
    }
    
    // Check if user already has a team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })
    
    if (user?.team) {
      return NextResponse.json(
        { success: false, error: 'You are already in a team' },
        { status: 400 }
      )
    }
    
    // Find team by invite code
    const team = await prisma.team.findFirst({
      where: { inviteCode }
    })
    
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite code' },
        { status: 404 }
      )
    }
    
    // Add user to team
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamId: team.id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_JOINED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      data: team
    })
  } catch (error) {
    console.error('Error joining team:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join team' },
      { status: 500 }
    )
  }
}