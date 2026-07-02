/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MethodologyId, Question, Recommendation } from "./types";

export const METHODOLOGIES: MethodologyId[] = [
  "waterfall",
  "scrum",
  "kanban",
  "scrumban",
  "hybrid",
  "safe",
  "lean",
  "xp"
];

export const QUESTIONS: Question[] = [
  // ---------- PRODUCT / CUSTOMER ----------
  {
    id: "req_stability",
    perspective: "Product / Customer",
    signal: 3,
    text: "How stable are the requirements expected to be?",
    options: [
      { text: "Fixed and fully known upfront; change is rare", weights: { waterfall: 5, hybrid: 2 } },
      { text: "Mostly known, some change expected", weights: { hybrid: 4, scrum: 2, safe: 1 } },
      { text: "Expected to evolve frequently as we learn", weights: { scrum: 5, xp: 3, scrumban: 2 } },
      { text: "Highly unpredictable / interrupt-driven", weights: { kanban: 5, scrumban: 3 } }
    ]
  },
  {
    id: "change_freq",
    perspective: "Product / Customer",
    signal: 2,
    text: "How often do priorities change once work is underway?",
    options: [
      { text: "Almost never; the plan is locked", weights: { waterfall: 4 } },
      { text: "Only between planned cycles", weights: { scrum: 3, safe: 1 } },
      { text: "Constantly; needs reprioritization anytime", weights: { kanban: 4, scrumban: 3 } }
    ]
  },
  {
    id: "po_availability",
    perspective: "Product / Customer",
    signal: 2,
    text: "How available is a decision-maker / customer for continuous input?",
    options: [
      { text: "Rarely; decisions are made upfront", weights: { waterfall: 4, hybrid: 2 } },
      { text: "Periodically available", weights: { hybrid: 2, scrumban: 2 } },
      { text: "Continuously available and engaged", weights: { scrum: 4, xp: 2 } }
    ]
  },
  {
    id: "delivery_need",
    perspective: "Product / Customer",
    signal: 2,
    text: "What kind of delivery does the customer need?",
    options: [
      { text: "One complete delivery at the end", weights: { waterfall: 4, hybrid: 1 } },
      { text: "Incremental releases over time", weights: { scrum: 4, safe: 1, xp: 1 } },
      { text: "A steady stream of small changes", weights: { kanban: 4, scrumban: 2 } }
    ]
  },
  {
    id: "feedback_loop",
    perspective: "Product / Customer",
    signal: 1,
    text: "How important is fast feedback from real users?",
    options: [
      { text: "Not important; requirements are validated upfront", weights: { waterfall: 3 } },
      { text: "Useful between cycles", weights: { scrum: 2, hybrid: 1 } },
      { text: "Critical; we need to learn continuously", weights: { scrum: 2, xp: 3, kanban: 1 } }
    ]
  },

  // ---------- FINANCE ----------
  {
    id: "funding",
    perspective: "Finance",
    signal: 3,
    text: "How is the work funded?",
    options: [
      { text: "Fixed-price contract; budget locked upfront", weights: { waterfall: 5, hybrid: 3 } },
      { text: "Time-and-materials / flexible funding", weights: { scrum: 3, kanban: 3, scrumban: 2 } },
      { text: "Internal product budget, funded per period", weights: { scrum: 3, safe: 2, kanban: 2 } }
    ]
  },
  {
    id: "cost_certainty",
    perspective: "Finance",
    signal: 2,
    text: "How much cost certainty does finance require upfront?",
    options: [
      { text: "Exact total must be forecast before start", weights: { waterfall: 4, hybrid: 2 } },
      { text: "A budget envelope with periodic review", weights: { scrum: 2, safe: 2, hybrid: 1 } },
      { text: "Rolling / operational spend is acceptable", weights: { kanban: 3, scrumban: 2, lean: 1 } }
    ]
  },
  {
    id: "funding_release",
    perspective: "Finance",
    signal: 1,
    text: "How is funding released?",
    options: [
      { text: "All approved upfront for the whole project", weights: { waterfall: 3 } },
      { text: "Released at milestones / gates", weights: { hybrid: 4, safe: 1 } },
      { text: "Continuous / per period", weights: { scrum: 2, kanban: 2 } }
    ]
  },
  {
    id: "cost_priority",
    perspective: "Finance",
    signal: 1,
    text: "Which cost concern dominates?",
    options: [
      { text: "Not exceeding a fixed contract price", weights: { waterfall: 3, hybrid: 1 } },
      { text: "Getting value delivered early to offset cost", weights: { scrum: 3 } },
      { text: "Eliminating waste / maximizing efficiency", weights: { lean: 5, kanban: 1 } }
    ]
  },

  // ---------- EXECUTIVE / LEADERSHIP ----------
  {
    id: "exec_priority",
    perspective: "Executive / Leadership",
    signal: 3,
    text: "What does leadership need most?",
    options: [
      { text: "Predictable scope, date and budget", weights: { waterfall: 4, hybrid: 3 } },
      { text: "Speed to market and early value", weights: { scrum: 3, xp: 2, scrumban: 1 } },
      { text: "Maximum adaptability to change", weights: { scrum: 3, kanban: 3 } },
      { text: "Efficiency / eliminating waste", weights: { lean: 5, kanban: 2 } }
    ]
  },
  {
    id: "strategic_weight",
    perspective: "Executive / Leadership",
    signal: 1,
    text: "How strategically critical / high-stakes is this work?",
    options: [
      { text: "Mission-critical, failure is catastrophic", weights: { waterfall: 3, hybrid: 2, safe: 1 } },
      { text: "Important but recoverable", weights: { scrum: 2, hybrid: 1 } },
      { text: "Routine / low-stakes", weights: { kanban: 2, scrum: 1 } }
    ]
  },
  {
    id: "time_to_value",
    perspective: "Executive / Leadership",
    signal: 2,
    text: "How soon must the business see returns?",
    options: [
      { text: "Only at the end, once it's complete", weights: { waterfall: 3, hybrid: 1 } },
      { text: "In increments along the way", weights: { scrum: 4, safe: 1, xp: 1 } },
      { text: "Continuously as items ship", weights: { kanban: 3, scrumban: 2 } }
    ]
  },

  // ---------- PMO / GOVERNANCE ----------
  {
    id: "governance",
    perspective: "PMO / Governance",
    signal: 2,
    text: "How formal is the required governance / stage-gate process?",
    options: [
      { text: "Strict stage-gates, sign-offs, mandated templates", weights: { waterfall: 4, hybrid: 3, safe: 1 } },
      { text: "Some checkpoints, otherwise flexible", weights: { hybrid: 3, safe: 2 } },
      { text: "Lightweight; team decides its own process", weights: { scrum: 3, kanban: 3, xp: 1 } }
    ]
  },
  {
    id: "portfolio_reporting",
    perspective: "PMO / Governance",
    signal: 1,
    text: "Is portfolio-level roll-up reporting required?",
    options: [
      { text: "Yes, standardized across the organization", weights: { waterfall: 2, safe: 3, hybrid: 2 } },
      { text: "Some, but flexible in format", weights: { safe: 2, scrum: 1 } },
      { text: "No, team-level tracking is fine", weights: { kanban: 2, scrum: 2 } }
    ]
  },
  {
    id: "standardization",
    perspective: "PMO / Governance",
    signal: 1,
    text: "Must the project conform to a mandated organizational process?",
    options: [
      { text: "Yes, a defined methodology is required", weights: { waterfall: 3, safe: 2, hybrid: 2 } },
      { text: "Guidelines exist but teams adapt them", weights: { hybrid: 2, scrum: 1 } },
      { text: "No, the team is free to choose", weights: { kanban: 2, scrum: 2, xp: 1 } }
    ]
  },

  // ---------- MIDDLE MANAGEMENT ----------
  {
    id: "mgr_control",
    perspective: "Middle Management",
    signal: 2,
    text: "How much authority are managers willing to hand to the team?",
    options: [
      { text: "Work assigned and tracked top-down", weights: { waterfall: 3, hybrid: 2 } },
      { text: "Managers set priorities, team self-organizes execution", weights: { scrum: 3, scrumban: 2, safe: 1 } },
      { text: "Team is fully empowered to self-organize", weights: { scrum: 3, kanban: 2, xp: 2 } }
    ]
  },
  {
    id: "reporting",
    perspective: "Middle Management",
    signal: 1,
    text: "How do stakeholders expect to see progress?",
    options: [
      { text: "Gantt charts, % complete, milestone dates", weights: { waterfall: 3, hybrid: 2 } },
      { text: "Burndown / velocity per sprint", weights: { scrum: 3, safe: 1 } },
      { text: "Flow metrics (cycle time, throughput)", weights: { kanban: 3, scrumban: 2 } }
    ]
  },
  {
    id: "mgr_familiarity",
    perspective: "Middle Management",
    signal: 1,
    text: "What are managers most comfortable managing with?",
    options: [
      { text: "Detailed upfront plans and schedules", weights: { waterfall: 3, hybrid: 1 } },
      { text: "Prioritized backlogs and cadences", weights: { scrum: 3, scrumban: 1 } },
      { text: "Real-time boards and flow limits", weights: { kanban: 3 } }
    ]
  },
  {
    id: "coordination",
    perspective: "Middle Management",
    signal: 1,
    text: "How much cross-team coordination is needed?",
    options: [
      { text: "Minimal; one team owns it", weights: { scrum: 2, kanban: 2, xp: 1 } },
      { text: "Some coordination across a few teams", weights: { scrumban: 2, hybrid: 1 } },
      { text: "Heavy coordination across many teams", weights: { safe: 5, hybrid: 1 } }
    ]
  },

  // ---------- DELIVERY TEAM ----------
  {
    id: "team_scale",
    perspective: "Delivery Team",
    signal: 2,
    text: "How many teams are involved?",
    options: [
      { text: "One small team (≤10 people)", weights: { scrum: 3, kanban: 2, xp: 2 } },
      { text: "A few coordinated teams", weights: { scrum: 2, scrumban: 2, hybrid: 1 } },
      { text: "Many teams on one large program", weights: { safe: 5, hybrid: 2 } }
    ]
  },
  {
    id: "team_maturity",
    perspective: "Delivery Team",
    signal: 1,
    text: "How experienced is the team with agile practices?",
    options: [
      { text: "New to agile / prefers structure", weights: { waterfall: 2, hybrid: 2, scrum: 1 } },
      { text: "Some experience", weights: { scrum: 2, scrumban: 2 } },
      { text: "Highly experienced, disciplined engineering", weights: { xp: 3, scrum: 2, kanban: 1 } }
    ]
  },
  {
    id: "team_distribution",
    perspective: "Delivery Team",
    signal: 1,
    text: "How is the team distributed?",
    options: [
      { text: "Co-located", weights: { scrum: 2, xp: 2 } },
      { text: "Partly remote", weights: { scrum: 1, scrumban: 1, kanban: 1 } },
      { text: "Fully distributed across time zones", weights: { kanban: 2, hybrid: 1 } }
    ]
  },
  {
    id: "eng_discipline",
    perspective: "Delivery Team",
    signal: 1,
    text: "How strong are engineering practices (testing, CI, pairing)?",
    options: [
      { text: "Basic / ad hoc", weights: { waterfall: 1, kanban: 1, scrum: 1 } },
      { text: "Solid but not rigorous", weights: { scrum: 2, scrumban: 1 } },
      { text: "Rigorous TDD, CI, pairing", weights: { xp: 4, scrum: 1 } }
    ]
  },

  // ---------- IT / OPERATIONS ----------
  {
    id: "work_type",
    perspective: "IT / Operations",
    signal: 3,
    text: "What best describes the nature of the work?",
    options: [
      { text: "A project with defined scope and an end date", weights: { waterfall: 3, scrum: 2, hybrid: 2 } },
      { text: "Continuous flow of incoming requests (support/ops/maintenance)", weights: { kanban: 5, scrumban: 3 } },
      { text: "Ongoing product development in releases", weights: { scrum: 4, safe: 2 } }
    ]
  },
  {
    id: "batch_vs_flow",
    perspective: "IT / Operations",
    signal: 1,
    text: "Does work arrive in planned batches or unpredictably?",
    options: [
      { text: "Planned batches we can commit to", weights: { scrum: 3, waterfall: 1 } },
      { text: "A mix of planned and unplanned", weights: { scrumban: 4, hybrid: 1 } },
      { text: "Unpredictable, arrives anytime", weights: { kanban: 4 } }
    ]
  },
  {
    id: "release_cadence",
    perspective: "IT / Operations",
    signal: 1,
    text: "How often can you deploy / release?",
    options: [
      { text: "Once, at the end", weights: { waterfall: 3 } },
      { text: "On a regular cadence (e.g. each sprint)", weights: { scrum: 3, safe: 1 } },
      { text: "Anytime, continuously", weights: { kanban: 3, xp: 2, scrumban: 1 } }
    ]
  },
  {
    id: "interrupt_rate",
    perspective: "IT / Operations",
    signal: 2,
    text: "How often does urgent unplanned work interrupt the team?",
    options: [
      { text: "Almost never", weights: { waterfall: 2, scrum: 2 } },
      { text: "Occasionally", weights: { scrumban: 3, scrum: 1 } },
      { text: "Frequently; the team is interrupt-driven", weights: { kanban: 4, scrumban: 2 } }
    ]
  },

  // ---------- COMPLIANCE / LEGAL / RISK ----------
  {
    id: "compliance",
    perspective: "Compliance / Legal / Risk",
    signal: 2,
    text: "What are the documentation / audit requirements?",
    options: [
      { text: "Heavy regulatory docs, audit trails, formal sign-off", weights: { waterfall: 5, hybrid: 3 } },
      { text: "Moderate documentation", weights: { hybrid: 2, safe: 2 } },
      { text: "Minimal; working software over documentation", weights: { scrum: 2, kanban: 2, xp: 2 } }
    ]
  },
  {
    id: "risk_profile",
    perspective: "Compliance / Legal / Risk",
    signal: 2,
    text: "What is the project's risk / uncertainty profile?",
    options: [
      { text: "Low uncertainty, well-understood problem", weights: { waterfall: 3, hybrid: 1 } },
      { text: "Moderate uncertainty", weights: { hybrid: 2, scrum: 2 } },
      { text: "High uncertainty; needs to surface risks early", weights: { scrum: 3, xp: 2, scrumban: 1 } }
    ]
  },
  {
    id: "contract_type",
    perspective: "Compliance / Legal / Risk",
    signal: 2,
    text: "Are there binding contractual scope commitments?",
    options: [
      { text: "Yes, fixed scope is contractually locked", weights: { waterfall: 4, hybrid: 2 } },
      { text: "Loose commitments with change process", weights: { hybrid: 2, scrum: 1 } },
      { text: "None; scope is ours to manage", weights: { scrum: 2, kanban: 2 } }
    ]
  },
  {
    id: "safety_critical",
    perspective: "Compliance / Legal / Risk",
    signal: 1,
    text: "Is this safety-critical or highly regulated (e.g. medical, aviation, finance)?",
    options: [
      { text: "Yes, strict validation required", weights: { waterfall: 4, hybrid: 2 } },
      { text: "Somewhat regulated", weights: { hybrid: 2, safe: 1 } },
      { text: "No special regulation", weights: { scrum: 1, kanban: 1, xp: 1 } }
    ]
  },

  // ---------- HR / ORG CULTURE ----------
  {
    id: "culture",
    perspective: "HR / Org Culture",
    signal: 1,
    text: "How would you describe the organizational culture?",
    options: [
      { text: "Command-and-control, hierarchical", weights: { waterfall: 3, hybrid: 2 } },
      { text: "Mixed", weights: { hybrid: 2, scrumban: 1 } },
      { text: "Collaborative, trust-based", weights: { scrum: 3, kanban: 2, xp: 1 } }
    ]
  },
  {
    id: "incentives",
    perspective: "HR / Org Culture",
    signal: 1,
    text: "How are people primarily incentivized?",
    options: [
      { text: "Individual performance / assigned tasks", weights: { waterfall: 2, hybrid: 1 } },
      { text: "A mix of individual and team", weights: { scrumban: 1, scrum: 1 } },
      { text: "Team / collective outcomes", weights: { scrum: 3, kanban: 1, xp: 1 } }
    ]
  },
  {
    id: "change_appetite",
    perspective: "HR / Org Culture",
    signal: 1,
    text: "How open is the organization to changing how it works?",
    options: [
      { text: "Prefers established, familiar processes", weights: { waterfall: 3, hybrid: 1 } },
      { text: "Open to gradual change", weights: { scrumban: 2, hybrid: 1, scrum: 1 } },
      { text: "Actively embraces new ways of working", weights: { scrum: 2, kanban: 2, xp: 1 } }
    ]
  }
];

