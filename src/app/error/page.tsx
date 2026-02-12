use client

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const router = useRouter()
  const error = searchParams.error as string

  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  const getErrorMessage = () => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'Email already associated with another account'
      case 'SessionRequired':
        return 'Please log in to access this page'
      case 'AccessDenied':
        return 'You do not have permission to access this page'
      case 'Verification':
        return 'Email verification failed'
      default:
        return error || 'An unexpected error occurred'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
          <CardDescription className="text-muted-foreground">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
          <Button onClick={() => router.push('/')} variant="outline" className="w-full">
            Return Home
          </Button>
          {error === 'SessionRequired' && (
            <Button onClick={() => router.push('/login')} className="w-full">
              Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}