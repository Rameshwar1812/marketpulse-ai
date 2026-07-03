import React, { useState, useEffect } from "react";
import { 
  Filter, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  Activity, 
  AlertCircle,
  FolderOpen,
  PieChart as PieIcon,
  Tag,
  LineChart as LineIcon
} from "lucide-react";
import { api } from "../services/api";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { Drawer } from "../components/common/Drawer";
import { IngredientChart } from "../components/charts/IngredientChart";
import { MarketDistributionChart } from "../components/charts/MarketDistributionChart";
import { getCategoryColor } from "../utils/colors";
import { formatCurrency, formatPercent } from "../utils/formatters";

export const MarketExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [claims, setClaims] = useState([]);
  
  // Filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("all");
  
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);
  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState(null);
  const [interpretingAI, setInterpretingAI] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [ov, cats, ings, cls] = await Promise.all([
        api.get("/api/market/overview"),
        api.get("/api/market/categories"),
        api.get("/api/market/ingredients"),
        api.get("/api/market/claims")
      ]);
      setOverview(ov);
      setCategories(cats);
      setIngredients(ings);
      setClaims(cls);
    } catch (e) {
      setError(e.message || "Failed to retrieve market explorer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryClick = async (catId, catName) => {
    setDrawerOpen(true);
    setLoadingCategoryDetail(true);
    setAiInterpretation(null);
    setSelectedCategoryDetail(null);
    try {
      const detail = await api.get(`/api/market/category/${catId}`);
      setSelectedCategoryDetail(detail);
    } catch (e) {
      console.error("Failed to load category detail", e);
    } finally {
      setLoadingCategoryDetail(false);
    }
  };

  const handleInterpretCategory = async (catId) => {
    setInterpretingAI(true);
    try {
      const interpretation = await api.post(`/api/market/category/${catId}/interpret`);
      setAiInterpretation(interpretation);
    } catch (e) {
      console.error("AI interpretation failed", e);
    } finally {
      setInterpretingAI(false);
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500 gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        Compiling market landscape...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Segmentation</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Explore the market from category signal to product evidence.</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Analyze benefit category distributions, claims frequency, and hero ingredient penetration rates.
        </p>
      </div>

      <DemoDataNotice />

      {/* Sticky Filter Toolbar */}
      <div className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-600 uppercase">Filters</span>
          
          <select 
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div className="text-[10px] text-slate-400 font-semibold">
          Showing data aggregated across {overview?.total_products} products
        </div>
      </div>

      {/* Two Column Layout: Left Table / Right Segment Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Market Coverage Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Coverage Summary</h3>
            <p className="text-sm font-bold text-slate-800">Benefit Categories Matrix</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 pl-3">Category</th>
                  <th className="py-3 text-right">Products</th>
                  <th className="py-3 text-right">Revenue volume</th>
                  <th className="py-3 text-right">Avg Momentum</th>
                  <th className="py-3 pr-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {overview?.coverage_details.map((cov) => {
                  const catMatch = categories.find(c => c.name.toLowerCase() === cov.category_name.toLowerCase());
                  return (
                    <tr 
                      key={cov.category_name} 
                      className="hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => catMatch && handleCategoryClick(catMatch.id, catMatch.name)}
                    >
                      <td className="py-3 pl-3 font-bold text-slate-800 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(cov.category_name) }}></span>
                        {cov.category_name}
                      </td>
                      <td className="py-3 text-right text-slate-700 font-semibold">{cov.product_count} products</td>
                      <td className="py-3 text-right">{formatCurrency(cov.revenue)}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center rounded-sm bg-indigo-50 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 border border-indigo-150">
                          {cov.momentum}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <button className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          Analyze <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Ingredient & Claims Frequency */}
        <div className="space-y-6">
          {/* Ingredient frequencies */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingredient Signals</h3>
              <p className="text-sm font-bold text-slate-800">Top Hero Formulation Counts</p>
            </div>
            <IngredientChart data={ingredients} />
          </div>

          {/* Claims frequencies */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claims Frequencies</h3>
              <p className="text-sm font-bold text-slate-800">Top Extracted Benefit Claims</p>
            </div>
            <MarketDistributionChart data={claims} />
          </div>
        </div>
      </div>

      {/* Category In-Drawer Details */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedCategoryDetail ? `Category Analysis: ${selectedCategoryDetail.name}` : "Loading Detail..."}
        subtitle={selectedCategoryDetail ? "Structured segment metrics & AI interpretation" : ""}
        size="lg"
      >
        {loadingCategoryDetail ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-500 gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            Retrieving category indices...
          </div>
        ) : selectedCategoryDetail ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {selectedCategoryDetail.description}
              </p>
            </div>

            {/* In-drawer Category KPI stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-150 p-3 text-center bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products</span>
                <p className="text-lg font-black text-slate-800 mt-1">{selectedCategoryDetail.product_count}</p>
              </div>
              <div className="rounded-lg border border-slate-150 p-3 text-center bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
                <p className="text-sm font-bold text-slate-800 mt-1.5 truncate">{formatCurrency(selectedCategoryDetail.total_revenue)}</p>
              </div>
              <div className="rounded-lg border border-slate-150 p-3 text-center bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Momentum</span>
                <p className="text-lg font-black text-indigo-600 mt-1">{selectedCategoryDetail.avg_momentum}</p>
              </div>
            </div>

            {/* Top Products in drawer list */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Performing Products</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {selectedCategoryDetail.top_products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 text-xs font-semibold text-slate-700">
                    <div>
                      <div className="text-slate-900 font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.brand_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-800">{formatCurrency(p.revenue)}</div>
                      <div className="text-[10px] text-indigo-600">Momentum: {p.momentum}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top ingredients & claims badges list */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Ingredients</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategoryDetail.top_ingredients.map((i) => (
                    <span key={i.name} className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {i.name} ({i.count})
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Claims</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategoryDetail.top_claims.map((c) => (
                    <span key={c.claim} className="rounded-md bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      "{c.claim}" ({c.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Interpret Category Gemini integration block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Gemini Segment Analysis</span>
                </div>
                <button
                  onClick={() => handleInterpretCategory(selectedCategoryDetail.id)}
                  disabled={interpretingAI}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Interpret Segment
                </button>
              </div>

              {interpretingAI ? (
                <div className="flex h-32 items-center justify-center text-xs text-slate-500 gap-2 border border-dashed border-slate-200 rounded-lg">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                  Querying Gemini 2.5 Flash...
                </div>
              ) : aiInterpretation ? (
                <div className="rounded-lg border border-indigo-150 bg-indigo-50/10 p-4 space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">AI Executive Interpretation</span>
                    <p className="font-semibold text-slate-700 leading-relaxed italic">
                      "{aiInterpretation.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Growth Niches</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                        {aiInterpretation.growth_opportunities.map((o, idx) => <li key={idx}>{o}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Key Drivers</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                        {aiInterpretation.key_drivers.map((d, idx) => <li key={idx}>{d}</li>)}
                      </ul>
                    </div>
                  </div>

                  {aiInterpretation.underrepresented_claims && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 text-amber-800 font-semibold leading-relaxed">
                      <strong>Gap Analysis Opportunity:</strong> Underrepresented claims include: {aiInterpretation.underrepresented_claims.join(", ")}.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-semibold">
                  Click 'Interpret Segment' to generate dynamic growth findings, underserved niches, and category gaps from Gemini.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};
export default MarketExplorer;
