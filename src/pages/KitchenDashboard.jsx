import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChefHat } from "lucide-react";
import { kitchenAPI } from '../services/auth';
import { OrderDetailsModalKitchen } from "../components/common/OrderDetailsModalKitchen";

export const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await kitchenAPI.getKitchenOrders();
      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  // 🔥 Only pending & preparing orders shown
  const activeOrders = orders.filter(
    (o) => o.overallStatus === "pending" || o.overallStatus === "preparing"
  );

  // Sorting priority (preparing first, then pending)
  const orderPriority = {
    preparing: 1,
    pending: 2
  };

  const sortedOrders = [...activeOrders].sort(
    (a, b) => orderPriority[a.overallStatus] - orderPriority[b.overallStatus]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
        </div>

        {/* Active Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>

          <CardContent>
            {sortedOrders.length === 0 ? (
              <p>No active orders...</p>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between">
                      <h2 className="font-semibold">Order #{order._id.slice(-6)}</h2>

                      <span className="px-3 py-1 rounded-full bg-gray-200 text-sm">
                        {order.overallStatus}
                      </span>
                    </div>

                    <p>{order.items.length} items — ₹{order.totalAmount}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        {selectedOrder && (
          <OrderDetailsModalKitchen
            order={selectedOrder}
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            refresh={fetchOrders}
          />
        )}
      </div>
    </div>
  );
};
