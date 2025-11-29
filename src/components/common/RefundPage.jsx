import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/auth";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

export const RefundPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await adminAPI.getOrderById(orderId);
      const data = res.data.order;

      setOrder(data);

      // Calculate refund
      const refund = data.items
        .filter(i => i.status === "cancelled" || i.status === "rejected")
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      setRefundAmount(refund);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmRefund = async () => {
    try {
      setProcessing(true);

      const res = await adminAPI.processRefund({
        orderId,
        amount: refundAmount,
      });

      if (res.status === 200) {
        alert("Refund processed successfully!");
        navigate("/admin/kitchen");
      }
    } catch (error) {
      console.error("Refund error:", error);
      alert("Refund failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!order)
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Order not found.
      </div>
    );

  const refundableItems = order.items.filter(
    i => i.status === "cancelled" || i.status === "rejected"
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">
          Refund Processing
        </h1>

        {/* CUSTOMER DETAILS */}
        <div className="bg-gray-100 p-4 rounded-lg border mb-5">
          <h3 className="font-semibold mb-1 text-gray-800">Customer Details</h3>
          <p className="font-medium">{order.userId.fullName}</p>
          <p className="text-sm text-gray-700">{order.userId.email}</p>
          <p className="text-sm text-gray-700">{order.userId.phone}</p>
        </div>

        {/* PAYMENT STATUS */}
        <div className="bg-gray-100 p-4 rounded-lg border mb-5">
          <h3 className="font-semibold text-gray-800 mb-1">Payment Status</h3>
          <p
            className={`font-bold ${
              order.paymentStatus === "paid"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {order.paymentStatus.toUpperCase()}
          </p>
        </div>

        {/* REFUNDABLE ITEMS */}
        <div className="bg-gray-100 p-4 rounded-lg border mb-5">
          <h3 className="font-semibold mb-2">Refundable Items</h3>

          {refundableItems.length === 0 ? (
            <p className="text-gray-600">No items eligible for refund.</p>
          ) : (
            <ul className="space-y-3">
              {refundableItems.map((item, idx) => (
                <li key={idx} className="border-b pb-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  <p className="text-gray-600 text-xs">
                    Reason: {item.rejectionMessage}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TOTAL REFUND */}
        <div className="bg-blue-50 p-4 rounded-lg border mb-5 text-lg font-semibold text-blue-900">
          Total Refund Amount: ₹{refundAmount}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between">
          <button
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={() => navigate("/admin/orders")}
          >
            Cancel
          </button>

          <button
            disabled={refundAmount === 0 || processing}
            className={`px-4 py-2 rounded text-white ${
              refundAmount > 0
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={confirmRefund}
          >
            {processing ? "Processing..." : "Confirm Refund"}
          </button>
        </div>
      </div>
    </div>
  );
};
