/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Scenario, MethodologyId } from "../types";
import { RECS } from "../data";
import { Bookmark, Trash2, ArrowUpRight, Scale, Plus, Check } from "lucide-react";

interface ScenarioComparerProps {
  currentScores: Record<MethodologyId, number>;
  currentRecommended: MethodologyId;
  currentMode: "adaptive" | "exhaustive";
  currentAnswers: { questionId: string; optionText: string }[];
  savedScenarios: Scenario[];
  onSaveScenario: (name: string) => void;
  onDeleteScenario: (id: string) => void;
  onLoadScenario: (scenario: Scenario) => void;
}

export const ScenarioComparer: React.FC<ScenarioComparerProps> = ({
  currentScores,
  currentRecommended,
  currentMode,
  currentAnswers,
  savedScenarios,
  onSaveScenario,
  onDeleteScenario,
  onLoadScenario
}) => {
  const [newScenarioName, setNewScenarioName] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    onSaveScenario(newScenarioName.trim());
    setNewScenarioName("");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div
      id="scenario-comparer-card"
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Scale className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-800 text-base">
          Scenario Comparison & History
        </h3>
      </div>

      {/* Save current form */}
      <form onSubmit={handleSaveSubmit} className="flex gap-2 items-end">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Save Current Assessment as a Scenario
          </label>
          <input
            id="scenario-name-input"
            type="text"
            placeholder="e.g. 'Project Artemis - Phase 1'"
            value={newScenarioName}
            onChange={(e) => setNewScenarioName(e.target.value)}
            className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <button
          id="save-scenario-btn"
          type="submit"
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
            justSaved
              ? "bg-emerald-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {justSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Save Scenario</span>
            </>
          )}
        </button>
      </form>

      {/* Comparison table */}
      {savedScenarios.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Compare Saved Scenarios
          </h4>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4">Scenario / Date</th>
                  <th className="p-4">Recommendation</th>
                  <th className="p-4">Leaning Metrics</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Active current scenario row as reference */}
                <tr className="bg-indigo-50/20 border-l-4 border-l-indigo-600">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <span>[Active Run]</span>
                      <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded font-medium">
                        Live
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Current dynamic weights
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-indigo-600">
                      {RECS[currentRecommended]?.name || currentRecommended}
                    </span>
                    <span className="text-xs text-slate-400 block font-mono">
                      {currentAnswers.length} questions
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {(Object.entries(currentScores) as [MethodologyId, number][])
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([m, score]) => (
                          <span key={m} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                            {m.slice(0, 4)}:{Math.round(score)}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      Currently Displayed
                    </span>
                  </td>
                </tr>

                {/* Saved scenarios */}
                {savedScenarios.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{sc.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        {sc.timestamp}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">
                        {RECS[sc.recommendedId]?.name || sc.recommendedId}
                      </span>
                      <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                        {sc.mode} Mode
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        {(Object.entries(sc.scores) as [MethodologyId, number][])
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 3)
                          .map(([m, score]) => (
                            <span key={m} className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded font-mono font-medium">
                              {m.slice(0, 4)}:{Math.round(score)}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        id={`load-scenario-${sc.id}`}
                        onClick={() => onLoadScenario(sc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-md transition-all"
                        title="Restore this scenario's answers and weights to active display"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                      <button
                        id={`delete-scenario-${sc.id}`}
                        onClick={() => onDeleteScenario(sc.id)}
                        className="inline-flex items-center p-1 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-md transition-all"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
          <Bookmark className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
          <span className="text-xs font-medium text-slate-600 block">No scenarios saved yet</span>
          <span className="text-[10px] text-slate-400 max-w-[280px] mx-auto block mt-0.5">
            Fill in the form above to lock in your current scores and weights for side-by-side comparison.
          </span>
        </div>
      )}
    </div>
  );
};
