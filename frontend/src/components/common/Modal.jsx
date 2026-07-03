import React, { useEffect } from "react";
import { X } from "lucide-react";

export const Modal = ({ isOpen, onClose, title, children }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-xs">
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        
        <div className="text-xs text-slate-600 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
