import React, { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Info, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  User,
  Clock,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import { Drawer } from "../components/common/Drawer";
import { DemoDataNotice } from "../components/common/DemoDataNotice";
import { formatDate } from "../utils/formatters";

export const AuditTrail = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      const logs = await api.get("/api/audit");
      setAuditLogs(logs);
    } catch (e) {
      console.error("Failed to load audit trail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditTrail();
  }, []);

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesSearch = 
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.previous_value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.new_value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Governance and Accountable Records</span>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">System Audit Trail</h1>
        <p className="text-xs text-slate-500 font-semibold">
          A transparent record of human reclassification decisions, AI category recommendations, and configuration overrides.
        </p>
      </div>

      <DemoDataNotice />

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-2 left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, category, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-violet-600 focus:bg-white w-48"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-hidden focus:border-violet-600 cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="override_classification">Override Classification</option>
            <option value="approve_classification">Approve Classification</option>
            <option value="send_back_classification">Send Back Classification</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400 font-semibold">
          Audit Trail logs: {filteredLogs.length} events
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="py-12"><LoadingSkeleton type="table" count={5} /></div>
      ) : filteredLogs.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 pl-4">Timestamp</th>
                  <th className="py-3.5">User</th>
                  <th className="py-3.5">Action</th>
                  <th className="py-3.5">Previous value</th>
                  <th className="py-3.5">New value</th>
                  <th className="py-3.5">Reason</th>
                  <th className="py-3.5 pr-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => handleRowClick(log)}
                  >
                    <td className="py-4 pl-4 font-mono text-[10px] font-bold text-slate-550">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="py-4 font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                      {log.user_name}
                    </td>
                    <td className="py-4 font-bold">
                      <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[9px] uppercase tracking-wide border ${
                        log.action === "override_classification" 
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : log.action === "approve_classification"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 max-w-[100px] truncate">{log.previous_value}</td>
                    <td className="py-4 text-slate-800 font-bold max-w-[100px] truncate">{log.new_value}</td>
                    <td className="py-4 text-slate-500 max-w-[150px] truncate">{log.reason}</td>
                    <td className="py-4 pr-4 text-center">
                      <button className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-550 hover:bg-slate-50 cursor-pointer">
                        Details
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
          No audit log events matched the query filters.
        </div>
      )}

      {/* Slide-out details drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Audit Log Details"
        subtitle={selectedLog ? `Event ID: ${selectedLog.id}` : ""}
        size="md"
      >
        {selectedLog && (
          <div className="space-y-6 text-xs leading-relaxed font-semibold text-slate-650">
            <div className="rounded-lg bg-slate-50 border border-slate-150 p-4 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wide">
                <History className="h-4 w-4 text-violet-650" />
                <span>Governance Audit Entry</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2.5 pt-2 border-t border-slate-200/50">
                <div>User:</div>
                <div className="text-slate-800 font-bold">{selectedLog.user_name}</div>
                
                <div>Action type:</div>
                <div className="capitalize text-slate-800 font-bold">{selectedLog.action.replace(/_/g, " ")}</div>
                
                <div>Entity ID:</div>
                <div className="font-mono text-slate-800">{selectedLog.entity_type} #{selectedLog.entity_id}</div>

                <div>Timestamp:</div>
                <div className="text-slate-850 font-bold">{formatDate(selectedLog.created_at)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classification Reclassification</h4>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="rounded-lg border border-slate-150 p-3 bg-white text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Previous Mapping</span>
                  <p className="font-bold text-slate-700 mt-1">{selectedLog.previous_value}</p>
                </div>
                <div className="rounded-lg border border-violet-200 p-3 bg-violet-50/15 text-center">
                  <span className="text-[9px] font-bold text-violet-600 uppercase">New Mapping</span>
                  <p className="font-bold text-violet-700 mt-1">{selectedLog.new_value}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Justification Rationale</h4>
              <p className="rounded-lg border border-slate-150 bg-white p-3 font-semibold text-slate-700 leading-relaxed italic">
                "{selectedLog.reason}"
              </p>
            </div>

            {selectedLog.model_name !== "N/A" && (
              <div className="rounded-lg border border-violet-150 bg-violet-50/10 p-3 flex gap-2 items-start text-violet-700">
                <Sparkles className="h-4.5 w-4.5 shrink-0 text-violet-600 mt-0.5" />
                <div>
                  <div className="font-bold">Automated Reclassification Scan</div>
                  <div className="text-[10px] text-violet-550 font-semibold mt-0.5">
                    Reclassified recommendations synthesized using system algorithms grounded in packaging evidence.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
export default AuditTrail;
