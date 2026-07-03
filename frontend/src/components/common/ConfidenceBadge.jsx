import React from "react";

export const ConfidenceBadge = ({ confidence }) => {
  // convert decimals to percentages if needed
  const percent = confidence <= 1.0 ? confidence * 100 : confidence;
  
  const getColors = () => {
    if (percent >= 85) {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (percent >= 70) {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-rose-50 text-rose-700 border-rose-100";
  };

  return (
    <span 
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold ${getColors()}`}
    >
      {percent.toFixed(0)}% Confidence
    </span>
  );
};
export default ConfidenceBadge;
