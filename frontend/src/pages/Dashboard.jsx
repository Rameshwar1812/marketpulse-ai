import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Package, 
  Tags, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";
import { api } from "../services/api";
import { MetricCard } from "../components/common/MetricCard";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { CategoryRevenueChart } from "../components/charts/CategoryRevenueChart";
import { MomentumChart } from "../components/charts/MomentumChart";
import { OpportunityMatrix } from "../components/charts/OpportunityMatrix";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { ErrorState } from "../components/common/ErrorState";
import { formatCurrency, formatPercent } from "../utils/formatters";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [error, setError] = useState("");
  
  // Data states
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [momentumData, setMomentumData] = useState([]);
  const [signalsData, setSignalsData] = useState([]);
  const [insights, setInsights] = useState([]);

  const loadData = async (forceRefreshInsights = false) => {
    setLoading(true);
    setError("");
    try {
      // Parallel fetches
      const [summary, rev, mom, sigs] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/dashboard/category-opportunity"),
        api.get("/api/dashboard/momentum"),
        api.get("/api/dashboard/emerging-signals")
      ]);

      setSummaryMetrics(summary);
      setRevenueData(rev);
      setMomentumData(mom);
      setSignalsData(sigs);

      // Load insights
      if (forceRefreshInsights) {
        setRefreshingAI(true);
        const freshInsights = await api.post("/api/dashboard/executive-insights/refresh");
        setInsights(freshInsights);
      } else {
        const cachedInsights = await api.get("/api/dashboard/executive-insights");
        setInsights(cachedInsights);
      }
    } catch (e) {
      setError(e.message || "Failed to load dashboard data. Verify backend connection.");
    } finally {
      setLoading(false);
      setRefreshingAI(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefreshAI = async () => {
    setRefreshingAI(true);
    try {
      const freshInsights = await api.post("/api/dashboard/executive-insights/refresh");
      setInsights(freshInsights);
    } catch (e) {
      console.error("Failed to refresh AI insights", e);
    } finally {
      setRefreshingAI(false);
    }
  };

  if (loading && !summaryMetrics) {
    return <LoadingSkeleton type="card" count={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadData()} />;
  }

  // Merge revenue and momentum for the Opportunity Matrix
  const opportunityMatrixData = revenueData.map((revItem) => {
    const momItem = momentumData.find(m => m.category_id === revItem.category_id) || {};
    return {
      category_id: revItem.category_id,
      category_name: revItem.category_name,
      total_revenue: revItem.total_revenue,
      product_count: revItem.product_count,
      avg_momentum: momItem.avg_momentum || 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Market Intelligence Overview</span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Where is the market moving — and where should we look next?</h1>
          <p className="text-xs text-slate-500 font-semibold">
            A continuously refreshable view of category momentum, product positioning, and emerging market signals.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadData(true)}
            disabled={refreshingAI}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button 
            onClick={() => navigate("/ask")}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-700 cursor-pointer shadow-md shadow-violet-100"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask AI
          </button>
        </div>
      </div>

      <DemoDataNotice />

      {/* KPI Strip */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          <MetricCard 
            title="Products" 
            value={summaryMetrics.products_analyzed} 
            subtext="active dataset" 
            icon={Package} 
          />
          <MetricCard 
            title="Categories" 
            value={summaryMetrics.benefit_categories} 
            subtext="health mapping" 
            icon={Tags} 
          />
          <MetricCard 
            title="Claims Extracted" 
            value={summaryMetrics.claims_extracted} 
            subtext="packaging sources" 
            icon={TrendingUp} 
          />
          <MetricCard 
            title="Hero Ingredients" 
            value={summaryMetrics.hero_ingredients} 
            subtext="formulations" 
            icon={TrendingUp} 
          />
          <MetricCard 
            title="Baseline Effort" 
            value={`${summaryMetrics.annual_manual_effort_baseline} hrs`} 
            subtext="manual workload baseline" 
            icon={Clock} 
          />
          <MetricCard 
            title="Automation Saving" 
            value={`${summaryMetrics.illustrative_automation_saving} hrs`} 
            subtext="80% workload reduction" 
            trend="up"
            trendValue="Saved"
            icon={Clock} 
            className="bg-emerald-50/20 border-emerald-100"
          />
        </div>
      )}

      {/* Main Grid: Opportunity Landscape vs AI Executive Brief */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Revenue opportunity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opportunity Landscape</h3>
            <p className="text-sm font-bold text-slate-800">Benefit Category Revenue Volume</p>
          </div>
          <CategoryRevenueChart data={revenueData} />
        </div>

        {/* AI Executive Brief */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-violet-600 uppercase tracking-wider">AI Executive Brief</h3>
              <p className="text-sm font-bold text-slate-800">AI Synthesis Observations</p>
            </div>
            <button 
              onClick={handleRefreshAI}
              disabled={refreshingAI}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600 transition-colors shadow-xs cursor-pointer"
              title="Recalculate Insights"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[260px] pr-1">
            {refreshingAI ? (
              <div className="flex h-32 items-center justify-center text-xs text-slate-500 gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
                Analyzing market signals...
              </div>
            ) : insights.length > 0 ? (
              insights.map((ins) => (
                <div key={ins.number} className="flex gap-3 items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-[10px] font-bold text-violet-600">
                    {ins.number}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{ins.headline}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold leading-normal">{ins.explanation}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-sm border border-emerald-100">
                        {(ins.confidence * 100).toFixed(0)}% confidence
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {ins.evidence_count} evidence items
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                No observations compiled. Click refresh to query the AI engine.
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate("/ask")}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-all cursor-pointer"
          >
            <span>Ask follow-up questions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Category Momentum Chart & Emerging Signals */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Momentum score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Velocity</h3>
            <p className="text-sm font-bold text-slate-800">Average Momentum Index (0-10)</p>
          </div>
          <MomentumChart data={momentumData} />
        </div>

        {/* Emerging signals table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emerging Signals</h3>
            <p className="text-sm font-bold text-slate-800">High Growth / Low market footprint niches</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2 pl-2">Product</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Revenue</th>
                  <th className="py-2 pr-2 text-right">Momentum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {signalsData.map((sig) => (
                  <tr key={sig.product_id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => navigate(`/products/${sig.product_id}`)}>
                    <td className="py-2.5 pl-2 font-bold text-slate-800">
                      <div>{sig.product_name}</div>
                      <div className="text-[9px] text-slate-400 font-semibold">{sig.brand_name}</div>
                    </td>
                    <td className="py-2.5 text-slate-500 text-[11px]">{sig.category_name}</td>
                    <td className="py-2.5 text-[11px]">{formatCurrency(sig.revenue)}</td>
                    <td className="py-2.5 pr-2 text-right">
                      <span className="inline-flex items-center rounded-sm bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-150">
                        {sig.momentum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => navigate("/market-explorer")}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
          >
            <span>Explore all signal filters</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Scatter Plot matrix & Market Coverage list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scatter Opportunity Matrix */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Mapping</h3>
            <p className="text-sm font-bold text-slate-800">Opportunity Matrix (Market Footprint vs. Velocity)</p>
          </div>
          <OpportunityMatrix data={opportunityMatrixData} />
        </div>

        {/* Market Coverage summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Validation Quality</h3>
            <p className="text-sm font-bold text-slate-800">AI Confidence Audit Coverage</p>
          </div>

          {summaryMetrics && (
            <div className="space-y-4 flex-1 mt-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-500">Average Classification Confidence</div>
                  <div className="text-[10px] text-slate-400 font-medium">Extracting claims accuracy</div>
                </div>
                <div className="text-xl font-extrabold text-violet-600">
                  {formatPercent(summaryMetrics.avg_confidence)}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-500">Claims Mapped</div>
                  <div className="text-[10px] text-slate-400 font-medium">Ingredients linkages</div>
                </div>
                <div className="text-xl font-extrabold text-slate-850">
                  {summaryMetrics.claims_extracted}
                </div>
              </div>

              <div className="flex items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-500">Manual Refresh Savings</div>
                  <div className="text-[10px] text-slate-400 font-medium">Projected workload savings</div>
                </div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {summaryMetrics.automation_percentage}% Saved
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-violet-50/50 border border-violet-100 p-3 flex gap-2 items-start text-[11px] text-violet-700 font-medium leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-violet-600 mt-0.5" />
            <span>
              Low classification confidence items (&lt;70%) are automatically routed to the Compliance Review Queue.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
