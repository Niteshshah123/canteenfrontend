import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from '../contexts/CartContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useContext(CartContext);
  const { addToast } = useToast();
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await userAPI.getFavorites();
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      addToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    if (result.success) {
      addToast(`${product.name} added to cart!`, 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await userAPI.removeFavorite(productId);
      setFavorites(favorites.filter(fav => fav._id !== productId));
      addToast('Removed from favorites', 'success');
    } catch (error) {
      console.error('Error removing favorite:', error);
      addToast('Failed to remove from favorites', 'error');
    }
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Please log in to view favorites
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sign in to see your favorite dishes
            </p>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding your favorite dishes to see them here!
            </p>
            <Button onClick={() => navigate('/menu')}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <img
                  src={`${API_BASE_URL}${product.imageUrl}`}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                />
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 
                      className="font-semibold text-lg cursor-pointer hover:text-orange-500 transition-colors"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(product._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        {product.currency} {product.discountPrice || product.price}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.currency} {product.price}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {product.rating?.average || 4.5}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};