'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Download, 
  Star, 
  TrendingUp, 
  PlusCircle,
  Users,
  Eye,
  GitBranch
} from 'lucide-react'
import { DashboardNav } from '@/components/dashboard-nav'
import Link from 'next/link'
import apiClient from '@/lib/api'

interface DashboardStats {
  myAdapters: number
  myDownloads: number
  myStars: number
}

interface RecentAdapter {
  id: string
  name: string
  downloads: number
  starCount: number
  createdAt: string
  isPublic: boolean
}

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    myAdapters: 0,
    myDownloads: 0,
    myStars: 0
  })
  const [recentAdapters, setRecentAdapters] = useState<RecentAdapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch user's adapters
      const adaptersData = await apiClient.getAdapters({ authorId: user?.id })
      
      const myAdapters = adaptersData.adapters || []
      const myDownloads = myAdapters.reduce((sum: number, a: any) => sum + a.downloads, 0)
      const myStars = myAdapters.reduce((sum: number, a: any) => sum + a.starCount, 0)
      
      setStats({
        myAdapters: myAdapters.length,
        myDownloads,
        myStars
      })
      setRecentAdapters(myAdapters.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Please sign in to access your dashboard
              </p>
              <Button onClick={() => router.push('/auth/signin')}>
                Go to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your LoRa adapters.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Adapters</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myAdapters}</div>
              <p className="text-xs text-muted-foreground">
                Adapters you've created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myDownloads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all your adapters
              </p>
            </CardContent>
          </Card>

          <Card>
            < CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myStars.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Community favorites
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your adapter development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/create">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Adapter
                </Button>
              </Link>
              <Link href="/dashboard/adapters">
                <Button className="w-full justify-start" variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  Manage My Adapters
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verified</span>
                <Badge variant="secondary">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Type</span>
                <Badge variant="outline">Developer</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Adapters */}
        {recentAdapters.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Adapters</CardTitle>
                  <CardDescription>
                    Your latest adapter submissions
                  </CardDescription>
                </div>
                <Link href="/dashboard/adapters">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAdapters.map((adapter) => (
                  <div key={adapter.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{adapter.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(adapter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Download className="w-4 h-4" />
                        {adapter.downloads}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4" />
                        {adapter.starCount}
                      </div>
                      <Badge variant={adapter.isPublic ? 'default' : 'secondary'}>
                        {adapter.isPublic ? 'published' : 'draft'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {recentAdapters.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No adapters yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Get started by creating your first LoRa adapter
              </p>
              <Link href="/dashboard/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Adapter
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}