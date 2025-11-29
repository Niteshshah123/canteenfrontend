import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { adminAPI } from "../../services/auth";
import { useNavigate } from "react-router-dom";

export const OrderDetailsModalAdmin = ({ order, isOpen, onClose, refresh }) => {
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const navigate = useNavigate();
  if (!order) return null;

  // ------------------------------------------
  // STATE LOGIC
  // ------------------------------------------
  const isReady = order.overallStatus === "ready";
  const isPaid = order.paymentStatus === "paid";

  const hasRefundItems = order.items.some(
    (i) => i.status === "rejected" || i.status === "cancelled"
  );

  const allRejectedOrCancelled = order.items.every(
    (i) => i.status === "rejected" || i.status === "cancelled"
  );

  // Admin can only update items NOT cancelled/rejected
  const activeCount = order.items.filter(
    (i) => i.status !== "cancelled" && i.status !== "rejected"
  ).length;

  const redirectToRefund = () => {
    navigate(`/admin/refund/${order._id}`);
  };

  // ------------------------------------------
  // COMPLETE ORDER
  // ------------------------------------------
  const completeOrder = async () => {
    try {
      // If refund needed → skip API, go to refund page
      if (hasRefundItems && isPaid) {
        return redirectToRefund();
      }

      const res = await adminAPI.updateOrderStatus(
        order._id,
        "completed",
        null,
        activeCount
      );

      if (res.status === 200) {
        refresh();
        onClose();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Some items were cancelled or rejected. Please refresh the page.");
      } else {
        console.error("Complete error:", error);
      }
    }
  };

  // ------------------------------------------
  // REJECT ORDER
  // ------------------------------------------
  const rejectOrder = async () => {
    try {
      if (!rejectReason.trim()) {
        alert("Please enter a rejection reason.");
        return;
      }

      // If refund needed → redirect first, no API call here
      if (hasRefundItems && isPaid) {
        return redirectToRefund();
      }

      const res = await adminAPI.updateOrderStatus(
        order._id,
        "rejected",
        rejectReason,
        activeCount
      );

      if (res.status === 200) {
        refresh();
        onClose();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("Some items were cancelled or rejected. Please refresh.");
      } else {
        console.error("Reject error:", error);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="
            max-w-lg
            w-full
            p-0
            bg-white
            rounded-xl
            shadow-xl
            max-h-[90vh]
            flex
            flex-col
          "
        >
          {/* HEADER */}
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                Order #{order._id.slice(-6)}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-y-auto px-6 py-4 space-y-6 custom-scroll">

            {/* CUSTOMER DETAILS */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2 text-gray-800">Customer Details</h3>
              <p className="font-medium text-gray-900">{order.userId.fullName}</p>
              <p className="text-sm text-gray-600">{order.userId.email}</p>
              <p className="text-sm text-gray-600">{order.userId.phone}</p>
            </div>

            {/* PAYMENT STATUS */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-800 mb-1">Payment Status</h3>
              <p
                className={`font-semibold ${
                  isPaid ? "text-green-600" : "text-orange-600"
                }`}
              >
                {order.paymentStatus.toUpperCase()}
              </p>
            </div>

            {/* ORDER ITEMS */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">Order Items</h3>

              <ul className="space-y-3">
                {order.items.map((item, idx) => (
                  <li key={idx} className="border-b pb-2 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <p className="text-gray-600">
                      Status: <b>{item.status}</b>
                    </p>

                    {item.status === "rejected" && item.rejectionMessage && (
                      <p className="text-red-600 text-xs">
                        Kitchen: {item.rejectionMessage}
                      </p>
                    )}

                    {item.status === "cancelled" && item.rejectionMessage && (
                      <p className="text-orange-600 text-xs">
                        User: {item.rejectionMessage}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              <div className="text-right font-bold text-lg mt-3">
                Total: ₹{order.totalAmount}
              </div>
            </div>
          </div>

          {/* FOOTER ACTION BUTTONS */}
          <div className="p-6 border-t flex justify-between">

            {/* FULL REFUND BUTTON IF ALL ITEMS REJECTED/CANCELLED */}
            {allRejectedOrCancelled && isPaid ? (
              <button
                className="w-full px-4 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                onClick={redirectToRefund}
              >
                Refund ₹{order.totalAmount}
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-3 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
                  onClick={() => setShowRejectConfirm(true)}
                >
                  {hasRefundItems && isPaid ? "Reject → Refund" : "Reject"}
                </button>

                <button
                  className={`px-4 py-3 rounded text-white font-semibold ${
                    isReady
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isReady}
                  onClick={completeOrder}
                >
                  {hasRefundItems && isPaid ? "Complete → Refund" : "Complete"}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <DialogContent className="max-w-sm p-6 rounded-xl bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Reject Order
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 mb-2">
            Please provide a reason for rejecting this order.
          </p>

          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={3}
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-300"
              onClick={() => setShowRejectConfirm(false)}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={rejectOrder}
            >
              {hasRefundItems && isPaid ? "Reject → Refund" : "Reject"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
