import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, "success", dur),
    error: (msg, dur) => showToast(msg, "error", dur),
    info: (msg, dur) => showToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container positioned in the top right corner */}
      <div className="fixed top-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full select-none pointer-events-none">
        {toasts.map((t) => {
          let bgColor = "bg-white border-slate-200 text-slate-800";
          let icon = <Info className="h-4.5 w-4.5 text-violet-500 shrink-0" />;
          
          if (t.type === "success") {
            bgColor = "bg-[#1a0129] border-violet-800/40 text-white shadow-xl shadow-violet-950/10";
            icon = <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />;
          } else if (t.type === "error") {
            bgColor = "bg-[#11001c] border-rose-900/40 text-white shadow-xl shadow-rose-950/10";
            icon = <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />;
          } else if (t.type === "info") {
            bgColor = "bg-[#1a0129] border-violet-850/40 text-white shadow-xl shadow-violet-950/10";
            icon = <Info className="h-4.5 w-4.5 text-violet-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto transition-all duration-300 ease-out animate-slide-in-top ${bgColor}`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold leading-normal">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
