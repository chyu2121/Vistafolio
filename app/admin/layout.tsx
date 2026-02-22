import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "관리자 | Vistafolio",
    robots: { index: false, follow: false },
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 로그인하지 않은 경우 (middleware에서도 체크하지만 이중 보호)
    if (!user) {
        redirect('/admin/login')
    }

    // 관리자 권한 확인
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111]">
            {/* 관리자 헤더 */}
            <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Vistafolio Admin
                            </h1>
                            <nav className="flex space-x-4">
                                <a
                                    href="/admin/dashboard"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    대시보드
                                </a>
                                <a
                                    href="/admin/posts/new"
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    글쓰기
                                </a>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                            </span>
                            <form action="/api/auth/logout" method="POST">
                                <button
                                    type="submit"
                                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                >
                                    로그아웃
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
