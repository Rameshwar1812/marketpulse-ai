import React from "react";

export const LoadingSkeleton = ({ type = "card", count = 3 }) => {
  const renderItem = (idx) => {
    if (type === "table") {
      return (
        <tr key={idx} className="animate-pulse border-b border-slate-100">
          <td className="py-4 pl-4"><div className="h-4 w-24 rounded bg-slate-200"></div></td>
          <td className="py-4"><div className="h-4 w-32 rounded bg-slate-200"></div></td>
          <td className="py-4"><div className="h-4 w-16 rounded bg-slate-200"></div></td>
          <td className="py-4"><div className="h-4 w-20 rounded bg-slate-200"></div></td>
          <td className="py-4 pr-4"><div className="h-4 w-12 rounded bg-slate-200"></div></td>
        </tr>
      );
    }
    
    if (type === "chart") {
      return (
        <div key={idx} className="flex h-64 w-full animate-pulse items-end gap-2 rounded-xl border border-slate-100 bg-white p-4">
          <div className="h-1/3 w-full rounded-t bg-slate-100"></div>
          <div className="h-2/3 w-full rounded-t bg-slate-100"></div>
          <div className="h-1/2 w-full rounded-t bg-slate-100"></div>
          <div className="h-4/5 w-full rounded-t bg-slate-100"></div>
          <div className="h-1/4 w-full rounded-t bg-slate-100"></div>
        </div>
      );
    }

    return (
      <div key={idx} className="flex flex-col gap-3 rounded-xl border border-slate-150 bg-white p-5 shadow-xs animate-pulse">
        <div className="flex justify-between">
          <div className="h-3 w-1/3 rounded bg-slate-200"></div>
          <div className="h-7 w-7 rounded bg-slate-200"></div>
        </div>
        <div className="h-6 w-1/2 rounded bg-slate-200 mt-2"></div>
        <div className="h-3.5 w-2/3 rounded bg-slate-200 mt-1"></div>
      </div>
    );
  };

  if (type === "table") {
    return (
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
        </tbody>
      </table>
    );
  }

  return (
    <div className={`grid gap-4 ${type === "chart" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
      {Array.from({ length: count }).map((_, idx) => renderItem(idx))}
    </div>
  );
};
export default LoadingSkeleton;
