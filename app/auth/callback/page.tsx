"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
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
