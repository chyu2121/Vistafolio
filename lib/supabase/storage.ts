import { createClient } from "./client";

/**
 * 이미지를 Supabase Storage에 업로드하고 Public URL을 반환합니다.
 */
export async function uploadImage(file: File): Promise<string> {
    const supabase = createClient();

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop();
    const fileName = `${timestamp}-${random}.${ext}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
        .from("post-images")
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Image upload error:", error);
        throw new Error(`이미지 업로드 실패: ${error.message}`);
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * 파일을 Supabase Storage에 업로드하고 Public URL을 반환합니다.
 */
export async function uploadFile(file: File, bucket: string, folder: string): Promise<string> {
    const supabase = createClient();

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;

    // Storage에 업로드
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("File upload error:", error);
        throw new Error(`파일 업로드 실패: ${error.message}`);
    }

    // Public URL 생성
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}
