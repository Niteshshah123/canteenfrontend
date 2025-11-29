import { Star, Heart, ShoppingCart, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Add this import

export const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={() => navigate(`/product/${product._id}`)}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${API_BASE_URL}${product.imageUrl}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </Badge>
          )}
          {product.dietaryInfo?.isBestSeller && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              Best Seller
            </Badge>
          )}
          {product.dietaryInfo?.isVegetarian && (
            <Badge variant="outline" className="absolute bottom-2 left-2 bg-green-500 text-white">
              Veg
            </Badge>
          )}
          {/* Edit Button for Admin */}
          {user?.role === 'admin' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/edit-product/${product._id}`);
              }}
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white backdrop-blur-sm"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm font-medium">
                {product.rating?.average?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({product.rating?.count || 0} reviews)
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {product.currency} {displayPrice}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.currency} {product.price}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={() => onAddToCart(product)}
          className="flex-1"
          disabled={!product.availability?.isAvailable}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.availability?.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </Button>
        <Button
          onClick={() => onToggleFavorite(product._id)}
          variant="outline"
          size="icon"
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
          />
        </Button>
      </CardFooter>
    </Card>
  );
};