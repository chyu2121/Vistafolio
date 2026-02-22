"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadFile } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CreatePostInput {
    title: string;
    content: string;
    summary: string;
    category_id: number | null;
    is_published: boolean;
    thumbnail_file?: File;
}

export interface UpdatePostInput extends CreatePostInput {
    id: string;
}

export async function createPost(input: CreatePostInput) {
    const supabase = await createClient();
    
    // 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("인증되지 않은 사용자입니다");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("관리자 권한이 필요합니다");
    }

    // 썸네일 업로드
    let thumbnail_url: string | null = null;
    if (input.thumbnail_file) {
        thumbnail_url = await uploadFile(
            input.thumbnail_file,
            'post-images',
            `thumbnails/${user.id}`
        );
    }

    // 게시글 생성
    const { data, error } = await supabase
        .from('posts')
        .insert({
            title: input.title,
            content: input.content,
            summary: input.summary,
            category_id: input.category_id,
            thumbnail_url,
            is_published: input.is_published,
            author_id: user.id,
        })
        .select('id')
        .single();

    if (error) {
        throw new Error(`게시글 생성 실패: ${error.message}`);
    }

    revalidatePath('/vista_forum');
    revalidatePath('/admin/dashboard');
    
    return data.id;
}

export async function updatePost(input: UpdatePostInput) {
    const supabase = await createClient();
    
    // 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("인증되지 않은 사용자입니다");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("관리자 권한이 필요합니다");
    }

    // 썸네일 업로드 (새 파일이 있는 경우)
    let thumbnail_url: string | undefined = undefined;
    if (input.thumbnail_file) {
        thumbnail_url = await uploadFile(
            input.thumbnail_file,
            'post-images',
            `thumbnails/${user.id}`
        );
    }

    // 게시글 업데이트
    const updateData: any = {
        title: input.title,
        content: input.content,
        summary: input.summary,
        category_id: input.category_id,
        is_published: input.is_published,
        updated_at: new Date().toISOString(),
    };

    if (thumbnail_url) {
        updateData.thumbnail_url = thumbnail_url;
    }

    const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', input.id);

    if (error) {
        throw new Error(`게시글 수정 실패: ${error.message}`);
    }

    revalidatePath(`/vista_forum/${input.id}`);
    revalidatePath('/vista_forum');
    revalidatePath('/admin/dashboard');
    
    return input.id;
}

export async function deletePost(id: string) {
    const supabase = await createClient();
    
    // 사용자 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("인증되지 않은 사용자입니다");
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error("관리자 권한이 필요합니다");
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`게시글 삭제 실패: ${error.message}`);
    }

    revalidatePath('/vista_forum');
    revalidatePath('/admin/dashboard');
    redirect('/admin/dashboard');
}
