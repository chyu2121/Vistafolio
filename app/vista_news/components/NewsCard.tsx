"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  ChevronDown,
  Zap,
  Clock,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import type { AnalyzedNews, Sentiment, Impact } from "../page";

interface Props {
  news: AnalyzedNews;
  isScrapped?: boolean;
  isScrapLoading?: boolean;
  onScrap?: (news: AnalyzedNews) => void;
}

const SENTIMENT_CONFIG: Record<
  Sentiment,
  { label: string; icon: React.ReactNode; border: string; bg: string; text: string; glow: string; badge: string }
> = {
  bullish: {
    label: "호재",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    border: "border-emerald-500/25",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  bearish: {
    label: "악재",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    border: "border-red-500/25",
    bg: "bg-red-500/5",
    text: "text-red-400",
    glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.08)]",
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  neutral: {
    label: "중립",
    icon: <Minus className="h-3.5 w-3.5" />,
    border: "border-white/10",
    bg: "bg-white/3",
    text: "text-neutral-400",
    glow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]",
    badge: "border-white/15 bg-white/5 text-neutral-400",
  },
};

const IMPACT_CONFIG: Record<Impact, { label: string; color: string }> = {
  high: { label: "영향 높음", color: "text-amber-400" },
  medium: { label: "영향 보통", color: "text-neutral-400" },
  low: { label: "영향 낮음", color: "text-neutral-600" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.floor(diff / 60_000)}분 전`;
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function NewsCard({ news, isScrapped = false, isScrapLoading = false, onScrap }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SENTIMENT_CONFIG[news.sentiment];
  const impactCfg = IMPACT_CONFIG[news.impact];

  // Score bar width (0~1 → 0%~100%)
  const scoreWidth = `${Math.round(news.score * 100)}%`;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${cfg.border} ${cfg.bg} ${cfg.glow}`}
    >
      {/* Left accent line */}
      <div
        className={`absolute left-0 top-0 h-full w-0.5 ${
          news.sentiment === "bullish"
            ? "bg-emerald-500/60"
            : news.sentiment === "bearish"
              ? "bg-red-500/60"
              : "bg-white/20"
        }`}
      />

      <div className="px-5 py-4">
        {/* Top row: badge + impact + time */}
        <div className="mb-2.5 flex items-center gap-2">
          {/* Sentiment badge */}
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
          >
            {cfg.icon}
            {cfg.label}
          </span>

          {/* Impact */}
          {news.impact === "high" && (
            <span className={`flex items-center gap-1 text-xs ${impactCfg.color}`}>
              <Zap className="h-3 w-3" />
              {impactCfg.label}
            </span>
          )}

          {/* Time */}
          <span className="ml-auto flex items-center gap-1 text-xs text-neutral-600">
            <Clock className="h-3 w-3" />
            {timeAgo(news.publishedAt)}
          </span>

          {/* Scrap button */}
          {onScrap && (
            <button
              onClick={() => onScrap(news)}
              disabled={isScrapLoading}
              title={isScrapped ? "스크랩 취소" : "스크랩"}
              className={`flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 disabled:opacity-50 ${
                isScrapped
                  ? "text-[#93C572] hover:text-[#93C572]/60"
                  : "text-neutral-600 hover:text-[#93C572]"
              }`}
            >
              {isScrapLoading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
              ) : isScrapped ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-sm font-medium leading-snug">
          {news.url !== "#" ? (
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1.5 text-white/90 transition-colors duration-200 hover:text-white"
            >
              <span>{news.title}</span>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-400" />
            </a>
          ) : (
            <span className="text-white/90">{news.title}</span>
          )}
        </h3>

        {/* Source + score */}
        <div className="mb-3 flex items-center gap-3">
          <span className="text-xs text-neutral-500">{news.source}</span>
          <div className="flex flex-1 items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  news.sentiment === "bullish"
                    ? "bg-emerald-500/50"
                    : news.sentiment === "bearish"
                      ? "bg-red-500/50"
                      : "bg-white/20"
                }`}
                style={{ width: scoreWidth }}
              />
            </div>
            <span className="shrink-0 text-xs text-neutral-600">
              {Math.round(news.score * 100)}
            </span>
          </div>
        </div>

        {/* Reason (always visible) */}
        <p className="mb-2 text-xs text-neutral-400">{news.reason}</p>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-neutral-500 transition-colors duration-200 hover:text-neutral-300"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "요약 닫기" : "AI 요약 보기"}
        </button>

        {/* Expandable summary */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className={`mt-3 rounded-xl border p-3 ${
                  news.sentiment === "bullish"
                    ? "border-emerald-500/15 bg-emerald-500/5"
                    : news.sentiment === "bearish"
                      ? "border-red-500/15 bg-red-500/5"
                      : "border-white/8 bg-white/3"
                }`}
              >
                <p className={`mb-1.5 text-xs font-medium ${cfg.text}`}>AI 분석 요약</p>
                {news.summary.split("\n").map((line, i) => (
                  <p key={i} className="flex gap-2 text-xs leading-relaxed text-neutral-300">
                    <span className={`mt-0.5 shrink-0 ${cfg.text}`}>·</span>
                    {line}
                  </p>
                ))}
              </div>

              {/* Link to article */}
              {news.url !== "#" && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-xs text-neutral-500 transition-colors duration-200 hover:text-[#93C572]"
                >
                  <ExternalLink className="h-3 w-3" />
                  원문 보기
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
