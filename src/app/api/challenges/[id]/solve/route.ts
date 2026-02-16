import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'
import { calculateDynamicPoints } from '@/lib/utils'
import { limit } from '@/lib/rate-limit'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Rate limiting using Upstash Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
  analytics: true,
})

// Submit flag for challenge
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

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success, remaining } = await ratelimit.limit(`flag-submit-${ip}`)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Too many flag submissions. Please wait.' },
        { status: 429 }
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

    // Get the challenge
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        solvedBy: {
          include: {
            user: true
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

    // Check if challenge is visible
    if (!challenge.visible && session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { success: false, error: 'Challenge is not visible' },
        { status: 403 }
      )
    }

    // Check if user already solved this challenge
    const alreadySolved = await prisma.solve.findFirst({
      where: {
        userId: session.user.id,
        challengeId: params.id
      }
    })

    if (alreadySolved) {
      return NextResponse.json({
        success: true,
        correct: true,
        message: 'You have already solved this challenge',
        alreadySolved: true
      })
    }

    // Check honey tokens (anti-cheat)
    const honeyToken = await prisma.honeyToken.findUnique({
      where: { token: flag }
    })

    if (honeyToken) {
      // Ban the user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'BANNED' }
      })

      // Mark honey token as used
      await prisma.honeyToken.update({
        where: { id: honeyToken.id },
        data: { bannedUserId: session.user.id }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'HONEY_TOKEN_TRIGGERED',
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      })

      return NextResponse.json({
        success: false,
        error: 'Account banned for cheating',
        banned: true
      }, { status: 403 })
    }

    // Verify flag
    if (flag !== challenge.flag) {
      // Create audit log for incorrect submission
      await prisma.auditLog.create({
        data: {
          action: 'INCORRECT_FLAG',
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      })

      return NextResponse.json({
        success: false,
        correct: false,
        message: 'Incorrect flag',
        remaining: remaining ?? 0
      })
    }

    // Flag is correct - create solve record
    const solve = await prisma.solve.create({
      data: {
        userId: session.user.id,
        challengeId: params.id
      },
      include: {
        user: true,
        challenge: true
      }
    })

    // Calculate points earned
    const pointsEarned = Math.round(calculateDynamicPoints(
      challenge.points,
      challenge.minPoints,
      challenge.decay,
      challenge.solvedBy.length + 1
    ))

    // Update team score if user is in a team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: true
      }
    })

    if (user?.teamId) {
      const teamSolves = await prisma.solve.findMany({
        where: {
          user: {
            teamId: user.teamId
          },
          challengeId: params.id
        }
      })

      // Only update team score if this is the first solve from the team
      if (teamSolves.length === 0) {
        await prisma.team.update({
          where: { id: user.teamId },
          data: {
            score: { increment: pointsEarned }
          }
        })
      }
    }

    // Check for first blood achievement
    const isFirstSolve = challenge.solvedBy.length === 0
    if (isFirstSolve) {
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: 'FIRST_BLOOD'
        }
      })
    }

    // Check for speed demon (solved within 2 minutes of challenge creation)
    const timeDiff = Date.now() - challenge.createdAt.getTime()
    if (timeDiff < 120000) { // 2 minutes
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: 'SPEED_DEMON'
        }
      })
    }

    // Check for completionist (all challenges in category solved)
    const categoryChallenges = await prisma.challenge.findMany({
      where: { category: challenge.category }
    })

    const userSolves = await prisma.solve.findMany({
      where: {
        userId: session.user.id,
        challenge: {
          category: challenge.category
        }
      }
    })

    if (userSolves.length === categoryChallenges.length) {
      await prisma.achievement.create({
        data: {
          userId: session.user.id,
          type: 'COMPLETIONIST'
        }
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_SOLVED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })

    // Emit real-time update via Socket.io
    // This would be handled by the WebSocket server

    return NextResponse.json({
      success: true,
      correct: true,
      message: 'Correct flag!',
      pointsEarned,
      isFirstBlood,
      achievements: isFirstSolve || timeDiff < 120000 ? ['FIRST_BLOOD'] : [],
      remaining: remaining ?? 0
    })

  } catch (error) {
    console.error('Error submitting flag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit flag' },
      { status: 500 }
    )
  }
}
