import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'

// Get all hints for a challenge (without revealing text unless purchased)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(auth)

    const hints = await prisma.hint.findMany({
      where: { challengeId: params.id },
      orderBy: { order: 'asc' }
    })

    // Check which hints the user has revealed
    let revealedHintIds: string[] = []
    if (session?.user?.id) {
      const hintReveals = await prisma.hintReveal.findMany({
        where: {
          userId: session.user.id,
          hintId: {
            in: hints.map(h => h.id)
          }
        }
      })
      revealedHintIds = hintReveals.map(hr => hr.hintId)
    }

    // Return hints with text only if revealed
    const hintsWithStatus = hints.map(hint => ({
      id: hint.id,
      cost: hint.cost,
      order: hint.order,
      text: revealedHintIds.includes(hint.id) ? hint.text : null,
      revealed: revealedHintIds.includes(hint.id)
    }))

    return NextResponse.json({
      success: true,
      data: hintsWithStatus
    })
  } catch (error) {
    console.error('Error fetching hints:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch hints' },
      { status: 500 }
    )
  }
}

// Reveal a hint (requires points deduction)
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

    const body = await request.json()
    const { hintId } = body

    if (!hintId) {
      return NextResponse.json(
        { success: false, error: 'Hint ID is required' },
        { status: 400 }
      )
    }

    // Get the hint
    const hint = await prisma.hint.findUnique({
      where: { id: hintId },
      include: {
        challenge: {
          include: {
            solvedBy: true
          }
        }
      }
    })

    if (!hint) {
      return NextResponse.json(
        { success: false, error: 'Hint not found' },
        { status: 404 }
      )
    }

    if (hint.challengeId !== params.id) {
      return NextResponse.json(
        { success: false, error: 'Hint does not belong to this challenge' },
        { status: 400 }
      )
    }

    // Check if user already revealed this hint
    const existingReveal = await prisma.hintReveal.findFirst({
      where: {
        userId: session.user.id,
        hintId
      }
    })

    if (existingReveal) {
      return NextResponse.json({
        success: true,
        alreadyRevealed: true,
        hint: {
          id: hint.id,
          text: hint.text,
          cost: hint.cost,
          order: hint.order
        }
      })
    }

    // Check if user has already solved this challenge
    const alreadySolved = await prisma.solve.findFirst({
      where: {
        userId: session.user.id,
        challengeId: params.id
      }
    })

    if (alreadySolved) {
      // Free hints for solved challenges
      await prisma.hintReveal.create({
        data: {
          userId: session.user.id,
          hintId
        }
      })

      return NextResponse.json({
        success: true,
        hint: {
          id: hint.id,
          text: hint.text,
          cost: hint.cost,
          order: hint.order
        }
      })
    }

    // Check if user has enough points
    const userSolves = await prisma.solve.findMany({
      where: { userId: session.user.id },
      include: { challenge: true }
    })

    const userPoints = userSolves.reduce((total, solve) => {
      const challenge = solve.challenge
      const currentPoints = Math.max(
        challenge.minPoints,
        challenge.points * (1 - challenge.solvedBy.length * challenge.decay)
      )
      return total + Math.round(currentPoints)
    }, 0)

    if (userPoints < hint.cost) {
      return NextResponse.json(
        { success: false, error: 'Not enough points to reveal hint' },
        { status: 400 }
      )
    }

    // Create hint reveal record
    await prisma.hintReveal.create({
      data: {
        userId: session.user.id,
        hintId
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'HINT_REVEALED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      hint: {
        id: hint.id,
        text: hint.text,
        cost: hint.cost,
        order: hint.order
      }
    })

  } catch (error) {
    console.error('Error revealing hint:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reveal hint' },
      { status: 500 }
    )
  }
}
