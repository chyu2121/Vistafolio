import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PostForm from "@/components/vista_forum/PostForm";

export const metadata = {
    title: "글 수정 | Vistafolio Admin",
};

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 게시글 조회
    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !post) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
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
    );
}
