"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
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
        title: "AI 뉴스",
        description: "AI가 요약한 최신 금융·경제 뉴스를 확인하세요",
        href: "/ai_news",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        color: "from-blue-500/20 to-blue-500/5",
        border: "border-blue-500/30",
        iconColor: "text-blue-400",
    },
    {
        title: "스마트 절약",
        description: "지출 패턴을 분석하고 절약 방법을 찾아보세요",
        href: "/smart_savings",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: "from-amber-500/20 to-amber-500/5",
        border: "border-amber-500/30",
        iconColor: "text-amber-400",
    },
];

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.replace("/auth");
            } else {
                setUser(session.user);
                setLoading(false);
            }
        });
    }, [router]);

    const handleSignOut = async () => {
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
                    <h2 className="mb-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider">계정 정보</h2>
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
            </main>
        </div>
    );
}
