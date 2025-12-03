'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { ReviewSection } from '@/components/review-section'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Star, Calendar, GitBranch, Globe } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

interface Adapter {
  id: string
  name: string
  slug: string
  description: string
  category: string
  version: string
  downloads: number
  starCount: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  model: string[]
  repository?: string
  readme?: string
  fileUrl?: string
  fileName?: string
}

export default function AdapterDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [adapter, setAdapter] = useState<Adapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAdapter(params.id as string)
      checkIfStarred(params.id as string)
    }
  }, [params.id])

  const fetchAdapter = async (id: string) => {
    try {
      const data = await apiClient.getAdapter(id)
      setAdapter(data.adapter)
    } catch (error) {
      console.error('Failed to fetch adapter:', error)
      toast({
        title: "Error",
        description: "Failed to load adapter details",
        variant: "destructive"
      })
      router.push('/dashboard/adapters')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!adapter) return

    if (!adapter.fileUrl) {
      toast({
        title: "Download not available",
        description: "This adapter doesn't have a file uploaded",
        variant: "destructive"
      })
      return
    }

    try {
      // Increment download count
      await apiClient.incrementDownload(adapter.id)

      // Trigger file download
      const link = document.createElement('a')
      link.href = adapter.fileUrl
      link.download = adapter.fileName || `${adapter.slug}.safetensors`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: `${adapter.name} is being downloaded`
      })

      // Update local adapter state
      setAdapter({
        ...adapter,
        downloads: adapter.downloads + 1
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the adapter file",
        variant: "destructive"
      })
    }
  }

  const checkIfStarred = async (id: string) => {
    try {
      const data = await apiClient.checkStar(id)
      setIsStarred(data.isStarred)
    } catch (error) {
      // User might not be authenticated, ignore
    }
  }

  const handleStar = async () => {
    if (!adapter) return

    try {
      if (isStarred) {
        await apiClient.unstarAdapter(adapter.id)
        setIsStarred(false)
        setAdapter({
          ...adapter,
          starCount: adapter.starCount - 1
        })
        toast({
          title: "Unstarred",
          description: "Removed from your starred adapters"
        })
      } else {
        await apiClient.starAdapter(adapter.id)
        setIsStarred(true)
        setAdapter({
          ...adapter,
          starCount: adapter.starCount + 1
        })
        toast({
          title: "Starred",
          description: "Added to your starred adapters"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to star adapter",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!adapter) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/adapters">
          <Button variant="ghost" className="mb-6 pl-0 hover:pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Adapters
          </Button>
        </Link>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{adapter.name}</h1>
                <Badge variant={adapter.isPublic ? 'default' : 'secondary'}>
                  {adapter.isPublic ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <p className="text-gray-500 mb-4">by {adapter.author?.name || 'Unknown'}</p>
              <p className="text-lg text-gray-700 max-w-3xl">{adapter.description}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Model
              </Button>
              <Button onClick={handleStar} variant={isStarred ? "default" : "outline"}>
                <Star className={`w-4 h-4 mr-2 ${isStarred ? 'fill-current' : ''}`} />
                {isStarred ? 'Starred' : 'Star'}
              </Button>
              {adapter.repository && (
                <a href={adapter.repository} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Repository
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t">
            <div className="flex items-center text-gray-600">
              <Download className="w-5 h-5 mr-2" />
              <div>
                <div className="font-semibold text-gray-900">{adapter.downloads.toLocaleString()}</div>
                <div className="text-sm">Downloads</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Star className="w-5 h-5 mr-2" />
              <div>
                <div className="font-semibold text-gray-900">{adapter.starCount}</div>
                <div className="text-sm">Stars</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <div>
                <div className="font-semibold text-gray-900">
                  {new Date(adapter.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm">Created</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Globe className="w-5 h-5 mr-2" />
              <div>
                <div className="font-semibold text-gray-900">{adapter.category}</div>
                <div className="text-sm">Category</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Readme/Details */}
            <Card>
              <CardHeader>
                <CardTitle>Model Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Compatible Models</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {adapter.model.map((m) => (
                      <Badge key={m} variant="outline">{m}</Badge>
                    ))}
                  </div>
                  
                  {adapter.readme && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Documentation</h3>
                      <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-md">
                        {adapter.readme}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <ReviewSection adapterId={adapter.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">v{adapter.version}</div>
                      <div className="text-sm text-gray-500">Current Release</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(adapter.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">LoRa</Badge>
                  <Badge variant="secondary">Stable Diffusion</Badge>
                  <Badge variant="secondary">AI</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
