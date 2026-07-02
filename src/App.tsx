/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QUESTIONS, RECS } from "./data";
import { Question, Option, MethodologyId, Scenario } from "./types";
import { PerspectiveBadge, getPerspectiveConfig } from "./components/PerspectiveIcon";
import { LiveScoreboard } from "./components/LiveScoreboard";
import { LensBreakdown } from "./components/LensBreakdown";
import { WeightTuner } from "./components/WeightTuner";
import { ScenarioComparer } from "./components/ScenarioComparer";
import { ResultsDisplay } from "./components/ResultsDisplay";
import {
  Sparkles,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Settings,
  Scale,
  Sliders,
  Bookmark,
  Award,
  HelpCircle,
  FileCheck
} from "lucide-react";

const CONFIDENCE_THRESHOLD = 0.25;
const MIN_QUESTIONS = 6;
const HIGH_SIGNAL = 3;

export default function App() {
  // App state
  const [currentStep, setCurrentStep] = useState<"welcome" | "quiz" | "results">("welcome");
  const [mode, setMode] = useState<"adaptive" | "exhaustive">("adaptive");

  // Questions pools
  const [askedQuestions, setAskedQuestions] = useState<Question[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Record<string, Option>>({});

  // Question selection history (for backtracking/undo)
  const [historyStack, setHistoryStack] = useState<
    {
      currentQuestion: Question;
      asked: Question[];
      available: Question[];
      answers: Record<string, Option>;
    }[]
  >([]);

  // Customizable lens weights
  const [weights, setWeights] = useState<Record<string, number>>({
    "Product / Customer": 1.0,
    "Finance": 1.0,
    "Executive / Leadership": 1.0,
    "PMO / Governance": 1.0,
    "Middle Management": 1.0,
    "Delivery Team": 1.0,
    "IT / Operations": 1.0,
    "Compliance / Legal / Risk": 1.0,
    "HR / Org Culture": 1.0
  });

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);

  // Active tab on results screen
  const [resultsTab, setResultsTab] = useState<"report" | "breakdown" | "tuner" | "history">("report");

  // Show live scores inline in the quiz
  const [showLiveQuizScores, setShowLiveQuizScores] = useState(false);

  // Load scenarios from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem("methodology_advisor_scenarios");
      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved scenarios:", e);
    }
  }, []);

  // Dynamically calculate scores based on answers and weights
  const scores: Record<MethodologyId, number> = React.useMemo(() => {
    const s: Record<MethodologyId, number> = {
      waterfall: 0,
      scrum: 0,
      kanban: 0,
      scrumban: 0,
      hybrid: 0,
      safe: 0,
      lean: 0,
      xp: 0
    };

    askedQuestions.forEach((q) => {
      const option = answers[q.id];
      if (option) {
        const scale = weights[q.perspective] ?? 1.0;
        (Object.entries(option.weights) as [MethodologyId, number][]).forEach(([m, w]) => {
          const mId = m;
          if (s[mId] !== undefined) {
            s[mId] += (w ?? 0) * q.signal * scale;
          }
        });
      }
    });

    return s;
  }, [askedQuestions, answers, weights]);

  // Derive ranked methodologies
  const rankedMethodologies = React.useMemo(() => {
    return Object.entries(scores)
      .map(([m, val]) => ({
        id: m as MethodologyId,
        score: val
      }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const recommendedId = rankedMethodologies[0]?.id || "scrum";
  const runnerUpId = rankedMethodologies[1]?.id || "waterfall";

  // Calculate confidence gap
  const confidenceGap = React.useMemo(() => {
    const top = rankedMethodologies[0]?.score || 0;
    const second = rankedMethodologies[1]?.score || 0;
    return top === 0 ? 0 : (top - second) / top;
  }, [rankedMethodologies]);

  // Determine if there are high-signal questions remaining in pool
  const hasRemainingHighSignal = React.useMemo(() => {
    return availableQuestions.some((q) => q.signal >= HIGH_SIGNAL);
  }, [availableQuestions]);

  // Check if we can safely stop early in adaptive mode
  const canFinishEarly = React.useMemo(() => {
    if (askedQuestions.length < MIN_QUESTIONS) return false;
    if (hasRemainingHighSignal) return false;
    return confidenceGap >= CONFIDENCE_THRESHOLD;
  }, [askedQuestions.length, hasRemainingHighSignal, confidenceGap]);

  // Dynamic stabilizer diagnostic text
  const whatWouldChangeText = React.useMemo(() => {
    for (const q of availableQuestions) {
      const scale = weights[q.perspective] ?? 1.0;
      for (const o of q.options) {
        const testScores = { ...scores };
        (Object.entries(o.weights) as [MethodologyId, number][]).forEach(([m, w]) => {
          const mId = m;
          if (testScores[mId] !== undefined) {
            testScores[mId] += (w ?? 0) * q.signal * scale;
          }
        });
        const sorted = Object.entries(testScores).sort((a, b) => b[1] - a[1]);
        const newLeader = sorted[0][0] as MethodologyId;
        if (newLeader !== recommendedId) {
          return `Your potential answers to remaining questions, such as "${q.text}" under the "${q.perspective}" lens, could sway the recommendation to ${RECS[newLeader]?.name || newLeader}.`;
        }
      }
    }
    return "The current recommendation is structurally stable across all remaining contextual factors.";
  }, [availableQuestions, scores, recommendedId, weights]);

  // Pick the next question that resolves the difference between leader and runner-up
  const selectNextQuestion = (
    avail: Question[],
    currentLeader: MethodologyId,
    currentRunnerUp: MethodologyId
  ): Question | null => {
    if (avail.length === 0) return null;

    let bestQ: Question | null = null;
    let highestRelevance = -1;

    for (const q of avail) {
      let relevance = q.signal;

      // Check if this question's options touch the contested pair (leader vs. runner-up)
      const touchesContested = q.options.some(
        (o) =>
          o.weights[currentLeader] !== undefined ||
          o.weights[currentRunnerUp] !== undefined
      );

      if (touchesContested) {
        relevance += 2.0;
      }

      if (relevance > highestRelevance) {
        highestRelevance = relevance;
        bestQ = q;
      }
    }

    return bestQ || avail[0];
  };

  // Start the assessment
  const handleStart = (selectedMode: "adaptive" | "exhaustive") => {
    setMode(selectedMode);
    const initialPool = [...QUESTIONS];
    setAvailableQuestions(initialPool);
    setAskedQuestions([]);
    setAnswers({});
    setHistoryStack([]);
    setWeights({
      "Product / Customer": 1.0,
      "Finance": 1.0,
      "Executive / Leadership": 1.0,
      "PMO / Governance": 1.0,
      "Middle Management": 1.0,
      "Delivery Team": 1.0,
      "IT / Operations": 1.0,
      "Compliance / Legal / Risk": 1.0,
      "HR / Org Culture": 1.0
    });

    // Pick first question (use a decisive high signal one first)
    const firstQ = initialPool.find((q) => q.id === "req_stability") || initialPool[0];
    setCurrentQuestion(firstQ);
    setAvailableQuestions(initialPool.filter((q) => q.id !== firstQ.id));
    setCurrentStep("quiz");
  };

  // Handle answering a question
  const handleAnswer = (option: Option) => {
    if (!currentQuestion) return;

    // Push current state to history stack for backtrack
    setHistoryStack((prev) => [
      ...prev,
      {
        currentQuestion,
        asked: askedQuestions,
        available: availableQuestions,
        answers: { ...answers }
      }
    ]);

    const updatedAsked = [...askedQuestions, currentQuestion];
    const updatedAnswers = { ...answers, [currentQuestion.id]: option };

    setAskedQuestions(updatedAsked);
    setAnswers(updatedAnswers);

    // Calculate dynamic scores immediately to pick next question logically
    const tempScores = {
      waterfall: 0,
      scrum: 0,
      kanban: 0,
      scrumban: 0,
      hybrid: 0,
      safe: 0,
      lean: 0,
      xp: 0
    };
    updatedAsked.forEach((q) => {
      const opt = updatedAnswers[q.id];
      if (opt) {
        const scale = weights[q.perspective] ?? 1.0;
        (Object.entries(opt.weights) as [MethodologyId, number][]).forEach(([m, w]) => {
          const mId = m;
          if (tempScores[mId] !== undefined) {
            tempScores[mId] += (w ?? 0) * q.signal * scale;
          }
        });
      }
    });

    const sorted = Object.entries(tempScores).sort((a, b) => b[1] - a[1]);
    const lead = (sorted[0]?.[0] || "scrum") as MethodologyId;
    const runUp = (sorted[1]?.[0] || "waterfall") as MethodologyId;
    const gap = sorted[0] ? (sorted[0][1] - (sorted[1]?.[1] || 0)) / (sorted[0][1] || 1) : 0;
    const hasHighSig = availableQuestions.some((q) => q.signal >= HIGH_SIGNAL);

    // Decide if we should finish
    const nextAvail = availableQuestions;
    const isFinished = (selectedMode: "adaptive" | "exhaustive") => {
      if (nextAvail.length === 0) return true;
      if (selectedMode === "exhaustive") return false;
      return (
        updatedAsked.length >= MIN_QUESTIONS &&
        !hasHighSig &&
        gap >= CONFIDENCE_THRESHOLD
      );
    };

    if (isFinished(mode)) {
      setCurrentStep("results");
      setResultsTab("report");
    } else {
      const nextQ = selectNextQuestion(nextAvail, lead, runUp);
      if (nextQ) {
        setCurrentQuestion(nextQ);
        setAvailableQuestions(nextAvail.filter((q) => q.id !== nextQ.id));
      } else {
        setCurrentStep("results");
        setResultsTab("report");
      }
    }
  };

  // Backtrack/Undo last question
  const handleBacktrack = () => {
    if (historyStack.length === 0) return;

    const lastState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));

    setCurrentQuestion(lastState.currentQuestion);
    setAskedQuestions(lastState.asked);
    setAvailableQuestions(lastState.available);
    setAnswers(lastState.answers);
  };

  // Force early termination in adaptive mode
  const handleFinishEarly = () => {
    setCurrentStep("results");
    setResultsTab("report");
  };

  // Weight modification
  const handleWeightChange = (perspective: string, value: number) => {
    setWeights((prev) => ({ ...prev, [perspective]: value }));
  };

  const handleResetWeights = () => {
    setWeights({
      "Product / Customer": 1.0,
      "Finance": 1.0,
      "Executive / Leadership": 1.0,
      "PMO / Governance": 1.0,
      "Middle Management": 1.0,
      "Delivery Team": 1.0,
      "IT / Operations": 1.0,
      "Compliance / Legal / Risk": 1.0,
      "HR / Org Culture": 1.0
    });
  };

  // Save Scenario
  const handleSaveScenario = (name: string) => {
    const newScenario: Scenario = {
      id: `sc-${Date.now()}`,
      name,
      timestamp: new Date().toLocaleString(),
      mode,
      scores,
      recommendedId,
      answers: askedQuestions.map((q) => ({
        questionId: q.id,
        optionText: answers[q.id]?.text || ""
      }))
    };

    const updated = [...savedScenarios, newScenario];
    setSavedScenarios(updated);
    try {
      localStorage.setItem("methodology_advisor_scenarios", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to persist scenario:", e);
    }
  };

  // Load Scenario
  const handleLoadScenario = (sc: Scenario) => {
    // Reconstruct answers maps and asked list
    const reconstructedAnswers: Record<string, Option> = {};
    const reconstructedAsked: Question[] = [];

    sc.answers.forEach((ansItem) => {
      const matchedQ = QUESTIONS.find((q) => q.id === ansItem.questionId);
      if (matchedQ) {
        reconstructedAsked.push(matchedQ);
        const matchedOpt = matchedQ.options.find((o) => o.text === ansItem.optionText);
        if (matchedOpt) {
          reconstructedAnswers[matchedQ.id] = matchedOpt;
        }
      }
    });

    setAskedQuestions(reconstructedAsked);
    setAnswers(reconstructedAnswers);
    setAvailableQuestions(
      QUESTIONS.filter((q) => !reconstructedAsked.some((aq) => aq.id === q.id))
    );
    setMode(sc.mode);
    setCurrentStep("results");
    setResultsTab("report");
  };

  // Delete Scenario
  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter((sc) => sc.id !== id);
    setSavedScenarios(updated);
    try {
      localStorage.setItem("methodology_advisor_scenarios", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update scenarios:", e);
    }
  };

  // Reset entirely
  const handleRestart = () => {
    setCurrentStep("welcome");
    setAskedQuestions([]);
    setAnswers({});
    setAvailableQuestions([]);
    setCurrentQuestion(null);
    setHistoryStack([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleRestart}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
              PM
            </div>
            <div>
              <span className="text-sm font-black text-slate-800 tracking-tight block">
                Methodology Advisor
              </span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest block">
                Enterprise Decision Framework
              </span>
            </div>
          </div>

          {currentStep === "quiz" && (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-indigo-50 border border-indigo-100/80 text-indigo-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {mode === "adaptive" ? "Adaptive Mode" : "Exhaustive Mode"}
              </span>
              <button
                id="header-restart"
                onClick={handleRestart}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
              >
                Reset Quiz
              </button>
            </div>
          )}

          {currentStep === "results" && (
            <button
              id="header-recalculate"
              onClick={handleRestart}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/50 px-3 py-1.5 rounded-lg transition-all"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* WELCOME / START SCREEN */}
          {currentStep === "welcome" && (
            <motion.div
              key="welcome-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto space-y-8"
              id="start-screen"
            >
              {/* Logo Card Banner */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PMI® alignment methodology diagnostic</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Find the Perfect Development Methodology for Your Organization
                </h1>
                <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
                  Answer structured questions about your project, finance, executive mandate, team maturity, and governance requirements. We will recommend the optimal framework.
                </p>
              </div>

              {/* Stakeholders Multi-lens Display */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                  Synthesizing Nine Organizational Stakeholder Perspectives
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    "Product / Customer",
                    "Finance",
                    "Executive / Leadership",
                    "PMO / Governance",
                    "Middle Management",
                    "Delivery Team",
                    "IT / Operations",
                    "Compliance / Legal / Risk",
                    "HR / Org Culture"
                  ].map((p) => {
                    const config = getPerspectiveConfig(p);
                    const Icon = config.icon;
                    return (
                      <div
                        key={p}
                        className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200/80 transition-all cursor-default"
                      >
                        <div className={`p-1.5 rounded-lg ${config.bgColor} ${config.textColor}`}>
                          <Icon className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate">{p}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selection Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adaptive Mode */}
                <div
                  id="mode-adaptive"
                  onClick={() => handleStart("adaptive")}
                  className="bg-white hover:bg-slate-50/20 border-2 border-indigo-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Recommended
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-slate-800">
                      Adaptive Assessment
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Evaluates signals dynamically. Shuts down the questionnaire as soon as a statistically decisive leading methodology is locked.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-bold text-xs">
                    <span>Adaptive Run (6 - 15 questions)</span>
                    <Play className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Exhaustive Mode */}
                <div
                  id="mode-exhaustive"
                  onClick={() => handleStart("exhaustive")}
                  className="bg-white hover:bg-slate-50/20 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      Comprehensive Audit
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Asks all 35 questions sequentially. Ideal for producing deep regulatory reports or performing rigorous department-by-department reviews.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-600 font-semibold text-xs group-hover:text-indigo-600 transition-colors">
                    <span>Exhaustive Run (All 35 questions)</span>
                    <Play className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* QUESTIONNAIRE RUNNER SCREEN */}
          {currentStep === "quiz" && currentQuestion && (
            <motion.div
              key="quiz-stage"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="max-w-3xl mx-auto space-y-6"
              id="question-screen"
            >
              {/* Perspective Badge and signal diagnostics */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PerspectiveBadge perspective={currentQuestion.perspective} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Question {askedQuestions.length + 1}
                  </span>
                  <span className="text-slate-200">|</span>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Signal strength: {currentQuestion.signal === 3 ? "Decisive" : currentQuestion.signal === 2 ? "Moderate" : "Subtle"}
                  </span>
                </div>
              </div>

              {/* Progress and indicators */}
              <div className="space-y-2">
                <div id="progress-bar" className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    id="progress-fill"
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        mode === "exhaustive"
                          ? (askedQuestions.length / QUESTIONS.length) * 100
                          : Math.min(100, (askedQuestions.length / 12) * 100)
                      }%`
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                  <span>
                    Progress: {askedQuestions.length} answered
                  </span>
                  {mode === "adaptive" && (
                    <span className="text-indigo-600">
                      Adaptive confidence targeting active...
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
                <h2 id="question-text" className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {currentQuestion.text}
                </h2>

                {/* Option Cards */}
                <div id="options" className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      id={`option-${idx}`}
                      onClick={() => handleAnswer(option)}
                      className="option p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-900">
                        {option.text}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  id="back-btn"
                  onClick={handleBacktrack}
                  disabled={historyStack.length === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>

                <div className="flex items-center gap-3">
                  {mode === "adaptive" && askedQuestions.length >= MIN_QUESTIONS && (
                    <button
                      id="terminate-early-btn"
                      onClick={handleFinishEarly}
                      className="px-3.5 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 rounded-xl transition-all"
                    >
                      Finish Early & View Current Recommendation
                    </button>
                  )}

                  <button
                    id="toggle-live-scoreboard"
                    onClick={() => setShowLiveQuizScores(!showLiveQuizScores)}
                    className="px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl transition-all"
                  >
                    {showLiveQuizScores ? "Hide Live Leaning" : "Show Live Leaning"}
                  </button>
                </div>
              </div>

              {/* Live scores widget */}
              {showLiveQuizScores && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  <LiveScoreboard scores={scores} compact={true} />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* FINAL RESULTS SCREEN */}
          {currentStep === "results" && (
            <motion.div
              key="results-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
              id="result-screen"
            >
              {/* Tabs selector */}
              <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none print:hidden">
                {[
                  { id: "report", label: "Advisor Report", icon: FileCheck },
                  { id: "breakdown", label: "Department Votes", icon: Scale },
                  { id: "tuner", label: "Interactive Tuner", icon: Sliders },
                  { id: "history", label: "Scenarios & Comparisons", icon: Bookmark }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = resultsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-btn-${tab.id}`}
                      onClick={() => setResultsTab(tab.id as any)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
                        isActive
                          ? "border-b-indigo-600 text-indigo-600 bg-indigo-50/25"
                          : "border-b-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Tab Body */}
              <div className="space-y-6">
                {/* 1. REPORT VIEW */}
                {resultsTab === "report" && (
                  <ResultsDisplay
                    scores={scores}
                    recommendedId={recommendedId}
                    runnerUpId={runnerUpId}
                    askedQuestions={askedQuestions}
                    answers={answers}
                    confidenceGap={confidenceGap}
                    whatWouldChangeText={whatWouldChangeText}
                    onRestart={handleRestart}
                  />
                )}

                {/* 2. DEPARTMENT VOTES VIEW */}
                {resultsTab === "breakdown" && (
                  <div className="animate-fade-in">
                    <LensBreakdown
                      askedQuestions={askedQuestions}
                      answers={answers}
                      weights={weights}
                    />
                  </div>
                )}

                {/* 3. INTERACTIVE TUNER VIEW */}
                {resultsTab === "tuner" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2">
                      <WeightTuner
                        weights={weights}
                        onWeightChange={handleWeightChange}
                        onResetWeights={handleResetWeights}
                      />
                    </div>
                    <div>
                      <LiveScoreboard scores={scores} />
                    </div>
                  </div>
                )}

                {/* 4. SCENARIOS AND COMPARATIVE HISTORY VIEW */}
                {resultsTab === "history" && (
                  <ScenarioComparer
                    currentScores={scores}
                    currentRecommended={recommendedId}
                    currentMode={mode}
                    currentAnswers={askedQuestions.map((q) => ({
                      questionId: q.id,
                      optionText: answers[q.id]?.text || ""
                    }))}
                    savedScenarios={savedScenarios}
                    onSaveScenario={handleSaveScenario}
                    onDeleteScenario={handleDeleteScenario}
                    onLoadScenario={handleLoadScenario}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 print:hidden mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-semibold text-slate-400 tracking-wider">
            PROJECT METHODOLOGY ADVISOR &bull; ENTERPRISE SYSTEMS
          </span>
          <span className="font-medium font-mono text-[10px] text-slate-400">
            Based on organizational dynamics, executive tolerance, and structural constraints.
          </span>
        </div>
      </footer>
    </div>
  );
}
