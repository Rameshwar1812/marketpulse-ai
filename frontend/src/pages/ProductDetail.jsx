import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Sparkles, 
  Package, 
  FileText, 
  Coins, 
  Award, 
  Activity, 
  AlertCircle,
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  History
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ConfidenceBadge } from "../components/common/ConfidenceBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { AttributionChart } from "../components/charts/AttributionChart";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { formatCurrency, formatPercent, formatDate } from "../utils/formatters";
import { getCategoryColor } from "../utils/colors";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [timeline, setTimeline] = useState([]);
  
  // AI analysis states
  const [classificationAnalysis, setClassificationAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  // General review queue states for this page
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    try {
      const [prod, line] = await Promise.all([
        api.get(`/api/products/${id}`),
        api.get(`/api/products/${id}/evidence`)
      ]);
      setProduct(prod);
      setTimeline(line);
    } catch (e) {
      console.error("Failed to load product details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const handleAnalyzeClassification = async () => {
    setAnalyzingAI(true);
    setClassificationAnalysis(null);
    try {
      const res = await api.post(`/api/products/${product.id}/analyze-classification`);
      setClassificationAnalysis(res);
      toast.success("AI reclassification analysis completed successfully.");
    } catch (e) {
      console.error("AI analysis failed", e);
      toast.error("Failed to run AI classification analysis.");
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleCreateReviewItem = async () => {
    setSubmittingReview(true);
    try {
      // Find if there is already a review record, else backend seeds or creates one
      // In this prototype, we'll hit reviews approve/send-back directly if user has rights, 
      // or flag it. Since seed.py creates reviews for some products, we can route reviewers:
      if (product.review_status === "pending") {
        navigate("/review");
      } else {
        toast.success("Compliance review request submitted. Queued for human governance.");
      }
    } catch (e) {
      console.error("Failed to request review", e);
      toast.error("Failed to submit compliance review request.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !product) {
    return <div className="py-12"><LoadingSkeleton type="card" count={3} /></div>;
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-xs text-slate-500 space-y-4">
        <p>Product not found.</p>
        <Link to="/products" className="text-indigo-600 font-bold underline">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and page headers */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Products Catalog
          </Link>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Intelligence Workspace</span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">SKU: {product.sku}</span>
              <span className="text-slate-350">|</span>
              <span className="text-xs font-bold text-slate-500">Brand: {product.brand_name}</span>
              <span className="text-slate-350">|</span>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: getCategoryColor(product.category_name), backgroundColor: `${getCategoryColor(product.category_name)}15` }}>
                {product.category_name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={product.ai_confidence} />
          <StatusBadge status={product.review_status} />
          
          <button
            onClick={handleCreateReviewItem}
            disabled={submittingReview}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
          >
            {product.review_status === "pending" ? "Resolve Review" : "Request Review"}
          </button>
        </div>
      </div>

      <DemoDataNotice />



      {/* Two Column Layout: Left Sticky details / Right detailed sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Left Sticky Column: Source Evidence */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Material</h3>
              <p className="text-sm font-bold text-slate-800">Packaging Evidence</p>
            </div>

            {/* Simulated product layout box */}
            <div className="aspect-square w-full rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
              <Package className="h-10 w-10 text-slate-400 stroke-1" />
              <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.brand_name}</span>
              <span className="text-[11px] font-black text-slate-700 leading-snug">{product.name}</span>
              <span className="mt-3 text-[9px] text-slate-400 font-bold bg-slate-200 px-2 py-0.5 rounded">INGREDIENT SPEC PANEL</span>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Source type:</span>
                <span className="text-slate-700 font-semibold">Packaging scan Ingestion</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Confidence:</span>
                <span className="text-slate-700 font-semibold">{(product.ai_confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Extraction points:</span>
                <span className="text-slate-700 font-semibold">{product.claims.length} claims, {product.ingredients.length} ingredients</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Column: Detailed Analysis Section Tabs */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Illustrative Revenue</span>
              <p className="text-lg font-black text-slate-900 mt-1">{formatCurrency(product.illustrative_revenue)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Momentum Index</span>
              <p className="text-lg font-black text-indigo-600 mt-1">{product.momentum_score}/10</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claims Mapped</span>
              <p className="text-lg font-black text-slate-900 mt-1">{product.claims.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingredients Found</span>
              <p className="text-lg font-black text-slate-900 mt-1">{product.ingredients.length}</p>
            </div>
          </div>

          {/* Section: Claims Intelligence */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claims Intelligence</h3>
              <p className="text-sm font-bold text-slate-800">Extracted benefit positioning & mapping weights</p>
            </div>

            <div className="space-y-2.5">
              {product.claims.map((claim) => (
                <div key={claim.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-100 rounded-lg p-3 hover:border-slate-200 bg-slate-50/50">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-850">"{claim.raw_text}"</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span>Normalized claim: <strong>{claim.normalized_claim}</strong></span>
                      <span>&bull;</span>
                      <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.2">Confidence: {(claim.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                      Weight: {claim.weight.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Ingredient Intelligence */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingredient Intelligence</h3>
              <p className="text-sm font-bold text-slate-800">Formulated ingredient dosages & hero status markers</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {product.ingredients.map((ing) => (
                <div key={ing.ingredient_id} className={`rounded-xl border p-4 space-y-2 hover:shadow-xs transition-shadow ${ing.is_hero ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate pr-2">{ing.name}</span>
                    {ing.is_hero && (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.2 text-[8px] font-bold text-indigo-700 uppercase tracking-wider shrink-0">
                        Hero
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold space-y-1">
                    <div>Active Dosage: <strong className="text-slate-700">{ing.dosage || "Not listed"}</strong></div>
                    <div>Extraction confidence: {(ing.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Category Mapping comparison visualizer */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Classification Integrity</h3>
                <p className="text-sm font-bold text-slate-800">Category mapping flow & validation</p>
              </div>
              
              <button
                onClick={handleAnalyzeClassification}
                disabled={analyzingAI}
                className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Analyze Classification
              </button>
            </div>

            {/* Classification visual flow */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 items-center text-center">
              <div className="rounded-lg border border-slate-150 p-3 bg-slate-50/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Category</span>
                <p className="text-xs font-black text-slate-700 mt-1">{product.category_name}</p>
              </div>
              <div className="text-slate-300 font-bold flex justify-center py-2 md:py-0">
                <ArrowRight className="h-5 w-5 transform rotate-90 md:rotate-0" />
              </div>
              <div className="rounded-lg border border-indigo-200 p-3 bg-indigo-50/15">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">AI Recommendation</span>
                <p className="text-xs font-black text-indigo-700 mt-1">
                  {classificationAnalysis ? classificationAnalysis.recommended_category : `${product.category_name} (Calculated)`}
                </p>
              </div>
            </div>

            {/* Analyze classification AI feedback */}
            {analyzingAI ? (
              <div className="flex h-24 items-center justify-center text-xs text-slate-500 gap-2 border border-dashed border-slate-200 rounded-lg">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                Gemini classification check...
              </div>
            ) : classificationAnalysis ? (
              <div className="rounded-lg border border-indigo-150 bg-indigo-50/10 p-4 space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">AI Classification Reasoning</span>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {classificationAnalysis.reasoning}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                  <span>Reclassified confidence: {(classificationAnalysis.confidence * 100).toFixed(0)}%</span>
                  <span>&bull;</span>
                  <span className="text-indigo-600">Reclassification requires manual Reviewer Override click in Governance queue.</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Section: Revenue Attribution Donut & Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue Attribution</h3>
              <p className="text-sm font-bold text-slate-800">Claim-weighted revenue distribution</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-center">
              {/* Donut chart */}
              <div className="md:col-span-1 flex justify-center">
                <AttributionChart data={product.attribution} />
              </div>

              {/* Detail Table */}
              <div className="md:col-span-2 overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2 pl-2">Claim Detail</th>
                      <th className="py-2 text-right">Weight</th>
                      <th className="py-2 pr-2 text-right">Attributed revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-[11px]">
                    {product.attribution.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40">
                        <td className="py-2.5 pl-2 font-bold text-slate-800 leading-snug">
                          "{item.normalized_claim || item.raw_text}"
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-700">{(item.weight * 100).toFixed(0)}%</td>
                        <td className="py-2.5 pr-2 text-right font-black text-slate-900">{formatCurrency(item.attributed_revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-150 p-2.5 text-[10px] text-slate-400 font-semibold italic text-center">
              “Illustrative attribution methodology for prototype validation.”
            </div>
          </div>

          {/* Section: Evidence Lineage vertical timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence Lineage</h3>
              <p className="text-sm font-bold text-slate-800">Vertical timeline tracking claim source audit details</p>
            </div>

            <div className="relative pl-6 border-l border-slate-200 space-y-6 ml-3 mt-4">
              {timeline.map((step, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Outer circle dot */}
                  <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border-2 border-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                  </span>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>{step.step}</span>
                    <span>{formatDate(step.timestamp)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{step.details}</h4>
                  {step.confidence < 1.0 && (
                    <div className="text-[10px] text-indigo-500 font-bold">Extraction Confidence: {(step.confidence * 100).toFixed(0)}%</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetail;
