import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { auth } from '@/lib/auth'

// Get challenge instance for current user
export async function GET(
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

    const instance = await prisma.challengeInstance.findFirst({
      where: {
        challengeId: params.id,
        userId: session.user.id,
        status: 'RUNNING',
        expiresAt: { gt: new Date() }
      }
    })

    if (!instance) {
      return NextResponse.json({
        success: true,
        hasInstance: false,
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      hasInstance: true,
      data: {
        id: instance.id,
        host: instance.host,
        port: instance.port,
        instanceType: instance.instanceType,
        expiresAt: instance.expiresAt,
        timeRemaining: Math.max(0, new Date(instance.expiresAt).getTime() - Date.now())
      }
    })
  } catch (error) {
    console.error('Error fetching instance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instance' },
      { status: 500 }
    )
  }
}

// Create new challenge instance
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
    const { instanceType = 'STATIC' } = body

    // Get challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id }
    })

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    // Check if user already has a running instance
    const existingInstance = await prisma.challengeInstance.findFirst({
      where: {
        challengeId: params.id,
        userId: session.user.id,
        status: 'RUNNING',
        expiresAt: { gt: new Date() }
      }
    })

    if (existingInstance) {
      return NextResponse.json({
        success: true,
        alreadyHasInstance: true,
        data: {
          id: existingInstance.id,
          host: existingInstance.host,
          port: existingInstance.port,
          instanceType: existingInstance.instanceType,
          expiresAt: existingInstance.expiresAt,
          timeRemaining: Math.max(0, new Date(existingInstance.expiresAt).getTime() - Date.now())
        }
      })
    }

    // Call challenge manager API to create instance
    const CHALLENGE_MANAGER_URL = process.env.CHALLENGE_MANAGER_URL || 'http://localhost:3002'

    try {
      const response = await fetch(`${CHALLENGE_MANAGER_URL}/instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengeId: params.id,
          userId: session.user.id,
          instanceType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create instance')
      }

      const result = await response.json()

      // Create instance record in database
      const instance = await prisma.challengeInstance.create({
        data: {
          challengeId: params.id,
          userId: session.user.id,
          instanceType,
          host: result.instance.host,
          port: result.instance.port,
          containerId: result.instance.containerId,
          status: 'RUNNING',
          expiresAt: new Date(Date.now() + 20 * 60 * 1000) // 20 minutes default
        }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'INSTANCE_CREATED',
          userId: session.user.id,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: instance.id,
          host: instance.host,
          port: instance.port,
          instanceType: instance.instanceType,
          expiresAt: instance.expiresAt
        }
      })
    } catch (apiError) {
      console.error('Error calling challenge manager:', apiError)
      return NextResponse.json(
        { success: false, error: 'Failed to create challenge instance' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating instance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create instance' },
      { status: 500 }
    )
  }
}

// Terminate challenge instance
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

    const instance = await prisma.challengeInstance.findFirst({
      where: {
        challengeId: params.id,
        userId: session.user.id,
        status: 'RUNNING'
      }
    })

    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'No running instance found' },
        { status: 404 }
      )
    }

    // Call challenge manager API to terminate instance
    const CHALLENGE_MANAGER_URL = process.env.CHALLENGE_MANAGER_URL || 'http://localhost:3002'

    try {
      await fetch(`${CHALLENGE_MANAGER_URL}/instance/${instance.id}`, {
        method: 'DELETE'
      })
    } catch (apiError) {
      console.error('Error calling challenge manager:', apiError)
    }

    // Update instance status in database
    await prisma.challengeInstance.update({
      where: { id: instance.id },
      data: { status: 'TERMINATED' }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'INSTANCE_TERMINATED',
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Instance terminated'
    })
  } catch (error) {
    console.error('Error terminating instance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to terminate instance' },
      { status: 500 }
    )
  }
}
