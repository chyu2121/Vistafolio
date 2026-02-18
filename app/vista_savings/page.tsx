"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    TrendingUp,
    Building2,
    Smartphone,
    Globe,
    Star,
    Filter,
    RefreshCw,
    Percent,
    Clock,
    Users,
    Sparkles,
    Search,
    X,
    Calculator,
    ChevronDown,
    Bookmark, // 추가
} from "lucide-react";
import ProductCard from "@/components/savings/ProductCard";
import { Product } from "@/types/savings";

// (유틸 및 컴포넌트는 components/savings/ProductCard.tsx 등으로 분리됨)

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

type TabType = "deposit" | "saving";
type TermFilter = "all" | "6" | "12" | "24" | "36";

export default function VistaSavingsPage() {
    const [tab, setTab] = useState<TabType>("deposit");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [termFilter, setTermFilter] = useState<TermFilter>("all");
    const [search, setSearch] = useState("");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

    const fetchData = async (type: TabType) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/savings?type=${type}`);
            if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
            const json = await res.json();
            setProducts(json.products ?? []);
            setLastUpdated(new Date());
        } catch (e) {
            setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(tab);
        setSearch("");
        setTermFilter("all");
    }, [tab]);

    const filtered = useMemo(() => {
        let list = products;
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (p) => p.kor_co_nm.toLowerCase().includes(q) || p.fin_prdt_nm.toLowerCase().includes(q)
            );
        }
        if (termFilter !== "all") {
            list = list.filter((p) => p.options.some((opt) => opt.save_trm === termFilter));
            list = [...list].sort((a, b) => {
                const aMax = Math.max(...a.options.filter((o) => o.save_trm === termFilter).map((o) => o.intr_rate2));
                const bMax = Math.max(...b.options.filter((o) => o.save_trm === termFilter).map((o) => o.intr_rate2));
                return bMax - aMax;
            });
        }
        return list;
    }, [products, search, termFilter]);

    const stats = useMemo(() => {
        if (!products.length) return null;
        const rates = products.map((p) => p.best_rate);
        return {
            max: Math.max(...rates),
            avg: rates.reduce((a, b) => a + b, 0) / rates.length,
            count: products.length,
        };
    }, [products]);

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

                {/* Center: 페이지 타이틀 */}
                <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
                    <Link href="/vista_savings" className="text-xl font-bold text-[#93C572]">Vista Savings</Link>
                    <Link
                        href="/vista_savings/bookmarks"
                        className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-white"
                    >
                        <Bookmark className="h-3.5 w-3.5" />
                        관심상품
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
                <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#93C572]/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-emerald-500/5 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32">
                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Vista{" "}
                        <span className="bg-gradient-to-r from-[#b8e09a] to-[#93C572] bg-clip-text text-transparent">
                            Savings
                        </span>
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-neutral-400">
                        금감원 공시 기준 최신 예적금특판 한눈 비교.<br />
                        세후 수령액까지 즉시 계산하는 스마트 금리 탐색기.
                    </p>
                </motion.div>

                {/* 새로고침 + 업데이트 시각 */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => fetchData(tab)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        새로고침
                        {lastUpdated && (
                            <span className="text-slate-600 text-xs">
                                · {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        )}
                    </button>
                </div>

                {/* 통계 */}
                {stats && !loading && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
                            <p className="text-xs text-slate-500 mb-1">최고금리</p>
                            <p className="text-2xl font-black text-[#93C572]">{stats.max.toFixed(2)}<span className="text-sm font-normal text-slate-400">%</span></p>
                        </div>
                        <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
                            <p className="text-xs text-slate-500 mb-1">평균금리</p>
                            <p className="text-2xl font-black text-[#86efac]">{stats.avg.toFixed(2)}<span className="text-sm font-normal text-slate-400">%</span></p>
                        </div>
                        <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
                            <p className="text-xs text-slate-500 mb-1">상품 수</p>
                            <p className="text-2xl font-black text-blue-400">{filtered.length}<span className="text-sm font-normal text-slate-400">개</span></p>
                        </div>
                    </div>
                )}

                {/* 탭 */}
                <div className="flex gap-2 mb-5">
                    {(["deposit", "saving"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t
                                ? "bg-[#93C572] text-black shadow-lg shadow-[#93C572]/20"
                                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10"
                                }`}
                        >
                            {t === "deposit" ? "정기예금" : "적금"}
                        </button>
                    ))}
                </div>

                {/* 필터 */}
                <div className="flex gap-3 mb-6 flex-wrap items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="은행명 또는 상품명 검색"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#93C572]/50 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Filter size={13} className="text-slate-500" />
                        {(["all", "6", "12", "24", "36"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTermFilter(t)}
                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${termFilter === t
                                    ? "bg-[#93C572]/80 text-black"
                                    : "bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300 border border-white/10"
                                    }`}
                            >
                                {t === "all" ? "전체" : `${t}개월`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 콘텐츠 */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-2xl bg-slate-800/60 border border-white/10 p-5 animate-pulse">
                                <div className="flex gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/10 rounded w-1/3" />
                                        <div className="h-4 bg-white/10 rounded w-2/3" />
                                    </div>
                                </div>
                                <div className="h-8 bg-white/10 rounded w-1/2 mb-3" />
                                <div className="h-2 bg-white/10 rounded mb-4" />
                                <div className="h-24 bg-white/10 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                            <TrendingUp size={24} className="text-red-400" />
                        </div>
                        <p className="text-slate-400 mb-2">{error}</p>
                        <button onClick={() => fetchData(tab)} className="mt-4 px-4 py-2 rounded-xl bg-[#93C572] text-black text-sm hover:bg-[#86efac] transition-colors">
                            다시 시도
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Sparkles size={32} className="text-slate-600 mb-3" />
                        <p className="text-slate-500">검색 결과가 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-slate-600 mb-4">
                            최고금리 기준 내림차순 · {filtered.length}개 상품
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filtered.map((product, i) => (
                                <ProductCard
                                    key={`${product.fin_co_no}-${product.fin_prdt_cd}`}
                                    product={product}

                                    tab={tab}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="mt-12 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-700">
                        데이터 출처: 금융감독원 금융상품한눈에 (finlife.fss.or.kr) · 은행권 공시 기준 · 이자소득세 15.4% 적용
                    </p>
                </div>
            </div>
        </div>
    );
}
