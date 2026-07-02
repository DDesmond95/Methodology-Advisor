/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MethodologyId =
  | "waterfall"
  | "scrum"
  | "kanban"
  | "scrumban"
  | "hybrid"
  | "safe"
  | "lean"
  | "xp";

export interface Option {
  text: string;
  weights: Partial<Record<MethodologyId, number>>;
}

export interface Question {
  id: string;
  perspective: string;
  signal: number; // 1, 2, or 3
  text: string;
  options: Option[];
}

export interface Recommendation {
  name: string;
  summary: string;
  roles: string[];
  metrics: string[];
  cadence: string[];
  management_view: string;
  finance_view: string;
  risks: string[];
}

export interface Scenario {
  id: string;
  name: string;
  timestamp: string;
  mode: "adaptive" | "exhaustive";
  scores: Record<MethodologyId, number>;
  recommendedId: MethodologyId;
  answers: { questionId: string; optionText: string }[];
}
