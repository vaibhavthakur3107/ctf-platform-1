import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate dynamic challenge points based on solve count
 * @param basePoints Base points for the challenge
 * @param minPoints Minimum points the challenge can decay to
 * @param decay Decay factor (0-1)
 * @param solveCount Number of times the challenge has been solved
 * @returns Calculated points
 */
export function calculateDynamicPoints(
  basePoints: number,
  minPoints: number,
  decay: number,
  solveCount: number
): number {
  return Math.max(minPoints, basePoints * (1 - solveCount * decay))
}

/**
 * Generate a random invite code for teams
 * @param length Length of the invite code
 * @returns Random invite code
 */
export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Format timestamp for display
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Validate file type against allowed MIME types
 * @param file File to validate
 * @param allowedTypes Allowed MIME types
 * @returns True if file type is allowed
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.replace('/*', ''))
    }
    return file.type === type
  })
}

/**
 * Check if user has a specific badge
 * @param badges User's badges
 * @param badgeType Badge type to check
 * @returns True if user has the badge
 */
export function hasBadge(badges: any[], badgeType: string): boolean {
  return badges.some(badge => badge.type === badgeType)
}