"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
    postId: string;
}

export default function DeletePostButton({ postId }: Props) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            return;
        }

        setDeleting(true);

        try {
            const response = await fetch(`/api/admin/posts?id=${postId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("게시글 삭제 실패");
            }

            alert("게시글이 삭제되었습니다.");
            router.push("/vista_forum");
        } catch (error) {
            alert(error instanceof Error ? error.message : "오류가 발생했습니다");
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
            {deleting ? "삭제 중..." : "삭제"}
        </button>
    );
}
