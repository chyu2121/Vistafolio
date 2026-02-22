import PostForm from "@/components/vista_forum/PostForm";

export const metadata = {
    title: "새 글 쓰기 | Vistafolio Admin",
};

export default function NewPostPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                새 글 쓰기
            </h1>
            <PostForm mode="create" />
        </div>
    );
}
