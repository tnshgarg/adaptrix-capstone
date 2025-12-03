'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'
import { AdapterForm, AdapterFormData } from '@/components/adapter-form'
import apiClient from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditAdapterPage() {
  const params = useParams()
  const router = useRouter()
  const [initialData, setInitialData] = useState<AdapterFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchAdapter(params.id as string)
    }
  }, [params.id])

  const fetchAdapter = async (id: string) => {
    try {
      const data = await apiClient.getAdapter(id)
      const adapter = data.adapter

      // Map API response to form data
      const formData: AdapterFormData = {
        name: adapter.name,
        slug: adapter.slug,
        description: adapter.description,
        category: adapter.category,
        tags: adapter.tags || [],
        compatibleModels: adapter.model || [], // API returns 'model', form expects 'compatibleModels'
        version: adapter.version,
        license: adapter.license,
        repository: adapter.repository || '',
        readme: adapter.readme || '',
        isPublic: adapter.isPublic,
        fileName: adapter.fileName,
        fileUrl: adapter.fileUrl,
        // We might need to handle size parsing if it's a string like "10 MB"
        // For now, let's assume we might not have the raw size in bytes if it's not stored that way
        // If size is a string, we can't easily convert back to bytes for the progress bar, 
        // but the form handles size=0 gracefully for existing files.
      }

      setInitialData(formData)
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

  if (!initialData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/dashboard/adapters/${params.id}`}>
            <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Adapter</h1>
          <p className="text-gray-500">Update your adapter details</p>
        </div>

        <AdapterForm initialData={initialData} adapterId={params.id as string} />
      </div>
    </div>
  )
}
