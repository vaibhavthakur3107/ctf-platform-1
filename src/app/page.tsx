import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHub, Shield, Users, Trophy, Flag, Lock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Dexter Playz CTF</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Login
            </Link>
            <Link href="/register" className={buttonVariants()}>Register</Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">Dexter Playz CTF</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A comprehensive, production-ready CTF platform with gamification, team management, and advanced security features.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/challenges" className={buttonVariants({ size: "lg" })}>
              Browse Challenges
            </Link>
            <Link href="/leaderboard" className={buttonVariants({ variant: "outline", size: "lg" })}>
              View Leaderboard
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="ctf-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Gamification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Earn badges like First Blood, Speed Demon, and Completionist as you solve challenges and climb the leaderboard.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create and manage teams with unique invite codes. Compete together and track your team's progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="ctf-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built with rate limiting, honey tokens, and comprehensive audit logging to ensure fair play.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-8">Challenge Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['Web', 'Crypto', 'Forensics', 'OSINT', 'Reverse Engineering', 'Miscellaneous'].map((category) => (
              <Card key={category} className="ctf-card p-4 text-center">
                <CardTitle className="text-sm">{category}</CardTitle>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2024 Dexter Playz CTF. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="https://github.com/your-repo/dexter-playz-ctf" target="_blank" rel="noopener noreferrer">
              <GitHub className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}