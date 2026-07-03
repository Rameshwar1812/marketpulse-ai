import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

export const IngredientChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-slate-400">No ingredient signals recorded</div>;
  }

  // Format data for Recharts (limit to top 8 for space)
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.ingredient_name,
    "Product Presence": item.product_count,
    "Hero Formulation": item.hero_count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-slate-800">{payload[0].payload.name}</p>
          <div className="mt-1 space-y-0.5 text-[11px] font-medium text-slate-500">
            <p>Total Products: <span className="text-slate-800 font-bold">{payload[0].payload["Product Presence"]}</span></p>
            <p>Hero Formulation: <span className="text-violet-600 font-bold">{payload[0].payload["Hero Formulation"]}</span></p>
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
          margin={{ top: 10, right: 20, left: 60, bottom: 5 }}
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
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconSize={10} 
            iconType="circle"
            wrapperStyle={{ fontSize: "10px", fontWeight: "600" }} 
          />
          <Bar dataKey="Product Presence" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={8} />
          <Bar dataKey="Hero Formulation" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default IngredientChart;
