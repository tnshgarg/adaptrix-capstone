'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = apiClient.getToken()
      if (token) {
        try {
          const data = await apiClient.getMe()
          setUser(data.user)
        } catch (error) {
          console.error('Auth check failed:', error)
          apiClient.removeToken()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiClient.login(email, password)
    setUser(data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const data = await apiClient.register(name, email, password)
    setUser(data.user)
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
