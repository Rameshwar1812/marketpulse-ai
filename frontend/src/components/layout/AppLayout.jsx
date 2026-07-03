import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { CommandPalette } from "./CommandPalette";

export const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("marketpulse_sidebar_collapsed") === "true";
  });
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Sync collapsed state
  useEffect(() => {
    localStorage.setItem("marketpulse_sidebar_collapsed", collapsed);
  }, [collapsed]);

  // Global keydown listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-14 md:pb-0">
      {/* Navigation Sidebar (hidden on mobile, shown on md and up) */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Main Panel */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "md:pl-16" : "md:pl-64"
        }`}
      >
        {/* Header bar */}
        <Header onSearchClick={() => setPaletteOpen(true)} />

        {/* Content viewport */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <MobileNavigation />

      {/* Unified Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};
export default AppLayout;
