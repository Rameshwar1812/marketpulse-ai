import React, { useState, useEffect } from "react";
import { 
  FileCheck, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  CornerDownLeft, 
  User, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Save,
  CheckCircle2
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Drawer } from "../components/common/Drawer";
import { StatusBadge } from "../components/common/StatusBadge";
import { ConfidenceBadge } from "../components/common/ConfidenceBadge";
import { Toast } from "../components/common/Toast";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { formatDate } from "../utils/formatters";

export const ReviewQueue = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);

  // Override form states
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [toastShow, setToastShow] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revs, cats] = await Promise.all([
        api.get("/api/reviews"),
        api.get("/api/market/categories")
      ]);
      setReviews(revs);
      setCategories(cats);
    } catch (e) {
      console.error("Failed to retrieve governance reviews", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewClick = async (review) => {
    setSelectedReview(review);
    setDrawerOpen(true);
    setLoadingProductDetail(true);
    setSelectedProductDetail(null);
    setShowOverrideForm(false);
    setTargetCategoryId("");
    setOverrideReason("");
    setConfirmCheckbox(false);

    try {
      const detail = await api.get(`/api/products/${review.product_id}`);
      setSelectedProductDetail(detail);
    } catch (e) {
      console.error("Failed to fetch product details for review", e);
    } finally {
      setLoadingProductDetail(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedReview) return;
    setSubmittingAction(true);
    try {
      await api.post(`/api/reviews/${selectedReview.id}/approve`);
      setToastMessage("AI classification successfully approved. Database updated.");
      setToastType("success");
      setToastShow(true);
      setDrawerOpen(false);
      loadData();
    } catch (e) {
      setToastMessage(e.message || "Failed to approve reclassification.");
      setToastType("error");
      setToastShow(true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!targetCategoryId || !overrideReason || !confirmCheckbox) {
      alert("Please complete the override form, including validation confirmation.");
      return;
    }
    
    setSubmittingAction(true);
    try {
      await api.post(`/api/reviews/${selectedReview.id}/override`, {
        decision: "overridden",
        reason: overrideReason,
        override_category_id: parseInt(targetCategoryId)
      });
      setToastMessage("Override applied successfully. Product reclassified and logged.");
      setToastType("success");
      setToastShow(true);
      setDrawerOpen(false);
      loadData();
    } catch (e) {
      setToastMessage(e.message || "Failed to override reclassification.");
      setToastType("error");
      setToastShow(true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSendBack = async () => {
    if (!selectedReview) return;
    const reason = prompt("Enter the reason for sending back this ingestion record:");
    if (reason === null) return; // cancel
    if (!reason.trim()) {
      alert("A reason is required to send back the record.");
      return;
    }

    setSubmittingAction(true);
    try {
      await api.post(`/api/reviews/${selectedReview.id}/send-back`, {
        decision: "sent_back",
        reason: reason
      });
      setToastMessage("Record sent back to queue.");
      setToastType("success");
      setToastShow(true);
      setDrawerOpen(false);
      loadData();
    } catch (e) {
      setToastMessage(e.message || "Failed to send back record.");
      setToastType("error");
      setToastShow(true);
    } finally {
      setSubmittingAction(false);
    }
  };

  // KPI Calculations
  const pendingCount = reviews.filter(r => r.status === "pending").length;
  const lowConfidenceCount = reviews.filter(r => r.status === "pending" && r.ai_confidence < 0.70).length;
  const overriddenCount = reviews.filter(r => r.status === "overridden").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Human in the loop governance</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Compliance Review Queue</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Review uncertain AI classifications, approve benefit claims, or log overrides into the governance trail.
        </p>
      </div>

      <DemoDataNotice />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
          <p className="text-xl font-black text-slate-800 mt-1">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Confidence (&lt;70%)</span>
          <p className="text-xl font-black text-amber-600 mt-1">{lowConfidenceCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overrides Seeded</span>
          <p className="text-xl font-black text-purple-600 mt-1">{overriddenCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
          <p className="text-xl font-black text-slate-800 mt-1">4.2 min</p>
        </div>
        <div className="hidden lg:block rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audited Classifications</span>
          <p className="text-xl font-black text-slate-800 mt-1">{reviews.length}</p>
        </div>
      </div>

      {/* Review list Table */}
      {loading ? (
        <div className="py-12"><LoadingSkeleton type="table" count={5} /></div>
      ) : reviews.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-4">Product details</th>
                  <th className="py-3.5">AI classification recommendation</th>
                  <th className="py-3.5 text-center">Confidence</th>
                  <th className="py-3.5">Flagged Reason</th>
                  <th className="py-3.5">Assigned reviewer</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 pr-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {reviews.map((rev) => (
                  <tr 
                    key={rev.id} 
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => handleReviewClick(rev)}
                  >
                    <td className="py-4 pl-4 font-bold text-slate-800">
                      <div>{rev.product_name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{rev.brand_name}</div>
                    </td>
                    <td className="py-4 font-semibold text-violet-700">
                      {rev.ai_recommendation || "Approve current"}
                    </td>
                    <td className="py-4 text-center">
                      <ConfidenceBadge confidence={rev.ai_confidence} />
                    </td>
                    <td className="py-4 text-[11px] font-semibold text-slate-500">{rev.reason_flagged}</td>
                    <td className="py-4 text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {rev.reviewer_name || "Unassigned"}
                      </span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={rev.status} />
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <button 
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                          rev.status === "pending" 
                            ? "bg-violet-600 text-white hover:bg-violet-700" 
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {rev.status === "pending" ? "Review" : "Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400 font-semibold bg-white border border-slate-200 rounded-xl">
          Compliance review queue is currently empty.
        </div>
      )}

      {/* Slide-out Review details drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedReview ? `Reviewing: ${selectedReview.product_name}` : "Review Workspace"}
        subtitle={selectedReview ? `Flagged: ${selectedReview.reason_flagged}` : ""}
        size="xl"
      >
        {loadingProductDetail ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-500 gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
            Loading product data workspace...
          </div>
        ) : selectedProductDetail ? (
          <div className="space-y-6">
            
            {/* Product summary card inside drawer */}
            <div className="rounded-lg bg-slate-50 border border-slate-150 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="text-slate-900 font-black">{selectedProductDetail.name}</span>
                <span>{selectedProductDetail.sku}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">{selectedProductDetail.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 text-[11px] font-semibold text-slate-500">
                <div>Current Category: <strong className="text-slate-700">{selectedProductDetail.category_name}</strong></div>
                <div>Revenue Volume: <strong className="text-slate-750">{formatCurrency(selectedProductDetail.illustrative_revenue)}</strong></div>
              </div>
            </div>

            {/* AI Recommendation panel */}
            <div className="rounded-lg border border-violet-150 bg-violet-50/10 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-violet-700">
                <Sparkles className="h-4.5 w-4.5" />
                <span>AI Reclassification Recommendation</span>
              </div>
              <p className="font-semibold text-slate-700 leading-relaxed">
                {selectedReview?.ai_recommendation || "Retain existing category mapping."}
              </p>
              <div className="text-[10px] text-slate-400 font-bold">
                Calculated Extraction Confidence: {(selectedReview?.ai_confidence * 100).toFixed(0)}%
              </div>
            </div>

            {/* Evidence items details list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Claims Evidence Mapped</h4>
              <div className="space-y-1.5">
                {selectedProductDetail.claims.map((c) => (
                  <div key={c.id} className="rounded-md border border-slate-150 p-2.5 bg-white text-xs space-y-1">
                    <p className="font-semibold text-slate-750">"{c.raw_text}"</p>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Normalized claim: {c.normalized_claim}</span>
                      <span>Weight: {c.weight.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Decision panel actions */}
            {selectedReview?.status === "pending" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={submittingAction}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    Approve AI Mapping
                  </button>
                  
                  <button
                    onClick={() => setShowOverrideForm(!showOverrideForm)}
                    disabled={submittingAction}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Layers className="h-4 w-4" />
                    Override Reclassify
                  </button>

                  <button
                    onClick={handleSendBack}
                    disabled={submittingAction}
                    className="flex items-center justify-center gap-1 rounded-lg border border-slate-250 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <CornerDownLeft className="h-4 w-4" />
                    Send Back
                  </button>
                </div>

                {/* Reclassification override form container */}
                {showOverrideForm && (
                  <form onSubmit={handleOverrideSubmit} className="rounded-lg border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Target Category Override</label>
                      <select
                        required
                        value={targetCategoryId}
                        onChange={(e) => setTargetCategoryId(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 bg-white py-1.5 px-2.5 text-xs font-semibold outline-hidden focus:border-violet-600 cursor-pointer"
                      >
                        <option value="">Select Category...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Justification Rationale</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Explain compliance findings justifying reclassification override..."
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        className="w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs outline-hidden focus:border-violet-600"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 text-[11px] text-slate-500 font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={confirmCheckbox}
                        onChange={(e) => setConfirmCheckbox(e.target.checked)}
                        className="rounded border-slate-350 text-violet-600 mt-0.5"
                      />
                      <span>
                        I certify that this reclassification is supported by extracted claim weights and hero ingredients.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={submittingAction || !confirmCheckbox || !targetCategoryId}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      <Save className="h-4 w-4" />
                      Submit Classification Override
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Resolved display log details */
              <div className="rounded-lg border border-slate-150 p-4 space-y-3 bg-slate-50/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                  <span>Review Resolved</span>
                </div>
                <div className="space-y-1 text-slate-600 font-semibold">
                  <div>Decision: <strong className="text-slate-800 capitalize">{selectedReview?.reviewer_decision}</strong></div>
                  <div>Audited by: <strong className="text-slate-800">{selectedReview?.reviewer_name}</strong></div>
                  <div>Justification: <strong className="text-slate-800">"{selectedReview?.reviewer_reason}"</strong></div>
                  <div>Resolved: <strong className="text-slate-800">{formatDate(selectedReview?.resolved_at)}</strong></div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Unified Toaster */}
      <Toast 
        message={toastMessage} 
        type={toastType} 
        show={toastShow} 
        onClose={() => setToastShow(false)} 
      />
    </div>
  );
};
export default ReviewQueue;
