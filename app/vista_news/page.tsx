"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Newspaper, TrendingUp, TrendingDown, Minus, Search, RefreshCw, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NewsSearch from "./components/NewsSearch";
import NewsCard from "./components/NewsCard";
import OverallSummary from "./components/OverallSummary";
import NewsLoadingSkeleton from "./components/NewsLoadingSkeleton";
import { useScrap } from "@/hooks/useScrap";

export type Market = "US" | "KR";

export type Sentiment = "bullish" | "bearish" | "neutral";
export type Impact = "high" | "medium" | "low";

export interface AnalyzedNews {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  score: number;
  sentiment: Sentiment;
  impact: Impact;
  summary: string;
  reason: string;
}

export interface AnalysisResult {
  ticker: string;
  companyName: string;
  market: Market;
  analyzedAt: string;
  news: AnalyzedNews[];
  overall_sentiment: Sentiment;
  key_insight: string;
}

// --- Mock data for UI preview ---
const MOCK_RESULT: AnalysisResult = {
  ticker: "AAPL",
  companyName: "Apple Inc.",
  market: "US",
  analyzedAt: new Date().toISOString(),
  overall_sentiment: "bullish",
  key_insight:
    "애플의 AI 기능 탑재 신제품 발표가 시장 기대를 상회하며 단기 주가 상승 모멘텀이 유지될 전망. 다만 중국 시장 수요 둔화는 지속적인 리스크 요인.",
  news: [
    {
      title: "Apple Intelligence Features Drive Record iPhone Upgrade Cycle",
      url: "#",
      source: "Bloomberg",
      publishedAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
      score: 1.0,
      sentiment: "bullish",
      impact: "high",
      summary:
        "애플의 AI 기능이 역대 최대 아이폰 교체 수요를 이끌고 있음.\n애널리스트들은 2025 회계연도 매출 전망치를 상향 조정.\n공급망 파트너사들도 증산 준비에 나서며 긍정적 신호.",
      reason: "핵심 제품 수요 증가 및 실적 전망 상향 → 호재",
    },
    {
      title: "Apple Faces New EU Antitrust Probe Over App Store Practices",
      url: "#",
      source: "Reuters",
      publishedAt: new Date(Date.now() - 5 * 3_600_000).toISOString(),
      score: 0.95,
      sentiment: "bearish",
      impact: "medium",
      summary:
        "EU 당국이 앱스토어 수수료 정책 관련 신규 반독점 조사 착수.\n최대 글로벌 매출의 10% 벌금 부과 가능성 존재.\n규제 불확실성이 단기 투자심리 위축 요인으로 작용.",
      reason: "규제 리스크 확대 및 잠재적 수익성 훼손 → 악재",
    },
    {
      title: "Apple's Services Revenue Hits All-Time High in Q1 2025",
      url: "#",
      source: "CNBC",
      publishedAt: new Date(Date.now() - 8 * 3_600_000).toISOString(),
      score: 0.9,
      sentiment: "bullish",
      impact: "high",
      summary:
        "서비스 부문 매출이 분기 최고치를 경신하며 280억 달러 달성.\n앱스토어·구독 서비스 성장이 하드웨어 의존도 낮추는 데 기여.\n고마진 사업 비중 확대로 전사 수익성 개선 지속.",
      reason: "고마진 서비스 부문의 지속적 성장 확인 → 호재",
    },
    {
      title: "China iPhone Sales Decline for Third Consecutive Quarter",
      url: "#",
      source: "WSJ",
      publishedAt: new Date(Date.now() - 14 * 3_600_000).toISOString(),
      score: 0.7,
      sentiment: "bearish",
      impact: "medium",
      summary:
        "중국 내 아이폰 판매량이 3분기 연속 하락세 기록.\n화웨이·샤오미 등 현지 브랜드와의 경쟁 심화가 주요 원인.\n중국 매출 비중(약 19%)을 감안 시 전사 성장에 부담.",
      reason: "핵심 시장 점유율 지속 하락 → 악재",
    },
    {
      title: "Apple Announces $110B Share Buyback Program",
      url: "#",
      source: "MarketWatch",
      publishedAt: new Date(Date.now() - 20 * 3_600_000).toISOString(),
      score: 0.65,
      sentiment: "bullish",
      impact: "medium",
      summary:
        "역대 최대 규모인 1,100억 달러 자사주 매입 프로그램 발표.\n주주환원 강화로 EPS(주당순이익) 개선 효과 기대.\n풍부한 현금흐름이 적극적 자본배분 정책의 바탕.",
      reason: "대규모 자사주 매입으로 주주가치 제고 → 호재",
    },
  ],
};

