import React from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Label,
  Cell
} from "recharts";
import { getCategoryColor } from "../../utils/colors";
import { formatCurrency } from "../../utils/formatters";

export const OpportunityMatrix = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-slate-400">No opportunity matrix records</div>;
  }

  // Format data for Recharts scatter plot
  // We need to map category lists. Let's merge details if we have them.
  // Wait! In the dashboard endpoint, we get category-opportunity (revenue) and momentum.
  // We can merge them by category name!
  // Let's write a robust merge in the component in case data is passed separately or pre-merged.
  const chartData = data.map((item) => ({
    name: item.category_name || item.name,
    x: item.total_revenue || item.revenue || 0,
    y: item.avg_momentum || item.momentum || 0,
    productCount: item.product_count || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-slate-800">{dataPoint.name}</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Illustrative Revenue: <span className="text-slate-800 font-bold">{formatCurrency(dataPoint.x)}</span></p>
            <p>Avg Momentum: <span className="text-violet-600 font-bold">{dataPoint.y}/10</span></p>
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
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Revenue" 
            tickFormatter={(val) => `$${(val / 1e6).toFixed(1)}M`}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
          >
            <Label value="Illustrative Revenue (Market Presence)" offset={-10} position="insideBottom" fill="#64748b" fontSize={10} fontWeight="bold" />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Momentum" 
            domain={[0, 10]}
            stroke="#94a3b8"
            fontSize={10}
            tickLine={false}
          >
            <Label value="Average Momentum Score" angle={-90} position="insideLeft" offset={0} fill="#64748b" fontSize={10} fontWeight="bold" />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Categories" data={chartData} fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} r={10} className="cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
export default OpportunityMatrix;
