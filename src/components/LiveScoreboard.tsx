/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RECS } from "../data";
import { MethodologyId } from "../types";
import { BarChart3 } from "lucide-react";

interface LiveScoreboardProps {
  scores: Record<MethodologyId, number>;
  compact?: boolean;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({
  scores,
  compact = false
}) => {
  const maxScore = Math.max(1, ...(Object.values(scores) as number[]));
  const sortedScores = (Object.entries(scores) as [MethodologyId, number][])
    .map(([m, val]) => ({
      id: m,
      name: RECS[m]?.name || m,
      score: val
    }))
    .sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div id="live-scores-compact" className="bg-slate-50 border border-slate-200/60 rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Current Leaning (Top 4)
          </h4>
        </div>
        <div className="space-y-2">
          {sortedScores.slice(0, 4).map((item, idx) => {
            const pct = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
            const isLeader = idx === 0 && item.score > 0;

            return (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                <span className={`w-16 truncate font-medium ${isLeader ? "text-indigo-600 font-bold" : "text-slate-600"}`}>
                  {item.name.split(" ")[0]}
                </span>
                <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isLeader ? "bg-indigo-600" : "bg-slate-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-right font-mono text-slate-500 font-medium">
                  {Math.round(item.score)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="live-scores-full" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
          Aggregated Methodology Scores
        </h3>
      </div>
      <div className="space-y-3">
        {sortedScores.map((item, idx) => {
          const pct = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
          const isLeader = idx === 0 && item.score > 0;

          return (
            <div key={item.id} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${isLeader ? "text-indigo-600 font-bold text-sm" : "text-slate-700"}`}>
                  {item.name}
                </span>
                <span className="font-mono text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.score.toFixed(1)} pts
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLeader
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm"
                      : idx === 1
                      ? "bg-slate-500"
                      : "bg-slate-400/70"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
