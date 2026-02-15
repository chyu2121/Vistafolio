"use client";

import React, { useState, useRef, useEffect } from "react";

interface SearchResult {
    ticker: string;
    name: string;
    exchange: string;
}

interface StockInputPanelProps {
    onAdd: (
        ticker: string,
        name: string,
        currency: "USD" | "KRW",
        quantity: number,
        avgPrice: number
    ) => Promise<void>;
}

export default function StockInputPanel({ onAdd }: StockInputPanelProps) {
    const [currency, setCurrency] = useState<"USD" | "KRW">("USD");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selected, setSelected] = useState<SearchResult | null>(null);
    const [quantity, setQuantity] = useState("");
    const [avgPrice, setAvgPrice] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const search = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data.results ?? []);
            setShowDropdown(true);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleQueryChange = (v: string) => {
        setQuery(v);
        setSelected(null);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => search(v), 380);
    };

    const handleSelect = (item: SearchResult) => {
        setSelected(item);
        setQuery(`${item.ticker}  —  ${item.name}`);
        setShowDropdown(false);
    };

    const handleAdd = async () => {
        if (!selected || !quantity || !avgPrice) return;
        const qty = parseFloat(quantity);
        const price = parseFloat(avgPrice);
        if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;

        setIsAdding(true);
        try {
            await onAdd(selected.ticker, selected.name, currency, qty, price);
            setQuery("");
            setSelected(null);
            setQuantity("");
            setAvgPrice("");
        } finally {
            setIsAdding(false);
        }
    };

    const canAdd = selected && quantity && avgPrice &&
        parseFloat(quantity) > 0 && parseFloat(avgPrice) > 0;

    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-sm font-semibold tracking-wide text-white">종목 추가</h2>

            {/* 통화 토글 */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">통화</span>
                <div className="flex overflow-hidden rounded-lg border border-white/15">
                    {(["USD", "KRW"] as const).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`px-5 py-1.5 text-xs font-semibold transition-colors ${
                                currency === c
                                    ? "bg-[#93C572] text-black"
                                    : "text-neutral-400 hover:text-white"
                            }`}
                        >
                            {c === "USD" ? "🇺🇸 USD" : "🇰🇷 KRW"}
                        </button>
                    ))}
                </div>
            </div>

            {/* 티커/기업명 검색 */}
            <div className="relative" ref={dropdownRef}>
                <label className="mb-1.5 block text-xs text-neutral-400">티커 / 기업명 검색</label>
                <div className="relative">
                    <input
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => results.length > 0 && setShowDropdown(true)}
                        placeholder={
                            currency === "USD"
                                ? "AAPL, Apple Inc..."
                                : "005930.KS, 삼성전자..."
                        }
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#93C572]/50 focus:outline-none focus:ring-1 focus:ring-[#93C572]/25 transition-colors"
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#93C572] border-t-transparent" />
                        </div>
                    )}
                </div>

                {/* 검색 결과 드롭다운 */}
                {showDropdown && results.length > 0 && (
                    <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-white/15 bg-[#1c1c1c] shadow-2xl">
                        {results.map((r) => (
                            <button
                                key={r.ticker}
                                onClick={() => handleSelect(r)}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                            >
                                <span className="min-w-[64px] font-mono text-xs font-bold text-[#93C572]">
                                    {r.ticker}
                                </span>
                                <span className="flex-1 truncate text-sm text-white">{r.name}</span>
                                <span className="text-[10px] text-neutral-600">{r.exchange}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 수량 & 평균단가 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1.5 block text-xs text-neutral-400">보유 수량 (주)</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#93C572]/50 focus:outline-none focus:ring-1 focus:ring-[#93C572]/25 transition-colors"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs text-neutral-400">
                        평균단가 ({currency === "USD" ? "$" : "₩"})
                    </label>
                    <input
                        type="number"
                        value={avgPrice}
                        onChange={(e) => setAvgPrice(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="any"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#93C572]/50 focus:outline-none focus:ring-1 focus:ring-[#93C572]/25 transition-colors"
                    />
                </div>
            </div>

            {/* 추가 버튼 */}
            <button
                onClick={handleAdd}
                disabled={!canAdd || isAdding}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#93C572] py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#7db05e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isAdding ? (
                    <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                        시세 조회 중...
                    </>
                ) : (
                    <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        종목 추가
                    </>
                )}
            </button>

            {/* 안내 텍스트 */}
            {selected && (
                <p className="text-center text-xs text-neutral-500">
                    추가 시 Yahoo Finance에서 현재가를 자동으로 조회합니다
                </p>
            )}
        </div>
    );
}
