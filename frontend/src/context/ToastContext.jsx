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
      {/* Toast Container positioned in the bottom right corner */}
      <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full select-none pointer-events-none">
        {toasts.map((t) => {
          let bgColor = "bg-white border-slate-200 text-slate-800";
          let icon = <Info className="h-4.5 w-4.5 text-violet-500 shrink-0" />;
          
          if (t.type === "success") {
            bgColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
            icon = <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />;
          } else if (t.type === "error") {
            bgColor = "bg-rose-50 border-rose-200 text-rose-800";
            icon = <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0" />;
          } else if (t.type === "info") {
            bgColor = "bg-violet-50 border-violet-200 text-violet-800";
            icon = <Info className="h-4.5 w-4.5 text-violet-600 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto transition-all duration-300 ease-out animate-slide-in ${bgColor}`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold leading-normal">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 transition-colors"
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
