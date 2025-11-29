import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { SocketProvider } from './contexts/SocketContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { NotificationToast } from './components/common/NotificationToast';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Favorites } from './pages/Favorites';
import { AddProduct } from './pages/AddProduct';
import { AdminStaffPage } from './pages/AdminStaffPage';
import { AdminKitchenDashboard } from './pages/AdminKitchenDashboard';
import { RefundPage } from './components/common/RefundPage';
import { AdminAddExpense } from './pages/AdminAddExpense';
import { AdminExpenses } from './pages/AdminExpenses';
import { ManageProducts, ManageOrders, Expenses } from './pages/commonProducts';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'kitchen']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-product"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-product/:productId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expenses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminExpenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/refund/:orderId"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RefundPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kitchen"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminKitchenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expenses/add"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAddExpense />
              </ProtectedRoute>
            }
          />
          {/* Kitchen Routes */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['kitchen']}>
                <KitchenDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

