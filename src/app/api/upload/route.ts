import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getServerSession } from 'next-auth/react'
import { uploadChallengeFile, deleteChallengeFile } from '@/lib/supabase'
import { validateFileType } from '@/lib/utils'
import prisma from '@/lib/prisma'

// Upload challenge file
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
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const challengeId = formData.get('challengeId') as string
    
    if (!file || !challengeId) {
      return NextResponse.json(
        { success: false, error: 'File and challenge ID are required' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = [
      'image/*',
      'application/pdf',
      'application/zip',
      '.txt',
      '.py',
      '.js',
      '.html',
      '.css'
    ]
    
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      )
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }
    
    // Upload file
    const result = await uploadChallengeFile(file, challengeId)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_FILE_UPLOADED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      url: result.url
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// Delete challenge file
export async function DELETE(request: Request) {
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
    
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get('url')
    
    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: 'File URL is required' },
        { status: 400 }
      )
    }
    
    // Delete file
    const result = await deleteChallengeFile(fileUrl)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CHALLENGE_FILE_DELETED',
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}