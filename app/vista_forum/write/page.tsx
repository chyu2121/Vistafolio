import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PostForm from "@/components/vista_forum/PostForm";

export const metadata = {
    title: "새 글 쓰기 | Vista Forum",
};

export default async function WritePostPage() {
    const supabase = await createClient();

    // 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 사용자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // TODO: 일반 사용자 글쓰기 허용 시 아래 조건 제거
    if (profile?.role !== 'admin') {
        redirect('/vista_forum');
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#111] text-gray-900 dark:text-white">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    새 글 쓰기
                </h1>
                <PostForm mode="create" />
            </div>
        </div>
    );
}
