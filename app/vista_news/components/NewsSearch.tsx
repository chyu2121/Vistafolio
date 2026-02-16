"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Loader2 } from "lucide-react";
import type { Market } from "../page";

interface Props {
  onSearch: (ticker: string, market: Market) => void;
  loading: boolean;
}

const SUGGESTIONS: Record<Market, { ticker: string; name: string }[]> = {
  US: [
    { ticker: "AAPL", name: "Apple" },
    { ticker: "TSLA", name: "Tesla" },
    { ticker: "NVDA", name: "NVIDIA" },
    { ticker: "MSFT", name: "Microsoft" },
    { ticker: "AMZN", name: "Amazon" },
  ],
  KR: [
    { ticker: "005930", name: "삼성전자" },
    { ticker: "000660", name: "SK하이닉스" },
    { ticker: "035420", name: "NAVER" },
    { ticker: "035720", name: "카카오" },
    { ticker: "373220", name: "LG에너지솔루션" },
  ],
};

export default function NewsSearch({ onSearch, loading }: Props) {
  const [market, setMarket] = useState<Market>("US");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed, market);
  };

  const handleSuggestion = (ticker: string) => {
    setQuery(ticker);
    onSearch(ticker, market);
  };

  // market 변경 시 input 포커스
  useEffect(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [market]);

  return (
    <div className="space-y-4">
      {/* Market toggle */}
      <div className="flex justify-center">
        <div className="relative flex rounded-xl border border-white/10 bg-white/5 p-1">
          {/* Sliding indicator */}
          <motion.div
            className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-blue-500/20"
            animate={{ left: market === "US" ? "4px" : "calc(50%)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {(["US", "KR"] as Market[]).map((m) => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={`relative z-10 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                market === m ? "text-blue-300" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span>{m === "US" ? "🇺🇸" : "🇰🇷"}</span>
              <span>{m === "US" ? "글로벌 (US)" : "국내 (KR)"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit}>
        <div className="group relative">
          {/* Glow ring on focus */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(147,197,114,0.2))", filter: "blur(1px)" }}
          />

          <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors duration-200 group-focus-within:border-blue-500/30">
            <Search className="ml-4 h-4 w-4 shrink-0 text-neutral-500 transition-colors duration-200 group-focus-within:text-blue-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                market === "US"
                  ? "티커 입력 (예: AAPL, TSLA, NVDA)"
                  : "티커 또는 종목명 (예: 삼성전자, 005930)"
              }
              disabled={loading}
              className="flex-1 bg-transparent px-3 py-4 text-sm text-white placeholder-neutral-500 outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="mr-2 flex items-center gap-2 rounded-xl bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all duration-200 hover:bg-blue-500/30 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "분석 중" : "분석"}
            </button>
          </div>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-600">빠른 검색:</span>
        {SUGGESTIONS[market].map((s) => (
          <button
            key={s.ticker}
            onClick={() => handleSuggestion(s.ticker)}
            disabled={loading}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300 disabled:opacity-40"
          >
            {s.ticker}
            <span className="ml-1 text-neutral-600">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
