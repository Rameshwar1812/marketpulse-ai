import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Sparkles, Bell, User, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "../../services/api";

export const Header = ({ onSearchClick }) => {
  const location = useLocation();
  const [aiStatus, setAiStatus] = useState({ configured: false, checked: false });

  // Fetch health check on load to see if Gemini is configured
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get("/health");
        setAiStatus({ configured: res.gemini_configured, checked: true });
      } catch (e) {
        setAiStatus({ configured: false, checked: true });
      }
    };
    checkHealth();
  }, []);

  // Compute breadcrumbs from path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/dashboard") return ["Intelligence", "Executive Overview"];
    if (path === "/market-explorer") return ["Intelligence", "Market Explorer"];
    if (path === "/products") return ["Intelligence", "Products Catalog"];
    if (path.startsWith("/products/")) return ["Intelligence", "Products", "Product Details"];
    if (path === "/ask") return ["Intelligence", "Ask Intelligence"];
    if (path === "/review") return ["Governance", "Review Queue"];
    if (path === "/audit") return ["Governance", "Audit Trail"];
    if (path === "/sources") return ["Data Ingestion", "Data Sources"];
    return ["MarketPulse AI"];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb}>
            {idx > 0 && <span className="text-slate-300">/</span>}
            <span className={idx === breadcrumbs.length - 1 ? "text-slate-800 font-bold" : ""}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-4">
        {/* Mock Search trigger */}
        <div 
          onClick={onSearchClick}
          className="relative flex w-64 items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search workspace...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-bold text-slate-400">
            Ctrl K
          </kbd>
        </div>

        {/* AI Status Indicator */}
        {aiStatus.checked && (
          <div 
            title={aiStatus.configured ? "AI Engine connected and ready." : "AI configuration missing. Running in offline mode."}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              aiStatus.configured 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${aiStatus.configured ? "animate-pulse" : ""}`} />
            <span>AI: {aiStatus.configured ? "Ready" : "Offline"}</span>
          </div>
        )}

        {/* Notifications Mock */}
        <button 
          title="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-600"></span>
        </button>
      </div>
    </header>
  );
};
export default Header;
