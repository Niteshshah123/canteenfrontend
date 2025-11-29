import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, reviewAPI, userAPI } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../contexts/ToastContext';
import { 
  Star, 
  Clock, 
  Utensils, 
  Heart, 
  ArrowLeft,
  Shield,
  Leaf,
  Wheat,
  Egg,
  Sparkles,
  ThumbsUp,
  MessageCircle,
  User,
  Edit,
  Trash2
} from 'lucide-react';

// 👇 Add these imports for the confirmation dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useContext(CartContext);
  const { addToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  
  // 👇 Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (user) {
      fetchFavorites();
    }
  }, [id, user]); // 👈 Add user to dependencies

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      setProduct(response.data.product);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewAPI.getProductReviews(id);
      const reviewsData = response.data.reviews;
      setReviews(reviewsData);
      
      // Check if current user has already reviewed this product
      if (user) {
        const userExistingReview = reviewsData.find(
          review => review.userId._id === user._id
        );
        setUserReview(userExistingReview);

        // Initialize liked reviews for current user
        const userLikedReviews = new Set();
        reviewsData.forEach(review => {
          if (review.likes && review.likes.some(likeId => likeId.toString() === user._id)) {
            userLikedReviews.add(review._id);
          }
        });
        setLikedReviews(userLikedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      addToast('Failed to load reviews', 'error');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setFavoritesLoading(true);
      const response = await userAPI.getFavorites();
      const favoriteIds = response.data.favorites.map(f => f._id);
      
      // Check if current product is in favorites
      if (product) {
        setIsFavorite(favoriteIds.includes(product._id));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      addToast('Please login to add favorites', 'warning');
      return;
    }

    try {
      setFavoritesLoading(true);
      
      if (isFavorite) {
        // Remove from favorites
        await userAPI.removeFavorite(product._id);
        setIsFavorite(false);
        addToast('Removed from favorites', 'success');
      } else {
        // Add to favorites
        await userAPI.addFavorite(product._id);
        setIsFavorite(true);
        addToast('Added to favorites', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      addToast('Failed to update favorites', 'error');
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Update isFavorite when product data is loaded
  useEffect(() => {
    if (user && product) {
      fetchFavorites();
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      addToast('Please login to add items to cart', 'warning');
      return;
    }

    const result = await addToCart(product, quantity);
    if (result.success) {
      addToast(`${quantity} ${product.name} added to cart!`, 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      addToast('Please login to submit a review', 'warning');
      return;
    }

    if (!reviewForm.comment.trim()) {
      addToast('Please write a comment for your review', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewAPI.createReview({
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      addToast('Review submitted successfully!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews(); // Refresh reviews
      fetchProduct(); // Refresh product to update rating
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 409) {
        addToast('You have already reviewed this product', 'error');
      } else {
        addToast('Failed to submit review', 'error');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

const handleLikeReview = async (reviewId) => {
  if (!user) {
    addToast('Please login to like reviews', 'warning');
    return;
  }

  try {
    // Optimistically update the UI immediately
    const currentLiked = likedReviews.has(reviewId);
    const currentReview = reviews.find(r => r._id === reviewId);
    const currentLikeCount = currentReview?.likes || 0;

    // Toggle the like state optimistically
    setLikedReviews(prev => {
      const newLiked = new Set(prev);
      if (currentLiked) {
        newLiked.delete(reviewId);
      } else {
        newLiked.add(reviewId);
      }
      return newLiked;
    });

    // Update the count optimistically
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === reviewId 
          ? { 
              ...review, 
              likes: currentLiked ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1
            }
          : review
      )
    );

    // Make the API call
    await reviewAPI.likeReview(reviewId);
    
    // Force refresh reviews to get accurate data from backend
    fetchReviews();

  } catch (error) {
    console.error('Error liking review:', error);
    addToast('Failed to like review', 'error');
    
    // Revert optimistic updates on error
    fetchReviews(); // Refresh to get correct state
  }
};

const handleDeleteProduct = async () => {
    try {
      setDeleting(true);
      console.log('Deleting product with ID:', product._id); // Add this
      console.log('Full URL would be:', `/admin/products/${product._id}`);
      await productAPI.delete(product._id);
      addToast('Product deleted successfully!', 'success');
      navigate('/menu'); // Redirect to menu after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      addToast(errorMessage, 'error');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.deleteReview(reviewId);
      addToast('Review deleted successfully', 'success');
      setUserReview(null);
      fetchReviews();
      fetchProduct();
    } catch (error) {
      console.error('Error deleting review:', error);
      addToast('Failed to delete review', 'error');
    }
  };

  const getDietaryIcon = (type) => {
    const icons = {
      isVegetarian: <Leaf className="h-4 w-4" />,
      isVegan: <Sparkles className="h-4 w-4" />,
      isGlutenFree: <Wheat className="h-4 w-4" />,
      isEggless: <Egg className="h-4 w-4" />,
      isJain: <Shield className="h-4 w-4" />,
      isBestSeller: <Star className="h-4 w-4" />
    };
    return icons[type] || <Shield className="h-4 w-4" />;
  };

  const getDietaryLabel = (type) => {
    const labels = {
      isVegetarian: 'Vegetarian',
      isVegan: 'Vegan',
      isGlutenFree: 'Gluten Free',
      isEggless: 'Eggless',
      isJain: 'Jain',
      isBestSeller: 'Best Seller'
    };
    return labels[type] || type;
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Product Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The product you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeDietary = Object.entries(product.dietaryInfo || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <img
              src={`${API_BASE_URL}${product.imageUrl}`}
              alt={product.name}
              className="w-full h-96 lg:h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{product.rating?.average?.toFixed(1) || '4.5'}</span>
                    <span className="mx-1">•</span>
                    <span>{product.rating?.count || 0} reviews</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>15-20 min</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Edit Button for Admin */}
                {user?.role === 'admin' && (
                  <>
                    <Button
                      onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                      variant="outline"
                      size="icon"
                      className="rounded-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* 👇 Delete Button for Admin */}
                    <Button
                      onClick={() => setDeleteDialogOpen(true)}
                      variant="outline"
                      size="icon"
                      className="rounded-full border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Favorite Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={`rounded-full transition-all ${
                    isFavorite 
                      ? 'text-red-500 border-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.currency} {finalPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {product.currency} {product.price}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                    Save {product.currency} {product.price - product.discountPrice}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Dietary Information */}
            {activeDietary.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Dietary Information
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeDietary.map((type) => (
                    <div
                      key={type}
                      className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full text-sm"
                    >
                      {getDietaryIcon(type)}
                      <span>{getDietaryLabel(type)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisine & Category */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Cuisine
                </h4>
                <p className="text-gray-900 dark:text-white font-medium">
                  {product.cuisine}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Category
                </h4>
                <p className="text-gray-900 dark:text-white font-medium">
                  {product.categories?.join(', ')}
                </p>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Quantity:
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <span className="text-lg">+</span>
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                size="lg"
              >
                Add to Cart • {product.currency} {(finalPrice * quantity).toFixed(2)}
              </Button>
            </div>

            {/* Availability */}
            {product.availability && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    product.availability.isAvailable 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`} />
                  <span className={
                    product.availability.isAvailable 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }>
                    {product.availability.isAvailable 
                      ? 'Available today' 
                      : 'Currently unavailable'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Delete Product
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    Are you sure you want to delete "{product?.name}"?
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    This action cannot be undone. This will permanently delete the product 
                    and remove all associated data from our servers.
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      ⚠️ <strong>Warning:</strong> This product has{' '}
                      {product?.rating?.count || 0} reviews and may be in users' carts or favorites.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1"
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Reviews
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {renderStars(product.rating?.average || 0)}
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.rating?.average?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">
                    • {product.rating?.count || 0} reviews
                  </span>
                </div>
              </div>

              {user && !userReview && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Rating
                    </label>
                    {renderStars(reviewForm.rating, true, (rating) => 
                      setReviewForm({ ...reviewForm, rating })
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <Textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this dish..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewForm.comment.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* User's Existing Review */}
            {userReview && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Your Review
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(userReview.rating)}
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {new Date(userReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 mt-2">
                      {userReview.comment}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(userReview._id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews
                  .filter(review => !userReview || review._id !== userReview._id)
                  .map((review) => (
                  <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.userId.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {review.userId.fullName}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* FIXED LIKE BUTTON - Added proper styling */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeReview(review._id)}
                        className={`flex items-center space-x-1 transition-colors ${
                          likedReviews.has(review._id) 
                            ? 'text-primary hover:text-primary/80' 
                            : 'text-gray-500 hover:text-primary'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${likedReviews.has(review._id) ? 'fill-current' : ''}`} />
                        <span>{review.likes?.length || 0}</span>
                      </Button>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mt-3 ml-13">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No reviews yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Be the first to share your experience with this dish!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};