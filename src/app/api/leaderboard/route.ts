import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

// Cache leaderboard data for 60 seconds
const getCachedLeaderboard = unstable_cache(
  async () => {
    // Get global leaderboard (teams)
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            solves: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })
    
    const globalLeaderboard = teams.map(team => {
      const teamScore = team.members.reduce((sum, member) => {
        return sum + member.solves.length * 100 // Simple scoring
      }, 0)
      
      return {
        id: team.id,
        name: team.name,
        score: teamScore,
        memberCount: team.members.length
      }
    })
    
    // Get category leaders
    const categories = ['WEB', 'CRYPTO', 'FORENSICS', 'OSINT', 'REVERSE_ENGINEERING', 'MISCELLANEOUS']
    const categoryLeaders: Record<string, any[]> = {}
    
    for (const category of categories) {
      const users = await prisma.user.findMany({
        where: {
          solves: {
            some: {
              challenge: {
                category: category as any
              }
            }
          }
        },
        include: {
          solves: {
            where: {
              challenge: {
                category: category as any
              }
            },
            include: {
              challenge: true
            }
          }
        }
      })
      
      const leaders = users.map(user => {
        const categoryScore = user.solves.reduce((sum, solve) => {
          return sum + solve.challenge.points
        }, 0)
        
        return {
          userId: user.id,
          name: user.name || 'Anonymous',
          score: categoryScore,
          solves: user.solves.length
        }
      }).sort((a, b) => b.score - a.score).slice(0, 3)
      
      categoryLeaders[category] = leaders
    }
    
    return {
      global: globalLeaderboard,
      categories: categoryLeaders
    }
  },
  ['leaderboard-data'],
  { revalidate: 60 }
)

export async function GET(request: Request) {
  try {
    const data = await getCachedLeaderboard()
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}