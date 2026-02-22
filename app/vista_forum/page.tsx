import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryTabs, { CATEGORIES } from "./CategoryTabs";

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

// 카테고리별 플레이스홀더 그라디언트
const CATEGORY_GRADIENT: Record<number, string> = {
    1: "from-blue-500/20 to-blue-900/20",
    2: "from-purple-500/20 to-purple-900/20",
    3: "from-emerald-500/20 to-emerald-900/20",
    4: "from-amber-500/20 to-amber-900/20",
    5: "from-rose-500/20 to-rose-900/20",
    6: "from-[#93C572]/20 to-[#93C572]/5",
};

// ─── 메타데이터 ────────────────────────────────────────────────────────────────
export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
    const params = await searchParams;
    const categoryId = params.category ? parseInt(params.category) : null;

    if (categoryId) {
        const supabase = await createClient();
        const { data: category } = await supabase
            .from('categories')
            .select('name')
            .eq('id', categoryId)
            .single();

        if (category) {
            return {
                title: `${category.name} | Vista Forum`,
                description: "사회초년생을 위한 재테크 가이드. 주식, ETF, 예적금, 절세 계좌까지 한눈에.",
            };
        }
    }

    return {
        title: "Vista Forum | Vistafolio",
        description: "사회초년생을 위한 재테크 가이드. 주식, ETF, 예적금, 절세 계좌까지 한눈에.",
    };
}

// ─── 타입 ──────────────────────────────────────────────────────────────────────
interface Post {
    id: string;
    title: string;
    summary: string | null;
    category_id: number | null;
    categories: { name: string } | null;
    thumbnail_url: string | null;
    view_count: number;
    created_at: string;
}

// ─── 페이지 컴포넌트 ──────────────────────────────────────────────────────────
export default async function VistaForumPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; page?: string }>;
}) {
    const { category, page: pageParam } = await searchParams;
    const page = Math.max(1, parseInt(pageParam ?? "1", 10));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const supabase = await createClient();

    // Admin 체크
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
        isAdmin = profile?.role === "admin";
    }

    // 게시글 조회
    let query = supabase
        .from("posts")
        .select(`
            id,
            title,
            summary,
            category_id,
            categories(name),
            thumbnail_url,
            view_count,
            created_at
        `, { count: "exact" })
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (category && category !== "all") {
        query = query.eq("category_id", parseInt(category));
    }

    const { data: posts, count } = await query;
    const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] text-gray-900 dark:text-white">
            {/* Navbar */}
            <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-200/0 dark:border-white/0 bg-gradient-to-b from-white/80 dark:from-black/5 to-white/0 dark:to-black/0 px-6 py-4 backdrop-blur-sm md:px-12">
                <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors hover:text-[#93C572]">
                    Vistafolio
                </Link>
                <span className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#93C572] md:block">
                    Vista Forum
                </span>
                <Link
                    href="/dashboard"
                    className="rounded-full border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white transition hover:bg-gray-200 dark:hover:bg-white/10"
                >
                    대시보드
                </Link>
            </nav>

            {/* Background glow (다크모드에서만) */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden dark:block hidden">
                <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#93C572]/5 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 h-[400px] w-[600px] rounded-full bg-emerald-500/5 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32">
                {/* Hero 헤더 */}
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">
                        Vista{" "}
                        <span className="bg-gradient-to-r from-[#b8e09a] to-[#93C572] bg-clip-text text-transparent">
                            Forum
                        </span>
                    </h1>
                    <p className="mx-auto max-w-md text-sm text-gray-500 dark:text-neutral-400">
                        사회초년생을 위한 재테크 가이드
                    </p>
                </div>

                {/* 카테고리 탭 & 글쓰기 버튼 */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <CategoryTabs current={category ?? "all"} />
                    {isAdmin && (
                        <Link
                            href="/admin/posts/new"
                            className="shrink-0 rounded-lg bg-[#93C572] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7fb05e]"
                        >
                            글쓰기
                        </Link>
                    )}
                </div>

                {/* 게시글 목록 */}
                {!posts || posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-neutral-500">아직 게시글이 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-xs text-gray-500 dark:text-neutral-600">
                            {count}개의 글
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {(posts as Post[]).map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

                        {/* 페이지네이션 */}
                        {totalPages > 1 && (
                            <Pagination
                                current={page}
                                total={totalPages}
                                category={category}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
    const gradient = post.category_id
        ? (CATEGORY_GRADIENT[post.category_id] ?? "from-gray-200 dark:from-neutral-800 to-gray-300 dark:to-neutral-900")
        : "from-gray-200 dark:from-neutral-800 to-gray-300 dark:to-neutral-900";

    const formattedDate = new Date(post.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <Link href={`/vista_forum/${post.id}`} className="group block">
            <article className="h-full overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 transition-all duration-200 hover:border-[#93C572]/30 hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:shadow-[0_0_20px_rgba(147,197,114,0.08)]">
                {/* 썸네일 */}
                <div className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                    {post.thumbnail_url ? (
                        <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    )}
                    {/* 카테고리 태그 */}
                    {post.categories && (
                        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {post.categories.name}
                        </span>
                    )}
                </div>

                {/* 본문 */}
                <div className="p-5">
                    <h2 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white transition-colors group-hover:text-[#93C572]">
                        {post.title}
                    </h2>
                    {post.summary && (
                        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-neutral-500">
                            {post.summary}
                        </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-600">
                        <span>{formattedDate}</span>
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.view_count.toLocaleString()}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
    current,
    total,
    category,
}: {
    current: number;
    total: number;
    category?: string;
}) {
    const buildUrl = (p: number) => {
        const params = new URLSearchParams();
        if (category && category !== "all") params.set("category", category);
        params.set("page", String(p));
        return `/vista_forum?${params.toString()}`;
    };

    // 표시할 페이지 번호 범위 (현재 기준 ±2)
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i);
    }

    return (
        <div className="mt-12 flex items-center justify-center gap-1">
            {/* 이전 */}
            {current > 1 && (
                <Link
                    href={buildUrl(current - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-gray-600 dark:text-neutral-400 transition hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                >
                    ‹
                </Link>
            )}

            {/* 첫 페이지 */}
            {pages[0] > 1 && (
                <>
                    <Link href={buildUrl(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-gray-600 dark:text-neutral-400 transition hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white">
                        1
                    </Link>
                    {pages[0] > 2 && <span className="px-1 text-xs text-gray-400 dark:text-neutral-600">…</span>}
                </>
            )}

            {/* 페이지 번호 */}
            {pages.map((p) => (
                <Link
                    key={p}
                    href={buildUrl(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                        p === current
                            ? "bg-[#93C572] text-white"
                            : "border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-600 dark:text-neutral-400 hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                    {p}
                </Link>
            ))}

            {/* 마지막 페이지 */}
            {pages[pages.length - 1] < total && (
                <>
                    {pages[pages.length - 1] < total - 1 && (
                        <span className="px-1 text-xs text-gray-400 dark:text-neutral-600">…</span>
                    )}
                    <Link href={buildUrl(total)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-gray-600 dark:text-neutral-400 transition hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white">
                        {total}
                    </Link>
                </>
            )}

            {/* 다음 */}
            {current < total && (
                <Link
                    href={buildUrl(current + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs text-gray-600 dark:text-neutral-400 transition hover:border-gray-400 dark:hover:border-white/20 hover:text-gray-900 dark:hover:text-white"
                >
                    ›
                </Link>
            )}
        </div>
    );
}
