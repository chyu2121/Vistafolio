"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Bookmark,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";
import { useScraps } from "@/hooks/useScrap";
import type { Sentiment } from "../page";

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; icon: React.ReactNode; badge: string; border: string; bg: string; text: string }> = {
  bullish: {
    label: "호재",
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
  },
  bearish: {
    label: "악재",
    icon: <TrendingDown className="h-3.5 w-3.5" />,
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    text: "text-red-400",
  },
  neutral: {
    label: "중립",
    icon: <Minus className="h-3.5 w-3.5" />,
    badge: "border-white/15 bg-white/5 text-neutral-400",
    border: "border-white/10",
    bg: "bg-white/3",
    text: "text-neutral-400",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScrapsPage() {
  const { articles, fetching, isLoggedIn, remove } = useScraps();
  const [filterSentiment, setFilterSentiment] = useState<"all" | Sentiment>("all");
  const [filterMarket, setFilterMarket] = useState<"all" | "US" | "KR">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await remove(id);
    setDeletingId(null);
  };

  const filtered = articles.filter((a) => {
    if (filterSentiment !== "all" && a.sentiment !== filterSentiment) return false;
    if (filterMarket !== "all" && a.market !== filterMarket) return false;
    return true;
  });

  // 티커별 그룹핑
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, a) => {
    const key = `${a.ticker}__${a.market}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/0 bg-gradient-to-b from-black/5 to-black/0 px-6 py-4 backdrop-blur-sm transition-all duration-300 md:px-12"
      >
        <div className="z-10 flex items-center gap-2">
          <Link href="/" className="group flex items-center">
            <span className="text-xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-[#93C572]">
              Vistafolio
            </span>
          </Link>
        </div>
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
          <Link href="/vista_news" className="text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-white">
            Vista News
          </Link>
          <span className="flex items-center gap-1.5 text-sm font-medium text-[#93C572]">
            <Bookmark className="h-3.5 w-3.5" />
            스크랩
          </span>
        </div>
        <div className="z-10">
          <Link href="/vista_news">
            <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 transition-all duration-200 hover:border-white/20 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              뉴스로 돌아가기
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#93C572]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#93C572]/20 bg-[#93C572]/10">
              <Bookmark className="h-5 w-5 text-[#93C572]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">스크랩 목록</h1>
              <p className="text-xs text-neutral-500">
                {fetching ? "불러오는 중..." : `총 ${articles.length}건의 스크랩 기사`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 비로그인 */}
        {!isLoggedIn && !fetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <Bookmark className="h-7 w-7 text-neutral-500" />
            </div>
            <p className="mb-2 text-sm text-neutral-400">로그인이 필요한 기능입니다</p>
            <Link href="/auth">
              <button className="mt-3 rounded-full border border-[#93C572]/40 bg-[#93C572]/10 px-5 py-2 text-sm font-medium text-[#93C572] transition-all hover:border-[#93C572]/80 hover:bg-[#93C572]/30 hover:text-white">
                로그인하기
              </button>
            </Link>
          </motion.div>
        )}

        {/* 로딩 */}
        {fetching && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
          </div>
        )}

        {/* 로그인 + 로드 완료 */}
        {isLoggedIn && !fetching && (
          <>
            {articles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Bookmark className="h-7 w-7 text-neutral-500" />
                </div>
                <p className="text-sm text-neutral-500">아직 스크랩한 기사가 없습니다</p>
                <p className="mt-1 text-xs text-neutral-600">
                  뉴스 분석 결과에서 북마크 버튼을 눌러 스크랩하세요
                </p>
                <Link href="/vista_news">
                  <button className="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-neutral-300 transition-all hover:border-white/20 hover:text-white">
                    뉴스 분석하러 가기
                  </button>
                </Link>
              </motion.div>
            ) : (
              <>
                {/* 필터 */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 flex flex-wrap items-center gap-2"
                >
                  <Filter className="h-3.5 w-3.5 text-neutral-600" />

                  {/* 감성 필터 */}
                  {(["all", "bullish", "bearish", "neutral"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterSentiment(s)}
                      data-active={filterSentiment === s}
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                        s === "all"
                          ? "border-white/15 bg-white/5 text-neutral-400 data-[active=true]:border-white/30 data-[active=true]:text-white"
                          : s === "bullish"
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500/60 data-[active=true]:border-emerald-500/50 data-[active=true]:text-emerald-400"
                          : s === "bearish"
                          ? "border-red-500/20 bg-red-500/5 text-red-500/60 data-[active=true]:border-red-500/50 data-[active=true]:text-red-400"
                          : "border-white/10 bg-white/3 text-neutral-600 data-[active=true]:border-white/20 data-[active=true]:text-neutral-400"
                      }`}
                    >
                      {s === "all" ? "전체" : SENTIMENT_CONFIG[s].label}
                    </button>
                  ))}

                  <div className="mx-1 h-3.5 w-px bg-white/10" />

                  {/* 마켓 필터 */}
                  {(["all", "US", "KR"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setFilterMarket(m)}
                      data-active={filterMarket === m}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-500 transition-all duration-200 data-[active=true]:border-white/25 data-[active=true]:text-white"
                    >
                      {m === "all" ? "전체" : m === "US" ? "🇺🇸 US" : "🇰🇷 KR"}
                    </button>
                  ))}

                  <span className="ml-auto text-xs text-neutral-600">{filtered.length}건</span>
                </motion.div>

                {/* 티커별 그룹 */}
                <div className="space-y-8">
                  <AnimatePresence mode="popLayout">
                    {Object.entries(grouped).map(([key, items], gi) => {
                      const [ticker, market] = key.split("__");
                      const companyName = items[0].companyName;
                      return (
                        <motion.section
                          key={key}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ delay: gi * 0.05 }}
                        >
                          {/* 티커 헤더 */}
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-base font-semibold">{ticker}</span>
                            <span className="text-sm text-neutral-400">{companyName}</span>
                            <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-neutral-500">
                              {market === "US" ? "🇺🇸 US" : "🇰🇷 KR"}
                            </span>
                            <span className="text-xs text-neutral-600">{items.length}건</span>
                          </div>

                          {/* 기사 목록 */}
                          <div className="space-y-2.5">
                            {items.map((article) => {
                              const cfg = SENTIMENT_CONFIG[article.sentiment];
                              return (
                                <motion.div
                                  key={article.id}
                                  layout
                                  exit={{ opacity: 0, height: 0 }}
                                  className={`relative overflow-hidden rounded-xl border pl-3 pr-4 py-3.5 transition-all duration-200 ${cfg.border} ${cfg.bg}`}
                                >
                                  {/* accent line */}
                                  <div className={`absolute left-0 top-0 h-full w-0.5 ${
                                    article.sentiment === "bullish" ? "bg-emerald-500/50"
                                    : article.sentiment === "bearish" ? "bg-red-500/50"
                                    : "bg-white/15"
                                  }`} />

                                  <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      {/* top row */}
                                      <div className="mb-1.5 flex items-center gap-2">
                                        <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                                          {cfg.icon}
                                          {cfg.label}
                                        </span>
                                        <span className="text-xs text-neutral-600">
                                          {formatDate(article.scrapedAt)} 스크랩
                                        </span>
                                      </div>

                                      {/* title */}
                                      <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mb-1 inline-flex items-start gap-1.5 text-sm font-medium text-white/90 transition-colors duration-200 hover:text-white"
                                      >
                                        <span className="leading-snug">{article.title}</span>
                                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-neutral-600" />
                                      </a>

                                      {/* reason */}
                                      <p className="text-xs text-neutral-500">{article.reason}</p>
                                    </div>

                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDelete(article.id)}
                                      disabled={deletingId === article.id}
                                      className="shrink-0 rounded-lg p-1.5 text-neutral-600 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                                      title="스크랩 삭제"
                                    >
                                      {deletingId === article.id ? (
                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.section>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
