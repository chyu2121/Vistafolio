"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePortfolio } from "@/hooks/usePortfolio";
import DonutChart from "@/components/portfolio/DonutChart";
import StockInputPanel from "@/components/portfolio/StockInputPanel";
import PortfolioTable from "@/components/portfolio/PortfolioTable";

const REFRESH_INTERVAL = 60_000; // 60초마다 시세 자동 갱신

export default function VisualPortfolioPage() {
    const {
        entries,
        addEntry,
        removeEntry,
        refreshPrices,
        displayCurrency,
        setDisplayCurrency,
        exchangeRate,
        user,
        portfolios,
        savePortfolio,
        loadPortfolioData,
        deletePortfolio,
        updateEntry,
        isSaving,
    } = usePortfolio();
    const refreshRef = useRef(refreshPrices);
    refreshRef.current = refreshPrices;
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [portfolioName, setPortfolioName] = React.useState("");
    const [showPortfolioList, setShowPortfolioList] = React.useState(false);
    const [colorSeed, setColorSeed] = React.useState(0);

    // 자동 시세 갱신
    useEffect(() => {
        if (entries.length === 0) return;
        const timer = setInterval(() => refreshRef.current(), REFRESH_INTERVAL);
        return () => clearInterval(timer);
    }, [entries.length]);

    return (
        <div className="min-h-screen bg-[#111111] text-white">
            {/* 헤더 */}
            <header className="sticky top-0 z-10 border-b border-white/10 bg-[#111111]/80 backdrop-blur-xl px-6 py-4">
                <div className="mx-auto flex max-w-[1400px] items-center justify-between">
                    <Link
                        href="/"
                        className="text-lg font-bold tracking-tight text-white transition-colors hover:text-[#93C572]"
                    >
                        Vistafolio
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-300">비주얼 포트폴리오</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {user && (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPortfolioList(!showPortfolioList)}
                                        className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-400 transition-all hover:border-[#93C572]/50 hover:text-[#93C572]"
                                    >
                                        📂 저장된 포트폴리오
                                    </button>
                                    {showPortfolioList && portfolios.length > 0 && (
                                        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-white/15 bg-[#1a1a1a] shadow-xl">
                                            {portfolios.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className="group flex items-center justify-between px-3 py-2.5 text-xs text-neutral-300 hover:bg-white/5 border-b border-white/5 last:border-0"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            loadPortfolioData(p.id);
                                                            setShowPortfolioList(false);
                                                        }}
                                                        className="flex-1 text-left hover:text-[#93C572]"
                                                    >
                                                        {p.name}
                                                        {p.is_active && <span className="ml-1 text-[#93C572]">✓</span>}
                                                    </button>
                                                    <button
                                                        onClick={() => deletePortfolio(p.id)}
                                                        className="opacity-0 transition-all group-hover:opacity-100 text-rose-400 hover:text-rose-300"
                                                        title="삭제"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    disabled={entries.length === 0 || isSaving}
                                    className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-400 transition-all hover:border-[#93C572]/50 hover:text-[#93C572] disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
                                    </svg>
                                    {isSaving ? "저장 중..." : "포트폴리오 저장"}
                                </button>
                            </>
                        )}

                        <button
                            onClick={refreshPrices}
                            disabled={entries.length === 0}
                            className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-400 transition-all hover:border-[#93C572]/50 hover:text-[#93C572] disabled:pointer-events-none disabled:opacity-30"
                        >
                            <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            시세 갱신
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] space-y-6 px-6 py-8">
                {/* 도넛 차트 영역 */}
                <section className="relative">
                    <DonutChart entries={entries} displayCurrency={displayCurrency} exchangeRate={exchangeRate} colorSeed={colorSeed} />
                    <div className="absolute top-4 right-4 flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-1">
                        {(["USD", "KRW"] as const).map((currency) => (
                            <button
                                key={currency}
                                onClick={() => setDisplayCurrency(currency)}
                                className={`px-3 py-1.5 text-xs font-semibold transition-colors rounded ${displayCurrency === currency
                                    ? "bg-[#93C572] text-black"
                                    : "text-neutral-400 hover:text-white"
                                    }`}
                            >
                                {currency === "USD" ? "🇺🇸 USD" : "🇰🇷 KRW"}
                            </button>
                        ))}
                    </div>
                    <div className="absolute bottom-4 left-4">
                        <button
                            onClick={() => setColorSeed((prev) => prev + 1)}
                            className="group flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-400 transition-all hover:bg-white/10 hover:text-white hover:border-white/30"
                            title="색상 조합 변경"
                        >
                            <svg
                                className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            색상 변경
                        </button>
                    </div>
                </section>

                {/* 종목 입력 + 포트폴리오 테이블 */}
                <section className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
                    <StockInputPanel onAdd={addEntry} />
                    <PortfolioTable entries={entries} onRemove={removeEntry} displayCurrency={displayCurrency} exchangeRate={exchangeRate} onUpdate={updateEntry} />
                </section>

                {/* 안내 문구 */}
                <p className="pb-4 text-center text-xs text-neutral-600">
                    현재가는 Yahoo Finance 데이터 기준이며 최대 15분 지연될 수 있습니다 · 매 60초마다 자동 갱신
                </p>
            </main>

            {/* 저장 다이얼로그 */}
            {showSaveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-white mb-4">포트폴리오 저장</h3>
                        <input
                            type="text"
                            value={portfolioName}
                            onChange={(e) => setPortfolioName(e.target.value)}
                            placeholder="포트폴리오 이름 입력 (예: 2024년 포트폴리오)"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-[#93C572]/50 focus:outline-none focus:ring-1 focus:ring-[#93C572]/25 mb-4"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && portfolioName.trim()) {
                                    savePortfolio(portfolioName);
                                    setShowSaveDialog(false);
                                    setPortfolioName("");
                                }
                            }}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setPortfolioName("");
                                }}
                                className="flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-neutral-400 transition-all hover:text-white"
                            >
                                취소
                            </button>
                            <button
                                onClick={() => {
                                    savePortfolio(portfolioName);
                                    setShowSaveDialog(false);
                                    setPortfolioName("");
                                }}
                                disabled={!portfolioName.trim() || isSaving}
                                className="flex-1 rounded-lg bg-[#93C572] px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-[#7db05e] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
