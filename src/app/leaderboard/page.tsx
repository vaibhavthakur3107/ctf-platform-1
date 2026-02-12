import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Users, Shield, Medal } from 'lucide-react'
import { unstable_cache } from 'next/cache'

// Fetch leaderboard from API
async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`, {
    next: { revalidate: 60 }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard')
  }
  
  return res.json()
}

export default async function LeaderboardPage() {
  const leaderboardData = await getLeaderboard()
  
  if (!leaderboardData.success) {
    return <div className="container py-8">Error loading leaderboard</div>
  }
  
  const globalData = leaderboardData.data.global
  const categoryLeaders = leaderboardData.data.categories

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