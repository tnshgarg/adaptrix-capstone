'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Star, 
  MoreHorizontal,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'
import apiClient from '@/lib/api'
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
}
export default function AdaptersPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [adapters, setAdapters] = useState<Adapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [authLoading, isAuthenticated, router])
  useEffect(() => {
    if (user) {
      fetchAdapters()
    }
  }, [user])
  const fetchAdapters = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getAdapters({ authorId: user?.id })
      setAdapters(data.adapters)
    } catch (error) {
      console.error('Failed to fetch adapters:', error)
      toast({
        title: "Error",
        description: "Failed to load your adapters",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (adapterId: string) => {
    if (!confirm('Are you sure you want to delete this adapter? This action cannot be undone.')) {
      return
    }
    try {
      await apiClient.deleteAdapter(adapterId)
      toast({
        title: "Success",
        description: "Adapter deleted successfully"
      })
      fetchAdapters()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete adapter",
        variant: "destructive"
      })
    }
  }
  const filteredAdapters = adapters.filter(adapter => {
    const matchesSearch = !searchTerm || 
                         adapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adapter.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'published' && adapter.isPublic) ||
                         (filterStatus === 'draft' && !adapter.isPublic)
    
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredAdapters.length / itemsPerPage)
  const paginatedAdapters = filteredAdapters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus])
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Adapters</h1>
            <p className="mt-2 text-gray-600">
              Manage your LoRa adapters and track their performance
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Adapter
            </Button>
          </Link>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Adapters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adapters.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adapters.filter(a => a.isPublic).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adapters.reduce((sum, a) => sum + a.downloads, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adapters.reduce((sum, a) => sum + a.starCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search adapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Adapters</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Adapters Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Adapters</CardTitle>
            <CardDescription>
              A list of all your LoRa adapters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAdapters.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No adapters found' : 'No adapters yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first adapter'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link href="/dashboard/create">
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Your First Adapter
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Stars</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAdapters.map((adapter) => (
                    <TableRow key={adapter.id}>
                      <TableCell>
                        <div>
                          <Link href={`/dashboard/adapters/${adapter.id}`} className="font-medium hover:underline text-blue-600">
                            {adapter.name}
                          </Link>
                          <div className="text-sm text-gray-500">{adapter.slug}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{adapter.category}</Badge>
                      </TableCell>
                      <TableCell>{adapter.version}</TableCell>
                      <TableCell>
                        <Badge variant={adapter.isPublic ? 'default' : 'secondary'}>
                          {adapter.isPublic ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {adapter.downloads.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {adapter.starCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(adapter.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                             <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                           
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(adapter.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredAdapters.length} total)
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}