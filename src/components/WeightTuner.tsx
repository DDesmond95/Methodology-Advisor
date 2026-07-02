/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sliders, RotateCcw, Info } from "lucide-react";
import { getPerspectiveConfig } from "./PerspectiveIcon";

interface WeightTunerProps {
  weights: Record<string, number>;
  onWeightChange: (perspective: string, value: number) => void;
  onResetWeights: () => void;
}

export const WeightTuner: React.FC<WeightTunerProps> = ({
  weights,
  onWeightChange,
  onResetWeights
}) => {
  return (
    <div
      id="weight-tuner-card"
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">
            Stakeholder Power Dynamics (Weight Tuner)
          </h3>
        </div>
        <button
          id="reset-weights-btn"
          onClick={onResetWeights}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-md bg-slate-50 hover:bg-indigo-50/50 transition-colors"
          title="Reset all perspective weights to default (1.0)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Adjust the sliders to simulate changes in organizational influence. 
        For example, increasing <strong>Finance</strong> or <strong>Compliance</strong> weights 
        prioritizes structure, while boosting the <strong>Delivery Team</strong> emphasizes agility.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(weights) as [string, number][]).map(([perspective, val]) => {
          const config = getPerspectiveConfig(perspective);
          const Icon = config.icon;

          return (
            <div
              key={perspective}
              id={`tuner-row-${perspective.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
              className="flex flex-col gap-1.5 p-3 rounded-lg border border-slate-100 bg-slate-50/30 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${config.bgColor} ${config.textColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 truncate max-w-[180px]">
                    {perspective}
                  </span>
                </div>
                <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${val > 1 ? "bg-indigo-100 text-indigo-700" : val < 1 ? "bg-slate-100 text-slate-500" : "bg-slate-200/50 text-slate-700"}`}>
                  {val.toFixed(1)}x
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-medium">0.0</span>
                <input
                  id={`slider-${perspective.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={val}
                  onChange={(e) => onWeightChange(perspective, parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-medium">2.0</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 bg-indigo-50/40 border border-indigo-100/60 rounded-lg p-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <span className="text-[11px] text-indigo-800 leading-relaxed">
          <strong>Interactive math</strong>: Option weights are multiplied by both the question's base 
          signal (1 to 3) and this lens's custom multiplier before aggregating. Updates are instant!
        </span>
      </div>
    </div>
  );
};
