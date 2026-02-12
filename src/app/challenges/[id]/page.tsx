import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Flag, Code, Download, Check, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Mock challenge data - replace with actual data fetching
const challenge = {
  id: '1',
  title: 'XOR Encryption',
  description: `In this challenge, you'll need to decrypt a message that has been encrypted using XOR with a single-byte key.

XOR encryption is a simple symmetric cipher where each byte of the plaintext is XORed with a key byte. The same operation is used to decrypt.

Given: ciphertext = '1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736'

Find the correct single-byte key that produces readable plaintext. The flag format is CTF{key} where key is the ASCII character of the XOR key.

Hint: Look for plaintext that contains common English words and proper grammar.`,
  category: 'CRYPTO',
  tags: ['beginner', 'xor', 'cryptography'],
  author: 'Admin',
  points: 100,
  minPoints: 50,
  decay: 0.1,
  solvedCount: 42,
  fileUrl: '/files/xor-challenge.txt',
  createdAt: '2024-01-20T10:00:00',
}

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const currentPoints = Math.max(
    challenge.minPoints,
    challenge.points * (1 - challenge.solvedCount * challenge.decay)
  )

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const flag = formData.get('flag') as string

    // TODO: Implement actual flag submission logic
    if (flag === 'CTF{X}') {
      toast.success('Correct flag! +' + currentPoints + ' points')
    } else {
      toast.error('Incorrect flag. Try again!')
    }
  }

  const categoryIcons = {
    WEB: <Code className="h-5 w-5" />,
    CRYPTO: <Shield className="h-5 w-5" />,
    FORENSICS: <Code className="h-5 w-5" />,
    OSINT: <Code className="h-5 w-5" />,
    REVERSE_ENGINEERING: <Code className="h-5 w-5" />,
    MISCELLANEOUS: <Flag className="h-5 w-5" />,
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/challenges" className="flex items-center gap-2 text-primary hover:underline">
          <span>← Back to Challenges</span>
        </Link>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="ctf-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3 mb-2">
                  {categoryIcons[challenge.category as keyof typeof categoryIcons]}
                  {challenge.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-sm">
                    {currentPoints} points
                  </Badge>
                  {challenge.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Created by {challenge.author} on {new Date(challenge.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {challenge.solvedCount} solves • Dynamic scoring
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="ctf-card md:col-span-2">
            <CardHeader>
              <CardTitle>Challenge Description</CardTitle>
              <CardDescription>Read the challenge carefully</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{challenge.description}</p>
              </div>

              {challenge.fileUrl && (
                <div className="mt-6">
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Challenge Files</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">xor-challenge.txt</p>
                          <p className="text-sm text-muted-foreground">1.2 KB</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle>Submit Flag</CardTitle>
              <CardDescription>Enter the flag to solve this challenge</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFlagSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flag">Flag</Label>
                  <Input
                    id="flag"
                    name="flag"
                    placeholder="CTF{flag_content}"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Flag
                </Button>
              </form>

              <div className="mt-4 p-3 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Scoring Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Points:</span>
                    <span className="font-bold">{challenge.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Points:</span>
                    <span className="font-bold text-green-500">+{currentPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solves:</span>
                    <span className="font-bold">{challenge.solvedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decay Rate:</span>
                    <span className="font-bold">{challenge.decay * 100}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="ctf-card">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Helpful resources and hints</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hints">
              <TabsList className="mb-4">
                <TabsTrigger value="hints">Hints</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="hints">
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary p-2 rounded-lg">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Hint #1</h4>
                        <p className="text-sm text-muted-foreground">
                          XOR with a single byte key means each character is XORed with the same value.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-secondary p-2 rounded-lg">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Hint #2</h4>
                        <p className="text-sm text-muted-foreground">
                          Try XORing with common ASCII characters like space (32) or letters.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <span>Reveal Next Hint (-10 points)</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="resources">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">XOR Calculator</h4>
                      <p className="text-sm text-muted-foreground">Online XOR tool</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <span>Open</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <h4 className="font-medium">Cryptography Guide</h4>
                      <p className="text-sm text-muted-foreground">XOR encryption explained</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <span>Open</span>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="discussion">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AL</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Alice</span>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      <p className="text-sm">Has anyone figured out the key yet? I've tried all common characters but nothing works.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>BO</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Bob</span>
                        <span className="text-sm text-muted-foreground">1 hour ago</span>
                      </div>
                      <p className="text-sm">Try looking at the frequency of characters in the ciphertext. That might help.</p>
                    </div>
                  </div>

                  <form className="mt-4">
                    <div className="flex gap-2">
                      <Input placeholder="Add a comment..." />
                      <Button type="submit">Post</Button>
                    </div>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}