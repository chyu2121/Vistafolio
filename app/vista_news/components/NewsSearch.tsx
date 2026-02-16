"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import type { Market } from "../page";

export interface SuggestionItem {
  ticker: string;
  name: string;
  market: Market;
}

interface Props {
  onSearch: (ticker: string, market: Market) => void;
  loading: boolean;
  portfolioSuggestions?: SuggestionItem[];
}

const DEFAULT_SUGGESTIONS: Record<Market, SuggestionItem[]> = {
  US: [
    { ticker: "AAPL", name: "Apple", market: "US" },
    { ticker: "TSLA", name: "Tesla", market: "US" },
    { ticker: "NVDA", name: "NVIDIA", market: "US" },
    { ticker: "MSFT", name: "Microsoft", market: "US" },
    { ticker: "AMZN", name: "Amazon", market: "US" },
  ],
  KR: [
    { ticker: "005930", name: "삼성전자", market: "KR" },
    { ticker: "000660", name: "SK하이닉스", market: "KR" },
    { ticker: "035420", name: "NAVER", market: "KR" },
    { ticker: "035720", name: "카카오", market: "KR" },
    { ticker: "373220", name: "LG에너지솔루션", market: "KR" },
  ],
};

export default function NewsSearch({ onSearch, loading, portfolioSuggestions }: Props) {
  const [market, setMarket] = useState<Market>("US");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed, market);
  };

  const handleSuggestion = (ticker: string, m: Market) => {
    setMarket(m);
    setQuery(ticker);
    onSearch(ticker, m);
  };

  // market 변경 시 input 포커스
  useEffect(() => {
    setQuery("");
    inputRef.current?.focus();
  }, [market]);

  return (
    <div className="space-y-4">
      {/* Search input with Market toggle */}
      <form onSubmit={handleSubmit}>
        <div className="group relative">
          {/* Glow ring on focus */}
          <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
            style={{ background: "linear-gradient(135deg, rgba(147,197,114,0.3), rgba(147,197,114,0.15))", filter: "blur(1px)" }}
          />

          <div className="relative flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors duration-200 group-focus-within:border-[#93C572]/30">
            <Search className="ml-4 h-4 w-4 shrink-0 text-neutral-500 transition-colors duration-200 group-focus-within:text-[#93C572]" />
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

            {/* Market toggle buttons */}
            <div className="flex items-center gap-1 border-l border-white/10 px-2">
              {(["US", "KR"] as Market[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarket(m)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    market === m
                      ? "text-[#93C572] bg-[#93C572]/10"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title={m === "US" ? "🇺🇸 글로벌" : "🇰🇷 국내"}
                >
                  {m}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="mr-2 flex items-center gap-2 rounded-xl bg-[#93C572]/20 px-4 py-2 text-sm font-medium text-[#93C572] transition-all duration-200 hover:bg-[#93C572]/30 hover:text-[#b8e09a] disabled:cursor-not-allowed disabled:opacity-40"
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
      {(() => {
        const filtered = portfolioSuggestions?.filter((s) => s.market === market) ?? [];
        const fromPortfolio = filtered.length > 0;
        const items = fromPortfolio
          ? filtered.slice(0, 6)
          : DEFAULT_SUGGESTIONS[market];
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-600">
              {fromPortfolio ? "내 포트폴리오:" : "빠른 검색:"}
            </span>
            {items.map((s) => (
              <button
                key={s.ticker}
                onClick={() => handleSuggestion(s.ticker, s.market)}
                disabled={loading}
                className={`rounded-full border px-3 py-1 text-xs text-neutral-400 transition-all duration-200 hover:border-[#93C572]/30 hover:bg-[#93C572]/10 hover:text-[#93C572] disabled:opacity-40 ${
                  fromPortfolio
                    ? "border-[#93C572]/15 bg-[#93C572]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {s.ticker}
                <span className="ml-1 text-neutral-600">{s.name}</span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
