"use client"

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Shield, Trophy, Users, Flag, Clock, Medal, Activity } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  if (status === 'loading') {
    return <div className="container py-8">Loading...</div>
  }

  // Mock user data - replace with actual data
  const userData = {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    team: 'Team Alpha',
    score: 850,
    rank: 12,
    solves: 24,
    badges: ['FIRST_BLOOD', 'SPEED_DEMON'],
    recentActivity: [
      { id: '1', action: 'Solved XOR Encryption', timestamp: '2 hours ago', points: 95 },
      { id: '2', action: 'Joined Team Alpha', timestamp: '1 day ago' },
      { id: '3', action: 'Earned First Blood badge', timestamp: '3 days ago' },
    ],
    teamMembers: [
      { id: '1', name: 'Alice', score: 450, solves: 12 },
      { id: '2', name: 'Bob', score: 380, solves: 10 },
      { id: '3', name: 'Charlie', score: 320, solves: 8 },
    ],
  }

  const badgeInfo = {
    FIRST_BLOOD: { name: 'First Blood', description: 'First to solve a challenge', icon: <Medal className="h-4 w-4" /> },
    SPEED_DEMON: { name: 'Speed Demon', description: 'Solved in under 2 minutes', icon: <Clock className="h-4 w-4" /> },
    COMPLETIONIST: { name: 'Completionist', description: 'Solved all in category', icon: <Trophy className="h-4 w-4" /> },
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Dashboard
        </h1>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <Link href="/teams">
            <Button variant="outline">Team Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="ctf-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.score} pts</div>
              <p className="text-xs text-muted-foreground">Rank: #{userData.rank}</p>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Challenges Solved</CardTitle>
              <Flag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.solves}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.team}</div>
              <p className="text-xs text-muted-foreground">{userData.teamMembers.length} members</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Achievements earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {userData.badges.length > 0 ? (
                  userData.badges.map((badge) => {
                    const info = badgeInfo[badge as keyof typeof badgeInfo]
                    return (
                      <Badge key={badge} className="ctf-badge gap-2">
                        {info.icon}
                        <span>{info.name}</span>
                      </Badge>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No badges earned yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Your teammates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.name}.png`} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.solves} solves</p>
                      </div>
                    </div>
                    <span className="font-bold">{member.score} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.action.includes('Solved') ? (
                      <Flag className="h-4 w-4 text-green-500" />
                    ) : activity.action.includes('Joined') ? (
                      <Users className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Medal className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.action}</span>
                      {activity.points && <span className="ml-2 text-green-500 font-bold">+{activity.points} pts</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/challenges">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Flag className="h-6 w-6" />
                  <span>Browse Challenges</span>
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Trophy className="h-6 w-6" />
                  <span>View Leaderboard</span>
                </Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Manage Team</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <Shield className="h-6 w-6" />
                  <span>Your Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}