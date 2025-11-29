import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { orderAPI } from "../../services/auth";

export const CancelOrderModal = ({ order, isOpen, onClose, refresh }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitCancel = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to cancel.");
      return;
    }
    if (!reason.trim()) {
      alert("Please enter a cancellation reason.");
      return;
    }

    try {
      await orderAPI.cancelOrder(order._id, selectedItems, reason);
      refresh();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Cancellation failed.");
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-xl bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Cancel Items from Order #{order._id.slice(-6)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <p className="text-gray-600">Select items to cancel:</p>

          {order.items.map((item) => (
            <label
              key={item._id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item._id)}
                onChange={() => toggleItem(item._id)}
                disabled={item.status === "ready"} // cannot cancel ready items
              />
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  Quantity: {item.quantity} | Status: {item.status}
                </p>
              </div>
            </label>
          ))}

          <textarea
            placeholder="Reason for cancellation..."
            className="w-full border rounded-lg p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />

          <button
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            onClick={submitCancel}
          >
            Cancel Selected Items
          </button>

        </div>
      </DialogContent>
    </Dialog>
  );
};
