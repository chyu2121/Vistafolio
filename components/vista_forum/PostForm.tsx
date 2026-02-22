"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Placeholder } from "@tiptap/extension-placeholder";
import { uploadImage } from "@/lib/supabase/storage";
import { createPost, updatePost } from "@/app/admin/posts/actions";
import { createClient } from "@/lib/supabase/client";

interface Category {
    id: number;
    name: string;
}

interface PostFormProps {
    mode: "create" | "edit";
    postId?: string;
    initialData?: {
        title: string;
        content: string;
        summary: string;
        category_id: number | null;
        thumbnail_url: string | null;
        is_published: boolean;
    };
}

export default function PostForm({ mode, postId, initialData }: PostFormProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [categoryId, setCategoryId] = useState<number | null>(initialData?.category_id || null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null);
    const [summary, setSummary] = useState(initialData?.summary || "");
    const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            Underline,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            TextStyle,
            Color,
            Placeholder.configure({
                placeholder: "내용을 입력하세요...",
            }),
        ],
        content: initialData?.content || "",
        editorProps: {
            attributes: {
                class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
            },
        },
    });

    // 카테고리 목록 로드
    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('categories')
            .select('id, name')
            .order('sort_order', { ascending: true })
            .then(({ data }) => {
                if (data) {
                    setCategories(data);
                    if (!categoryId && data.length > 0) {
                        setCategoryId(data[0].id);
                    }
                }
            });
    }, []);

    const handleImageUpload = async () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const url = await uploadImage(file);
                editor?.chain().focus().setImage({ src: url }).run();
            } catch (error) {
                alert(error instanceof Error ? error.message : "이미지 업로드 실패");
            }
        };
        input.click();
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editor) return;

        if (!title.trim()) {
            alert("제목을 입력하세요");
            return;
        }

        if (!summary.trim()) {
            alert("요약을 입력하세요");
            return;
        }

        setSubmitting(true);

        try {
            const content = editor.getHTML();

            const input = {
                title: title.trim(),
                content,
                summary: summary.trim(),
                category_id: categoryId,
                is_published: isPublished,
                thumbnail_file: thumbnailFile || undefined,
            };

            let resultId: string;
            if (mode === "create") {
                resultId = await createPost(input);
            } else {
                if (!postId) throw new Error("게시글 ID가 없습니다");
                resultId = await updatePost({ ...input, id: postId });
            }

            router.push(`/vista_forum/${resultId}`);
            router.refresh();
        } catch (error) {
            alert(error instanceof Error ? error.message : "오류가 발생했습니다");
            setSubmitting(false);
        }
    };

    if (!editor) {
        return <div className="text-center text-gray-500 dark:text-neutral-500">에디터 로딩 중...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    제목
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#93C572] focus:border-transparent"
                    placeholder="게시글 제목을 입력하세요"
                />
            </div>

            {/* 요약 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    요약
                </label>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#93C572] focus:border-transparent"
                    placeholder="게시글 요약을 입력하세요 (목록에서 보여집니다)"
                />
            </div>

            {/* 카테고리 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카테고리
                </label>
                <select
                    value={categoryId || ""}
                    onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#93C572] focus:border-transparent"
                >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* 썸네일 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    썸네일 이미지
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                {thumbnailPreview && (
                    <div className="mt-2">
                        <img
                            src={thumbnailPreview}
                            alt="썸네일 미리보기"
                            className="w-48 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-700"
                        />
                    </div>
                )}
            </div>

            {/* 에디터 툴바 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    본문
                </label>
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                    {/* 툴바 */}
                    <div className="border-b border-gray-300 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolbarButton>
                        <div className="border-r border-gray-300 dark:border-gray-700 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} className="font-bold">B</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} className="italic">I</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} className="underline">U</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} className="line-through">S</ToolbarButton>
                        <div className="border-r border-gray-300 dark:border-gray-700 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>←</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>↔</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>→</ToolbarButton>
                        <div className="border-r border-gray-300 dark:border-gray-700 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>•</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1.</ToolbarButton>
                        <div className="border-r border-gray-300 dark:border-gray-700 mx-1" />
                        <ToolbarButton onClick={handleImageUpload}>🖼️ 이미지</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarButton>
                        <div className="border-r border-gray-300 dark:border-gray-700 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↶</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↷</ToolbarButton>
                    </div>

                    {/* 에디터 */}
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* 발행 상태 */}
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="is_published"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-[#93C572] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#93C572]"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    바로 발행 (체크 해제시 임시저장)
                </label>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[#93C572] text-white font-medium rounded-lg hover:bg-[#7eb35d] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {submitting ? "저장 중..." : mode === "create" ? "게시글 작성" : "수정 완료"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    취소
                </button>
            </div>
        </form>
    );
}

function ToolbarButton({
    onClick,
    active,
    disabled,
    children,
    className = "",
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                active ? "bg-gray-300 dark:bg-gray-600" : ""
            } ${className}`}
        >
            {children}
        </button>
    );
}