export default function VistaNewsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Navbar state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setAvatarUrl(session.user.user_metadata?.avatar_url as string | undefined);
      }
    });
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/");
  };

  // UI 개발용 프리뷰 — 실제 API 연동 시 제거
  const handleSearch = async (ticker: string, market: Market) => {
    setLoading(true);
    setHasSearched(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    setResult({ ...MOCK_RESULT, ticker: ticker.toUpperCase(), market });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/0 bg-gradient-to-b from-black/5 to-black/0 px-6 py-4 backdrop-blur-sm transition-all duration-300 md:px-12"
      >
        {/* Left: Logo */}
        <div className="z-10 flex items-center gap-2">
          <Link href="/" className="group flex items-center">
            <span className="text-xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-[#93C572]">
              Vistafolio
            </span>
          </Link>
        </div>

        {/* Center: 페이지 타이틀 + 스크랩 링크 */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
          <span className="text-sm font-medium text-[#93C572]">Vista News</span>
          <Link
            href="/vista_news/scraps"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-white"
          >
            <Bookmark className="h-3.5 w-3.5" />
            스크랩
          </Link>
        </div>

        {/* Right: 유저 */}
        <div className="z-10 flex items-center gap-3">
          {user && (
            <>
              <Link href="/dashboard">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.email}
                    className="hidden h-8 w-8 cursor-pointer rounded-full object-cover ring-2 ring-white/20 transition-all hover:ring-[#93C572]/50 md:block"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#93C572]/20 text-xs font-semibold text-[#93C572] ring-2 ring-[#93C572]/30 transition-all hover:ring-[#93C572]/50 md:flex">
                    {(user.user_metadata?.full_name as string)?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="hidden items-center gap-2 rounded-lg border border-[#93C572]/40 bg-[#93C572]/10 px-3 py-2 text-xs font-medium text-[#93C572] transition-all hover:border-[#93C572]/80 hover:bg-[#93C572]/30 hover:text-white hover:shadow-[0_0_16px_rgba(147,197,114,0.4)] disabled:cursor-not-allowed disabled:opacity-50 md:flex"
              >
                {isSigningOut ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
              </button>
            </>
          )}

          {!user && (
            <Link href="/auth">
              <button className="hidden rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 md:block">
                Get Started
              </button>
            </Link>
          )}
        </div>
      </motion.nav>

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-[#93C572]/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
            Vista{" "}
            <span className="bg-gradient-to-r from-blue-400 to-[#93C572] bg-clip-text text-transparent">
              News
            </span>
          </h1>
          <p className="mx-auto max-w-md text-sm text-neutral-400">
            종목 뉴스를 AI가 분석해 호재·악재를 즉시 판별합니다.
            <br />
            투자 의사결정 시간을 단축하는 지능형 필터.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <NewsSearch onSearch={handleSearch} loading={loading} />
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-10"
            >
              <NewsLoadingSkeleton />
            </motion.div>
          )}

          {!loading && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-10 space-y-5"
            >
              {/* Meta row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold">{result.ticker}</span>
                  <span className="ml-2 text-sm text-neutral-400">{result.companyName}</span>
                  <span className="ml-2 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-xs text-neutral-400">
                    {result.market === "US" ? "🇺🇸 US" : "🇰🇷 KR"}
                  </span>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 transition-all duration-200 hover:border-white/20 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                  새로 검색
                </button>
              </div>

              {/* Overall summary */}
              <OverallSummary
                sentiment={result.overall_sentiment}
                keyInsight={result.key_insight}
                newsCount={result.news.length}
                analyzedAt={result.analyzedAt}
              />

              {/* Sentiment filter chips */}
              <SentimentFilter
                news={result.news}
                ticker={result.ticker}
                companyName={result.companyName}
                market={result.market}
              />
            </motion.div>
          )}

          {!loading && !hasSearched && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-20 text-center"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Search className="h-7 w-7 text-neutral-500" />
              </div>
              <p className="text-sm text-neutral-500">
                티커 심볼 또는 종목명을 입력하고 분석을 시작하세요
              </p>
              <p className="mt-1 text-xs text-neutral-600">예: AAPL · TSLA · 삼성전자 · 005930</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sentiment filter + news list (inline for simplicity)
function SentimentFilter({
  news,
  ticker,
  companyName,
  market,
}: {
  news: AnalyzedNews[];
  ticker: string;
  companyName: string;
  market: Market;
}) {
  const [filter, setFilter] = useState<"all" | Sentiment>("all");
  const scrap = useScrap({ ticker, companyName, market });

  const counts = {
    bullish: news.filter((n) => n.sentiment === "bullish").length,
    bearish: news.filter((n) => n.sentiment === "bearish").length,
    neutral: news.filter((n) => n.sentiment === "neutral").length,
  };

  const filtered = filter === "all" ? news : news.filter((n) => n.sentiment === filter);

  const chips: { key: "all" | Sentiment; label: string; icon: React.ReactNode; color: string }[] =
    [
      {
        key: "all",
        label: `전체 ${news.length}`,
        icon: <Minus className="h-3 w-3" />,
        color: "border-white/20 bg-white/5 text-neutral-300 data-[active=true]:border-white/40 data-[active=true]:bg-white/10 data-[active=true]:text-white",
      },
      {
        key: "bullish",
        label: `호재 ${counts.bullish}`,
        icon: <TrendingUp className="h-3 w-3" />,
        color:
          "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 data-[active=true]:border-emerald-500/50 data-[active=true]:bg-emerald-500/15 data-[active=true]:text-emerald-300",
      },
      {
        key: "bearish",
        label: `악재 ${counts.bearish}`,
        icon: <TrendingDown className="h-3 w-3" />,
        color:
          "border-red-500/20 bg-red-500/5 text-red-400 data-[active=true]:border-red-500/50 data-[active=true]:bg-red-500/15 data-[active=true]:text-red-300",
      },
    ];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            data-active={filter === chip.key}
            onClick={() => setFilter(chip.key)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${chip.color}`}
          >
            {chip.icon}
            {chip.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <NewsCard
                news={item}
                isScrapped={scrap.isScrapped(item.url)}
                isScrapLoading={scrap.isLoading(item.url)}
                onScrap={scrap.isLoggedIn ? scrap.toggle : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
