import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, ThumbsUp, User, Verified, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string; // JSON string array of image URLs/base64
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductReviewsProps {
  productId: string;
  currentUserId?: string;
  onReviewAdded?: () => void;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  images: string[]; // Array of base64 image data
}

// Star Rating Component
const StarRating = ({ 
  rating, 
  editable = false, 
  onRatingChange,
  size = 'md' 
}: { 
  rating: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${editable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => editable && onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

export default function ProductReviews({ productId, currentUserId, onReviewAdded }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
        
        // Check if current user has reviewed
        if (currentUserId) {
          const userReview = data.find((review: ProductReview) => review.userId === currentUserId);
          setHasUserReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, currentUserId]);

  // Submit review (create or update)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setSubmitting(true);
    try {
      let response;
      if (editingReview) {
        // Update existing review
        response = await fetch(`/api/reviews/${editingReview.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            images: formData.images.length > 0 ? JSON.stringify(formData.images) : undefined
          }),
        });
      } else {
        // Create new review
        response = await fetch(`/api/products/${productId}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            images: formData.images.length > 0 ? JSON.stringify(formData.images) : undefined
          }),
        });
      }

      if (response.ok) {
        setShowForm(false);
        setEditingReview(null);
        setFormData({ rating: 5, title: '', comment: '', images: [] });
        fetchReviews();
        onReviewAdded?.();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${editingReview ? 'update' : 'submit'} review`);
      }
    } catch (error) {
      console.error(`Failed to ${editingReview ? 'update' : 'submit'} review:`, error);
      alert(`Failed to ${editingReview ? 'update' : 'submit'} review`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mark review as helpful
  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      
      if (response.ok) {
        fetchReviews(); // Refresh to show updated helpful count
      }
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
    }
  };

  // Edit review
  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || '',
      images: review.images ? JSON.parse(review.images) : []
    });
    setShowForm(true);
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReview(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchReviews();
        onReviewAdded?.(); // Refresh product data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    } finally {
      setDeletingReview(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowForm(false);
    setFormData({ rating: 5, title: '', comment: '', images: [] });
  };

  // Image upload handling
  const handleImageUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    // Limit to 3 images per review
    const maxImages = 3;
    const currentCount = formData.images.length;
    const remainingSlots = maxImages - currentCount;
    
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed per review`);
      return;
    }

    setUploadingImages(true);
    
    try {
      const newImages: string[] = [];
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      for (const file of filesToProcess) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select only image files');
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size must be less than 5MB');
          continue;
        }
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push(base64);
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Parse review images for display
  const parseReviewImages = (images?: string): string[] => {
    if (!images) return [];
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-muted h-32 rounded"></div>
        <div className="animate-pulse bg-muted h-24 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          {currentUserId && !hasUserReviewed && (
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              size="sm"
            >
              Write a Review
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">
            ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
          </span>
        </div>
      </div>

      {/* Review Form */}
      {showForm && currentUserId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingReview ? 'Edit Your Review' : 'Write Your Review'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="mt-1">
                  <StarRating
                    rating={formData.rating}
                    editable
                    onRatingChange={(rating) => setFormData({...formData, rating})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Review Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Summarize your experience"
                />
              </div>
              
              <div>
                <Label htmlFor="comment">Your Review (Optional)</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Tell others about your experience with this product"
                  rows={4}
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <Label>Photos (Optional)</Label>
                <div className="mt-2 space-y-3">
                  {/* Image Preview Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {formData.images.length < 3 && (
                    <div className="border-2 border-dashed border-muted rounded-lg p-4">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">
                          {uploadingImages ? 'Uploading...' : 'Upload Photos'}
                        </span>
                        <span className="text-xs mt-1">
                          Add up to {3 - formData.images.length} more photos (max 5MB each)
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (editingReview ? 'Updating...' : 'Submitting...') : (editingReview ? 'Update Review' : 'Submit Review')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={editingReview ? handleCancelEdit : () => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Anonymous User</span>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            <Verified className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}
                
                {review.comment && (
                  <p className="text-muted-foreground mb-3">{review.comment}</p>
                )}

                {/* Review Images */}
                {(() => {
                  const reviewImages = parseReviewImages(review.images);
                  return reviewImages.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-3 gap-2 max-w-md">
                        {reviewImages.map((image, index) => (
                          <div key={index} className="group cursor-pointer">
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border hover:shadow-md transition-shadow"
                              onClick={() => {
                                // Create modal overlay for full-size image view
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer';
                                modal.innerHTML = `
                                  <img src="${image}" alt="Review image ${index + 1}" class="max-w-full max-h-full object-contain" />
                                  <button class="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300">&times;</button>
                                `;
                                modal.onclick = () => document.body.removeChild(modal);
                                document.body.appendChild(modal);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        {reviewImages.length} photo{reviewImages.length !== 1 ? 's' : ''} from customer
                      </p>
                    </div>
                  );
                })()}
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkHelpful(review.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful ({review.helpfulCount})
                  </Button>
                  
                  {/* Review Management Buttons for Owner */}
                  {currentUserId === review.userId && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteReview(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingReview === review.id}
                            >
                              {deletingReview === review.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}