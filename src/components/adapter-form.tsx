'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Plus, Save } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import apiClient from '@/lib/api'

const categories = [
  'Development',
  'Content Creation', 
  'Data Science',
  'Business',
  'Healthcare',
  'Legal',
  'Education',
  'Creative',
  'Research',
  'Other'
]

const compatibleModels = [
  'Llama 3.1',
  'Mistral 7B',
  'Gemma 2B',
  'Phi-3',
  'Qwen 2',
  'Claude 3',
  'GPT-4',
  'Custom'
]

interface AdapterFormData {
  name: string
  slug: string
  description: string
  category: string
  tags: string[]
  compatibleModels: string[]
  version: string
  license: string
  repository: string
  readme: string
  isPublic: boolean
}

export function AdapterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [uploadedFile, setUploadedFile] = useState<{fileName: string, fileUrl: string, cloudinaryId: string, size: number} | null>(null)
  const [formData, setFormData] = useState<AdapterFormData>({
    name: '',
    slug: '',
    description: '',
    category: '',
    tags: [],
    compatibleModels: [],
    version: '1.0.0',
    license: 'MIT',
    repository: '',
    readme: '',
    isPublic: true
  })

  const handleInputChange = (field: keyof AdapterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    

    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const toggleModel = (model: string) => {
    setFormData(prev => ({
      ...prev,
      compatibleModels: prev.compatibleModels.includes(model)
        ? prev.compatibleModels.filter(m => m !== model)
        : [...prev.compatibleModels, model]
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const data = await apiClient.uploadFile(file)

      clearInterval(progressInterval)
      setUploadProgress(100)


      setUploadedFile({
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        cloudinaryId: data.cloudinaryId,
        size: data.size
      })

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to cloud storage`
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload adapter file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    toast({
      title: "File removed",
      description: "You can upload a new file"
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {

      const adapterData = {
        ...formData,
        fileUrl: uploadedFile?.fileUrl,
        cloudinaryId: uploadedFile?.cloudinaryId,
        fileName: uploadedFile?.fileName,
        size: uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB` : undefined
      }

      const data = await apiClient.createAdapter(adapterData)
      toast({
        title: "Adapter created successfully",
        description: "Your adapter has been published"
      })
      router.push('/dashboard/adapters')
    } catch (error) {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create adapter",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name && formData.slug && formData.description && formData.category && uploadedFile !== null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the basic details about your LoRa adapter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Adapter Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Code-Enhancer-Lora"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="code-enhancer-lora"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your adapter does and how it enhances LLM performance..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Select value={formData.license} onValueChange={(value) => handleInputChange('license', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIT">MIT</SelectItem>
                  <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                  <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                  <SelectItem value="BSD-3-Clause">BSD 3-Clause</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Add tags to help users discover your adapter
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compatible Models */}
      <Card>
        <CardHeader>
          <CardTitle>Compatible Models</CardTitle>
          <CardDescription>
            Select which LLM models your adapter works with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {compatibleModels.map(model => (
              <div key={model} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={model}
                  checked={formData.compatibleModels.includes(model)}
                  onChange={() => toggleModel(model)}
                  className="rounded"
                />
                <Label htmlFor={model} className="text-sm">{model}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Repository */}
      <Card>
        <CardHeader>
          <CardTitle>Repository</CardTitle>
          <CardDescription>
            Link to your source code repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="repository">GitHub URL</Label>
            <Input
              id="repository"
              value={formData.repository}
              onChange={(e) => handleInputChange('repository', e.target.value)}
              placeholder="https://github.com/username/adapter-name"
              type="url"
            />
          </div>
        </CardContent>
      </Card>

      {/* README */}
      <Card>
        <CardHeader>
          <CardTitle>README</CardTitle>
          <CardDescription>
            Detailed documentation for your adapter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="readme">README Content</Label>
            <Textarea
              id="readme"
              value={formData.readme}
              onChange={(e) => handleInputChange('readme', e.target.value)}
              placeholder="# Your Adapter Name

## Description
Describe your adapter in detail...

## Installation
Provide installation instructions...

## Usage
Show how to use your adapter...

## License
Specify the license..."
              rows={12}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Model File Upload *</CardTitle>
          <CardDescription>
            Upload your safetensors model file (.safetensors, .bin, .pth, .pt, .ckpt)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Supported formats: .safetensors, .bin, .pth, .pt, .ckpt (Max 2GB)
                    </span>
                  </Label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".safetensors,.bin,.pth,.pt,.ckpt"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              {isUploading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading to cloud...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Upload className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-900">
                      {uploadedFile.fileName}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • Uploaded to cloud storage
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeUploadedFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>
            Control who can see and use your adapter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600"
            />
            <Label htmlFor="isPublic">Make this adapter public</Label>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Public adapters can be discovered and installed by anyone. Private adapters are only visible to you.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/adapters')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <span className="mr-2">Creating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {uploadedFile ? 'Create Adapter' : 'Upload File First'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}