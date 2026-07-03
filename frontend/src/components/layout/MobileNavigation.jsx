import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Compass, 
  Package, 
  Sparkles, 
  FileCheck 
} from "lucide-react";

export const MobileNavigation = () => {
  const { user, hasRole } = useAuth();

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard, roles: ["executive", "analyst", "reviewer", "admin"] },
    { name: "Explore", path: "/market-explorer", icon: Compass, roles: ["executive", "analyst", "reviewer", "admin"] },
    { name: "Products", path: "/products", icon: Package, roles: ["executive", "analyst", "reviewer", "admin"] },
    { name: "Ask AI", path: "/ask", icon: Sparkles, roles: ["executive", "analyst", "reviewer", "admin"] },
    { name: "Review", path: "/review", icon: FileCheck, roles: ["reviewer", "admin"] }
  ];

  const visibleItems = navItems.filter(item => hasRole(item.roles));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-14 border-t border-slate-200 bg-white md:hidden items-center justify-around px-2 pb-safe shadow-lg">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-bold ${
              isActive 
                ? "text-violet-650" 
                : "text-slate-500 hover:text-slate-800"
            }`
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="mt-0.5 tracking-tight">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};
export default MobileNavigation;
