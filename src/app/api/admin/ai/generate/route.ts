import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { auth, isAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateChallenge, generateHints, validateChallenge } from '@/lib/ai'

// Generate a new AI-powered challenge
export async function POST(request: Request) {
  try {
    const session = await getServerSession(auth)

    if (!session || !session.user || !isAdmin(session.user)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { category, difficulty, topic, provider = 'openai', generateHints: shouldGenerateHints = true } = body

    if (!category || !difficulty) {
      return NextResponse.json(
        { success: false, error: 'Category and difficulty are required' },
        { status: 400 }
      )
    }

    // Generate challenge using AI
    const challenge = await generateChallenge(
      { category, difficulty, topic },
      provider
    )

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate challenge' },
        { status: 500 }
      )
    }

    // Validate generated challenge
    const validation = validateChallenge(challenge)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Generated challenge validation failed',
          issues: validation.issues
        },
        { status: 400 }
      )
    }

    // Create challenge in database
    const createdChallenge = await prisma.challenge.create({
      data: {
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        tags: challenge.tags,
        author: 'AI Generated',
        points: challenge.points,
        minPoints: challenge.minPoints,
        decay: challenge.decay,
        flag: challenge.flag,
        difficulty: challenge.difficulty,
      }
    })

    // Generate hints if requested
    let hints = []
    if (shouldGenerateHints) {
      const generatedHints = await generateHints(
        challenge.title,
        challenge.description,
        3,
        provider
      )

      if (generatedHints) {
        for (let i = 0; i < generatedHints.length; i++) {
          const hint = await prisma.hint.create({
            data: {
              challengeId: createdChallenge.id,
              text: generatedHints[i],
              cost: 10 * (i + 1),
              order: i + 1,
            }
          })
          hints.push(hint)
        }
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'AI_CHALLENGE_GENERATED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        challenge: createdChallenge,
        hints,
        solution: challenge.solution
      }
    })

  } catch (error) {
    console.error('Error generating AI challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate challenge' },
      { status: 500 }
    )
  }
}
