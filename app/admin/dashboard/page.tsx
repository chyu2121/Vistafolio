import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");

    // profiles에서 role 확인
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, display_name, email")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/");

    // 게시글 목록 조회 (발행/임시저장 모두)
    const { data: posts } = await supabase
        .from("posts")
        .select(`
            id,
            title,
            category_id,
            categories(name),
            is_published,
            view_count,
            created_at
        `)
        .order("created_at", { ascending: false });

    return (
        <AdminDashboardClient
            profile={{ display_name: profile.display_name, email: profile.email }}
            posts={posts ?? []}
        />
    );
}
