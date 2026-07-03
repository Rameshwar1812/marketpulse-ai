import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  FileText, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight,
  Database,
  Info
} from "lucide-react";
import { api } from "../services/api";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { formatPercent } from "../utils/formatters";

export const AskIntelligence = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuestion = searchParams.get("q") || "";

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  // Sidebar evidence state
  const [currentEvidence, setCurrentEvidence] = useState([]);
  const [highlightedEvidenceIds, setHighlightedEvidenceIds] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  // Execute question if passed in query param
  useEffect(() => {
    if (initialQuestion) {
      handleSendQuery(initialQuestion);
    }
  }, [initialQuestion]);

  const handleSendQuery = async (queryText) => {
    const qText = queryText || query;
    if (!qText.trim()) return;

    // Add user query to chat history
    const userMsg = { sender: "user", text: qText };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);
    setHighlightedEvidenceIds(new Set());

    try {
      const res = await api.post("/api/chat/query", { query: qText });
      
      // AI Response message
      const aiMsg = {
        sender: "ai",
        answer: res.answer,
        keyFindings: res.key_findings || [],
        confidence: res.confidence,
        followUps: res.follow_up_questions || []
      };

      setChatHistory((prev) => [...prev, aiMsg]);
      
      // Update evidence sidebar
      if (res.evidence && res.evidence.length > 0) {
        setCurrentEvidence(res.evidence);
      } else {
        setCurrentEvidence([]);
      }
    } catch (e) {
      console.error("AI chat query failed", e);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          answer: "AI analysis is temporarily unavailable. Check that your GEMINI_API_KEY is configured in backend environment variables.",
          keyFindings: [],
          confidence: 0.0,
          followUps: []
        }
      ]);
      setCurrentEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestClick = (q) => {
    handleSendQuery(q);
  };

  const handleFindingClick = (ids) => {
    if (ids && ids.length > 0) {
      setHighlightedEvidenceIds(new Set(ids));
    } else {
      setHighlightedEvidenceIds(new Set());
    }
  };

  const suggestions = [
    { title: "Accelerating Momentum", q: "Where is momentum accelerating?" },
    { title: "Sleep Formulations", q: "Which ingredients dominate sleep positioning?" },
    { title: "High-Momentum Niches", q: "Where are low-presence, high-momentum opportunities?" },
    { title: "Emerging Claims", q: "Which claims are emerging in stress and mood?" },
    { title: "Energy & Cognitive Blend", q: "Which products combine energy and cognitive positioning?" },
    { title: "Human Review Needed", q: "Which insights require human review?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] space-y-4">
      {/* Header */}
      <div className="space-y-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gemini Workspace</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Ask Market Intelligence</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Query benefit categories, product claims, hero ingredients, and validation audit lineages.
        </p>
      </div>

      <DemoDataNotice className="shrink-0" />

      {/* Main Split Layout: 70% Chat Workspace / 30% In-drawer Evidence Panel */}
      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        
        {/* Left 70%: Conversation Workspace */}
        <div className="w-full lg:w-[70%] flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
          
          {/* Scrollable messages viewport */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 ? (
              /* Empty state workspace */
              <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm animate-bounce">
                  <Sparkles className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Ask MarketPulse AI Copilot</h3>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                    Submit natural language queries grounded directly in catalog records. Gemini AI will synthesize observations backed by verified SQL aggregates.
                  </p>
                </div>

                {/* Grid cards suggestions */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 w-full pt-4">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestClick(s.q)}
                      className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-slate-800 leading-snug">{s.title}</span>
                      <p className="text-[9px] text-slate-400 font-semibold truncate w-full mt-0.5">{s.q}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat log rendering */
              <div className="space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bot avatar */}
                    {msg.sender === "ai" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-100">
                        M
                      </div>
                    )}

                    <div className={`space-y-4 max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-50 border border-slate-100 text-slate-850"}`}>
                      {msg.sender === "user" ? (
                        <p className="font-bold">{msg.text}</p>
                      ) : (
                        /* AI Response workspace block */
                        <div className="space-y-4">
                          <p className="font-semibold">{msg.answer}</p>

                          {/* Render findings cards */}
                          {msg.keyFindings.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-200/50">
                              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Key data findings</span>
                              <div className="grid grid-cols-1 gap-2.5">
                                {msg.keyFindings.map((finding, fIdx) => (
                                  <div
                                    key={fIdx}
                                    onClick={() => handleFindingClick(finding.evidence_ids)}
                                    className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-400 cursor-pointer shadow-xs"
                                  >
                                    <div className="space-y-1">
                                      <h4 className="font-bold text-slate-900 leading-snug">{finding.title}</h4>
                                      <p className="text-[10px] text-slate-500 font-semibold">{finding.finding}</p>
                                      {finding.evidence_ids?.length > 0 && (
                                        <div className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider mt-1">
                                          Click to highlight {finding.evidence_ids.length} evidence lines
                                        </div>
                                      )}
                                    </div>
                                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 whitespace-nowrap shrink-0">
                                      {finding.metric}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Bottom metadata tags */}
                          <div className="flex items-center gap-3 pt-2 text-[9px] font-bold text-slate-400">
                            <span>Confidence: {formatPercent(msg.confidence)}</span>
                            <span>&bull;</span>
                            <span>Model: gemini-2.5-flash</span>
                          </div>

                          {/* Follow-up question chips */}
                          {msg.followUps.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {msg.followUps.map((fq, fqIdx) => (
                                <button
                                  key={fqIdx}
                                  onClick={() => handleSuggestClick(fq)}
                                  className="rounded-full bg-white border border-slate-200 hover:border-indigo-400 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer transition-colors shadow-xs"
                                >
                                  {fq}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-4 justify-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-md">
                      M
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                      Grounding data findings...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Form input footer */}
          <div className="border-t border-slate-200 p-4 bg-slate-50/50">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
              className="flex items-center gap-2 bg-white border border-slate-250 rounded-lg px-3 py-2 focus-within:border-indigo-600 transition-colors shadow-xs"
            >
              <input
                type="text"
                placeholder="Ask Gemini about category momentum, top ingredients, claims or reclassifications..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-slate-800 outline-hidden placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right 30%: Evidence Workspace sidebar */}
        <div className="hidden lg:flex w-[30%] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden h-full">
          <div className="mb-4 shrink-0 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Database className="h-4 w-4 text-slate-500" />
              <span>Grounded Evidence Panel</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Supporting packaging image sources and retailer scan documents associated with query results.
            </p>
          </div>

          {/* Evidence Card view list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {currentEvidence.length > 0 ? (
              currentEvidence.map((ev) => {
                const isHighlighted = highlightedEvidenceIds.has(ev.id);
                return (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-3 space-y-2 transition-all duration-200 shadow-xs ${
                      isHighlighted 
                        ? "border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500" 
                        : "border-slate-200 bg-slate-50/30 hover:border-slate-350"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <span>[{ev.evidence_type}]</span>
                      <span>Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                    </div>
                    
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{ev.description}</h4>
                    
                    <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span className="truncate max-w-[120px]">{ev.product_name}</span>
                      <button 
                        onClick={() => navigate(`/products/${ev.product_id}`)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer font-bold"
                      >
                        Inspect <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <FileText className="h-8 w-8 text-slate-300 stroke-1" />
                <span className="text-[10px] font-semibold">Evidence container empty.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AskIntelligence;
