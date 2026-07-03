import React from "react";
import { AlertCircle } from "lucide-react";

export const DemoDataNotice = ({ className }) => {
  return (
    <div 
      className={`flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 text-xs text-indigo-700 font-medium ${className}`}
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-indigo-600 animate-pulse" />
      <span>
        <strong>Demonstration environment:</strong> Demonstration data — illustrative, not actual market data.
      </span>
    </div>
  );
};
export default DemoDataNotice;
