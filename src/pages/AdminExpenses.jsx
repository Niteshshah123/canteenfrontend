import { useEffect, useState } from "react";
import { adminAPI } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { Calendar, Filter, PlusCircle } from "lucide-react";

export const AdminExpenses = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
  });

  const expenseTypes = [
    { value: "", label: "All Types" },
    { value: "salary", label: "Salary" },
    { value: "inventory", label: "Inventory" },
    { value: "goods", label: "Goods" },
    { value: "utilities", label: "Utilities" },
    { value: "maintenance", label: "Maintenance" },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await adminAPI.getAllExpenses(filters);
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const today = new Date().toDateString();
  const todayExpense = expenses
    .filter((e) => new Date(e.date).toDateString() === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonth = new Date().getMonth();
  const monthlyExpense = expenses
    .filter((e) => new Date(e.date).getMonth() === thisMonth)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>

        <button
          onClick={() => navigate("/admin/expenses/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          <PlusCircle size={20} /> Add Expense
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <SummaryCard title="Total Expense" amount={totalExpense} color="blue" />
        <SummaryCard
          title="Today's Expense"
          amount={todayExpense}
          color="green"
        />
        <SummaryCard
          title="This Month"
          amount={monthlyExpense}
          color="purple"
        />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-5 rounded-xl shadow-md border mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter size={20} /> Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* START DATE */}
          <div>
            <label className="text-gray-700 font-medium">Start Date</label>
            <input
              type="date"
              className="w-full mt-1 border px-3 py-2 rounded-lg"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="text-gray-700 font-medium">End Date</label>
            <input
              type="date"
              className="w-full mt-1 border px-3 py-2 rounded-lg"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="text-gray-700 font-medium">Expense Type</label>
            <select
              className="w-full mt-1 border px-3 py-2 rounded-lg"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
            >
              {expenseTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* APPLY FILTER BUTTON */}
          <div className="flex items-end">
            <button
              onClick={fetchExpenses}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* EXPENSE LIST */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} /> Expense Records
        </h2>

        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No expenses found...
          </p>
        ) : (
          <div className="space-y-4">
            {expenses.map((e) => (
              <ExpenseCard key={e._id} expense={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------- CARD COMPONENTS ----------------------- */

const SummaryCard = ({ title, amount, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    green: "bg-green-50 text-green-800 border-green-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <div
      className={`p-6 rounded-xl border ${colors[color]} shadow-sm`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">₹{amount}</p>
    </div>
  );
};

const ExpenseCard = ({ expense }) => {
  const typeColors = {
    salary: "text-green-700 bg-green-100",
    inventory: "text-blue-700 bg-blue-100",
    goods: "text-yellow-700 bg-yellow-100",
    utilities: "text-purple-700 bg-purple-100",
    maintenance: "text-red-700 bg-red-100",
  };

  return (
    <div className="p-5 border rounded-xl bg-gray-50 hover:bg-gray-100 shadow-sm transition">
      <div className="flex justify-between">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            typeColors[expense.type]
          }`}
        >
          {expense.type.toUpperCase()}
        </span>

        <span className="font-bold text-gray-700">
          ₹{expense.amount}
        </span>
      </div>

      <p className="text-gray-700 mt-1">
        {new Date(expense.date).toLocaleDateString()}
      </p>

      {expense.note && (
        <p className="text-gray-600 text-sm mt-2 italic">"{expense.note}"</p>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Recorded By: {expense.recordedBy?.fullName || "Unknown"}
      </p>
    </div>
  );
};
