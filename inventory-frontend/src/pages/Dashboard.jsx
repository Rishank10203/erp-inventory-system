import { useEffect, useState } from "react";
import API from "../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_invoices: 0,
    paid_invoices: 0,
    pending_payments: 0,
    total_revenue: 0,
    total_customers: 0,
    monthly_sales: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("billing/dashboard/stats/");
        setStats(res.data);
      } catch (error) {
        console.error("Dashboard stats error:", error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Total Invoices", value: stats.total_invoices, icon: "🧾", color: "bg-blue-50 text-blue-600" },
    { title: "Paid Invoices", value: stats.paid_invoices || 0, icon: "✅", color: "bg-emerald-50 text-emerald-600" },
    { title: "Pending Payments", value: stats.pending_payments || 0, icon: "⏳", color: "bg-orange-50 text-orange-600" },
    { title: "Total Revenue", value: `$${stats.total_revenue || stats.total_sales || 0}`, icon: "💰", color: "bg-indigo-50 text-indigo-600" },
    { title: "Customers", value: stats.total_customers || 0, icon: "👥", color: "bg-purple-50 text-purple-600" },
    { title: "Monthly Sales", value: `$${stats.monthly_sales || 0}`, icon: "📈", color: "bg-pink-50 text-pink-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${card.color} bg-opacity-20`}>
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-800 mb-6">Business Insights</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-600">Payment Collection Rate</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full uppercase tracking-tighter">94% Efficient</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-600">Average Invoice Value</span>
              <span className="text-sm font-black text-blue-600">$1,240</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <span className="text-sm font-bold text-gray-600">Outstanding Debt</span>
              <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[25%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-2xl shadow-blue-500/20 text-white flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-6 backdrop-blur-sm animate-bounce">
            📈
          </div>
          <h3 className="text-2xl font-black mb-2">Smart Billing Growth</h3>
          <p className="text-blue-100/80 mb-6 max-w-xs">Your revenue is up 12% from last month. Automation has saved you 15 hours in billing this week.</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-gray-50 transition-colors">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;