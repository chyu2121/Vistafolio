"use client";

import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus, CalendarClock, Building2, Layers } from "lucide-react";
import ClaudeIcon from "./ClaudeIcon";
import type { Sentiment, CompanyProfile } from "../page";

interface Props {
  sentiment: Sentiment;
  keyInsight: string;
  newsCount: number;
  analyzedAt: string;
  companyProfile?: CompanyProfile | null;
}

const CONFIG: Record<
  Sentiment,
  {
    label: string;
    icon: React.ReactNode;
    gradient: string;
    border: string;
    text: string;
    glow: string;
    bgAccent: string;
  }
> = {
  bullish: {
    label: "전반적 호재",
    icon: <TrendingUp className="h-5 w-5" />,
    gradient: "from-emerald-500/15 to-emerald-500/5",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.08)]",
    bgAccent: "bg-emerald-500/10",
  },
  bearish: {
    label: "전반적 악재",
    icon: <TrendingDown className="h-5 w-5" />,
    gradient: "from-red-500/15 to-red-500/5",
    border: "border-red-500/30",
    text: "text-red-400",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.08)]",
    bgAccent: "bg-red-500/10",
  },
  neutral: {
    label: "중립적 흐름",
    icon: <Minus className="h-5 w-5" />,
    gradient: "from-white/8 to-white/3",
    border: "border-white/15",
    text: "text-neutral-300",
    glow: "shadow-[0_0_40px_rgba(255,255,255,0.03)]",
    bgAccent: "bg-white/8",
  },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OverallSummary({ sentiment, keyInsight, newsCount, analyzedAt, companyProfile }: Props) {
  const cfg = CONFIG[sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${cfg.gradient} ${cfg.border} ${cfg.glow} p-5`}
    >
      {/* Decorative corner glow */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl ${cfg.bgAccent}`}
      />

      {/* Header row */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ClaudeIcon size={36} mode="static" />
          <div>
            <p className="text-xs font-medium text-neutral-500">AI 종합 분석</p>
            <p className={`text-sm font-semibold ${cfg.text}`}>
              {cfg.label}
            </p>
          </div>
        </div>

        {/* Sentiment visual badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${cfg.border} ${cfg.bgAccent}`}>
          <span className={cfg.text}>{cfg.icon}</span>
          <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Divider */}
      <div className={`mb-4 h-px w-full ${cfg.bgAccent}`} />

      {/* Company profile */}
      {companyProfile && (
        <div className="mb-4 rounded-xl border border-white/8 bg-white/4 p-4">
          <p className="mb-3 text-xs font-medium text-neutral-500">기업 정보</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {companyProfile.sector && (
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-neutral-300">
                <Layers className="h-3 w-3 text-neutral-500" />
                {companyProfile.sector}
              </span>
            )}
            {companyProfile.industry && (
              <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-xs text-neutral-300">
                <Building2 className="h-3 w-3 text-neutral-500" />
                {companyProfile.industry}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-neutral-300">{companyProfile.description}</p>
        </div>
      )}

      {/* Key insight */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-neutral-500">핵심 인사이트</p>
        <p className="text-sm leading-relaxed text-neutral-200">{keyInsight}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-neutral-600">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatTime(analyzedAt)} 분석
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-neutral-500">
          뉴스 {newsCount}건 기반
        </span>
      </div>
    </motion.div>
  );
}
