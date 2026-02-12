"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Shield, Copy, UserPlus, UserMinus, Settings } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function TeamsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('CTF-2024')
  const [joinCode, setJoinCode] = useState('')

  if (status === 'loading') {
    return <div className="container py-8">Loading...</div>
  }

  // Mock team data - replace with actual data
  const hasTeam = true
  const teamData = {
    name: 'Team Alpha',
    inviteCode: 'CTF-2024',
    score: 1500,
    rank: 1,
    members: [
      { id: '1', name: 'Alice', email: 'alice@example.com', score: 450, isLeader: true },
      { id: '2', name: 'Bob', email: 'bob@example.com', score: 380, isLeader: false },
      { id: '3', name: 'Charlie', email: 'charlie@example.com', score: 320, isLeader: false },
    ],
  }

  const handleCreateTeam = async () => {
    if (!teamName) {
      toast.error('Team name is required')
      return
    }

    // TODO: Implement actual team creation API call
    toast.success('Team created successfully!')
    // Refresh data
  }

  const handleJoinTeam = async () => {
    if (!joinCode) {
      toast.error('Invite code is required')
      return
    }

    // TODO: Implement actual team joining API call
    toast.success('Joined team successfully!')
    // Refresh data
  }

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(teamData.inviteCode)
    toast.success('Invite code copied to clipboard')
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Team Management
        </h1>
      </div>

      {!hasTeam ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Create a Team</CardTitle>
              <CardDescription>Form your own team and invite members</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    placeholder="Team Alpha"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleCreateTeam} className="w-full">
                  Create Team
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Join a Team</CardTitle>
              <CardDescription>Join an existing team with an invite code</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Invite Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="CTF-2024"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>
                <Button type="button" onClick={handleJoinTeam} className="w-full">
                  Join Team
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {teamData.name}
                <Button variant="ghost" size="icon" onClick={handleCopyInviteCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Team Score: {teamData.score} pts • Rank: #{teamData.rank}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  value={teamData.inviteCode}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={handleCopyInviteCode}>Copy Invite Code</Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Share this invite code with others to join your team.
              </p>
              <div className="flex gap-2">
                <Link href="/teams/settings">
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Team Settings
                  </Button>
                </Link>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>{teamData.members.length} members in your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.name}.png`} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.name}
                          {member.isLeader && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Leader
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{member.score} pts</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((member.score / teamData.score) * 100)}% contribution
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
              <CardDescription>Your team's performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <p className="text-2xl font-bold">{teamData.score}</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Rank</p>
                  <p className="text-2xl font-bold">#{teamData.rank}</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">{teamData.members.length}</p>
                </div>
                <div className="text-center p-4 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {Math.round(teamData.score / teamData.members.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Team Actions</CardTitle>
              <CardDescription>Manage your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span>Invite Members</span>
                </Button>
                <Link href="/teams/settings">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Team Settings</span>
                  </Button>
                </Link>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <UserMinus className="h-6 w-6" />
                  <span>Leave Team</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}