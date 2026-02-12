import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Flag, Code, Search, Filter, Trophy } from 'lucide-react'
import Link from 'next/link'

// Fetch challenges from API
async function getChallenges() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch challenges')
  }
  
  return res.json()
}

export default async function ChallengesPage() {
  const challengesData = await getChallenges()
  
  if (!challengesData.success) {
    return <div className="container py-8">Error loading challenges</div>
  }
  
  const challenges = challengesData.data
  const categories = ['ALL', 'WEB', 'CRYPTO', 'FORENSICS', 'OSINT', 'REVERSE_ENGINEERING', 'MISCELLANEOUS']

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flag className="h-8 w-8" />
          Challenges
        </h1>
        <div className="flex gap-2">
          <Input placeholder="Search challenges..." className="max-w-sm" />
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ALL" className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full max-w-4xl mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category === 'ALL' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges
                .filter((challenge) => category === 'ALL' || challenge.category === category)
                .map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: any }) {
  const currentPoints = Math.max(
    challenge.minPoints,
    challenge.points * (1 - challenge.solvedCount * challenge.decay)
  )

  const categoryIcons = {
    WEB: <Code className="h-5 w-5" />,
    CRYPTO: <Shield className="h-5 w-5" />,
    FORENSICS: <Search className="h-5 w-5" />,
    OSINT: <Search className="h-5 w-5" />,
    REVERSE_ENGINEERING: <Code className="h-5 w-5" />,
    MISCELLANEOUS: <Trophy className="h-5 w-5" />,
  }

  return (
    <Card className="ctf-card hover:border-primary transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            {categoryIcons[challenge.category as keyof typeof categoryIcons]}
            {challenge.title}
          </CardTitle>
          <Badge variant="secondary" className="text-sm">
            {currentPoints} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {challenge.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <CardDescription className="text-sm mb-3">
          {challenge.solvedCount} solves • Dynamic scoring
        </CardDescription>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            By: {challenge.author}
          </span>
          <Link href={`/challenges/${challenge.id}`}>
            <Button size="sm" variant="outline">
              View Challenge
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}