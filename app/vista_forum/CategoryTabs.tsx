"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Category {
    id: number;
    name: string;
}

interface Props {
    current: string;
}

export default function CategoryTabs({ current }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const supabase = createClient();

        // 카테고리 목록 가져오기
        supabase
            .from('categories')
            .select('id, name')
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                if (data) setCategories(data);
            });

        // 관리자 권한 체크
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data }) => {
                        setIsAdmin(data?.role === 'admin');
                    });
            }
        });
    }, []);

    const handleClick = (id: string) => {
        const params = new URLSearchParams();
        if (id !== "all") params.set("category", id);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {/* 전체 탭 */}
            <button
                onClick={() => handleClick("all")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    current === "all" || !current
                        ? "bg-[#93C572] text-white shadow-[0_0_12px_rgba(147,197,114,0.3)]"
                        : "border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
                전체
            </button>

            {/* 카테고리 탭들 */}
            {categories.map(({ id, name }) => {
                const active = current === String(id);
                return (
                    <button
                        key={id}
                        onClick={() => handleClick(String(id))}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                            active
                                ? "bg-[#93C572] text-white shadow-[0_0_12px_rgba(147,197,114,0.3)]"
                                : "border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        {name}
                    </button>
                );
            })}

            {/* Admin 글쓰기 버튼 */}
            {isAdmin && (
                <Link href="/admin/posts/new">
                    <button className="rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 border border-[#93C572]/30 bg-[#93C572]/10 text-[#93C572] hover:border-[#93C572]/50 hover:bg-[#93C572]/20">
                        ✏️ 글쓰기
                    </button>
                </Link>
            )}
        </div>
    );
}
