import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/vista_forum/PostForm";

export const metadata = {
    title: "글 수정 | Vista Forum",
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 게시글 조회
    const { data: post, error } = await supabase
        .from("posts")
        .select("*, author_id")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    // 사용자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // 관리자이거나 본인 글인 경우에만 수정 허용
    const isAdmin = profile?.role === 'admin';
    const isAuthor = post.author_id === user.id;

    if (!isAdmin && !isAuthor) {
        redirect('/vista_forum');
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] text-gray-900 dark:text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    글 수정
                </h1>
                <PostForm
                    mode="edit"
                    postId={id}
                    initialData={{
                        title: post.title,
                        content: post.content,
                        summary: post.summary || "",
                        category_id: post.category_id,
                        thumbnail_url: post.thumbnail_url,
                        is_published: post.is_published,
                    }}
                />
            </div>
        </div>
    );
}
