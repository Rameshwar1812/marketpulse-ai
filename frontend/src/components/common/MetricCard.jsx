import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export const MetricCard = ({ title, value, subtext, trend, trendValue, icon: Icon, className }) => {
  const renderTrend = () => {
    if (trend === "up") {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          <ArrowUpRight className="h-3 w-3" />
          {trendValue}
        </span>
      );
    }
    if (trend === "down") {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
          <ArrowDownRight className="h-3 w-3" />
          {trendValue}
        </span>
      );
    }
    if (trend === "neutral") {
      return (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
          <Minus className="h-3 w-3" />
          {trendValue}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="h-4 w-4 shrink-0" />
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-1">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          {renderTrend()}
          <span>{subtext}</span>
        </div>
      </div>
    </div>
  );
};
export default MetricCard;
