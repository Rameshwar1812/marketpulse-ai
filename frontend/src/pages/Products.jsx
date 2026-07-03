import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  ChevronDown 
} from "lucide-react";
import { api } from "../services/api";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { ConfidenceBadge } from "../components/common/ConfidenceBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { useDebounce } from "../hooks/useDebounce";
import { formatCurrency } from "../utils/formatters";
import { getCategoryColor } from "../utils/colors";

export const Products = () => {
  const navigate = useNavigate();

  // Loading/data states
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Grid/List toggle view modes
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("marketpulse_products_view_mode") || "table";
  });

  // Filter params state
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [sort, setSort] = useState("revenue_desc");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const debouncedSearch = useDebounce(search, 300);

  // Cache viewMode toggle
  useEffect(() => {
    localStorage.setItem("marketpulse_products_view_mode", viewMode);
  }, [viewMode]);

  // Load supporting lists
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [cats, ov] = await Promise.all([
          api.get("/api/market/categories"),
          api.get("/api/market/overview")
        ]);
        setCategories(cats);
        
        // Extract brands from categories coverage structure to avoid creating more endpoints
        // Seed script added 8 brands, we can fetch them or hardcode list since it's synthetic
        setBrands([
          { id: 1, name: "Northstar Wellness" },
          { id: 2, name: "VitaForge" },
          { id: 3, name: "WellSpring Labs" },
          { id: 4, name: "CoreBloom Nutrition" },
          { id: 5, name: "Elevate Health Co." },
          { id: 6, name: "Nurtura" },
          { id: 7, name: "BrightPath Wellness" },
          { id: 8, name: "EverPeak Nutrition" }
        ]);
      } catch (e) {
        console.error("Failed to load filter metrics", e);
      }
    };
    loadFilters();
  }, []);

  // Query products on filters adjust
  const loadProducts = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * LIMIT;
      let queryUrl = `/api/products?limit=${LIMIT}&offset=${offset}&sort=${sort}`;
      
      if (debouncedSearch) queryUrl += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (categoryId) queryUrl += `&category_id=${categoryId}`;
      if (brandId) queryUrl += `&brand_id=${brandId}`;
      if (minConfidence) queryUrl += `&min_confidence=${minConfidence}`;
      if (reviewStatus) queryUrl += `&review_status=${reviewStatus}`;

      const res = await api.get(queryUrl);
      setProducts(res.products || []);
      setTotal(res.total || 0);
    } catch (e) {
      console.error("Failed to fetch product list", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [debouncedSearch, categoryId, brandId, minConfidence, reviewStatus, sort, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, brandId, minConfidence, reviewStatus, sort]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Intelligence</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Explore product positioning through claims & ingredients.</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Search the catalog, view revenue attribution mappings, and review AI classification scores.
        </p>
      </div>

      <DemoDataNotice />

      {/* Toolbar Filter Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs outline-hidden focus:border-violet-600 focus:bg-white"
            />
          </div>

          {/* Right Toolbar: View mode toggler & Sorter */}
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-hidden focus:border-violet-600 cursor-pointer"
            >
              <option value="revenue_desc">Revenue: High to Low</option>
              <option value="revenue_asc">Revenue: Low to High</option>
              <option value="momentum_desc">Momentum: High to Low</option>
              <option value="momentum_asc">Momentum: Low to High</option>
              <option value="confidence_desc">AI Confidence: High to Low</option>
            </select>

            {/* View Mode Toggle Buttons */}
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50/50">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === "table" ? "bg-white text-violet-600 shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md cursor-pointer transition-colors ${viewMode === "grid" ? "bg-white text-violet-600 shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Eager filters strip */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            <Filter className="h-3 w-3" /> Filters:
          </span>

          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-slate-150 px-2 py-1 text-[11px] font-semibold text-slate-600 outline-hidden cursor-pointer"
          >
            <option value="">Category: All</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select 
            value={brandId} 
            onChange={(e) => setBrandId(e.target.value)}
            className="rounded-lg border border-slate-150 px-2 py-1 text-[11px] font-semibold text-slate-600 outline-hidden cursor-pointer"
          >
            <option value="">Brand: All</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <select 
            value={minConfidence} 
            onChange={(e) => setMinConfidence(e.target.value)}
            className="rounded-lg border border-slate-150 px-2 py-1 text-[11px] font-semibold text-slate-600 outline-hidden cursor-pointer"
          >
            <option value="">AI Confidence: Any</option>
            <option value="0.85">High (&gt;85%)</option>
            <option value="0.70">Medium (&gt;70%)</option>
            <option value="0.0">Low (&lt;70%)</option>
          </select>

          <select 
            value={reviewStatus} 
            onChange={(e) => setReviewStatus(e.target.value)}
            className="rounded-lg border border-slate-150 px-2 py-1 text-[11px] font-semibold text-slate-600 outline-hidden cursor-pointer"
          >
            <option value="">Review Status: All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="overridden">Overridden</option>
            <option value="sent_back">Sent Back</option>
          </select>
        </div>
      </div>

      {/* Grid or Table Results View */}
      {loading ? (
        <div className="py-12"><LoadingSkeleton type={viewMode === "table" ? "table" : "card"} count={viewMode === "table" ? 6 : 9} /></div>
      ) : products.length > 0 ? (
        <>
          {viewMode === "table" ? (
            /* Table View Mode */
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 pl-4">Product Name</th>
                      <th className="py-3.5">Category</th>
                      <th className="py-3.5 text-right">Illustrative Revenue</th>
                      <th className="py-3.5 text-right">Momentum</th>
                      <th className="py-3.5 text-center">AI Confidence</th>
                      <th className="py-3.5">Compliance Status</th>
                      <th className="py-3.5 pr-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {products.map((p) => (
                      <tr 
                        key={p.id} 
                        className="hover:bg-slate-50/50 cursor-pointer"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
                        <td className="py-4 pl-4 font-bold text-slate-800">
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{p.brand_name} &bull; {p.sku}</div>
                        </td>
                        <td className="py-4 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(p.category_name) }}></span>
                            {p.category_name}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-800 font-semibold">{formatCurrency(p.illustrative_revenue)}</td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center rounded-sm bg-violet-50 px-1.5 py-0.2 text-[10px] font-bold text-violet-700 border border-violet-150">
                            {p.momentum_score}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <ConfidenceBadge confidence={p.ai_confidence} />
                        </td>
                        <td className="py-4">
                          <StatusBadge status={p.review_status} />
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <button className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View Mode */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.id}`)}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:shadow-md hover:border-slate-350 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: getCategoryColor(p.category_name), backgroundColor: `${getCategoryColor(p.category_name)}15` }}>
                        {p.category_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{p.sku}</span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">{p.brand_name}</p>

                    {/* Claims list snippets */}
                    <div className="space-y-1 pt-1.5">
                      {p.claims.map((c, idx) => (
                        <div key={idx} className="rounded-md bg-slate-50 border border-slate-100 p-1.5 text-[10px] text-slate-500 font-semibold truncate">
                          "{c}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase">Revenue</div>
                      <div className="text-xs font-bold text-slate-800">{formatCurrency(p.illustrative_revenue)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase text-right">Momentum</div>
                      <div className="text-right">
                        <span className="rounded-sm bg-violet-50 px-1 py-0.2 text-[10px] font-bold text-violet-700">
                          {p.momentum_score}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <ConfidenceBadge confidence={p.ai_confidence} />
                    <StatusBadge status={p.review_status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs font-semibold text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{((page - 1) * LIMIT) + 1}</strong> to <strong className="text-slate-800">{Math.min(page * LIMIT, total)}</strong> of <strong className="text-slate-800">{total}</strong> products
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span>Page {page} of {totalPages}</span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-250 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 bg-white rounded-xl border border-slate-200">
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <span className="text-slate-400 font-bold">No products matched query filters.</span>
            <button 
              onClick={() => { setSearch(""); setCategoryId(""); setBrandId(""); setMinConfidence(""); setReviewStatus(""); }} 
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-violet-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Products;
