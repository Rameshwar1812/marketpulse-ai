import React from "react";
import { 
  HelpCircle, 
  BrainCircuit, 
  SearchCode, 
  Atom, 
  GitCompare, 
  Coins, 
  ShieldCheck, 
  LineChart, 
  CheckSquare,
  ArrowDown
} from "lucide-react";

export const AgentWorkflow = () => {
  const steps = [
    {
      title: "1. User Question Ingestion",
      desc: "Analyst submits a natural language question or requests detailed product reclassification audits.",
      icon: HelpCircle,
      status: "Triggered"
    },
    {
      title: "2. Orchestration & Context Construction",
      desc: "FastAPI router processes queries, extracts keywords, and aggregates facts from the SQLite DB.",
      icon: BrainCircuit,
      status: "Orchestrating"
    }
  ];

  const specialists = [
    { title: "Claims Agent", desc: "Extracts and normalizes benefit claims.", icon: SearchCode },
    { title: "Ingredient Agent", desc: "Tracks dosages and identifies hero tags.", icon: Atom },
    { title: "Market Matcher", desc: "Maps products to clinical categories.", icon: GitCompare },
    { title: "Attribution Agent", desc: "Applies weights to attribute revenue.", icon: Coins }
  ];

  const pipeline = [
    {
      title: "4. Evidence Lineage Validation",
      desc: "System reconciles AI recommendations with raw packaging scans and third-party reports.",
      icon: ShieldCheck,
      status: "Secured"
    },
    {
      title: "5. Automated Interpretation",
      desc: "Advanced language processing models synthesize clean, grounded executive summaries and findings lists.",
      icon: LineChart,
      status: "Grounded"
    },
    {
      title: "6. Human-in-the-Loop Review",
      desc: "Low-confidence classifications queue for manual compliance override and audit trails.",
      icon: CheckSquare,
      status: "Governed"
    }
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Intelligence Pipeline</h3>
        <p className="text-sm font-bold text-slate-800">Target-State Intelligent Orchestration Workflow</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Step 1 & 2 */}
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className="flex w-full items-start gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:border-slate-200 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-none">{s.title}</span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                    {s.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
            <ArrowDown className="h-4 w-4 text-slate-300" />
          </React.Fragment>
        ))}

        {/* Step 3: Parallel Capabilities */}
        <div className="w-full space-y-2.5 rounded-xl border border-violet-150 bg-violet-50/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">3. Parallel Specialist Capabilities</span>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-700 uppercase tracking-wide">
              Specialist Layer
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {specialists.map((sp, idx) => (
              <div 
                key={idx} 
                className="flex flex-col gap-2 rounded-lg border border-violet-100 bg-white p-3 hover:shadow-xs transition-shadow"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-violet-50 text-violet-600">
                  <sp.icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">{sp.title}</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">{sp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ArrowDown className="h-4 w-4 text-slate-300" />

        {/* Step 4, 5, 6 */}
        {pipeline.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className="flex w-full items-start gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3 hover:border-slate-200 transition-colors">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 leading-none">{s.title}</span>
                  <span className="rounded-full bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                    {s.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            </div>
            {idx < pipeline.length - 1 && <ArrowDown className="h-4 w-4 text-slate-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-5 border-t border-slate-150 pt-3 text-[10px] text-slate-400 font-semibold italic text-center">
        Target-state workflow; prototype implementation combines SQL analytics, application services, automated interpretation, and human review.
      </div>
    </div>
  );
};
export default AgentWorkflow;
