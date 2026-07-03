import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Navigation, X, Package, ArrowRight } from "lucide-react";
import { api } from "../../services/api";

export const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setProducts([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Fetch matching products as user types
  useEffect(() => {
    if (!query) {
      setProducts([]);
      return;
    }
    const searchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
        setProducts(res.products || []);
      } catch (e) {
        console.error("Failed to query products for palette", e);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(searchProducts, 200);
    return () => clearTimeout(handler);
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleAskQuestion = (question) => {
    navigate(`/ask?q=${encodeURIComponent(question)}`);
    onClose();
  };

  const suggestions = [
    "Where is category momentum accelerating?",
    "Which ingredients dominate sleep positioning?",
    "Where are low-presence, high-momentum opportunities?",
    "Which products combine energy and cognitive positioning?"
  ];

  const quickLinks = [
    { name: "Executive Dashboard", path: "/dashboard" },
    { name: "Market Explorer Workspace", path: "/market-explorer" },
    { name: "Products Catalog Catalog", path: "/products" },
    { name: "Ask Gemini Intelligence", path: "/ask" },
    { name: "Review Pending Classifications", path: "/review" },
    { name: "Data Ingestion Sources", path: "/sources" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-4 pt-20 backdrop-blur-xs">
      {/* Overlay click */}
      <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

      {/* Palette Container */}
      <div className="relative flex w-full max-w-xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl transition-all">
        {/* Search bar header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, products, or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-hidden"
          />
          <button 
            onClick={onClose} 
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Dynamic Product Search Results */}
          {query && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matching Products</h4>
              {loading ? (
                <div className="py-2 text-xs text-slate-500">Searching products...</div>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate(`/products/${p.id}`)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-500" />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand_name} &bull; {p.category_name}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                ))
              ) : (
                <div className="py-2 text-xs text-slate-400">No products found matching "{query}"</div>
              )}
            </div>
          )}

          {/* Quick Navigation Links */}
          {!query && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</h4>
              <div className="grid grid-cols-2 gap-1">
                {quickLinks.map((link) => (
                  <div
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-100 border border-transparent cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{link.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Analysis (Gemini)</h4>
            <div className="space-y-1">
              {suggestions.map((s) => (
                <div
                  key={s}
                  onClick={() => handleAskQuestion(s)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-700 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[10px] font-medium text-slate-400 rounded-b-xl">
          <span>Search using natural language</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
export default CommandPalette;
