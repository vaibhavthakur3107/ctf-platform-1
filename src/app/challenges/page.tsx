import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Flag, Code, Search, Filter, Trophy } from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with actual data fetching
const challenges = [
  {
    id: '1',
    title: 'XOR Encryption',
    category: 'CRYPTO',
    points: 100,
    minPoints: 50,
    decay: 0.1,
    solvedCount: 42,
    tags: ['beginner', 'xor'],
    author: 'Admin',
  },
  {
    id: '2',
    title: 'SQL Injection 101',
    category: 'WEB',
    points: 150,
    minPoints: 75,
    decay: 0.08,
    solvedCount: 28,
    tags: ['sql', 'injection'],
    author: 'Admin',
  },
  {
    id: '3',
    title: 'Hidden Message',
    category: 'FORENSICS',
    points: 80,
    minPoints: 40,
    decay: 0.12,
    solvedCount: 56,
    tags: ['steganography', 'beginner'],
    author: 'Admin',
  },
  {
    id: '4',
    title: 'Reverse Engineering Basics',
    category: 'REVERSE_ENGINEERING',
    points: 200,
    minPoints: 100,
    decay: 0.05,
    solvedCount: 15,
    tags: ['assembly', 'ghidra'],
    author: 'Admin',
  },
  {
    id: '5',
    title: 'OSINT Challenge',
    category: 'OSINT',
    points: 120,
    minPoints: 60,
    decay: 0.1,
    solvedCount: 33,
    tags: ['social', 'metadata'],
    author: 'Admin',
  },
  {
    id: '6',
    title: 'Misc Puzzle',
    category: 'MISCELLANEOUS',
    points: 90,
    minPoints: 45,
    decay: 0.1,
    solvedCount: 48,
    tags: ['puzzle', 'logic'],
    author: 'Admin',
  },
]

export default function ChallengesPage() {
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