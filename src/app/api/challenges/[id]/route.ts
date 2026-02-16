import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { calculateDynamicPoints } from '@/lib/utils'

// Get single challenge details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(auth)

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        solvedBy: {
          select: {
            id: true
          }
        },
        hints: {
          orderBy: {
            order: 'asc'
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

    // Check if user has solved this challenge
    const userSolved = session?.user?.id
      ? challenge.solvedBy.some(s => s.id === session.user.id)
      : false

    // Check which hints the user has revealed
    let revealedHints = []
    if (session?.user?.id) {
      const hintReveals = await prisma.hintReveal.findMany({
        where: {
          userId: session.user.id,
          hintId: {
            in: challenge.hints.map(h => h.id)
          }
        },
        include: {
          hint: true
        }
      })
      revealedHints = hintReveals.map(hr => ({
        ...hr.hint,
        revealed: true
      }))
    }

    // Calculate current points
    const currentPoints = calculateDynamicPoints(
      challenge.points,
      challenge.minPoints,
      challenge.decay,
      challenge.solvedBy.length
    )

    // Don't expose the flag to the frontend
    const { flag, ...challengeWithoutFlag } = challenge

    return NextResponse.json({
      success: true,
      data: {
        ...challengeWithoutFlag,
        solvedCount: challenge.solvedBy.length,
        currentPoints,
        userSolved,
        hints: challenge.hints.map(hint => {
          const revealed = revealedHints.find(rh => rh.id === hint.id)
          return {
            id: hint.id,
            text: revealed ? hint.text : null,
            cost: hint.cost,
            order: hint.order,
            revealed: !!revealed
          }
        })
      }
    })
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge' },
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

    return NextResponse.json({ success: true, data: challenge })
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Super Admin access required' },
        { status: 403 }
      )
    }

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

    return NextResponse.json({ success: true, message: 'Challenge deleted' })
  } catch (error) {
    console.error('Error deleting challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete challenge' },
      { status: 500 }
    )
  }
}
