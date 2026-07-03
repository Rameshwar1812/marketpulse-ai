import React from "react";

export const StatusBadge = ({ status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "overridden":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "sent_back":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getLabel = () => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Review";
      case "overridden":
        return "Overridden";
      case "sent_back":
        return "Sent Back";
      default:
        return status || "Unknown";
    }
  };

  return (
    <span 
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${getColors()}`}
    >
      {getLabel()}
    </span>
  );
};
export default StatusBadge;
