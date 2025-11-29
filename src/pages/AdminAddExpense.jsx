import { useState } from "react";
import { adminAPI } from "../services/auth";
import { useNavigate } from "react-router-dom";

export const AdminAddExpense = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "",
    amount: "",
    date: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);

  const expenseTypes = [
    { value: "salary", label: "Salary" },
    { value: "inventory", label: "Inventory" },
    { value: "goods", label: "Goods" },
    { value: "utilities", label: "Utilities" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitExpense = async (e) => {
    e.preventDefault();

    if (!form.type || !form.amount || !form.date) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const res = await adminAPI.createExpense(form);

      if (res.status === 201) {
        alert("Expense added successfully!");
        navigate("/admin/expenses");
      }
    } catch (err) {
      console.error("Expense creation error:", err);
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl w-full mt-6 border">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Add New Expense
        </h1>

        <form onSubmit={submitExpense} className="space-y-6">

          {/* Expense Type */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select Type</option>
              {expenseTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              min="0"
              value={form.amount}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter amount"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Note (Optional)
            </label>
            <textarea
              name="note"
              rows="3"
              value={form.note}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Write a note (optional)"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Add Expense"}
          </button>
        </form>

        {/* Back Button */}
        <button
          className="mt-4 w-full text-center py-2 rounded-lg bg-gray-300 hover:bg-gray-400 font-medium"
          onClick={() => navigate("/admin/expenses")}
        >
          Back to Expenses
        </button>
      </div>
    </div>
  );
};
