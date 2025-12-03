'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Download, Star, TrendingUp, Package, Users, Zap, Shield, Sparkles, Terminal, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import apiClient from '@/lib/api'
import Link from 'next/link'
import { CLIDemo } from '@/components/cli-demo'

interface LoRaAdapter {
  id: string
  name: string
  slug: string
  description: string
  author: string | { name: string; id: string; _id: string; username: string }
  version: string
  downloads: number
  stars: number
  tags: string[]
  model: string
  size: string
  lastUpdated: string
  installCommand: string
  category: string
  rating: number
  fileUrl?: string
  fileName?: string
}

const mockAdapters: LoRaAdapter[] = [
  {
    id: '1',
    name: 'Code-Enhancer-Lora',
    description: 'Enhances code generation capabilities with better syntax understanding and documentation generation',
    author: 'TechCorp AI',
    version: '1.2.0',
    downloads: 15420,
    stars: 423,
    tags: ['coding', 'documentation', 'syntax'],
    model: 'Llama 3.1',
    size: '2.3GB',
    lastUpdated: '2 hours ago',
    installCommand: 'adaptrix install TechCorp-AI/Code-Enhancer-Lora',
    category: 'Development'
  },
  {
    id: '2',
    name: 'Creative-Writer-Pro',
    description: 'Specialized adapter for creative writing, storytelling, and content creation with enhanced narrative flow',
    author: 'CreativeLabs',
    version: '2.0.1',
    downloads: 8930,
    stars: 287,
    tags: ['writing', 'creative', 'storytelling'],
    model: 'Mistral 7B',
    size: '1.8GB',
    lastUpdated: '5 hours ago',
    installCommand: 'adaptrix install CreativeLabs/Creative-Writer-Pro',
    category: 'Content Creation'
  },
  {
    id: '3',
    name: 'Data-Scientist-Helper',
    description: 'Optimized for data analysis, statistical modeling, and machine learning explanations',
    author: 'DataAI Team',
    version: '1.5.3',
    downloads: 12100,
    stars: 356,
    tags: ['data-science', 'analytics', 'ml'],
    model: 'Llama 3.1',
    size: '3.1GB',
    lastUpdated: '1 day ago',
    installCommand: 'adaptrix install DataAI-Team/Data-Scientist-Helper',
    category: 'Data Science'
  },
  {
    id: '4',
    name: 'Business-Strategy-Advisor',
    description: 'Professional business analysis and strategic planning with market insights',
    author: 'BizIntelligence',
    version: '1.0.5',
    downloads: 6780,
    stars: 198,
    tags: ['business', 'strategy', 'analysis'],
    model: 'Gemma 2B',
    size: '1.2GB',
    lastUpdated: '3 days ago',
    installCommand: 'adaptrix install BizIntelligence/Business-Strategy-Advisor',
    category: 'Business'
  },
  {
    id: '5',
    name: 'Medical-Assistant-Lite',
    description: 'Medical terminology and healthcare information processing for clinical applications',
    author: 'HealthAI Solutions',
    version: '2.1.0',
    downloads: 9450,
    stars: 412,
    tags: ['medical', 'healthcare', 'clinical'],
    model: 'Llama 3.1',
    size: '2.7GB',
    lastUpdated: '6 hours ago',
    installCommand: 'adaptrix install HealthAI-Solutions/Medical-Assistant-Lite',
    category: 'Healthcare'
  },
  {
    id: '6',
    name: 'Legal-Document-Analyzer',
    description: 'Legal document analysis and contract review with jurisdiction awareness',
    author: 'LegalTech Pro',
    version: '1.3.2',
    downloads: 5230,
    stars: 167,
    tags: ['legal', 'contracts', 'compliance'],
    model: 'Mistral 7B',
    size: '2.1GB',
    lastUpdated: '2 days ago',
    installCommand: 'adaptrix install LegalTech-Pro/Legal-Document-Analyzer',
    category: 'Legal'
  }
]

