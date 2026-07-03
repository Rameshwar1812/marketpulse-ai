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
import { formatCurrency } from "../../utils/formatters";

export const CategoryRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-slate-400">No category opportunity records</div>;
  }

  // Format data for Recharts
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: item.total_revenue,
    productCount: item.product_count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-slate-800">{dataPoint.name}</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Revenue: <span className="text-slate-800 font-bold">{formatCurrency(dataPoint.value)}</span></p>
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
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`} 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={11} 
            fontWeight="bold"
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default CategoryRevenueChart;
