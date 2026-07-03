import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Compass, 
  Package, 
  Sparkles, 
  FileCheck, 
  History, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  UserCheck,
  ShieldCheck
} from "lucide-react";

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout, hasRole } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigation = [
    {
      section: "INTELLIGENCE",
      items: [
        { name: "Executive Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["executive", "analyst", "reviewer", "admin"] },
        { name: "Market Explorer", path: "/market-explorer", icon: Compass, roles: ["executive", "analyst", "reviewer", "admin"] },
        { name: "Products Catalog", path: "/products", icon: Package, roles: ["executive", "analyst", "reviewer", "admin"] },
        { name: "Ask Intelligence", path: "/ask", icon: Sparkles, roles: ["executive", "analyst", "reviewer", "admin"] },
      ]
    },
    {
      section: "GOVERNANCE",
      items: [
        { name: "Review Queue", path: "/review", icon: FileCheck, roles: ["reviewer", "admin"] },
        { name: "Audit Trail", path: "/audit", icon: History, roles: ["reviewer", "admin"] },
      ]
    },
    {
      section: "DATA",
      items: [
        { name: "Data Sources", path: "/sources", icon: Database, roles: ["executive", "analyst", "reviewer", "admin"] },
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white font-bold shadow-md shadow-violet-100">
            M
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 tracking-tight">MarketPulse AI</span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Trend Assistant</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigation.map((group) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(item => hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.section} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {group.section}
                </h3>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? "bg-violet-50 text-violet-700 font-semibold border-l-2 border-violet-600 rounded-l-none" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-3 space-y-3">
        {/* Data fresh indicator */}
        {!collapsed && (
          <div className="rounded-lg bg-slate-100 p-2 text-[11px] text-slate-500 font-medium space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              System Active
            </div>
            <div>Workspace: Synced</div>
            <div className="text-[10px] text-violet-600 font-bold uppercase tracking-wider">Production Portal</div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center justify-between ${collapsed ? "flex-col gap-2" : ""}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold text-sm">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-800 truncate">{user?.full_name}</span>
                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium capitalize">
                  <ShieldCheck className="h-3 w-3 text-violet-500 shrink-0" />
                  {user?.role}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Log Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-red-650" />
          </button>
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none">
          <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-6 shadow-xl space-y-4 animate-scale-in">
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 tracking-tight">Confirm Logout</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you want to end your current session and return to the login screen?
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-750 cursor-pointer shadow-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
