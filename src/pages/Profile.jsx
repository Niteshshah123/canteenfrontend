import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LogOut, User, Mail, Phone, Shield, Edit, Heart, ShoppingBag, Star } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { userAPI, orderAPI, reviewAPI } from '../services/auth';

export const Profile = () => {
  const { user, logout, updateUser, checkSession } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState({
    orders: 0,
    favorites: 0,
    reviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || ''
  });

  useEffect(() => {
    let interval;
    let attempts = 0;

    if (!user?._id) {
      interval = setInterval(() => {
        attempts++;

        checkSession();

        if (user?._id || attempts >= 10) {
          clearInterval(interval);

          if (user?._id) fetchUserStats();
        }

      }, 500);
    } else {
      fetchUserStats();
    }

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({ fullName: user.fullName });
    }
  }, [user]);

  const fetchUserStats = async () => {

    try {
      setLoading(true);
      
      // Use Promise.all to fetch all data in parallel
      const [favoritesResponse, ordersResponse, reviewsResponse] = await Promise.all([
        userAPI.getFavorites().catch(error => {
          console.warn('Failed to fetch favorites:', error);
          return { data: { favorites: [] } };
        }),
        orderAPI.getUserOrders().catch(error => {
          console.warn('Failed to fetch orders:', error);
          return { data: { orders: [] } };
        }),
        reviewAPI.getUserReviewCount(user._id).catch(error => {
          console.warn('Failed to fetch review count:', error);
          return { data: { reviewCount: 0 } };
        })
      ]);

      const favoritesCount = favoritesResponse.data.favorites?.length || 0;
      const ordersCount = ordersResponse.data.orders?.length || 0;
      const reviewsCount = reviewsResponse.data.reviewCount || 0;
      
      setStats({
        orders: ordersCount,
        favorites: favoritesCount,
        reviews: reviewsCount
      });
      
    } catch (error) {
      console.error('Error fetching user stats:', error);
      addToast('Failed to load user statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully', 'success');
      navigate('/');
    } catch (error) {
      addToast('Failed to logout', 'error');
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({ fullName: user.fullName });
  };

  const handleSaveEdit = async () => {
    if (!editForm.fullName.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    try {
      const response = await userAPI.updateProfile({ fullName: editForm.fullName });
      updateUser(response.data.user); // Update user in auth context
      setIsEditing(false);
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ fullName: user.fullName });
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <Shield className="h-5 w-5 text-red-500" />,
      kitchen_staff: <User className="h-5 w-5 text-orange-500" />,
      user: <User className="h-5 w-5 text-blue-500" />
    };
    return icons[role] || <User className="h-5 w-5 text-gray-500" />;
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      kitchen_staff: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center space-x-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-100 dark:from-primary/20 dark:to-blue-900/20">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <User className="h-6 w-6" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Profile Picture & Basic Info */}
                <div className="flex items-center space-x-4 mb-6">
                  {/* Clickable Avatar for Editing */}
                  <div className="relative group">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer shadow-lg">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Enhanced Edit Icon Overlay */}
                    <button
                      onClick={handleEditClick}
                      className="absolute -bottom-1 -right-1 bg-gradient-to-br from-primary to-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:shadow-xl border-2 border-white dark:border-gray-800"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div>
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ fullName: e.target.value })}
                          placeholder="Enter your full name"
                          className="text-2xl font-bold h-12 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Button onClick={handleSaveEdit} size="sm" className="bg-primary hover:bg-primary/90">
                            Save
                          </Button>
                          <Button onClick={handleCancelEdit} variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user?.fullName}
                        </h2>
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadge(user?.role)}`}>
                          {getRoleIcon(user?.role)}
                          <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>Email Address</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>Phone Number</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Member Since
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      User ID
                    </div>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
                      {user?._id}
                    </p>
                  </div>

                </div>

              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            
            {/* Account Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300">Orders</span>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                        {stats.orders}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                        <span className="text-gray-700 dark:text-gray-300">Favorites</span>
                      </div>
                      <span className="font-bold text-pink-600 dark:text-pink-400 text-lg">
                        {stats.favorites}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">Reviews</span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {stats.reviews}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/favorites')}
                  disabled={stats.favorites === 0}
                >
                  ❤️ My Favorites
                  {stats.favorites > 0 && (
                    <span className="ml-auto bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                      {stats.favorites}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/orders')}
                  disabled={stats.orders === 0}
                >
                  📦 Order History
                  {stats.orders > 0 && (
                    <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {stats.orders}
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/settings')}
                >
                  ⚙️ Settings
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Edit Name Modal */}
      {/* Edit Name Modal with Blurred Background */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Your Name</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your display name</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full text-lg py-3 px-4 border-2 border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                    autoFocus
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>This name will be visible to others</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <Button 
                  onClick={handleCancelEdit} 
                  variant="outline" 
                  className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit} 
                  className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};