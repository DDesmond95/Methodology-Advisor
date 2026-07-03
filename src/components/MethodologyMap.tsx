/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MethodologyId, Question, Option } from "../types";
import { RECS } from "../data";
import {
  GitFork,
  Network,
  CheckCircle,
  HelpCircle,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Boxes
} from "lucide-react";

interface MethodologyMapProps {
  recommendedId: MethodologyId;
  askedQuestions: Question[];
  answers: Record<string, Option>;
}

export const MethodologyMap: React.FC<MethodologyMapProps> = ({
  recommendedId,
  askedQuestions,
  answers
}) => {
  const [mapMode, setMapMode] = useState<"decision-path" | "landscape">("decision-path");
  const [selectedMindNode, setSelectedMindNode] = useState<MethodologyId>(recommendedId);

  // Helper to check if a specific condition in the flowchart was satisfied by user answers
  const checkAnswerContains = (questionId: string, keyword: string): boolean => {
    const ans = answers[questionId]?.text?.toLowerCase();
    if (!ans) return false;
    return ans.includes(keyword);
  };

  // Determine active states for the decision path flowchart nodes
  const reqStable = askedQuestions.some(q => q.id === "req_stability")
    ? checkAnswerContains("req_stability", "fixed") || checkAnswerContains("req_stability", "mostly")
    : null; // null means undetermined

  const isAgileEvolving = askedQuestions.some(q => q.id === "req_stability")
    ? checkAnswerContains("req_stability", "evolve")
    : null;

  const isInterruptDriven = askedQuestions.some(q => q.id === "req_stability")
    ? checkAnswerContains("req_stability", "unpredictable") || checkAnswerContains("req_stability", "interrupt")
    : null;

  // Level 2 paths
  const hasHeavyGovernance = askedQuestions.some(q => q.id === "governance")
    ? checkAnswerContains("governance", "strict") || checkAnswerContains("governance", "heavy")
    : null;

  const isScaledTeams = askedQuestions.some(q => q.id === "team_scale")
    ? checkAnswerContains("team_scale", "many") || checkAnswerContains("team_scale", "large")
    : null;

  const hasHighInterrupt = askedQuestions.some(q => q.id === "interrupt_rate")
    ? checkAnswerContains("interrupt_rate", "frequently") || checkAnswerContains("interrupt_rate", "constantly")
    : null;

  const hasStrongEngineering = askedQuestions.some(q => q.id === "eng_discipline")
    ? checkAnswerContains("eng_discipline", "rigorous") || checkAnswerContains("eng_discipline", "tdd")
    : null;

  return (
    <div id="interactive-map-container" className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Interactive Decision & Methodology Maps
          </h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Visualize how your project factors map into the final framework recommendation, or explore the general methodology landscape.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start shrink-0">
          <button
            id="btn-map-decision"
            onClick={() => setMapMode("decision-path")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mapMode === "decision-path"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Decision Flow</span>
          </button>
          <button
            id="btn-map-landscape"
            onClick={() => setMapMode("landscape")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              mapMode === "landscape"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Landscape Mind Map</span>
          </button>
        </div>
      </div>

      {/* 1. DYNAMIC DECISION PATH FLOWCHART */}
      {mapMode === "decision-path" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 overflow-hidden">
          <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Below is the dynamic decision-tree path based on your <strong>assessment history</strong>. 
              The nodes light up in <span className="text-indigo-600 font-semibold">Indigo</span> when your answers satisfy that branch. 
              The ultimate leaf node highlighted matching your recommendation is <strong>{RECS[recommendedId]?.name}</strong>.
            </p>
          </div>

          {/* SVG Connector Flowchart Box */}
          <div className="relative border border-slate-100 bg-slate-50/20 rounded-xl p-6 min-h-[420px] flex flex-col justify-between">
            {/* Horizontal or Vertical flow depending on layout, here we model a highly structured visual grid flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
              
              {/* Column 1: Root & Core Question */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  Step 1: Requirements Scope
                </div>
                
                {/* Node: Start */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-4 text-center shadow-sm">
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Entry Node</span>
                  <h4 className="text-xs font-extrabold">All Project Variables</h4>
                </div>

                {/* Question Node */}
                <div className={`border-2 rounded-xl p-4 text-center transition-all ${
                  askedQuestions.some(q => q.id === "req_stability")
                    ? "border-indigo-500 bg-indigo-50/40 text-indigo-900"
                    : "border-slate-200 bg-white text-slate-400"
                }`}>
                  <span className="text-[9px] uppercase font-bold tracking-widest block opacity-75">Core Decision Variable</span>
                  <h4 className="text-xs font-extrabold mt-0.5">Are requirements stable upfront?</h4>
                  {askedQuestions.some(q => q.id === "req_stability") && (
                    <span className="inline-block bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full mt-2 font-semibold">
                      Answered
                    </span>
                  )}
                </div>
              </div>

              {/* Column 2: Branching Variables */}
              <div className="flex flex-col justify-between gap-4">
                <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  Step 2: Structural Constraints
                </div>

                {/* Sub-Branch A: Predictive */}
                <div className={`border-2 rounded-xl p-3.5 transition-all flex flex-col justify-between h-[110px] ${
                  reqStable === true
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-900"
                    : reqStable === false
                    ? "border-slate-200 bg-slate-100/50 text-slate-300 opacity-40"
                    : "border-slate-200 bg-white text-slate-400"
                }`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold block opacity-75">Predictive Branch</span>
                    <h5 className="text-xs font-bold mt-0.5">Strict Governance & Lock-In?</h5>
                  </div>
                  <span className="text-[10px] italic">
                    {reqStable === true ? "✓ Answered: Stable/Fixed" : "Pending stability signal"}
                  </span>
                </div>

                {/* Sub-Branch B: Adaptive Iterations */}
                <div className={`border-2 rounded-xl p-3.5 transition-all flex flex-col justify-between h-[110px] ${
                  isAgileEvolving === true
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-900"
                    : isAgileEvolving === false
                    ? "border-slate-200 bg-slate-100/50 text-slate-300 opacity-40"
                    : "border-slate-200 bg-white text-slate-400"
                }`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold block opacity-75">Adaptive Sprint Branch</span>
                    <h5 className="text-xs font-bold mt-0.5">Scale or Engineering Rigor?</h5>
                  </div>
                  <span className="text-[10px] italic">
                    {isAgileEvolving === true ? "✓ Answered: Iterative/Evolving" : "Pending evolving signal"}
                  </span>
                </div>

                {/* Sub-Branch C: Continuous Flow */}
                <div className={`border-2 rounded-xl p-3.5 transition-all flex flex-col justify-between h-[110px] ${
                  isInterruptDriven === true
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm text-indigo-900"
                    : isInterruptDriven === false
                    ? "border-slate-200 bg-slate-100/50 text-slate-300 opacity-40"
                    : "border-slate-200 bg-white text-slate-400"
                }`}>
                  <div>
                    <span className="text-[9px] uppercase font-bold block opacity-75">Continuous Flow Branch</span>
                    <h5 className="text-xs font-bold mt-0.5">Ad-Hoc / Highly Interruptive?</h5>
                  </div>
                  <span className="text-[10px] italic">
                    {isInterruptDriven === true ? "✓ Answered: Unpredictable/Ad-hoc" : "Pending flow signal"}
                  </span>
                </div>
              </div>

              {/* Column 3: Recommended Leaf Target */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center font-bold text-[10px] uppercase tracking-wider text-slate-400">
                  Step 3: Framework Resolution
                </div>

                {/* Highlighted winner leaf */}
                <div className="bg-indigo-900 text-white rounded-2xl p-5 border border-indigo-950/80 shadow-md flex flex-col items-center justify-center text-center space-y-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-800 flex items-center justify-center text-indigo-300 animate-pulse">
                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-300 block">
                      Resolved Fit
                    </span>
                    <h4 className="text-lg font-black tracking-tight">{RECS[recommendedId]?.name}</h4>
                  </div>
                  <p className="text-[11px] text-indigo-200 leading-relaxed max-w-[200px]">
                    Best aligned with your organization's power balances, budget release, and governance gates.
                  </p>
                </div>
              </div>

            </div>

            {/* Absolute background connecting lines (pure CSS representation) */}
            <div className="hidden md:block absolute inset-0 pointer-events-none opacity-30">
              <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                {/* Line from Root to Column 2 Sub-Branches */}
                <path d="M 230 180 Q 250 120 330 120" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5,5" />
                <path d="M 230 180 Q 250 200 330 205" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5,5" />
                <path d="M 230 180 Q 250 290 330 290" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5,5" />

                {/* Line from Column 2 Sub-Branches to resolved leaf */}
                <path d="M 500 120 Q 550 180 580 185" fill="none" stroke="#6366f1" strokeWidth="2" />
                <path d="M 500 205 Q 550 205 580 205" fill="none" stroke="#6366f1" strokeWidth="2" />
                <path d="M 500 290 Q 550 220 580 225" fill="none" stroke="#6366f1" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* 2. GLOBAL LANDSCAPE MIND MAP */}
      {mapMode === "landscape" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mind Map Canvas Node Grid (Left 2 columns) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
              Methodology Family Domains
            </h4>

            <div className="grid grid-cols-2 gap-4 relative min-h-[360px] p-2">
              
              {/* Category: Predictive / Planned */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Predictive & Structured
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "waterfall", title: "Waterfall", label: "Pure Sequential Plan" },
                    { id: "hybrid", title: "Hybrid (Agile/Gate)", label: "Structured + Sprints" }
                  ].map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedMindNode(node.id as MethodologyId)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedMindNode === node.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-800">{node.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Agile Sprints */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Adaptive Iterative
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "scrum", title: "Scrum", label: "Standard 2-Week Sprint" },
                    { id: "xp", title: "XP (Extreme Prog.)", label: "Agile + TDD Rigor" }
                  ].map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedMindNode(node.id as MethodologyId)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedMindNode === node.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-800">{node.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Continuous Flow / Lean */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Boxes className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Flow & Optimization
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "kanban", title: "Kanban", label: "Continuous WIP Board" },
                    { id: "scrumban", title: "Scrumban", label: "Sprint Structure + Flow" },
                    { id: "lean", title: "Lean", label: "Waste & Lead Time focus" }
                  ].map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedMindNode(node.id as MethodologyId)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedMindNode === node.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-800">{node.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Enterprise Scaled */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Scaled Program
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: "safe", title: "SAFe (Scaled Agile)", label: "Large Enterprise Train" }
                  ].map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedMindNode(node.id as MethodologyId)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedMindNode === node.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/15"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold block text-slate-800">{node.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Node Inspector Sidebar (Right 1 column) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-500 block">
                  Interactive Node Inspector
                </span>
                <h3 className="text-lg font-black text-slate-800">
                  {RECS[selectedMindNode]?.name}
                </h3>
              </div>

              <div className="space-y-4 mt-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Core Mandate
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {RECS[selectedMindNode]?.summary}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-1">
                    Prerequisite Roles
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {RECS[selectedMindNode]?.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-semibold"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider mb-1">
                    Primary Metrics
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {RECS[selectedMindNode]?.metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {selectedMindNode === recommendedId && (
              <div className="bg-indigo-950 text-white rounded-xl p-3 border border-indigo-900 text-xs flex items-center justify-between">
                <span>⭐ This matches your recommendation!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
