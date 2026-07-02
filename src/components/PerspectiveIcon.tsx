/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Users,
  DollarSign,
  Crown,
  ShieldCheck,
  UsersRound,
  Cpu,
  Settings,
  AlertTriangle,
  Heart,
  LucideIcon
} from "lucide-react";

interface PerspectiveConfig {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
}

const CONFIG_MAP: Record<string, PerspectiveConfig> = {
  "Product / Customer": {
    icon: Users,
    bgColor: "bg-blue-50/70",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    accentColor: "bg-blue-600"
  },
  "Finance": {
    icon: DollarSign,
    bgColor: "bg-emerald-50/70",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    accentColor: "bg-emerald-600"
  },
  "Executive / Leadership": {
    icon: Crown,
    bgColor: "bg-purple-50/70",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    accentColor: "bg-purple-600"
  },
  "PMO / Governance": {
    icon: ShieldCheck,
    bgColor: "bg-indigo-50/70",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    accentColor: "bg-indigo-600"
  },
  "Middle Management": {
    icon: UsersRound,
    bgColor: "bg-amber-50/70",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    accentColor: "bg-amber-600"
  },
  "Delivery Team": {
    icon: Cpu,
    bgColor: "bg-cyan-50/70",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    accentColor: "bg-cyan-600"
  },
  "IT / Operations": {
    icon: Settings,
    bgColor: "bg-orange-50/70",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    accentColor: "bg-orange-600"
  },
  "Compliance / Legal / Risk": {
    icon: AlertTriangle,
    bgColor: "bg-red-50/70",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    accentColor: "bg-red-600"
  },
  "HR / Org Culture": {
    icon: Heart,
    bgColor: "bg-rose-50/70",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    accentColor: "bg-rose-600"
  }
};

const DEFAULT_CONFIG: PerspectiveConfig = {
  icon: Users,
  bgColor: "bg-slate-50/70",
  textColor: "text-slate-700",
  borderColor: "border-slate-200",
  accentColor: "bg-slate-600"
};

export function getPerspectiveConfig(perspective: string): PerspectiveConfig {
  return CONFIG_MAP[perspective] || DEFAULT_CONFIG;
}

interface PerspectiveBadgeProps {
  perspective: string;
  className?: string;
}

export const PerspectiveBadge: React.FC<PerspectiveBadgeProps> = ({
  perspective,
  className = ""
}) => {
  const config = getPerspectiveConfig(perspective);
  const Icon = config.icon;

  return (
    <div
      id={`perspective-badge-${perspective.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{perspective}</span>
    </div>
  );
};
