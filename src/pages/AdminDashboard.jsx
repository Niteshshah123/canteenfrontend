import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { adminAPI } from '../services/auth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [productRange, setProductRange] = useState('7days');
  const [filteredOrders, setFilteredOrders] = useState([]);

  // 🔥 NEW: people analytics state
  const [peopleRange, setPeopleRange] = useState('30days');
  const [topCustomers, setTopCustomers] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [staffStats, setStaffStats] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = import.meta.env.VITE_SOCKET_URL;

  // Load dashboard + recent orders
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsRes, ordersRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getAllOrders({ limit: 20, sort: 'desc' }),
        ]);

        const statsData = statsRes.data;
        setStats(statsData);

        const ordersRaw = ordersRes.data?.orders || ordersRes.data || [];
        if (Array.isArray(ordersRaw) && ordersRaw.length > 0) {
          const sorted = [...ordersRaw].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setLastOrder(sorted[0]);
        }
      } catch (err) {
        console.error('Error loading admin dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Load orders for top products
  useEffect(() => {
    const loadFilteredOrders = async () => {
      try {
        const res = await adminAPI.getAllOrders({
          limit: 500,
          range: productRange,
        });
        setFilteredOrders(res.data.orders || []);
      } catch (err) {
        console.error('Error loading filtered order data:', err);
      }
    };

    loadFilteredOrders();
  }, [productRange]);

  // 🔥 Load Top Customers + Staff for overview tab
  useEffect(() => {
    const loadPeopleAnalytics = async () => {
      try {
        setLoadingPeople(true);

        const [customersRes, staffRes] = await Promise.all([
          adminAPI.getTopCustomers({
            range: peopleRange,
            page: customerPage,
            limit: 10,
          }),
          adminAPI.getStaffPerformance({
            range: peopleRange,
          }),
        ]);

        setTopCustomers(customersRes.data.customers || []);
        setCustomerTotalPages(customersRes.data.totalPages || 1);

        setStaffStats(staffRes.data.staff || []);
      } catch (err) {
        console.error('Error loading people analytics:', err);
      } finally {
        setLoadingPeople(false);
      }
    };

    loadPeopleAnalytics();
  }, [peopleRange, customerPage]);

  const calcChangePct = (current, previous) => {
    if (previous == null || previous === 0) return null;
    const diff = current - previous;
    return (diff / previous) * 100;
  };

  const growthMetrics = useMemo(() => {
    if (!stats) return {};
    const revenueChange = calcChangePct(
      stats.totalRevenue,
      stats.lastMonthRevenue
    );
    const ordersChange = calcChangePct(
      stats.totalOrders,
      stats.lastMonthOrders
    );
    const customersChange = calcChangePct(
      stats.totalCustomers,
      stats.lastMonthCustomers
    );
    const profitChange = calcChangePct(stats.netProfit, stats.lastMonthProfit);

    return {
      revenueChange,
      ordersChange,
      customersChange,
      profitChange,
    };
  }, [stats]);

  const topProductsData = useMemo(() => {
    if (!filteredOrders.length) return [];

    const productTotals = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productObj = item.productId || {};
        const id = productObj._id || `deleted-${item.productName}`;

        if (!productTotals[id]) {
          productTotals[id] = {
            name: productObj.name || item.productName || 'Unknown Product',
            imageUrl: productObj.imageUrl || 'no_image.png',
            totalSold: 0,
            revenue: 0,
          };
        }

        productTotals[id].totalSold += item.quantity;
        productTotals[id].revenue += item.quantity * item.price;
      });
    });

    return Object.values(productTotals)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  const renderChangeBadge = (value) => {
    if (value == null) {
      return <span className="text-xs text-muted-foreground">N/A</span>;
    }
    const rounded = value.toFixed(1);
    const isPositive = value >= 0;
    return (
      <span
        className={`text-xs ml-2 ${
          isPositive ? 'text-green-600' : 'text-red-500'
        }`}
      >
        {isPositive ? '+' : ''}
        {rounded}% vs last month
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        {error || 'No stats available'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('topProducts')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'topProducts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Top Products & Business Insights
          </button>
        </div>

        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    INR {stats.totalRevenue ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue from all paid orders
                    {renderChangeBadge(growthMetrics.revenueChange)}
                  </p>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalOrders ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all statuses
                    {renderChangeBadge(growthMetrics.ordersChange)}
                  </p>
                </CardContent>
              </Card>

              {/* Total Customers */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCustomers ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Unique customers
                    {renderChangeBadge(growthMetrics.customersChange)}
                  </p>
                </CardContent>
              </Card>

              {/* Net Profit */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Profit
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      (stats.netProfit ?? 0) < 0
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}
                  >
                    INR {stats.netProfit ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Revenue - Expenses (Expenses: INR {stats.totalExpenses ?? 0})
                    {renderChangeBadge(growthMetrics.profitChange)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 🔥 People analytics section (Top Customers + Staff Performance) */}
            <div className="space-y-6">
              {/* Filter bar for customers & staff */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Customers & Staff</h2>
                <div className="flex gap-2">
                  {[
                    { label: 'Today', value: 'today' },
                    { label: 'Last 7 Days', value: '7days' },
                    { label: 'Last 30 Days', value: '30days' },
                    { label: 'All Time', value: 'all' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPeopleRange(opt.value);
                        setCustomerPage(1);
                      }}
                      className={`px-3 py-1 text-xs rounded-md border ${
                        peopleRange === opt.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TOP CUSTOMERS TABLE */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPeople ? (
                      <div className="flex justify-center py-6">
                        <LoadingSpinner />
                      </div>
                    ) : topCustomers.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 pr-4">Customer</th>
                                <th className="text-left py-2 pr-4">Orders</th>
                                <th className="text-left py-2 pr-4">
                                  Total Spent (INR)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {topCustomers.map((c, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="py-2 pr-4">
                                    <div className="flex flex-col">
                                      <span className="font-semibold">
                                        {c.user?.fullName || 'Unknown'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {c.user?.email}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 pr-4">
                                    {c.ordersCount}
                                  </td>
                                  <td className="py-2 pr-4">
                                    {c.totalSpent}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-end items-center mt-4 gap-2 text-xs">
                          <button
                            disabled={customerPage <= 1}
                            onClick={() =>
                              setCustomerPage((p) => Math.max(1, p - 1))
                            }
                            className={`px-2 py-1 rounded border ${
                              customerPage <= 1
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Prev
                          </button>
                          <span>
                            Page {customerPage} of {customerTotalPages}
                          </span>
                          <button
                            disabled={customerPage >= customerTotalPages}
                            onClick={() =>
                              setCustomerPage((p) =>
                                Math.min(customerTotalPages, p + 1)
                              )
                            }
                            className={`px-2 py-1 rounded border ${
                              customerPage >= customerTotalPages
                                ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Next
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No customer data for this range.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* STAFF PERFORMANCE */}
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPeople ? (
                      <div className="flex justify-center py-6">
                        <LoadingSpinner />
                      </div>
                    ) : staffStats.length > 0 ? (
                      <div className="space-y-3 text-sm max-h-80 overflow-y-auto">
                        {staffStats.map((s, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-3 bg-white shadow-sm"
                          >
                            <div className="font-semibold">
                              {s.staff?.fullName || 'Unknown Staff'}
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {s.staff?.email}
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Items Prepared</span>
                              <span>{s.itemsPrepared}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Total Revenue Covered</span>
                              <span>INR {s.totalRevenue}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Avg Prep Time / Item</span>
                              <span>
                                {s.avgPrepTimePerItem
                                  ? `${s.avgPrepTimePerItem.toFixed(1)} min`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No staff activity for this range.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* ================= TOP PRODUCTS TAB ================= */}
        {activeTab === 'topProducts' && (
          <div className="space-y-6">
            {/* Filter bar for products */}
            <div className="flex gap-3 mb-4">
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'Last 7 Days', value: '7days' },
                { label: 'Last 30 Days', value: '30days' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setProductRange(opt.value)}
                  className={`px-4 py-2 text-sm rounded-md border 
                    ${
                      productRange === opt.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Products (by Revenue)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData}>

                      {/* Soft Grid */}
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                      <XAxis 
                        dataKey="name"
                        tick={{ fill: "#4b5563", fontSize: 12 }} 
                        axisLine={{ stroke: "#cbd5e1" }}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fill: "#4b5563", fontSize: 12 }}
                        axisLine={{ stroke: "#cbd5e1" }}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          padding: "10px",
                        }}
                        itemStyle={{ color: "#334155" }}
                      />

                      {/* BEAUTIFUL GRADIENT BAR */}
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>

                      <Bar
                        dataKey="revenue"
                        fill="url(#revenueGradient)"
                        radius={[6, 6, 0, 0]}  // rounded top corners
                        maxBarSize={50}
                      />

                    </BarChart>
                  </ResponsiveContainer>

                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Not enough data to show top products yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Products Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {topProductsData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Product</th>
                            <th className="text-left py-2 pr-4">Units Sold</th>
                            <th className="text-left py-2 pr-4">
                              Revenue (INR)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProductsData.map((p, idx) => (
                            <tr key={idx} className="border-b last:border-0">
                              <td className="py-2 pr-4 flex items-center gap-2">
                                {p.imageUrl && (
                                  <img
                                    src={
                                      p.imageUrl.startsWith('/')
                                        ? `${API_BASE_URL}${p.imageUrl}` // backend
                                        : p.imageUrl // public folder
                                    }
                                    alt={p.name}
                                    onError={(e) => (e.target.src = '/no_image.png')}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <span>{p.name}</span>
                              </td>
                              <td className="py-2 pr-4">{p.totalSold}</td>
                              <td className="py-2 pr-4">{p.revenue}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      No product data available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Business Insight + Last Order (unchanged) */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span>INR {stats.totalRevenue ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Expenses</span>
                      <span>INR {stats.totalExpenses ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Profit</span>
                      <span
                        className={
                          (stats.netProfit ?? 0) < 0
                            ? 'text-red-500'
                            : 'text-green-600'
                        }
                      >
                        INR {stats.netProfit ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span>{stats.totalOrders ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Customers</span>
                      <span>{stats.totalCustomers ?? 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastOrder ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Order ID</span>
                          <span className="font-mono">
                            {lastOrder._id || lastOrder.orderId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer</span>
                          <span>
                            {lastOrder.user?.name ||
                              lastOrder.customerName ||
                              'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status</span>
                          <span className="capitalize">
                            {lastOrder.status || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount</span>
                          <span>INR {lastOrder.totalAmount ?? 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Placed On</span>
                          <span>
                            {lastOrder.createdAt
                              ? new Date(
                                  lastOrder.createdAt
                                ).toLocaleString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        No orders found.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
