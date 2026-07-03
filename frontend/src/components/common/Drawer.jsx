import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Drawer = ({ isOpen, onClose, title, subtitle, children, size = "md" }) => {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl"
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Drawer viewport */}
      <div 
        className={`relative flex h-full w-full ${sizeClasses[size] || sizeClasses.md} flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Drawer;
