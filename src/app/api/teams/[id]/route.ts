import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getServerSession } from 'next-auth/react'

// Get team details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            solves: true,
          }
        }
      }
    })
    
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      )
    }
    
    // Calculate team score
    const teamScore = team.members.reduce((sum, member) => {
      return sum + member.solves.length
    }, 0)
    
    return NextResponse.json({
      success: true,
      data: {
        ...team,
        score: teamScore,
        memberCount: team.members.length
      }
    })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

// Leave team
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
    
    // Check if user is in this team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { team: true }
    })
    
    if (!user?.team || user.team.id !== params.id) {
      return NextResponse.json(
        { success: false, error: 'You are not in this team' },
        { status: 400 }
      )
    }
    
    // Remove user from team
    await prisma.user.update({
      where: { id: session.user.id },
      data: { teamId: null }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'TEAM_LEFT',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Left team successfully'
    })
  } catch (error) {
    console.error('Error leaving team:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to leave team' },
      { status: 500 }
    )
  }
}