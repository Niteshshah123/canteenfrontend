import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { kitchenAPI } from "../../services/auth";
import { useAuth } from '../../hooks/useAuth';

export const OrderDetailsModalKitchen = ({
  order,
  isOpen,
  onClose,
  refresh,
}) => {
  const [rejectItemId, setRejectItemId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const { user } = useAuth();
  if (!order) return null;

  /* -----------------------------
      HANDLE BACKEND MESSAGE
  ----------------------------- */
  const handleBackendResponse = (res) => {
    if (!res.data.success) {
      alert(res.data.message || "Order was updated externally. Refreshing...");
      refresh();   // reload orders
      onClose();   // close modal
      return false; // stop further execution
    }
    return true;
  };

  /* -----------------------------
      UPDATE ITEM STATUS
  ----------------------------- */
  const updateItem = async (itemId, status) => {
    try {
      const res = await kitchenAPI.updateItemStatus(
        order._id,
        itemId,
        status,
        user._id
      );

      // If failed → refresh page instead of closing
      if (!handleBackendResponse(res)) return;

      refresh();
      onClose();
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  /* -----------------------------
      REJECT ITEM
  ----------------------------- */
  const rejectItem = async () => {
    try {
      const res = await kitchenAPI.rejectOrderItem(
        order._id,
        rejectItemId,
        user._id,
        rejectReason
      );

      if (!handleBackendResponse(res)) return;

      refresh();
      setRejectItemId(null);
      setRejectReason("");
      onClose();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  /* BUTTON ENABLE LOGIC */
  const canPrepare = (state) => state === "pending";
  const canReady = (state) => state === "pending" || state === "preparing";
  const canReject = (state) => !["rejected", "ready", "cancelled"].includes(state);

  return (
    <>
      {/* MAIN ORDER MODAL */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg p-6 rounded-xl bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Order #{order._id.slice(-6)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-2">

            {/* ITEMS LIST */}
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="bg-gray-50 border rounded-lg p-4">

                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-bold text-gray-700">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    Status: <span className="font-semibold">{item.status}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-3">

                    {/* PREPARING */}
                    <button
                      disabled={!canPrepare(item.status)}
                      className={`px-3 py-2 rounded text-white ${
                        canPrepare(item.status)
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      onClick={() => updateItem(item._id, "preparing")}
                    >
                      Preparing
                    </button>

                    {/* READY */}
                    <button
                      disabled={!canReady(item.status)}
                      className={`px-3 py-2 rounded text-white ${
                        canReady(item.status)
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      onClick={() => updateItem(item._id, "ready")}
                    >
                      Ready
                    </button>

                    {/* REJECT */}
                    <button
                      disabled={!canReject(item.status)}
                      className={`px-3 py-2 rounded text-white ${
                        canReject(item.status)
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      onClick={() => setRejectItemId(item._id)}
                    >
                      Reject
                    </button>

                  </div>
                </div>
              ))}
            </div>

            <div className="text-right font-bold text-lg">
              Total: ₹{order.totalAmount}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* REJECT CONFIRMATION MODAL */}
      <Dialog open={!!rejectItemId} onOpenChange={() => setRejectItemId(null)}>
        <DialogContent className="max-w-sm p-6 rounded-xl bg-white shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Reject Item</DialogTitle>
          </DialogHeader>

          <p className="text-gray-700 mb-3">
            Are you sure you want to reject this item?
          </p>

          <textarea
            className="w-full border rounded p-2 mb-4"
            placeholder="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              onClick={() => {
                setRejectItemId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={rejectItem}
            >
              Yes, Reject
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
