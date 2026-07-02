/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Question, Option, MethodologyId } from "../types";
import { RECS } from "../data";
import { getPerspectiveConfig } from "./PerspectiveIcon";
import { CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

interface LensBreakdownProps {
  askedQuestions: Question[];
  answers: Record<string, Option>;
  weights: Record<string, number>;
}

export const LensBreakdown: React.FC<LensBreakdownProps> = ({
  askedQuestions,
  answers,
  weights
}) => {
  // Define all possible perspectives
  const perspectives = [
    "Product / Customer",
    "Finance",
    "Executive / Leadership",
    "PMO / Governance",
    "Middle Management",
    "Delivery Team",
    "IT / Operations",
    "Compliance / Legal / Risk",
    "HR / Org Culture"
  ];

  return (
    <div id="lens-breakdown-panel" className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          Stakeholder Lens Breakdown
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          See how different departments inside your organization "voted" based on your answers. 
          Each card shows that specific department's favorite methodology and their alignment factors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {perspectives.map((perspective) => {
          const config = getPerspectiveConfig(perspective);
          const Icon = config.icon;

          // Filter questions answered for this perspective
          const perspectiveQuestions = askedQuestions.filter(
            (q) => q.perspective === perspective
          );

          // Calculate sub-scores for this perspective
          const subScores: Record<MethodologyId, number> = {
            waterfall: 0,
            scrum: 0,
            kanban: 0,
            scrumban: 0,
            hybrid: 0,
            safe: 0,
            lean: 0,
            xp: 0
          };

          let hasAnswers = false;
          perspectiveQuestions.forEach((q) => {
            const chosenOption = answers[q.id];
            if (chosenOption) {
              hasAnswers = true;
              const scale = weights[perspective] ?? 1.0;
              (Object.entries(chosenOption.weights) as [MethodologyId, number][]).forEach(([m, w]) => {
                const methId = m;
                if (subScores[methId] !== undefined) {
                  subScores[methId] += (w ?? 0) * q.signal * scale;
                }
              });
            }
          });

          // Find the leader in this perspective
          let leaderId: MethodologyId | null = null;
          let maxSubScore = 0;

          if (hasAnswers) {
            Object.entries(subScores).forEach(([m, val]) => {
              if (val > maxSubScore) {
                maxSubScore = val;
                leaderId = m as MethodologyId;
              }
            });
          }

          return (
            <div
              key={perspective}
              id={`lens-card-${perspective.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div className={`p-4 border-b border-slate-100 flex items-center gap-2.5 ${config.bgColor}`}>
                <div className={`p-1.5 rounded-lg bg-white shadow-sm ${config.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Perspective
                  </h4>
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {perspective}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                {hasAnswers && leaderId ? (
                  <div className="space-y-4">
                    {/* Winner Badge */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                          Department Leaning
                        </span>
                        <span className="text-base font-bold text-slate-800">
                          {RECS[leaderId].name}
                        </span>
                      </div>
                      <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
                        {maxSubScore.toFixed(1)} pts
                      </div>
                    </div>

                    {/* Question Answers list */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Deciding Factors
                      </span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {perspectiveQuestions.map((q) => {
                          const o = answers[q.id];
                          return (
                            <div key={q.id} className="text-xs text-slate-600 bg-slate-50/50 p-1.5 rounded border border-slate-100/60 leading-tight">
                              <span className="font-semibold text-slate-700 block mb-0.5 truncate" title={q.text}>
                                {q.text}
                              </span>
                              <span className="text-slate-500 block truncate" title={o?.text}>
                                &bull; {o?.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                    <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-xs font-medium">Awaiting input</span>
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[150px]">
                      Answer questions tagged under this lens to see votes.
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
