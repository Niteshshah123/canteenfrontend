export const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
        <h3 className="font-semibold text-lg mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this staff member?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2">
            Cancel
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
