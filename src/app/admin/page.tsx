"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, Users, Flag, FileUp, FileDown, Settings, Plus, Trash2, Edit, Eye, EyeOff, Activity, BarChart2, PieChart } from 'lucide-react'
import { toast } from 'sonner'
import { isAdmin } from '@/lib/auth'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AdminDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login')
    }
  })

  if (status === 'loading') {
    return <div className="container py-8">Loading...</div>
  }

  if (!isAdmin(session?.user)) {
    redirect('/dashboard')
  }

  // Mock admin data
  const [competitionSettings, setCompetitionSettings] = useState({
    isPublic: true,
    registrationDeadline: '2024-12-31T23:59:59',
    maxParticipants: 100,
    scoreboardFreezeTime: 30,
  })

  const [users, setUsers] = useState([
    { id: '1', name: 'Alice', email: 'alice@example.com', role: 'USER', team: 'Team Alpha', createdAt: '2024-01-15' },
    { id: '2', name: 'Bob', email: 'bob@example.com', role: 'USER', team: 'Team Alpha', createdAt: '2024-01-16' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', role: 'ADMIN', team: 'CTF Masters', createdAt: '2024-01-17' },
  ])

  const [challenges, setChallenges] = useState([
    { id: '1', title: 'XOR Encryption', category: 'CRYPTO', points: 100, author: 'Admin', createdAt: '2024-01-20' },
    { id: '2', title: 'SQL Injection 101', category: 'WEB', points: 150, author: 'Admin', createdAt: '2024-01-21' },
  ])

  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: 'USER_REGISTERED', user: 'Alice', timestamp: '2024-01-15T10:30:00', ip: '192.168.1.1' },
    { id: '2', action: 'CHALLENGE_CREATED', user: 'Admin', timestamp: '2024-01-20T14:15:00', ip: '192.168.1.2' },
  ])

  // Chart data
  const solvesPerHourData = [
    { hour: '00:00', solves: 5 },
    { hour: '02:00', solves: 3 },
    { hour: '04:00', solves: 1 },
    { hour: '06:00', solves: 2 },
    { hour: '08:00', solves: 8 },
    { hour: '10:00', solves: 12 },
    { hour: '12:00', solves: 15 },
    { hour: '14:00', solves: 10 },
    { hour: '16:00', solves: 14 },
    { hour: '18:00', solves: 9 },
    { hour: '20:00', solves: 6 },
    { hour: '22:00', solves: 4 },
  ]

  const categoryBreakdownData = [
    { category: 'WEB', count: 8 },
    { category: 'CRYPTO', count: 6 },
    { category: 'FORENSICS', count: 5 },
    { category: 'OSINT', count: 3 },
    { category: 'REVERSE_ENGINEERING', count: 4 },
    { category: 'MISCELLANEOUS', count: 4 },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A4DE6C']

  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Competition settings updated successfully!')
  }

  const handleUserAction = (userId: string, action: 'ban' | 'promote' | 'demote') => {
    // TODO: Implement actual user management
    toast.success(`User ${action} action initiated`)
  }

  const handleChallengeAction = (challengeId: string, action: 'delete') => {
    // TODO: Implement actual challenge management
    toast.success(`Challenge ${action} action initiated`)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Flag className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Eye className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="ctf-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card className="ctf-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{challenges.length}</div>
                <p className="text-xs text-muted-foreground">Available challenges</p>
              </CardContent>
            </Card>

            <Card className="ctf-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competition Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={competitionSettings.isPublic ? 'secondary' : 'outline'}>
                    {competitionSettings.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {competitionSettings.isPublic ? 'Open to all' : 'Invite only'}
                </p>
              </CardContent>
            </Card>

            <Card className="ctf-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditLogs.length}</div>
                <p className="text-xs text-muted-foreground">Recent actions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 mt-6">
            <Card className="ctf-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <Plus className="h-6 w-6" />
                        <span>Add Challenge</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Challenge</DialogTitle>
                        <DialogDescription>
                          Create a new challenge for the competition
                        </DialogDescription>
                      </DialogHeader>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" placeholder="Challenge title" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WEB">Web</SelectItem>
                              <SelectItem value="CRYPTO">Crypto</SelectItem>
                              <SelectItem value="FORENSICS">Forensics</SelectItem>
                              <SelectItem value="OSINT">OSINT</SelectItem>
                              <SelectItem value="REVERSE_ENGINEERING">Reverse Engineering</SelectItem>
                              <SelectItem value="MISCELLANEOUS">Miscellaneous</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit">Create Challenge</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <FileUp className="h-6 w-6" />
                        <span>Import Challenges</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Challenges</DialogTitle>
                        <DialogDescription>
                          Upload a JSON file with challenges
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input type="file" accept=".json" />
                        <Button>Import</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                        <FileDown className="h-6 w-6" />
                        <span>Export Challenges</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Challenges</DialogTitle>
                        <DialogDescription>
                          Download all challenges as JSON
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Button>Export to JSON</Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Competition Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Charts */}
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card className="ctf-card">
              <CardHeader>
                <CardTitle>Solves per Hour</CardTitle>
                <CardDescription>Challenge solve activity</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={solvesPerHourData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} 
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Legend />
                    <Bar dataKey="solves" fill="#3B82F6" name="Solves" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="ctf-card">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Challenges by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categoryBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="category"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} 
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.team || 'None'}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.role !== 'ADMIN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'ban')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            {user.role === 'USER' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'promote')}
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                            {user.role === 'ADMIN' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'demote')}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Challenge Management</CardTitle>
              <CardDescription>Manage all challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <TableRow key={challenge.id}>
                        <TableCell>{challenge.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </TableCell>
                        <TableCell>{challenge.points}</TableCell>
                        <TableCell>{challenge.author}</TableCell>
                        <TableCell>{challenge.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChallengeAction(challenge.id, 'delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Competition Settings</CardTitle>
              <CardDescription>Configure competition parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSettingsUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="isPublic">Competition Visibility</Label>
                    <Select
                      value={competitionSettings.isPublic.toString()}
                      onValueChange={(value) => 
                        setCompetitionSettings({...competitionSettings, isPublic: value === 'true'})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Public</SelectItem>
                        <SelectItem value="false">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                    <Input
                      id="registrationDeadline"
                      type="datetime-local"
                      value={competitionSettings.registrationDeadline}
                      onChange={(e) => 
                        setCompetitionSettings({...competitionSettings, registrationDeadline: e.target.value})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={competitionSettings.maxParticipants}
                      onChange={(e) => 
                        setCompetitionSettings({...competitionSettings, maxParticipants: parseInt(e.target.value)})
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scoreboardFreezeTime">Scoreboard Freeze Time (minutes)</Label>
                    <Input
                      id="scoreboardFreezeTime"
                      type="number"
                      value={competitionSettings.scoreboardFreezeTime}
                      onChange={(e) => 
                        setCompetitionSettings({...competitionSettings, scoreboardFreezeTime: parseInt(e.target.value)})
                      }
                    />
                  </div>

                  <Button type="submit">Save Settings</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Recent system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}