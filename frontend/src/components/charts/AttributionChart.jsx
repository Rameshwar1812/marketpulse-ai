import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

export const AttributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-48 items-center justify-center text-xs text-slate-400">No revenue attribution data</div>;
  }

  // Map Recharts input
  const chartData = data.map((item) => ({
    name: item.normalized_claim || item.raw_text,
    value: item.attributed_revenue,
    weight: item.weight
  }));

  // Restrained premium palette for attribution slices
  const COLORS = ["#4f46e5", "#0d9488", "#3b82f6", "#a855f7", "#ec4899", "#f97316"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg max-w-xs">
          <p className="text-xs font-bold text-slate-800 leading-snug">{dataPoint.name}</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Attributed Revenue: <span className="text-slate-800 font-bold">{formatCurrency(dataPoint.value)}</span></p>
            <p>Weight: <span className="text-indigo-600 font-semibold">{(dataPoint.weight * 100).toFixed(0)}%</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconSize={8} 
            iconType="circle"
            wrapperStyle={{ fontSize: "10px", fontWeight: "600", textOverflow: "ellipsis" }} 
            formatter={(value) => <span className="text-slate-600 inline-block max-w-[120px] truncate">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default AttributionChart;
