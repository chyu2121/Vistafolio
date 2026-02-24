"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      console.log("[AuthCallback] Code from URL:", code);

      if (code) {
        const supabase = createClient();
        console.log("[AuthCallback] Exchanging code for session...");
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          console.error("[AuthCallback] Session error:", sessionError.message);
          router.replace("/login?error=callback_failed");
          return;
        }

        console.log("[AuthCallback] Session created:", sessionData);

        // 세션 획득 후 user 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();
        console.log("[AuthCallback] User:", user);

        if (!user) {
          console.error("[AuthCallback] No user found");
          router.replace("/login");
          return;
        }

        // profiles 테이블에서 role 확인
        console.log("[AuthCallback] Checking profile for user:", user.id);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        console.log("[AuthCallback] Profile:", profile, "Error:", profileError);

        if (profileError && profileError.code === "PGRST116") {
          // profiles에 행이 없는 경우 (신규 사용자) - role = 'user'로 자동 생성
          console.log("[AuthCallback] Creating new profile with role=user");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({ id: user.id, role: "user" });

          if (insertError) {
            console.error("[AuthCallback] Profile insert error:", insertError.message);
          } else {
            console.log("[AuthCallback] Profile created successfully");
          }
        }

        // 모든 사용자 /dashboard로 리다이렉트
        console.log("[AuthCallback] Redirecting to /dashboard");
        router.replace("/dashboard");
      } else {
        console.log("[AuthCallback] No code, checking existing session");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AuthCallback] Existing session:", session);

        if (session) {
          console.log("[AuthCallback] Session found, redirecting to /dashboard");
          router.replace("/dashboard");
        } else {
          console.log("[AuthCallback] No session, redirecting to /login");
          router.replace("/login");
        }
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111]">
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <p className="text-sm text-neutral-400">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#111]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
