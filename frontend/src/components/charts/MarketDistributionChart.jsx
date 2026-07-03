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

export const MarketDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-slate-400">No claims frequency records</div>;
  }

  // Format data for Recharts (limit to top 8 claims for readability)
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.claim,
    category: item.category_name,
    count: item.count,
    confidence: item.avg_confidence
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg max-w-xs">
          <p className="text-xs font-bold text-slate-800 leading-snug">"{dataPoint.name}"</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Category: <span className="text-slate-800 font-semibold">{dataPoint.category}</span></p>
            <p>Occurrences: <span className="text-violet-600 font-bold">{dataPoint.count}</span></p>
            <p>Extraction Confidence: <span className="text-slate-800 font-semibold">{(dataPoint.confidence * 100).toFixed(0)}%</span></p>
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
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#475569" 
            fontSize={10} 
            fontWeight="bold"
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default MarketDistributionChart;
