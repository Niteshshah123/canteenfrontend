import { useState, useEffect, useContext } from 'react';
import { productAPI, userAPI } from '../services/auth';
import { ProductCard } from '../components/common/ProductCard';
import { CartContext } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cuisines, setCuisines] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const { addToCart } = useContext(CartContext);
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    if (user) {
      fetchFavorites();
    }
  }, [user, search, cuisineFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (search) filters.search = search;
      if (cuisineFilter !== 'all') filters.cuisine = cuisineFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;

      const response = await productAPI.getAll(filters);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCuisines(response.data.cuisines);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await userAPI.getFavorites();
      setFavorites(response.data.favorites.map(f => f._id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    if (result.success) {
      addToast('Added to cart successfully!', 'success');
    } else {
      addToast(result.error, 'error');
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!user) {
      addToast('Please login to add favorites', 'warning');
      return;
    }

    try {
      if (favorites.includes(productId)) {
        await userAPI.removeFavorite(productId);
        setFavorites(favorites.filter(id => id !== productId));
        addToast('Removed from favorites', 'success');
      } else {
        await userAPI.addFavorite(productId);
        setFavorites([...favorites, productId]);
        addToast('Added to favorites', 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      addToast('Failed to update favorites', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Our Menu</h1>
          {user?.role === 'admin' && (
            <Button 
              onClick={() => navigate('/admin/add-product')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

