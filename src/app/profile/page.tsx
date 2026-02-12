"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, User, Mail, Lock, Medal, Flag, Clock, Trophy } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  const [name, setName] = useState(session?.user?.name || '')
  const [email, setEmail] = useState(session?.user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  if (status === 'loading') {
    return <div className="container py-8">Loading...</div>
  }

  // Mock user data - replace with actual data
  const userData = {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    joined: 'January 15, 2024',
    lastActive: 'Today, 2:30 PM',
    score: 850,
    rank: 12,
    solves: 24,
    badges: [
      { type: 'FIRST_BLOOD', name: 'First Blood', description: 'First to solve a challenge', earned: '2024-02-10' },
      { type: 'SPEED_DEMON', name: 'Speed Demon', description: 'Solved in under 2 minutes', earned: '2024-02-15' },
    ],
    achievements: [
      { id: '1', challenge: 'XOR Encryption', category: 'CRYPTO', points: 95, solvedAt: '2024-02-10T14:30:00' },
      { id: '2', challenge: 'SQL Injection 101', category: 'WEB', points: 140, solvedAt: '2024-02-12T10:15:00' },
      { id: '3', challenge: 'Hidden Message', category: 'FORENSICS', points: 75, solvedAt: '2024-02-14T16:45:00' },
    ],
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual profile update API call
    toast.success('Profile updated successfully!')
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    // TODO: Implement actual password update API call
    toast.success('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Your Profile
        </h1>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
            <CardDescription>Your account information and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`https://avatar.vercel.sh/${userData.name}.png`} />
                  <AvatarFallback className="text-2xl">{userData.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Joined</p>
                  <p className="font-medium">{userData.joined}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Active</p>
                  <p className="font-medium">{userData.lastActive}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Score</p>
                  <p className="font-medium font-bold text-primary">{userData.score} pts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rank</p>
                  <p className="font-medium font-bold">#{userData.rank}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Update Profile</CardTitle>
              <CardDescription>Change your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
                <Button type="submit" className="w-full">
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Your Badges</CardTitle>
            <CardDescription>Achievements you've earned</CardDescription>
          </CardHeader>
          <CardContent>
            {userData.badges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userData.badges.map((badge) => (
                  <div key={badge.type} className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary p-2 rounded-lg">
                        <Medal className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold flex items-center gap-2 mb-1">
                          {badge.name}
                          <Badge variant="secondary" className="text-xs">
                            {badge.type}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {badge.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Earned on {badge.earned}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No badges earned yet. Start solving challenges!</p>
            )}
          </CardContent>
        </Card>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Your Solves</CardTitle>
            <CardDescription>Challenges you've completed</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList className="mb-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="p-3 font-semibold">Challenge</th>
                        <th className="p-3 font-semibold">Category</th>
                        <th className="p-3 font-semibold">Points</th>
                        <th className="p-3 font-semibold">Solved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.achievements.map((achievement) => (
                        <tr key={achievement.id} className="border-b border-border last:border-0">
                          <td className="p-3">
                            <div className="font-medium">{achievement.challenge}</div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {achievement.category}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-green-500">+{achievement.points}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {new Date(achievement.solvedAt).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="all">
                <p className="text-center text-muted-foreground py-8">
                  All your solves will be displayed here
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                <span>Privacy Settings</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Mail className="h-6 w-6" />
                <span>Email Preferences</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Lock className="h-6 w-6" />
                <span>Two-Factor Auth</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}