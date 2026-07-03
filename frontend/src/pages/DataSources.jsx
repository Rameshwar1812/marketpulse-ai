import React, { useState, useEffect } from "react";
import { 
  Database, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  RefreshCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ListRestart
} from "lucide-react";
import { api } from "../services/api";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { Toast } from "../components/common/Toast";
import { AgentWorkflow } from "../components/workflow/AgentWorkflow";

export const DataSources = () => {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState([]);
  
  // CSV Upload/Validation states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [toastShow, setToastShow] = useState(false);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/sources");
      setSources(data);
    } catch (e) {
      console.error("Failed to load data sources", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationResult(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const res = await api.upload("/api/sources/upload-csv", selectedFile);
      setValidationResult(res);
      setToastMessage("CSV source material successfully parsed and validated.");
      setToastType("success");
      setToastShow(true);
    } catch (e) {
      setToastMessage(e.message || "Failed to process CSV file.");
      setToastType("error");
      setToastShow(true);
      setValidationResult(null);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = () => {
    // Confirmation click mock. Prototype does not write to DB automatically.
    setToastMessage(`Prototype simulation: Imported ${validationResult?.valid_rows} product catalog records successfully.`);
    setToastType("success");
    setToastShow(true);
    setValidationResult(null);
    setSelectedFile(null);
  };

  const getSourceIcon = (type) => {
    switch (type) {
      case "Market Report":
        return FileText;
      case "Packaging Images":
        return Upload;
      default:
        return Database;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Ingestion Workspace</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Market Intelligence Data Sources</h1>
        <p className="text-xs text-slate-500 font-semibold">
          Manage third-party market sync services, check OCR document quality scores, or validate catalog updates.
        </p>
      </div>

      <DemoDataNotice />

      {/* Grid: 4 Source Ingestion Cards */}
      {loading ? (
        <div className="flex h-32 items-center justify-center text-xs text-slate-500 gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
          Syncing sources metadata...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((src) => {
            const Icon = getSourceIcon(src.source_type);
            return (
              <div key={src.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className={`rounded-full px-2 py-0.2 text-[8px] font-bold uppercase tracking-wider ${
                    src.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {src.status}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-slate-800 leading-snug">{src.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{src.reference}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>Quality Score: <strong>{(src.data_quality_score * 100).toFixed(0)}%</strong></span>
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <Clock className="h-3 w-3" /> 
                    {new Date(src.last_refresh).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Two Column Ingestion workspace: Left Ingest CSV panel / Right target state agent pipeline workflow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Left: CSV Upload & Validation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">CSV Ingestion Workspace</h3>
            <p className="text-sm font-bold text-slate-800">Validate & Upload catalog updates</p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-350 p-6 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="h-8 w-8 text-slate-400 mx-auto stroke-1" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                {selectedFile ? `Selected: ${selectedFile.name}` : "Click or drag CSV product file here"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Maximum file size: 2MB</p>
            </div>

            {selectedFile && (
              <button
                type="submit"
                disabled={uploading}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  "Validate Catalog File"
                )}
              </button>
            )}
          </form>

          {/* Validation Results breakdown */}
          {validationResult && (
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                <span className="font-bold text-slate-800">Validation Summary: {validationResult.filename}</span>
                <span className="font-mono text-[10px] text-slate-500">{validationResult.rows_found} rows parsed</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-xs">{validationResult.valid_rows}</div>
                    <div>Valid rows</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <div>
                    <div className="font-bold text-xs">{validationResult.invalid_rows}</div>
                    <div>Invalid rows</div>
                  </div>
                </div>
              </div>

              {/* Warning lines list */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Parsing Warnings</span>
                  <div className="max-h-24 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white p-2 text-[10px] text-slate-500 font-semibold space-y-1">
                    {validationResult.warnings.map((w, idx) => (
                      <div key={idx} className="py-1 first:pt-0 last:pb-0">{w}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmation Action buttons */}
              {validationResult.valid_rows > 0 && (
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200/50">
                  <button
                    onClick={() => setValidationResult(null)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Confirm Import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Target state architecture visualization */}
        <AgentWorkflow />
      </div>

      <Toast 
        message={toastMessage} 
        type={toastType} 
        show={toastShow} 
        onClose={() => setToastShow(false)} 
      />
    </div>
  );
};
export default DataSources;
