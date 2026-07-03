import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/30 p-8 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-800">Operational Error Encountered</h3>
      <p className="mt-2 text-xs text-slate-500 max-w-sm font-medium">
        {message || "We ran into an issue retrieving market intelligence indices from the database."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
export default ErrorState;
