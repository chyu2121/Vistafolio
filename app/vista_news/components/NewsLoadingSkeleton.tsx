"use client";

import { motion } from "motion/react";
import ClaudeIcon from "./ClaudeIcon";

const STEPS = [
  "뉴스 데이터 수집 중",
  "관련도 스코어 계산 중",
  "AI 감성 분석 중",
  "결과 정리 중",
];

function Shimmer({ className }: { className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ translateX: ["−100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function NewsLoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Analysis progress card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 rounded-2xl border border-[#93C572]/20 bg-[#93C572]/5 p-5"
      >
        <ClaudeIcon size={40} mode="loading" />
        <div className="flex-1">
          <p className="mb-3 text-sm font-medium text-[#93C572]">AI 분석 진행 중...</p>
          <div className="space-y-2">
            {STEPS.map((step, i) => (
              <ProgressStep key={step} label={step} index={i} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
        <div className="mb-4 flex items-center gap-3">
          <Shimmer className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-4 w-24" />
          </div>
          <div className="ml-auto">
            <Shimmer className="h-7 w-24 rounded-full" />
          </div>
        </div>
        <Shimmer className="mb-2 h-px w-full" />
        <Shimmer className="mb-1.5 h-3 w-20" />
        <Shimmer className="mb-1 h-4 w-full" />
        <Shimmer className="h-4 w-3/4" />
      </div>

      {/* News card skeletons */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-2xl border border-white/8 bg-white/3 p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Shimmer className="h-5 w-14 rounded-full" />
            <div className="ml-auto">
              <Shimmer className="h-3 w-12" />
            </div>
          </div>
          <Shimmer className="mb-1.5 h-4 w-full" />
          <Shimmer className="mb-3 h-4 w-5/6" />
          <div className="flex items-center gap-3">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-1.5 flex-1 rounded-full" />
            <Shimmer className="h-3 w-6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressStep({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.5 }}
      className="flex items-center gap-2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.5, type: "spring", stiffness: 500 }}
        className="h-1.5 w-1.5 rounded-full bg-[#93C572]/60"
      />
      <span className="text-xs text-neutral-500">{label}</span>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: index * 0.5 + 0.1, duration: 0.4 }}
        className="h-px flex-1 bg-[#93C572]/20"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.5 + 0.5 }}
        className="text-xs text-[#93C572]/60"
      >
        ✓
      </motion.span>
    </motion.div>
  );
}
