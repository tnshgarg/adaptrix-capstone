'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Trash2, Edit2, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

interface Review {
  _id: string
  userId: {
    _id: string
    name: string
    username: string
    avatar?: string
  }
  rating: number
  comment: string
  createdAt: string
}

interface ReviewSectionProps {
  adapterId: string
}

export function ReviewSection({ adapterId }: ReviewSectionProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [adapterId])

  const fetchReviews = async () => {
    try {
      const data = await apiClient.getReviews(adapterId)
      setReviews(data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await apiClient.updateReview(editingId, { rating, comment })
        toast({ title: "Success", description: "Review updated successfully" })
      } else {
        await apiClient.createReview({ adapterId, rating, comment })
        toast({ title: "Success", description: "Review posted successfully" })
      }
      
      setRating(0)
      setComment('')
      setEditingId(null)
      fetchReviews()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post review",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await apiClient.deleteReview(id)
      toast({ title: "Success", description: "Review deleted successfully" })
      fetchReviews()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (review: Review) => {
    setRating(review.rating)
    setComment(review.comment)
    setEditingId(review._id)
    // Scroll to form
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setRating(0)
    setComment('')
    setEditingId(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Reviews ({reviews.length})</h3>
      </div>

      {/* Review Form */}
      {user && (
        <div id="review-form" className="bg-card p-6 rounded-lg border shadow-sm">
          <h4 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit your review' : 'Write a review'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`focus:outline-none transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your thoughts about this adapter..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            <div className="flex space-x-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : (editingId ? 'Update Review' : 'Post Review')}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="bg-card p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={review.userId.avatar} />
                    <AvatarFallback>
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{review.userId.name}</div>
                    <div className="flex items-center space-x-1 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {user && user.id === review.userId._id && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="mt-4 text-gray-700 whitespace-pre-wrap">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
