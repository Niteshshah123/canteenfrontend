import { useEffect, useState } from "react";
import { adminAPI } from "../services/auth";
import { EditStaffModal } from "../components/common/EditStaffModal";
import { DeleteConfirmDialog } from "../components/common/DeleteConfirmDialog";

export const AdminStaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [editStaff, setEditStaff] = useState(null);
  const [deleteStaffId, setDeleteStaffId] = useState(null);

  const fetchStaff = async () => {
    const res = await adminAPI.getAllStaff();
    setStaff(res.data.staff);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Staff Management</h1>

      <div className="space-y-4">
        {staff.map((s) => (
          <div
            key={s._id}
            className="border p-4 rounded-lg flex justify-between items-center shadow-sm bg-white"
          >
            <div>
              <p className="font-bold text-lg">{s.fullName}</p>
              <p className="text-gray-600">{s.email}</p>
              <p className="text-gray-600">Role: {s.role}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditStaff(s)}
                className="text-blue-600 font-medium"
              >
                Edit
              </button>

              <button
                onClick={() => setDeleteStaffId(s._id)}
                className="text-red-600 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editStaff && (
        <EditStaffModal
          isOpen={true}
          onClose={() => setEditStaff(null)}
          staff={editStaff}
          refresh={fetchStaff}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteStaffId && (
        <DeleteConfirmDialog
          isOpen={true}
          onClose={() => setDeleteStaffId(null)}
          onConfirm={async () => {
            await adminAPI.deleteStaff(deleteStaffId);
            setDeleteStaffId(null);
            fetchStaff();
          }}
        />
      )}
    </div>
  );
};
