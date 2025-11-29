import API from './api';

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (email, password) => API.post('/auth/login', { email, password }),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
};

export const productAPI = {
  getAll: (filters = {}) => API.get('/products', { params: filters }),
  getById: (id) => API.get(`/products/${id}`),
  getCategories: () => API.get('/products/categories'),
  create: (productData) => API.post('/admin/products', productData),
  update: (id, productData) => API.put(`/admin/products/${id}`, productData),
  updateAvailability: (id, isAvailable) =>
    API.put(`/admin/products/${id}/availability`, { isAvailable }),
  updateDiscount: (id, discountPrice) =>
    API.put(`/admin/products/${id}/discount`, { discountPrice }),
  delete: (id) => API.delete(`/admin/products/${id}`),
};

export const userAPI = {
  getProfile: () => API.get('/user/profile'),
  updateProfile: (data) => API.put('/user/profile', data),
  addAddress: (address) => API.post('/user/addresses', address),
  updateAddress: (id, address) => API.put(`/user/addresses/${id}`, address),
  deleteAddress: (id) => API.delete(`/user/addresses/${id}`),
  getFavorites: () => API.get('/user/favorites'),
  addFavorite: (productId) => API.post(`/user/favorites/${productId}`),
  removeFavorite: (productId) => API.delete(`/user/favorites/${productId}`),
};

export const cartAPI = {
  getCart: () => API.get('/orders/cart'),
  addToCart: (productId, quantity) =>
    API.post('/orders/cart/items', { productId, quantity }),
  updateCartItem: (productId, quantity) =>
    API.put(`/orders/cart/items/${productId}`, { quantity }),
  removeFromCart: (productId) => API.delete(`/orders/cart/items/${productId}`),
  clearCart: () => API.delete('/orders/cart/clear'),
};

export const orderAPI = {
  getUserOrders: () => API.get('/orders'),
  getOrderById: (id) => API.get(`/orders/${id}`),
  placeOrder: (orderData) => API.post('/orders/place', orderData),

  cancelOrder: (id, selectedItems, reason) =>
    API.post(`/orders/${id}/cancel`, {
      items: selectedItems,
      reason
    }),

  confirmPayment: (paymentData) =>
    API.post('/orders/payments/confirm', paymentData),
};

export const reviewAPI = {
  getProductReviews: (productId) => API.get(`/reviews/product/${productId}`),
  createReview: (reviewData) => API.post('/reviews', reviewData),
  updateReview: (id, reviewData) => API.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => API.delete(`/reviews/${id}`),
  likeReview: (id) => API.post(`/reviews/${id}/like`),
  getUserReviewCount: (userId) => API.get(`/reviews/user/${userId}/count`),
};

export const adminAPI = {
  getDashboardStats: (filters = {}) =>
    API.get('/admin/dashboard/stats', { params: filters }),

  getAllOrders: (filters = {}) => API.get('/admin/orders', { params: filters }),

  updateOrderStatus: (id, status, rejectionMessage = null, activeCount = null) =>
    API.put(`/admin/orders/${id}/status`, {
      status,
      rejectionMessage,
      activeCount
    }),

  // GET SPECIFIC ORDER FOR REFUND PAGE
  getOrderById: (id) => API.get(`/admin/orders/${id}`),

  // PROCESS REFUND
  processRefund: ({ orderId, amount }) =>
    API.post(`/admin/orders/${orderId}/refund`, { amount }),

  // Analytics
  getTopCustomers: (params = {}) =>
    API.get('/admin/analytics/top-customers', { params }),

  getStaffPerformance: (params = {}) =>
    API.get('/admin/analytics/staff-performance', { params }),

  // STAFF
  createStaff: (data) => API.post('/admin/staff', data),
  getAllStaff: () => API.get('/admin/staff'),
  updateStaff: (id, data) => API.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => API.delete(`/admin/staff/${id}`),

  // EXPENSE
  createExpense: (data) => API.post('/admin/expenses', data),
  getAllExpenses: (filters = {}) => API.get('/admin/expenses', { params: filters }),
};

export const kitchenAPI = {
  getKitchenOrders: (filters = {}) =>
    API.get('/kitchen/orders', { params: filters }),

  getOrderStats: () => API.get('/kitchen/orders/stats'),

  acceptOrderItem: (orderId, itemId, staffId) =>
    API.post(`/kitchen/orders/${orderId}/items/${itemId}/accept`, { staffId }),

  rejectOrderItem: (orderId, itemId, staffId, reason) =>
    API.post(`/kitchen/orders/${orderId}/items/${itemId}/reject`, { staffId, reason }),

  updateItemStatus: (orderId, itemId, status, staffId) =>
    API.put(`/kitchen/orders/${orderId}/items/${itemId}/status`, { status, staffId }),

  completeOrderItem: (orderId, itemId, staffId) =>
    API.post(`/kitchen/orders/${orderId}/items/${itemId}/complete`, { staffId })
};

export { API };