export const RECS: Record<MethodologyId, Recommendation> = {
  waterfall: {
    name: "Waterfall",
    summary: "Sequential, phase-based delivery. Best when requirements are fixed, compliance is heavy, and predictability of scope/date/budget matters most.",
    roles: ["Project Manager", "Phase/discipline leads", "Business Analyst"],
    metrics: ["Milestone completion", "% complete", "Earned value / schedule variance"],
    cadence: ["Sequential phases with stage-gate reviews and formal sign-off between phases"],
    management_view: "Managers get familiar Gantt/milestone reporting and clear go/no-go gates.",
    finance_view: "Fits fixed-price budgets; costs forecast upfront with change-control for deviations.",
    risks: ["Late discovery of problems", "Poor fit if requirements actually change", "Little room to adapt once committed"]
  },
  scrum: {
    name: "Scrum",
    summary: "Iterative delivery in fixed sprints. Best for evolving products with an engaged product owner and an empowered team.",
    roles: ["Product Owner", "Scrum Master", "Development Team"],
    metrics: ["Velocity", "Sprint burndown", "Sprint goal completion"],
    cadence: ["Fixed-length sprints", "Sprint planning, daily standup, review, retrospective"],
    management_view: "Progress shown via burndown/velocity; managers set priorities, not task assignments.",
    finance_view: "Suits per-period/product funding; scope flexes while cost per sprint is stable.",
    risks: ["Needs a genuinely available Product Owner", "Fails without real team empowerment", "Sprint overhead if work is truly ad-hoc"]
  },
  kanban: {
    name: "Kanban",
    summary: "Continuous flow with WIP limits. Best for unpredictable, interrupt-driven work like support, ops and maintenance.",
    roles: ["Team members (no fixed roles)", "Service Delivery Manager (optional)"],
    metrics: ["Cycle time", "Throughput", "WIP limits", "Cumulative flow"],
    cadence: ["Continuous flow", "Optional replenishment and delivery review cadences"],
    management_view: "Forecasting is probabilistic (based on flow), not date-committed.",
    finance_view: "Best treated as ongoing operational cost rather than a fixed project budget.",
    risks: ["Degrades into chaos without WIP limits", "Weak fit for hard fixed deadlines", "Less structure than some stakeholders expect"]
  },
  scrumban: {
    name: "Scrumban",
    summary: "A hybrid of Scrum structure and Kanban flow. Best when work mixes planned cycles with a steady stream of unplanned items.",
    roles: ["Product Owner (light)", "Team members", "Flow manager"],
    metrics: ["Cycle time", "Throughput", "WIP limits", "Optional velocity"],
    cadence: ["Pull-based flow with periodic planning/replenishment"],
    management_view: "Blends sprint-like planning with continuous flow reporting.",
    finance_view: "Flexible funding; blends period planning with ongoing flow.",
    risks: ["Can become undisciplined if neither framework is followed well", "Ambiguity over which rules apply"]
  },
  hybrid: {
    name: "Hybrid (Agile + Stage-Gate)",
    summary: "Structured phases with agile execution inside them. Best when governance/compliance is required but delivery still benefits from iteration.",
    roles: ["Project Manager", "Product Owner", "Scrum Master", "Governance board"],
    metrics: ["Milestone gates + velocity/burndown within phases"],
    cadence: ["Stage-gates at the program level, iterative sprints within phases"],
    management_view: "Satisfies governance reporting while giving teams iterative flexibility.",
    finance_view: "Works with gated funding release tied to milestones.",
    risks: ["Can inherit the overhead of both worlds", "Requires clear boundaries between gated and agile parts"]
  },
  safe: {
    name: "SAFe (Scaled Agile)",
    summary: "A framework for coordinating many agile teams on one large program. Best for big, multi-team initiatives needing alignment.",
    roles: ["Release Train Engineer", "Product Management", "Multiple Scrum teams", "System Architect"],
    metrics: ["Program increment (PI) objectives", "Team velocities", "Program predictability"],
    cadence: ["Program Increments", "PI planning", "Synchronized team sprints"],
    management_view: "Provides program-level alignment and roll-up reporting across teams.",
    finance_view: "Suits large program/portfolio funding models.",
    risks: ["Heavy overhead for smaller efforts", "Can feel bureaucratic if imposed without need"]
  },
  lean: {
    name: "Lean",
    summary: "Focus on maximizing value while eliminating waste. Best when efficiency and flow optimization are the priority.",
    roles: ["Team members", "Value-stream owner"],
    metrics: ["Lead time", "Value-added ratio", "Waste reduction"],
    cadence: ["Continuous improvement (kaizen), pull-based flow"],
    management_view: "Emphasis on measuring and removing waste across the value stream.",
    finance_view: "Cost efficiency-oriented; reduces spend on non-value activity.",
    risks: ["Requires disciplined measurement culture", "Not a full delivery framework on its own"]
  },
  xp: {
    name: "Extreme Programming (XP)",
    summary: "Agile with strong engineering discipline (TDD, pairing, continuous integration). Best for experienced teams building evolving software with high quality demands.",
    roles: ["Whole team", "Customer/on-site customer", "Coach"],
    metrics: ["Velocity", "Defect rate", "Test coverage"],
    cadence: ["Short iterations", "Continuous integration", "Frequent small releases"],
    management_view: "High-quality, adaptive delivery; requires strong engineering buy-in.",
    finance_view: "Flexible funding suited to evolving software products.",
    risks: ["Demands disciplined engineering practices", "Steep learning curve for inexperienced teams", "Needs close customer involvement"]
  }
};
