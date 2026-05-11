import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { API_CONFIG } from '@/config'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export function LoginModal() {
  const { setCredentials } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }

    setIsLoading(true)

    try {
      // Test credentials by making a request to a protected endpoint
      const auth = btoa(`${username}:${password}`)
      const endpoint = `${API_CONFIG.baseURL}/auth/verify`
      console.log('Attempting login with URL:', endpoint)

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid username or password')
        } else {
          setError(`Failed to validate credentials (${response.status})`)
        }
        setIsLoading(false)
        return
      }

      // Credentials are valid, save them
      console.log('Login successful, saving credentials')
      setCredentials(username, password)
      setIsLoading(false)
    } catch (err) {
      console.error('Error validating credentials:', err)
      setError(
        `Failed to connect to the server: ${err instanceof Error ? err.message : String(err)}`
      )
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
