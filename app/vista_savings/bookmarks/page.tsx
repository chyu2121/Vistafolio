"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bookmark, User, LogOut } from "lucide-react";
import ProductCard from "@/components/savings/ProductCard";
import { useSavingsBookmark } from "@/hooks/useSavingsBookmark";
import { Product } from "@/types/savings";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BookmarksPage() {
    const { bookmarks, isLoaded } = useSavingsBookmark();
    const [user, setUser] = useState<any>(null);

    // Navbar 등의 공통 로직 (간소화)
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Navbar */}
            <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-md md:px-12">
                {/* Left: 로고 */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="group flex items-center">
                        <span className="text-xl font-bold tracking-tight text-white transition-colors duration-300 hover:text-[#93C572]">
                            Vistafolio
                        </span>
                    </Link>
                </div>

                {/* Center */}
                <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 md:flex">
                    <Link href="/vista_savings" className="text-sm font-medium text-neutral-500 transition-colors duration-200 hover:text-white">
                        Vista Savings
                    </Link>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#93C572]">
                        <Bookmark className="h-3.5 w-3.5" />
                        관심상품
                    </span>
                </div>

                {/* Right: 돌아가기 */}
                <div>
                    <Link href="/vista_savings">
                        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 transition-all duration-200 hover:border-white/20 hover:text-white">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            목록으로
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#93C572]/5 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32">
                {/* Header */}
                <div className="mb-8">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#93C572]/20 bg-[#93C572]/10">
                            <Bookmark className="h-6 w-6 text-[#93C572]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight mb-1">관심 상품 목록</h1>
                            <p className="text-sm text-slate-400">
                                {isLoaded ? `총 ${bookmarks.length}개의 상품을 저장했습니다.` : "로딩 중..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {bookmarks.length === 0 && isLoaded ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-white/10 bg-white/5">
                        <Bookmark className="h-12 w-12 text-slate-600 mb-4" />
                        <p className="text-slate-400 mb-2">아직 저장된 관심 상품이 없습니다.</p>
                        <Link href="/vista_savings">
                            <button className="px-5 py-2.5 rounded-xl bg-[#93C572] text-black text-sm font-semibold hover:bg-[#86efac] transition-colors mt-2">
                                상품 둘러보기
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookmarks.map((item) => (
                            <ProductCard
                                key={`${item.fin_co_no}-${item.fin_prdt_cd}`}
                                product={item as Product}

                                tab={item.type || "deposit"}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
