import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const links = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Customers", path: "/customers", icon: "👥" },
    { name: "Products", path: "/products", icon: "📦" },
    { name: "Invoices", path: "/billing", icon: "🧾" },
    { name: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <div className="w-72 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-2xl">
      <div className="p-8 border-b border-slate-800">
        <h2 className="text-xl font-black text-white tracking-tighter flex items-center space-x-2">
          <span className="bg-blue-600 p-1.5 rounded-lg text-[10px] leading-none">ERP</span>
          <span className="whitespace-nowrap">Smart Invoice</span>
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${location.pathname === link.path
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "hover:bg-slate-800 hover:text-white"
              }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {link.icon}
            </span>
            <span className="font-semibold text-sm">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 group transition-all hover:bg-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shrink-0 uppercase">
              {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0] : "A")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.first_name || user?.last_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Admin Account"}
              </p>
              <p className="text-[10px] text-slate-500 truncate font-semibold">{user?.email || "billing@system.com"}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-red-500/20 active:scale-95 shrink-0"
            title="Sign Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
