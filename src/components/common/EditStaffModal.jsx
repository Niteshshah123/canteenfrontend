import { useState } from "react";
import { adminAPI } from "../../services/auth";

export const EditStaffModal = ({ isOpen, onClose, staff, refresh }) => {
  const [form, setForm] = useState({
    fullName: staff.fullName,
    email: staff.email,
    phone: staff.phone,
    role: staff.role,
  });

  const handleSubmit = async () => {
    try {
      await adminAPI.updateStaff(staff._id, form);
      if (refresh) refresh();
      onClose();
    } catch (err) {
      console.error("Update error", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Staff</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="kitchen">Kitchen</option>
          <option value="staff">Staff</option>
          <option value="delivery">Delivery</option>
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2">
            Cancel
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};
