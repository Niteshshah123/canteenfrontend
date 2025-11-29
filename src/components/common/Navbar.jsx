import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useContext, useState } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { 
  ShoppingCart, 
  User, 
  Home, 
  Menu as MenuIcon, 
  UtensilsCrossed, 
  X, 
  Plus,
  LayoutDashboard,
  ChefHat,
  Heart,
  Receipt 
} from 'lucide-react';
import { Button } from '../ui/button';

export const Navbar = () => {
  const { user } = useAuth();
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const cartItemCount = cartItems.filter(item => item.productId !== null).length;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Canteen MS</span>
          </Link>

          {/* Hamburger Button for Mobile */}
          <button
            className="md:hidden p-2 rounded focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">

            <Link to="/" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
              <Home className="h-4 w-4 mx-auto" />
              <span>Home</span>
            </Link>

            <Link to="/menu" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
              <MenuIcon className="h-4 w-4 mx-auto" />
              <span>Menu</span>
            </Link>

            {user && (
              <>
                {/* Cart - Only for users */}
                {user.role === 'user' && (
                  <Link to="/cart" className="relative flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                    <ShoppingCart className="h-5 w-5 mx-auto" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                    <span>Cart</span>
                  </Link>
                )}

                {/* Favorites - For users and admin */}
                {(user.role === 'user') && (
                  <Link to="/favorites" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                    <Heart className="h-5 w-5 mx-auto" />
                    <span>Favorites</span>
                  </Link>
                )}

                {/* Add Product - Only for admin */}
                {user.role === 'admin' && (
                  <Link to="/admin/add-product" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                    <Plus className="h-5 w-5 mx-auto" />
                    <span>Add Product</span>
                  </Link>
                )}

                {/* Dashboard - Only for admin */}
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                    <LayoutDashboard className="h-5 w-5 mx-auto" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Kitchen - For kitchen staff and admin */}
                {(user.role === 'kitchen' || user.role === 'admin') && (
                  <Link 
                  to={user.role === "admin" ? "/admin/kitchen" : "/kitchen"}
                  className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                    <ChefHat className="h-5 w-5 mx-auto" />
                    <span>Kitchen</span>
                  </Link>
                )}

                {/* Expenses - Only for admin */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin/expenses" 
                    className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary"
                  >
                    <Receipt className="h-5 w-5 mx-auto" />
                    <span>Expenses</span>
                  </Link>
                )}

                {/* Profile - For all logged in users */}
                <Link to="/profile" className="flex-col text-gray-700 dark:text-gray-300 hover:text-primary">
                  <User className="h-5 w-5 mx-auto" />
                  <span>Profile</span>
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 space-y-3 bg-white dark:bg-gray-900 p-4 shadow-lg rounded-lg">
            
            <Link
              to="/"
              className="block text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <div className='flex items-center gap-2'>
                <Home className="h-4 w-4 my-auto" />
                Home
              </div>
            </Link>

            <Link
              to="/menu"
              className="block text-gray-700 dark:text-gray-300 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              <div className='flex items-center gap-2'>
                <MenuIcon className="h-4 w-4 my-auto" />
                <span>Menu</span>
              </div>
            </Link>

            {user && (
              <>
                {/* Cart - Only for users */}
                {user.role === 'user' && (
                  <Link
                    to="/cart"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <ShoppingCart className="h-5 w-5 my-auto" />
                      Cart ({cartItemCount})
                    </div>
                  </Link>
                )}

                {/* Favorites - For users and admin */}
                {(user.role === 'user') && (
                  <Link
                    to="/favorites"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <Heart className="h-5 w-5 my-auto" />
                      Favorites
                    </div>
                  </Link>
                )}

                {/* Add Product - Only for admin */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/add-product"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <Plus className="h-5 w-5 my-auto" />
                      Add Product
                    </div>
                  </Link>
                )}

                {/* Dashboard - Only for admin */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <LayoutDashboard className="h-5 w-5 my-auto" />
                      Dashboard
                    </div>
                  </Link>
                )}

                {/* Kitchen - For kitchen staff and admin */}
                {(user.role === 'kitchen' || user.role === 'admin') && (
                  <Link
                    to={user.role === "admin" ? "/admin/kitchen" : "/kitchen"}
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <ChefHat className="h-5 w-5 my-auto" />
                      Kitchen
                    </div>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/expenses"
                    className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className='flex items-center gap-2'>
                      <Receipt className="h-5 w-5 my-auto" />
                      Expenses
                    </div>
                  </Link>
                )}

                {/* Profile - For all logged in users */}
                <Link
                  to="/profile"
                  className="block text-gray-700 dark:text-gray-300 hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <div className='flex items-center gap-2'>
                    <User className="h-5 w-5 my-auto" />
                    Profile
                  </div>
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/login"
                  className="block hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="block hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};