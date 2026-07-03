/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { MethodologyId, Question, Option } from "../types";
import { RECS } from "../data";
import {
  Award,
  AlertTriangle,
  Users,
  Target,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Printer,
  RefreshCw,
  Sparkles,
  Info,
  UserX,
  ShieldAlert,
  Zap,
  Network
} from "lucide-react";

interface ResultsDisplayProps {
  scores: Record<MethodologyId, number>;
  recommendedId: MethodologyId;
  runnerUpId: MethodologyId;
  askedQuestions: Question[];
  answers: Record<string, Option>;
  confidenceGap: number;
  whatWouldChangeText: string;
  onRestart: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  scores,
  recommendedId,
  runnerUpId,
  askedQuestions,
  answers,
  confidenceGap,
  whatWouldChangeText,
  onRestart
}) => {
  const r = RECS[recommendedId];
  const alt = RECS[runnerUpId];

  // Derive confidence fit text
  let fitLabel = "Moderate Fit (mixed variables)";
  let fitColor = "text-amber-700 bg-amber-50 border-amber-200";
  if (confidenceGap >= 0.4) {
    fitLabel = "Strong Structural Fit";
    fitColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (confidenceGap >= 0.2) {
    fitLabel = "Good Structural Fit";
    fitColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
  }

  // Derive which questions specifically pushed towards the winner
  const pushingFactors = askedQuestions
    .filter((q) => {
      const option = answers[q.id];
      if (!option) return false;
      // Option had a non-zero weight for this winner
      return (option.weights[recommendedId] ?? 0) > 0;
    })
    .map((q) => {
      const option = answers[q.id]!;
      const winWeight = option.weights[recommendedId] ?? 0;
      return {
        perspective: q.perspective,
        text: q.text,
        choice: option.text,
        influence: winWeight * q.signal
      };
    })
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 4);

  // Derive behavioral / people / process flags
  const behavioralFlags: { title: string; desc: string; impact: string; icon: React.ReactNode }[] = [];

  const poAns = answers["po_availability"]?.text;
  if (poAns && poAns.includes("Rarely")) {
    behavioralFlags.push({
      title: "Decision-Maker Bottleneck",
      desc: "A decision-maker or customer is rarely available for continuous input and feedback.",
      impact: "Frameworks like Scrum or XP will stall. Without a daily engaged Product Owner, teams guess requirements, resulting in high rework and feature drift.",
      icon: <UserX className="w-4 h-4 text-amber-700" />
    });
  }

  const mgrAns = answers["mgr_control"]?.text;
  const cultAns = answers["culture"]?.text;
  if (
    (mgrAns && mgrAns.includes("top-down")) ||
    (cultAns && cultAns.includes("Command-and-control"))
  ) {
    behavioralFlags.push({
      title: "Self-Organization Mismatch",
      desc: "Command-and-control culture or management style values top-down task assignment over team autonomy.",
      impact: "Scrum or XP relies on decentralized authority. Imposing sprints in a command-and-control environment leads to empty ceremonies ('cargo-cult' agile) rather than actual agility.",
      icon: <ShieldAlert className="w-4 h-4 text-amber-700" />
    });
  }

  const matAns = answers["team_maturity"]?.text;
  if (
    matAns && matAns.includes("New") &&
    (recommendedId === "scrum" || recommendedId === "xp" || recommendedId === "kanban")
  ) {
    behavioralFlags.push({
      title: "Agile Maturity vs. Autonomy Gap",
      desc: "The delivery team is new to agile and prefers clear, pre-defined upfront structure, but the recommended framework requires high self-organization.",
      impact: "Pushing full autonomy without established habits can lead to confusion and stagnation. Pair the model with strong mentoring or use a Hybrid approach first.",
      icon: <Users className="w-4 h-4 text-amber-700" />
    });
  }

  const intAns = answers["interrupt_rate"]?.text;
  if (intAns && intAns.includes("Frequently") && recommendedId === "scrum") {
    behavioralFlags.push({
      title: "High Interruption vs. Protected Sprint Conflict",
      desc: "The team is frequently interrupted by urgent, unplanned work, but Scrum mandates protected sprint commitments.",
      impact: "Commitments will be broken repeatedly, destroying morale. You should protect the team, or pivot to a continuous pull-based framework like Kanban.",
      icon: <Zap className="w-4 h-4 text-amber-700" />
    });
  }

  // TWO-PLANE BLUEPRINT DERIVATION
  const teamMethods: MethodologyId[] = ["scrum", "kanban", "xp", "scrumban", "lean"];
  const sortedTeam = teamMethods
    .map((id) => ({ id, score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const teamId = sortedTeam[0]?.id || "scrum";

  const governanceMethods: MethodologyId[] = ["waterfall", "hybrid", "safe"];
  const sortedGov = governanceMethods
    .map((id) => ({ id, score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  const govId = sortedGov[0]?.id || "hybrid";

  let combineText = "";
  const isSmallTeam = answers["team_scale"]?.text.includes("small team") || answers["team_scale"]?.text.includes("≤10");
  const overallWinner = recommendedId;

  if (isSmallTeam && ["scrum", "kanban", "xp", "scrumban", "lean"].includes(overallWinner)) {
    combineText = `A single, lightweight team-level method (${RECS[overallWinner].name}) is sufficient for your scope. You do not need a scaling or heavy enterprise governance model.`;
  } else {
    if (govId === "safe") {
      if (teamId === "scrum") {
        combineText = "Run SAFe (Scaled Agile) at the program/portfolio level with highly aligned Scrum teams executing beneath.";
      } else if (teamId === "kanban" || teamId === "scrumban") {
        combineText = "Run SAFe at the program/portfolio level with Kanban/Scrumban boards managing continuous service delivery.";
      } else {
        combineText = `Run SAFe at the program/portfolio level with ${RECS[teamId].name} teams executing underneath.`;
      }
    } else if (govId === "hybrid") {
      if (teamId === "scrum") {
        combineText = "Use a stage-gate/Hybrid backbone for compliance and milestone governance, with Scrum sprints powering execution within each stage.";
      } else if (teamId === "kanban") {
        combineText = "Use a stage-gate/Hybrid backbone for milestones, with continuous Kanban flow managing task completion inside each stage.";
      } else {
        combineText = `Use a stage-gate/Hybrid backbone for governance, with ${RECS[teamId].name} managing execution within each phase.`;
      }
    } else if (govId === "waterfall") {
      combineText = `Run a structured Waterfall stage-gate process, using lightweight ${RECS[teamId].name} techniques for team execution under strict milestones.`;
    }
  }

  return (
    <div id="results-report-view" className="space-y-6 print:space-y-4">
      {/* BEHAVIORAL WARNING ALERTS (THE ALARM-CLOCK CRITIQUE PASS) */}
      {behavioralFlags.length > 0 && (
        <div id="behavioral-warning-card" className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4 print:bg-slate-50 print:border-slate-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-sm shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-900 tracking-tight uppercase">
                ⚠️ Systemic People & Process Risks Detected
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed mt-1">
                Your answers reveal structural behaviors that <strong>no delivery framework can resolve on its own</strong>. 
                Address these organizational bottlenecks first—otherwise, any methodology you select below is destined to become a mirror of existing dysfunction.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {behavioralFlags.map((flag, idx) => {
              return (
                <div key={idx} className="bg-white/90 backdrop-blur-sm border border-amber-200/50 p-4 rounded-xl space-y-2 hover:bg-white hover:border-amber-300 transition-all print:bg-white print:border-slate-200">
                  <div className="flex items-center gap-2 border-b border-amber-100 pb-1.5 print:border-slate-100">
                    {flag.icon}
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                      {flag.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Reality Check:</strong> {flag.desc}
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed bg-amber-50/50 border border-amber-100/60 p-2.5 rounded-lg print:bg-slate-50 print:border-slate-200">
                    <strong>Framework Impact:</strong> {flag.impact}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Header Summary Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-950/40 relative overflow-hidden print:bg-white print:text-slate-800 print:border-slate-200 print:shadow-none">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800/10 rounded-full blur-2xl pointer-events-none print:hidden" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-indigo-400 print:text-indigo-600" />
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300 print:text-indigo-600">
                Primary Recommendation
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {r.name}
            </h1>
            <p className="text-slate-200 text-sm max-w-2xl leading-relaxed print:text-slate-700">
              {r.summary}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${fitColor} print:bg-slate-100 print:text-slate-800`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{fitLabel}</span>
            </span>
            <div className="text-slate-400 text-xs mt-2 font-medium font-mono print:text-slate-500">
              Confidence gap: {(confidenceGap * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Stability checklist */}
        <div className="mt-5 pt-4 border-t border-indigo-800/60 flex items-start gap-2.5 bg-indigo-950/40 rounded-xl p-3 text-xs text-indigo-200 leading-relaxed print:border-slate-200 print:bg-slate-50 print:text-slate-600">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 print:text-indigo-600" />
          <div>
            <strong>Stability & Sensitivity Analysis:</strong> {whatWouldChangeText} 
            <span className="block text-[10px] text-indigo-300/80 mt-0.5 font-medium print:text-slate-500">
              Analyzed across {askedQuestions.length} answered questions covering {new Set(askedQuestions.map(q => q.perspective)).size} distinct organizational viewpoints.
            </span>
          </div>
        </div>
      </div>

      {/* Two-Plane Methodology Blueprint */}
      <div id="two-plane-blueprint-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 print:border-slate-300">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
              Two-Plane Methodology Blueprint
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Separating governance structure from team execution prevents methodology dogmatism.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plane 1: Delivery & Governance Model */}
          <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Level 1: Governance & Delivery Model
            </span>
            <h4 className="text-lg font-black text-slate-800">
              {RECS[govId]?.name || "Hybrid"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides the macro structure for budgeting, contract alignment, client reporting, and strategic milestones.
            </p>
          </div>

          {/* Plane 2: Team Execution Level */}
          <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Level 2: Team-Level Execution Method
            </span>
            <h4 className="text-lg font-black text-slate-800">
              {RECS[teamId]?.name || "Scrum"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powers the daily rhythm, task management, collaboration ceremonies, and delivery feedback loops.
            </p>
          </div>
        </div>

        {/* Combine Banner */}
        <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wide">Strategic Synthesis</span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
              {combineText}
            </p>
          </div>
        </div>
      </div>

      {/* Decision Factors & Runner-Up Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decision Factors */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Strongest Driving Factors
            </h3>
          </div>
          <div className="space-y-3">
            {pushingFactors.map((f, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-slate-50/50 border border-slate-100 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {f.perspective} Lens
                  </span>
                  <p className="text-xs font-semibold text-slate-700">
                    {f.text}
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    &ldquo;{f.choice}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternate Recommendation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                Viable Alternative Recommendation
              </h3>
            </div>
            <div className="bg-slate-50/60 rounded-xl border border-slate-100 p-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Runner-Up Option
              </span>
              <h4 className="text-xl font-bold text-slate-800 mb-1">
                {alt.name}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {alt.summary}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Consider adopting the runner-up methodology if stakeholders lean more toward its respective strengths, or if you can adjust team-level practices to match its prerequisites.
            </p>
          </div>
          <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 leading-relaxed flex items-start gap-2 mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>When to Pivot:</strong> If your organizational culture or funding release shifts, the optimal path will pivot immediately toward <strong>{alt.name}</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Staffing, Cadence & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Staffing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Roles to Staff
            </h4>
          </div>
          <ul className="space-y-2">
            {r.roles.map((role, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100/50 font-medium">
                <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>{role}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metrics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Target className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Metrics to Track
            </h4>
          </div>
          <ul className="space-y-2">
            {r.metrics.map((metric, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100/50 font-medium">
                <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{metric}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cadences */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Ceremonies & Cadence
            </h4>
          </div>
          <ul className="space-y-2">
            {r.cadence.map((cad, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100/50 font-medium">
                <ArrowRight className="w-3 h-3 text-purple-500 shrink-0" />
                <span>{cad}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stakeholder Perspectives Report Card (Middle Management & Finance views) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Stakeholder Impact Analysis
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Middle Management View */}
          <div className="bg-amber-50/20 border border-amber-100/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Management & Progress View
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {r.management_view}
            </p>
          </div>

          {/* Finance View */}
          <div className="bg-emerald-50/20 border border-emerald-100/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Finance & Funding View
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {r.finance_view}
            </p>
          </div>
        </div>
      </div>

      {/* Execution Risks (Watch out for...) */}
      <div className="bg-red-50/20 border border-red-100 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-red-100">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h4 className="font-bold text-red-800 text-xs uppercase tracking-wider">
            Critical Pitfalls & Risks of {r.name}
          </h4>
        </div>
        <ul className="space-y-2">
          {r.risks.map((risk, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
              <span className="h-1.5 w-1.5 bg-red-500 rounded-full shrink-0 mt-1.5" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Report Controls (Print, restart, back, etc.) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
        <button
          id="restart-btn"
          onClick={onRestart}
          className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 bg-white hover:bg-indigo-50/50 rounded-xl transition-all flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start a New Assessment</span>
        </button>

        <button
          id="print-btn"
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Save as PDF / Print Report</span>
        </button>
      </div>
    </div>
  );
};
