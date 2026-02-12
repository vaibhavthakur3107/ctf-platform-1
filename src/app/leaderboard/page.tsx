import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Users, Shield, Medal } from 'lucide-react'
import { unstable_cache } from 'next/cache'

// Mock data - replace with actual data fetching
const globalLeaderboard = [
  { rank: 1, team: 'Team Alpha', score: 1500, members: 4 },
  { rank: 2, team: 'CTF Masters', score: 1200, members: 3 },
  { rank: 3, team: 'Byte Bandits', score: 950, members: 5 },
  { rank: 4, team: 'Security Ninjas', score: 800, members: 2 },
  { rank: 5, team: 'Code Warriors', score: 650, members: 4 },
  { rank: 6, team: 'Hackers Anonymous', score: 500, members: 3 },
  { rank: 7, team: 'Pwn Stars', score: 400, members: 2 },
  { rank: 8, team: 'Script Kiddies', score: 300, members: 1 },
]

const categoryLeaders = {
  WEB: [
    { rank: 1, user: 'Alice', score: 450, solves: 12 },
    { rank: 2, user: 'Bob', score: 380, solves: 10 },
    { rank: 3, user: 'Charlie', score: 320, solves: 8 },
  ],
  CRYPTO: [
    { rank: 1, user: 'Dave', score: 520, solves: 15 },
    { rank: 2, user: 'Eve', score: 410, solves: 12 },
    { rank: 3, user: 'Frank', score: 340, solves: 9 },
  ],
  FORENSICS: [
    { rank: 1, user: 'Grace', score: 380, solves: 11 },
    { rank: 2, user: 'Heidi', score: 310, solves: 8 },
    { rank: 3, user: 'Ivan', score: 250, solves: 6 },
  ],
}

// Cache leaderboard data for 60 seconds
const getCachedLeaderboard = unstable_cache(
  async () => globalLeaderboard,
  ['leaderboard-global'],
  { revalidate: 60 }
)

export default async function LeaderboardPage() {
  const globalData = await getCachedLeaderboard()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8" />
          Leaderboard
        </h1>
      </div>

      <Tabs defaultValue="global" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="global">
            <Users className="h-4 w-4 mr-2" />
            Global Rank
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Shield className="h-4 w-4 mr-2" />
            Category Leaders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top teams across all challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="p-3 font-semibold">Rank</th>
                      <th className="p-3 font-semibold">Team</th>
                      <th className="p-3 font-semibold text-right">Score</th>
                      <th className="p-3 font-semibold text-right">Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {globalData.map((entry) => (
                      <tr key={entry.rank} className="border-b border-border last:border-0">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {entry.rank <= 3 ? (
                              <Medal className={`h-5 w-5 ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                            ) : (
                              <span>{entry.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://avatar.vercel.sh/${entry.team}.png`} />
                              <AvatarFallback>{entry.team.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{entry.team}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold">{entry.score}</td>
                        <td className="p-3 text-right">{entry.members}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryLeaders).map(([category, leaders]) => (
              <Card key={category} className="ctf-card">
                <CardHeader>
                  <CardTitle className="text-lg">{category} Leaders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaders.map((leader, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={`https://avatar.vercel.sh/${leader.user}.png`} />
                              <AvatarFallback>{leader.user.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{leader.user}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{leader.score} pts</div>
                          <div className="text-sm text-muted-foreground">{leader.solves} solves</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}