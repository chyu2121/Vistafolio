"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
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

    // Navbar state
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await supabase.auth.signOut();
        router.replace("/");
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setAvatarUrl(session.user.user_metadata?.avatar_url as string | undefined);
            }
        });
    }, []);

    // 자동 시세 갱신
    useEffect(() => {
        if (entries.length === 0) return;
        const timer = setInterval(() => refreshRef.current(), REFRESH_INTERVAL);
        return () => clearInterval(timer);
    }, [entries.length]);

    return (
        <div className="min-h-screen bg-[#111111] text-white">
            {/* 메인 Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-12 bg-gradient-to-b from-black/5 to-black/0 backdrop-blur-sm border-b border-white/0"
            >
                {/* Left: Logo */}
                <div className="flex items-center gap-2 z-10">
                    <Link href="/" className="flex items-center group">
                        <span className="text-xl font-bold tracking-tight text-white hover:text-[#93C572] transition-colors duration-300">
                            Vistafolio
                        </span>
                    </Link>
                </div>

                {/* Center: 페이지 타이틀 */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
                    <span className="text-xl font-bold text-[#93C572]">Visual Portfolio</span>
                </div>

                {/* Right: 포트폴리오 버튼 + 유저 */}
                <div className="flex items-center gap-3 z-10">
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

                            <Link href="/dashboard">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user.email}
                                        className="hidden md:block h-8 w-8 rounded-full object-cover ring-2 ring-white/20 cursor-pointer hover:ring-[#93C572]/50 transition-all"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-[#93C572]/20 text-xs font-semibold text-[#93C572] ring-2 ring-[#93C572]/30 cursor-pointer hover:ring-[#93C572]/50 transition-all">
                                        {(user.user_metadata?.full_name as string)?.[0]?.toUpperCase() ?? "U"}
                                    </div>
                                )}
                            </Link>
                            <button
                                onClick={handleSignOut}
                                disabled={isSigningOut}
                                className="hidden md:flex items-center gap-2 rounded-lg border border-[#93C572]/40 bg-[#93C572]/10 px-3 py-2 text-xs font-medium text-[#93C572] transition-all hover:border-[#93C572]/80 hover:bg-[#93C572]/30 hover:text-white hover:shadow-[0_0_16px_rgba(147,197,114,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <button className="hidden md:block rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                Get Started
                            </button>
                        </Link>
                    )}
                </div>
            </motion.nav>

            <main className="mx-auto max-w-[1400px] space-y-6 px-6 pb-8 pt-32">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 text-center"
                >
                    <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Visual{" "}
                        <span className="bg-gradient-to-r from-[#b8e09a] to-[#93C572] bg-clip-text text-transparent">
                            Portfolio
                        </span>
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-neutral-400">
                        보유 종목을 도넛 차트로 한눈에 시각화.<br />
                        실시간 시세와 수익률을 즉시 확인하는 스마트 포트폴리오 트래커.
                    </p>
                </motion.div>

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
                                {currency === "USD" ? "USD" : "KRW"}
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