export default function AdaptrixMarketplace() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [adapters, setAdapters] = useState<LoRaAdapter[]>([]);
  const [filteredAdapters, setFilteredAdapters] = useState<LoRaAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdapters, setTotalAdapters] = useState(0);
  const [platformStats, setPlatformStats] = useState({ totalAdapters: 0, totalDownloads: 0, totalDevelopers: 0 });
  const router = useRouter();
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAdapters()
  }, [selectedCategory, sortBy, currentPage]);

  useEffect(() => {
    // Fetch platform stats
    const fetchStats = async () => {
      try {
        const stats = await apiClient.getPlatformStats();
        setPlatformStats({
          totalAdapters: stats.totalAdapters || 0,
          totalDownloads: stats.totalDownloads || 0,
          totalDevelopers: stats.totalUsers || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [])

  useEffect(() => {
    filterAndSortAdapters()
  }, [searchTerm, selectedCategory, sortBy, adapters])

  const fetchAdapters = async () => {
    try {
      setLoading(true);
      const params: any = { sort: sortBy, limit: itemsPerPage, page: currentPage };
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const data = await apiClient.getAdapters(params);
      setAdapters(data.adapters || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalAdapters(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching adapters:', error);
      setAdapters([]);
    } finally {
      setLoading(false);
    }
  }

  const filterAndSortAdapters = () => {
    let filtered = adapters.filter(adapter => {
      const matchesSearch = adapter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           adapter.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           adapter.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || adapter.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort adapters
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads
        case 'stars':
          return b.stars - a.stars
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredAdapters(filtered)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Adaptrix</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">LoRa Adapter Marketplace</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard/create">
                    <Button size="sm">Create Adapter</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            The GitHub for Low-Rank Adapters
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Discover, share, and deploy LoRa adapters for your local LLM models. 
            Join our community of developers building the future of AI customization.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{platformStats.totalAdapters}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Adapters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{platformStats.totalDownloads.toLocaleString()}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-600">{platformStats.totalDevelopers}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Developers</div>
            </div>
          </div>

          {/* Quick Install Demo */}
          <Card className="max-w-2xl mx-auto bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Quick Start with CLI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 p-4 rounded-lg font-mono text-sm">
                <div className="text-green-400">$ npm install -g adaptrix-cli</div>
                <div className="text-green-400">$ adaptrix install TechCorp-AI/Code-Enhancer-Lora</div>
                <div className="text-slate-400"># Adapter installed and ready to use!</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search adapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Content Creation">Content Creation</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="stars">Most Stars</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-96">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            filteredAdapters.map((adapter) => (
              <Link key={adapter.id} href={`/dashboard/adapters/${adapter.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 hover:text-violet-600 transition-colors">{adapter.name}</CardTitle>
                      <CardDescription className="text-sm">
                        by {typeof adapter.author === 'string' ? adapter.author : adapter.author?.name || 'Unknown'} • v{adapter.version}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {adapter.model}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {adapter.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {adapter.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {adapter.downloads.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {adapter.stars}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {adapter.size}
                    </div>
                  </div>

                  {/* Install Command */}
                  <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mb-4">
                    <code className="text-xs text-slate-700 dark:text-slate-300">
                      {adapter.installCommand}
                    </code>
                  </div>

                  {/* View Details CTA */}
                  <div className="text-sm text-violet-600 font-medium">
                    Click to view details →
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))
          )}
        </div>

        {filteredAdapters.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
              No adapters found
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
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
      </section>

      {/* CLI Demo Section */}
      {/* <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Try the CLI Interface
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Experience the power of Adaptrix CLI with our interactive demo. 
            See how easy it is to search, install, and manage LoRa adapters from your terminal.
          </p>
        </div>
        <CLIDemo />
      </section> */}

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>CLI Guide</li>
                <li>SDK Reference</li>
                <li>API Docs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>GitHub</li>
                <li>Discord</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>About</li>
                <li>Contact</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            © 2024 Adaptrix. Building the future of AI customization.
          </div>
        </div>
      </footer>
    </div>
  )
}