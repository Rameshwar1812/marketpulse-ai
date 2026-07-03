import React from "react";
import { HelpCircle } from "lucide-react";

export const EmptyState = ({ title, description, icon: Icon }) => {
  const StateIcon = Icon || HelpCircle;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <StateIcon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-700">{title || "No data records found"}</h3>
      <p className="mt-2 text-xs text-slate-500 max-w-xs font-semibold">
        {description || "Adjust your query filter parameters or upload new product catalog sources to begin analysis."}
      </p>
    </div>
  );
};
export default EmptyState;
