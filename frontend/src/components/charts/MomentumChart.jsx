import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { getCategoryColor } from "../../utils/colors";

export const MomentumChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-slate-400">No category momentum records</div>;
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.category_name,
    momentum: item.avg_momentum,
    productCount: item.product_count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-slate-800">{dataPoint.name}</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Avg Momentum: <span className="text-indigo-600 font-bold">{dataPoint.momentum}/10</span></p>
            <p>Products: <span className="text-slate-800 font-semibold">{dataPoint.productCount}</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={9} 
            fontWeight="semibold"
            tickLine={false} 
            tickFormatter={(val) => val.split(" & ")[0]} // Shorten names for XAxis
          />
          <YAxis 
            domain={[0, 10]} 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="momentum" radius={[4, 4, 0, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default MomentumChart;
