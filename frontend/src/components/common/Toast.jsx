import React, { useEffect } from "react";
import { CheckCircle, AlertOctagon, X } from "lucide-react";

export const Toast = ({ message, type = "success", show, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (show && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed right-6 bottom-6 z-50 flex max-w-sm items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xl animate-slide-up">
      {type === "success" ? (
        <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
      ) : (
        <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />
      )}
      
      <p className="text-xs font-semibold text-slate-700 flex-1">{message}</p>
      
      <button 
        onClick={onClose}
        className="rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
export default Toast;
