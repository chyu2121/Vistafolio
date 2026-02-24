"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/main/navbar";
import type { User } from "@supabase/supabase-js";

const MENU_ITEMS = [
    {
        title: "포트폴리오 시각화",
        description: "보유 종목을 차트와 함께 시각적으로 분석하세요",
        href: "/visual_portfolio",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        ),
        color: "from-[#93C572]/20 to-[#93C572]/5",
        border: "border-[#93C572]/30",
        iconColor: "text-[#93C572]",
    },
    {
        title: "AI 뉴스 분석",
        description: "AI가 즉시 판별하는 호재·악재 뉴스를 확인하세요",
        href: "/vista_news",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        color: "from-[#93C572]/20 to-[#93C572]/5",
        border: "border-[#93C572]/30",
        iconColor: "text-[#93C572]",
    },
    {
        title: "스마트 절약",
        description: "금감원 공시 기준 최신 예적금특판 한눈 비교",
        href: "/vista_savings",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: "from-[#93C572]/20 to-[#93C572]/5",
        border: "border-[#93C572]/30",
        iconColor: "text-[#93C572]",
    },
];

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [recentPosts, setRecentPosts] = useState<any[]>([]);

    useEffect(() => {
        const initializePage = async () => {
            const supabase = createClient();
            console.log("[Dashboard] Checking session...");
            const { data: { session } } = await supabase.auth.getSession();
            console.log("[Dashboard] Session:", session);

            if (!session) {
                console.log("[Dashboard] No session, redirecting to /login");
                router.replace("/login");
                return;
            }

            setUser(session.user);
            console.log("[Dashboard] User set:", session.user.email);

            // profiles 테이블에서 role 확인
            console.log("[Dashboard] Fetching profile for user:", session.user.id);
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            console.log("[Dashboard] Profile:", profile);

            const userIsAdmin = profile?.role === "admin";
            setIsAdmin(userIsAdmin);
            console.log("[Dashboard] Is admin:", userIsAdmin);

            // 관리자인 경우 최근 게시글 가져오기
            if (userIsAdmin) {
                const { data: posts } = await supabase
                    .from("forum_posts")
                    .select("id, title, published, created_at")
                    .order("created_at", { ascending: false })
                    .limit(5);

                setRecentPosts(posts || []);
                console.log("[Dashboard] Recent posts loaded:", posts?.length);
            }

            setLoading(false);
            console.log("[Dashboard] Page initialized");
        };

        initializePage();
    }, [router]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace("/");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#111]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
        );
    }

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
    const fullName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "사용자";
    const email = user?.email ?? "";

    return (
        <div className="min-h-screen bg-[#111] text-white">
            <Navbar />

            {/* 메인 */}
            <main className="mx-auto max-w-6xl px-6 py-24 md:px-12">
                {/* 환영 메시지 */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <h1 className="text-2xl font-bold text-white md:text-3xl">
                        안녕하세요, <span className="text-[#93C572]">{fullName.split(" ")[0]}</span>님
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">오늘도 현명한 투자 하세요.</p>
                </motion.div>

                {/* 메뉴 카드 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {MENU_ITEMS.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: 0.15 + i * 0.07 }}
                        >
                            <Link href={item.href}>
                                <div
                                    className={`group relative flex flex-col gap-4 rounded-2xl border bg-gradient-to-br p-6 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${item.color} ${item.border}`}
                                >
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${item.iconColor}`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-white">{item.title}</h2>
                                        <p className="mt-1 text-sm text-neutral-400">{item.description}</p>
                                    </div>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="absolute right-5 top-5 h-4 w-4 text-neutral-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-neutral-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 프로필 카드 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">계정 정보</h2>
                        <button
                            onClick={handleSignOut}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-400 transition hover:border-white/20 hover:text-white cursor-pointer"
                        >
                            로그아웃
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#93C572]/20 text-xl font-bold text-[#93C572] ring-2 ring-[#93C572]/30">
                                {fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-white">{fullName}</p>
                            <p className="text-sm text-neutral-500">{email}</p>
                            <p className="mt-1 text-xs text-neutral-600">
                                Google 계정으로 로그인됨
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 관리자 패널 */}
                {isAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="mt-8 rounded-2xl border border-[#93C572]/30 bg-gradient-to-br from-[#93C572]/10 to-[#93C572]/5 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-semibold text-[#93C572] uppercase tracking-wider">관리자 메뉴</h2>
                            <span className="rounded-full bg-[#93C572]/20 px-3 py-1 text-xs font-medium text-[#93C572]">
                                Admin
                            </span>
                        </div>

                        {/* 버튼 그룹 */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <Link href="/vista_forum/write">
                                <button className="flex items-center gap-2 rounded-lg bg-[#93C572] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#7eb35d] hover:shadow-lg cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    새 글 작성
                                </button>
                            </Link>
                            <Link href="/vista_forum">
                                <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:shadow-lg cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    포럼 관리
                                </button>
                            </Link>
                        </div>

                        {/* 게시글 통계 */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[
                                { label: "전체 글", value: recentPosts.length, color: "text-white" },
                                { label: "발행됨", value: recentPosts.filter(p => p.published).length, color: "text-[#93C572]" },
                                { label: "임시저장", value: recentPosts.filter(p => !p.published).length, color: "text-yellow-500" },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center"
                                >
                                    <p className="text-xs text-neutral-400">{stat.label}</p>
                                    <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* 최근 게시글 목록 */}
                        <div>
                            <h3 className="mb-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">최근 게시글</h3>
                            {recentPosts.length > 0 ? (
                                <div className="space-y-2">
                                    {recentPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-all hover:bg-white/10"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-sm text-white truncate">{post.title}</span>
                                                {!post.published && (
                                                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-500">
                                                        임시저장
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/vista_forum/${post.id}`}>
                                                    <button className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer">
                                                        보기
                                                    </button>
                                                </Link>
                                                <span className="text-neutral-600">·</span>
                                                <Link href={`/vista_forum/${post.id}/edit`}>
                                                    <button className="text-xs text-neutral-400 hover:text-[#93C572] transition-colors cursor-pointer">
                                                        수정
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">게시글이 없습니다.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
