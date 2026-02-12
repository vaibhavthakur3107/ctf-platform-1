import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full">
              <SearchX className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="text-muted-foreground">
            The page you are looking for does not exist
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full">Return Home</Button>
          </Link>
          <Link href="/challenges" className="w-full">
            <Button variant="outline" className="w-full">
              Browse Challenges
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}