"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Post {
    id: string;
    title: string;
    category_id: number | null;
    categories: { name: string } | null;
    is_published: boolean;
    view_count: number;
    created_at: string;
}

interface Props {
    profile: { display_name: string | null; email: string | null };
    posts: Post[];
}


export default function AdminDashboardClient({ profile, posts }: Props) {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const publishedCount = posts.filter((p) => p.is_published).length;
    const draftCount = posts.filter((p) => !p.is_published).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white">
            {/* 헤더 */}
            <header className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                            Vista<span className="text-[#93C572]">folio</span>
                        </span>
                        <span className="rounded-full border border-[#93C572]/30 bg-[#93C572]/10 px-2 py-0.5 text-xs font-medium text-[#93C572]">
                            관리자
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden text-sm text-gray-500 dark:text-neutral-400 sm:block">
                            {profile.display_name ?? profile.email}
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 text-xs text-gray-600 dark:text-neutral-400 transition hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-6 py-10">
                {/* 요약 카드 */}
                <div className="mb-8 grid grid-cols-3 gap-4">
                    {[
                        { label: "전체 글", value: posts.length },
                        { label: "발행됨", value: publishedCount },
                        { label: "임시저장", value: draftCount },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-5 py-4"
                        >
                            <p className="text-xs text-gray-500 dark:text-neutral-500">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* 게시글 목록 헤더 */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                        게시글 목록
                    </h2>
                    <Link
                        href="/admin/posts/new"
                        className="flex items-center gap-1.5 rounded-lg bg-[#93C572] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7eb35d]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        새 글 쓰기
                    </Link>
                </div>

                {/* 게시글 테이블 */}
                {posts.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 py-16 text-center text-sm text-gray-500 dark:text-neutral-500">
                        아직 작성된 글이 없습니다.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-gray-500 dark:text-neutral-500">
                                    <th className="px-5 py-3 text-left font-medium">제목</th>
                                    <th className="px-4 py-3 text-left font-medium">카테고리</th>
                                    <th className="px-4 py-3 text-center font-medium">상태</th>
                                    <th className="px-4 py-3 text-right font-medium">조회수</th>
                                    <th className="px-4 py-3 text-right font-medium">작성일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                {posts.map((post) => (
                                    <tr
                                        key={post.id}
                                        className="transition hover:bg-gray-50 dark:hover:bg-white/5"
                                    >
                                        <td className="px-5 py-3.5">
                                            <Link
                                                href={`/admin/posts/${post.id}/edit`}
                                                className="text-gray-900 dark:text-white hover:text-[#93C572] transition"
                                            >
                                                {post.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 dark:text-neutral-400">
                                            {post.categories?.name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    post.is_published
                                                        ? "bg-[#93C572]/15 text-[#93C572]"
                                                        : "bg-gray-200 dark:bg-neutral-700/50 text-gray-600 dark:text-neutral-400"
                                                }`}
                                            >
                                                {post.is_published ? "발행" : "임시저장"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-gray-600 dark:text-neutral-400">
                                            {post.view_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-gray-500 dark:text-neutral-500">
                                            {new Date(post.created_at).toLocaleDateString("ko-KR", {
                                                year: "2-digit",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
