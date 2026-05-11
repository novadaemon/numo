import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  username: string | null
  password: string | null
  isAuthenticated: boolean
  setCredentials: (username: string, password: string) => void
  clearCredentials: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'NUMO_AUTH'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Load credentials from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(STORAGE_KEY)
    if (storedAuth) {
      try {
        const { username: u, password: p } = JSON.parse(storedAuth)
        setUsername(u)
        setPassword(p)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to load credentials from localStorage:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const setCredentials = (newUsername: string, newPassword: string) => {
    setUsername(newUsername)
    setPassword(newPassword)
    setIsAuthenticated(true)

    // Store in localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username: newUsername,
        password: newPassword,
      })
    )
  }

  const clearCredentials = () => {
    setUsername(null)
    setPassword(null)
    setIsAuthenticated(false)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value: AuthContextType = {
    username,
    password,
    isAuthenticated,
    setCredentials,
    clearCredentials,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
