"use client";

import React, { Suspense, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

const FluidGradient = dynamic(
    () => import("@/components/ui/fluid-gradient").then((mod) => mod.FluidGradient),
    { ssr: false }
)

const GoogleIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
)

function AuthContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // 콜백으로부터 전달된 에러 메시지 표시
    const callbackError = searchParams.get("error");

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);

        let redirectTo = `${window.location.origin}/auth/callback`;

        // vistafolio.vercel.app는 vistafolio.kr로 리다이렉트
        if (redirectTo.includes('vistafolio.vercel.app')) {
            redirectTo = 'https://vistafolio.kr/auth/callback';
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo,
                queryParams: {
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // 에러가 없으면 Google OAuth 페이지로 리다이렉트됨
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden text-white px-4">
            <FluidGradient />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center p-8 rounded-3xl border border-white/20 bg-white/20 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                    <div className="mb-8 text-center">
                        <Link href="/" className="inline-block mb-6">
                            <h1 className="text-3xl font-bold tracking-tight hover:text-[#93C572] transition-colors duration-300">
                                Vistafolio
                            </h1>
                        </Link>
                        <h2 className="text-xl font-medium text-neutral-500 mb-2">
                            Welcome back
                        </h2>
                        <p className="text-sm text-neutral-500">
                            Sign in to continue to your portfolio
                        </p>
                    </div>

                    {/* 에러 메시지 */}
                    {(error || callbackError) && (
                        <div className="mb-4 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                            {error ?? "로그인 중 오류가 발생했습니다. 다시 시도해주세요."}
                        </div>
                    )}

                    <div className="w-full space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-900 shadow-sm hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-900" />
                            ) : (
                                <GoogleIcon className="h-5 w-5" />
                            )}
                            <span>{loading ? "연결 중..." : "Continue with Google"}</span>
                        </button>
                    </div>

                    <div className="mt-8 text-center text-xs text-neutral-500">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-neutral-400">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-neutral-400">
                            Privacy Policy
                        </Link>
                        .
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#111]" />}>
            <AuthContent />
        </Suspense>
    )
}
