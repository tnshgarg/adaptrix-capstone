'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'
import { AdapterForm } from '@/components/adapter-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateAdapterPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Adapter</h1>
          <p className="mt-2 text-gray-600">
            Publish your LoRa adapter to the Adaptrix marketplace
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adapter Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your adapter. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdapterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}