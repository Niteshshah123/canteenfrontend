import { useState } from "react";
import { adminAPI } from "../../services/auth";

export const AddStaffModal = ({ isOpen, onClose, refresh }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "kitchen",
  });

  const handleSubmit = async () => {
    try {
      await adminAPI.createStaff(form);

      if (refresh) refresh();   // 🔥 safely refresh list
      onClose();
    } catch (err) {
      console.error("Error creating staff", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Kitchen Employee</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Phone"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-3"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="kitchen">Kitchen</option>
          <option value="staff">Staff</option>
          <option value="delivery">Delivery</option>
        </select>

        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2" onClick={onClose}>Cancel</button>
          <button
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
