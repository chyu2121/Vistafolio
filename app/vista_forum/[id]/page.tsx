import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import MarkdownContent from "@/components/vista_forum/MarkdownContent";
import DeletePostButton from "@/components/vista_forum/DeletePostButton";

interface Post {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    category_id: number | null;
    categories: { name: string } | null;
    thumbnail_url: string | null;
    view_count: number;
    created_at: string;
    updated_at: string;
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: post } = await supabase
        .from("posts")
        .select("title, summary, category_id, categories(name)")
        .eq("id", id)
        .eq("is_published", true)
        .single();

    if (!post) {
        return {
            title: "게시글을 찾을 수 없습니다 | Vista Forum",
        };
    }

    return {
        title: `${post.title} | Vista Forum`,
        description: post.summary || post.title,
    };
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 게시글 조회
    const { data: post, error } = await supabase
        .from("posts")
        .select(`
            id,
            title,
            content,
            summary,
            category_id,
            categories(name),
            thumbnail_url,
            view_count,
            created_at,
            updated_at
        `)
        .eq("id", id)
        .eq("is_published", true)
        .single();

    if (error || !post) {
        notFound();
    }

    // 조회수 증가 (IP 기반 중복 제외는 RPC 함수에서 처리)
    await supabase.rpc("increment_view_count", { post_id: id });

    // 관리자 권한 체크
    const { data: { user } } = await supabase.auth.getUser();
    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        isAdmin = profile?.role === 'admin';
    }

    // 이전글/다음글 조회
    const { data: prevPost } = await supabase
        .from("posts")
        .select("id, title")
        .eq("is_published", true)
        .lt("created_at", post.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    const { data: nextPost } = await supabase
        .from("posts")
        .select("id, title")
        .eq("is_published", true)
        .gt("created_at", post.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

    const formattedDate = new Date(post.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] text-gray-900 dark:text-white">
            {/* Navbar */}
            <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-200/0 dark:border-white/0 bg-gradient-to-b from-white/80 dark:from-black/5 to-white/0 dark:to-black/0 px-6 py-4 backdrop-blur-sm md:px-12">
                <Link href="/vista_forum" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors hover:text-[#93C572]">
                    Vista Forum
                </Link>
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
            </div>

            <div className="relative mx-auto max-w-4xl px-4 pb-24 pt-32">
                {/* 뒤로 가기 */}
                <Link
                    href="/vista_forum"
                    className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400 transition hover:text-gray-900 dark:hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    목록으로
                </Link>

                {/* 게시글 헤더 */}
                <article className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 md:p-12">
                    {/* 카테고리 & 관리자 버튼 */}
                    <div className="mb-4 flex items-center justify-between">
                        {(post as any).categories && (
                            <span className="inline-block rounded-full border border-[#93C572]/30 bg-[#93C572]/10 px-3 py-1 text-xs font-medium text-[#93C572]">
                                {(post as any).categories.name}
                            </span>
                        )}
                        {isAdmin && (
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/admin/posts/${id}/edit`}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    수정
                                </Link>
                                <DeletePostButton postId={id} />
                            </div>
                        )}
                    </div>

                    {/* 제목 */}
                    <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{post.title}</h1>

                    {/* 메타 정보 */}
                    <div className="mb-8 flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-500">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>조회 {post.view_count.toLocaleString()}</span>
                    </div>

                    {/* 본문 */}
                    <div className="prose dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-[#93C572] prose-strong:text-gray-900 dark:prose-strong:text-white">
                        <MarkdownContent content={post.content} />
                    </div>
                </article>

                {/* 이전글/다음글 네비게이션 */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prevPost && (
                        <Link
                            href={`/vista_forum/${prevPost.id}`}
                            className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition hover:border-[#93C572]/30 hover:bg-gray-50 dark:hover:bg-white/[0.07]"
                        >
                            <span className="text-xs text-gray-500 dark:text-neutral-500">이전글</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#93C572] line-clamp-2">
                                {prevPost.title}
                            </span>
                        </Link>
                    )}
                    {nextPost && (
                        <Link
                            href={`/vista_forum/${nextPost.id}`}
                            className="group flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition hover:border-[#93C572]/30 hover:bg-gray-50 dark:hover:bg-white/[0.07] md:text-right"
                        >
                            <span className="text-xs text-gray-500 dark:text-neutral-500">다음글</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#93C572] line-clamp-2">
                                {nextPost.title}
                            </span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
