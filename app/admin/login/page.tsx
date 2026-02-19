"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.");
            setLoading(false);
            return;
        }

        router.push("/admin/dashboard");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
            <div className="w-full max-w-sm">
                {/* 로고 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Vista<span className="text-[#93C572]">folio</span>
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500">관리자 로그인</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* 에러 메시지 */}
                    {error && (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    {/* 이메일 */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                            이메일
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="admin@example.com"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-[#93C572]/50 focus:ring-1 focus:ring-[#93C572]/30"
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-[#93C572]/50 focus:ring-1 focus:ring-[#93C572]/30"
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-lg bg-[#93C572] px-4 py-2.5 text-sm font-semibold text-[#111] transition hover:bg-[#7eb35d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111] border-t-transparent" />
                                로그인 중...
                            </span>
                        ) : (
                            "로그인"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
