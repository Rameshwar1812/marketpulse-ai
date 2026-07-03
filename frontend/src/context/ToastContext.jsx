import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    // Allow animation to run (300ms) before actual deletion from array
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, isExiting: false }]);

    // Trigger exit animation before duration ends
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);
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
      <div className="fixed top-6 right-6 z-55 flex flex-col gap-3 max-w-sm w-full select-none pointer-events-none overflow-hidden">
        {toasts.map((t) => {
          let bgColor = "bg-violet-600/30 backdrop-blur-md border-slate-200/50 text-violet-950";
          let icon = <Info className="h-4.5 w-4.5 text-violet-700 shrink-0" />;
          
          if (t.type === "success") {
            bgColor = "bg-violet-600/30 backdrop-blur-md border-emerald-500/40 text-violet-950 shadow-lg shadow-emerald-500/5";
            icon = <CheckCircle className="h-4.5 w-4.5 text-emerald-700 shrink-0" />;
          } else if (t.type === "error") {
            bgColor = "bg-violet-600/30 backdrop-blur-md border-rose-500/40 text-violet-950 shadow-lg shadow-rose-500/5";
            icon = <AlertTriangle className="h-4.5 w-4.5 text-rose-700 shrink-0" />;
          } else if (t.type === "info") {
            bgColor = "bg-violet-600/30 backdrop-blur-md border-violet-500/40 text-violet-950 shadow-lg shadow-violet-500/5";
            icon = <Info className="h-4.5 w-4.5 text-violet-700 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg pointer-events-auto transition-all duration-300 ease-out ${
                t.isExiting ? "animate-toast-exit" : "animate-toast-enter"
              } ${bgColor}`}
            >
              {icon}
              <div className="flex-1 text-xs font-semibold leading-normal">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 transition-colors"
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
