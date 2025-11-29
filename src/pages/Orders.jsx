import { useState, useEffect } from 'react';
import { orderAPI } from '../services/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CancelOrderModal } from '../components/common/CancelOrderModal';
import { Package } from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      preparing: 'bg-purple-500',
      ready: 'bg-green-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) return <LoadingSpinner />;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start ordering to see your order history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order._id.slice(-8)}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.overallStatus)}>
                      {order.overallStatus}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Payment: {order.paymentStatus}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">INR {item.price * item.quantity}</p>
                        <Badge variant="outline" className="mt-1">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    INR {order.totalAmount}
                  </span>
                </div>

                {/* CANCEL BUTTON */}
                {["pending", "preparing"].includes(order.overallStatus) && (
                  <button
                    className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Cancel Items
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SINGLE MODAL (NOT inside map) */}
      {selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          refresh={fetchOrders}
        />
      )}
    </div>
  );
};
