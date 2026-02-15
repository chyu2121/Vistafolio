"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error("Auth callback error:", error.message);
            router.replace("/auth?error=callback_failed");
          } else {
            router.replace("/dashboard");
          }
        });
    } else {
      // 코드 없이 접근한 경우 (예: hash 방식 implicit flow 처리)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace("/dashboard");
        } else {
          router.replace("/auth");
        }
      });
    }
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
