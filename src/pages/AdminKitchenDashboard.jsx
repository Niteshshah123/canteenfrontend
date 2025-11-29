import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChefHat } from "lucide-react";
import { adminAPI } from '../services/auth';
import { OrderDetailsModalAdmin } from "../components/common/OrderDetailsModalAdmin";
import { useNavigate } from "react-router-dom";
import { AddStaffModal } from "../components/common/AddStaffModal"; 
import { useAuth } from "../hooks/useAuth";

export const AdminKitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

      const res = await adminAPI.getAllOrders({
        startDate: firstDay.toISOString(),
        endDate: now.toISOString(),
      });

      setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  // COUNTS BASED ON CURRENT MONTH
  const pending = orders.filter(o => o.overallStatus === "pending");
  const preparing = orders.filter(o => o.overallStatus === "preparing");
  const ready = orders.filter(o => o.overallStatus === "ready");
  const rejected = orders.filter(o => o.overallStatus === "rejected");
  const completed = orders.filter(o => o.overallStatus === "completed");
  const cancelled = orders.filter(o => o.overallStatus === "cancelled");

  // SHOW ACTIVE ORDERS (EXCEPT COMPLETED + REJECTED)
  const activeOrders = orders.filter((o) => {
    if (o.overallStatus === "completed") return false; // completed orders never show

    // show rejected/cancelled ONLY when payment is PAID (refund needed)
    if (["rejected", "cancelled"].includes(o.overallStatus)) {
      return o.paymentStatus === "paid";
    }

    // pending / preparing / ready → always active
    return true;
  });


  const orderPriority = {
    ready: 1,
    preparing: 2,
    pending: 3,
    rejected: 4,
    cancelled: 4
  };

  const sortedOrders = [...activeOrders].sort(
    (a, b) => orderPriority[a.overallStatus] - orderPriority[b.overallStatus]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin – Kitchen Dashboard</h1>
          </div>

          <div className="flex items-center">
            <button
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80"
              onClick={() => setShowStaffModal(true)}
            >
              + Add Kitchen Employee
            </button>

            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ml-3"
              onClick={() => navigate('/admin/staff')}
            >
              Manage Staff
            </button>
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <StatusCard title="Pending" count={pending.length} color="text-yellow-600" />
          <StatusCard title="Preparing" count={preparing.length} color="text-blue-600" />
          <StatusCard title="Ready" count={ready.length} color="text-green-600" />
          <StatusCard title="Rejected" count={rejected.length} color="text-red-600" />
          <StatusCard title="cancelled" count={cancelled.length} color="text-yellow-600" />
          <StatusCard title="Completed" count={completed.length} color="text-purple-600" />
        </div>

        {/* ACTIVE ORDERS */}
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedOrders.length === 0 ? (
              <p className="text-gray-500">No active orders...</p>
            ) : (
              <div className="space-y-4">
                {sortedOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex justify-between">
                      <h2 className="text-lg font-semibold">
                        Order #{order._id.slice(-6)}
                      </h2>

                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.overallStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.overallStatus === "preparing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {order.overallStatus}
                      </span>
                    </div>

                    <p className="text-gray-700">
                      {order.items.length} items — ₹{order.totalAmount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ORDER MODAL */}
        {selectedOrder && (
          <OrderDetailsModalAdmin
            order={selectedOrder}
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            refresh={fetchOrders}
          />
        )}

        {/* ADD STAFF MODAL */}
        <AddStaffModal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          refresh={fetchOrders}
        />
      </div>
    </div>
  );
};

const StatusCard = ({ title, count, color }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-4xl font-bold ${color}`}>{count}</div>
    </CardContent>
  </Card>
);
